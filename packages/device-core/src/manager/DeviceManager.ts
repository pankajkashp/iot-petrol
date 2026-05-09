import { EventEmitter } from "node:events";
import type { DeviceEvent } from "../events/deviceEvents";
import { DeviceEventType } from "../events/deviceEvents";
import type { DeviceRepository } from "../interfaces/DeviceRepository";
import type { PumpDevice } from "../interfaces/PumpDevice";
import type { PumpDefinition, PumpReading, PumpDeviceStatus } from "../types";

export interface DeviceManagerOptions {
  repository: DeviceRepository;
  devices: Record<string, PumpDevice>;
}

export class DeviceManager extends EventEmitter {
  private readonly repository: DeviceRepository;
  private readonly devices: Record<string, PumpDevice>;
  private readonly activeSubscriptions = new Map<string, () => void>();
  private readonly lastPumpStatus = new Map<string, PumpDefinition["status"]>();

  constructor(options: DeviceManagerOptions) {
    super();
    this.repository = options.repository;
    this.devices = options.devices;
  }

  async start() {
    const pumps = await this.repository.getPumps();

    for (const pump of pumps) {
      const device = this.devices[pump.pumpId];
      if (!device) {
        await this.updatePumpStatus(pump.pumpId, "offline");
        this.emitEvent({
          type: DeviceEventType.DEVICE_OFFLINE,
          pumpId: pump.pumpId,
          timestamp: new Date().toISOString(),
          payload: { reason: "missing-device" }
        });
        continue;
      }

      try {
        this.subscribeToDevice(pump.pumpId, device);
        this.lastPumpStatus.set(pump.pumpId, pump.status);
        await device.connect();
        await this.handleStatusChange(pump.pumpId, await device.getStatus());
      } catch (error) {
        await this.updatePumpStatus(pump.pumpId, "offline");
        this.emitEvent({
          type: DeviceEventType.DEVICE_OFFLINE,
          pumpId: pump.pumpId,
          timestamp: new Date().toISOString(),
          payload: {
            reason: error instanceof Error ? error.message : "connect-failed"
          }
        });
      }
    }
  }

  async stop() {
    for (const unsubscribe of this.activeSubscriptions.values()) {
      unsubscribe();
    }
    this.activeSubscriptions.clear();
    this.lastPumpStatus.clear();

    for (const device of Object.values(this.devices)) {
      await device.disconnect();
    }
  }

  private subscribeToDevice(pumpId: string, device: PumpDevice) {
    if (this.activeSubscriptions.has(pumpId)) return;

    const onReading = async (reading: PumpReading) => {
      await this.repository.saveReading(reading);
      await this.repository.saveDeviceLog({
        id: crypto.randomUUID(),
        pumpId,
        message: `FLOW_UPDATED: ${reading.liters.toFixed(2)}L @ ₹${reading.revenue.toFixed(2)}`,
        level: "info",
        createdAt: reading.createdAt
      });
      this.emit("reading", reading);
      this.emitEvent({
        type: DeviceEventType.FLOW_UPDATED,
        pumpId,
        timestamp: reading.createdAt,
        payload: {
          liters: reading.liters,
          revenue: reading.revenue,
          status: reading.status
        }
      });
      this.emitOverview();
    };

    const onStatus = async (status: PumpDeviceStatus) => {
      await this.handleStatusChange(pumpId, status);
    };

    const unsubscribeReading = device.onReading(onReading);
    const unsubscribeStatus = device.onStatusChange(onStatus);

    this.activeSubscriptions.set(pumpId, () => {
      unsubscribeReading();
      unsubscribeStatus();
    });
  }

  async toggleSensorFeed(pumpId: string) {
    // For mock devices, "toggling" might mean starting a specific simulation sequence
    // or just connecting/disconnecting. In our new MockPumpDevice, it simulates
    // automatically when connected.
    const device = this.devices[pumpId];
    if (!device) return;

    const status = await device.getStatus();
    if (status.connected) {
      await device.disconnect();
    } else {
      await device.connect();
    }
  }

  getOverview() {
    return this.repository.getOverview();
  }

  private async updatePumpStatus(pumpId: string, status: PumpDefinition["status"]) {
    const pump = (await this.repository.getPumps()).find((p) => p.pumpId === pumpId);
    if (pump) {
      await this.repository.savePumpState({
        pumpId,
        status,
        liters: pump.liters,
        revenue: pump.revenue,
        lastReadingAt: new Date().toISOString()
      });
    }
  }

  private async handleStatusChange(pumpId: string, status: PumpDeviceStatus) {
    const previousStatus = this.lastPumpStatus.get(pumpId) ?? "offline";
    this.lastPumpStatus.set(pumpId, status.status);

    await this.updatePumpStatus(pumpId, status.status);

    if (previousStatus !== "dispensing" && status.status === "dispensing") {
      this.emitEvent({
        type: DeviceEventType.PUMP_STARTED,
        pumpId,
        timestamp: status.lastSeenAt,
        payload: { status: status.status }
      });
    }

    if (previousStatus === "dispensing" && status.status === "idle") {
      this.emitEvent({
        type: DeviceEventType.PUMP_STOPPED,
        pumpId,
        timestamp: status.lastSeenAt,
        payload: { status: status.status }
      });
    }

    if (status.connected) {
      this.emitEvent({
        type: DeviceEventType.DEVICE_ONLINE,
        pumpId,
        timestamp: status.lastSeenAt,
        payload: { status: status.status }
      });
    } else {
      this.emitEvent({
        type: DeviceEventType.DEVICE_OFFLINE,
        pumpId,
        timestamp: status.lastSeenAt,
        payload: { status: status.status, reason: "transport-disconnected" }
      });
    }

    this.emitOverview();
  }

  private emitEvent(event: DeviceEvent) {
    void this.repository.saveDeviceLog({
      id: crypto.randomUUID(),
      pumpId: event.pumpId,
      message: this.resolveLogMessage(event),
      level: this.resolveLogLevel(event.type),
      createdAt: event.timestamp
    });

    this.emit("event", event);
  }

  private resolveLogLevel(type: DeviceEvent["type"]) {
    if (type === DeviceEventType.DEVICE_OFFLINE || type === DeviceEventType.DEVICE_ERROR) {
      return "warn" as const;
    }

    return "info" as const;
  }

  private resolveLogMessage(event: DeviceEvent) {
    switch (event.type) {
      case DeviceEventType.PUMP_STARTED:
        return "PUMP_STARTED";
      case DeviceEventType.PUMP_STOPPED:
        return "PUMP_STOPPED";
      case DeviceEventType.FLOW_UPDATED:
        return `FLOW_UPDATED: ${String(event.payload?.liters ?? 0)}L`;
      case DeviceEventType.DEVICE_OFFLINE:
        return `DEVICE_OFFLINE: ${String(event.payload?.reason ?? "unknown")}`;
      case DeviceEventType.DEVICE_ONLINE:
        return "DEVICE_ONLINE";
      case DeviceEventType.DEVICE_ERROR:
        return `DEVICE_ERROR: ${String(event.payload?.reason ?? "unknown")}`;
    }
  }

  private emitOverview() {
    void this.repository.getOverview().then((overview) => {
      this.emit("overview", overview);
    });
  }
}
