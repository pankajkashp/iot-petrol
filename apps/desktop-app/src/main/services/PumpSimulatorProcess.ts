import { EventEmitter } from "node:events";
import type {
  PumpDeviceConfig,
  PumpDeviceEvent,
  PumpDeviceStatus,
  PumpReading,
  PumpStatus
} from "@fuel/device-core";
import type { PumpRow } from "../types";

type PumpRuntimeState = {
  id: string;
  name: string;
  nozzle: string;
  fuelType: PumpDeviceConfig["fuelType"];
  pricePerLiter: number;
  connected: boolean;
  status: PumpStatus;
  liters: number;
  revenue: number;
  lastReadingAt: string | null;
};

export interface PumpSimulatorTickPayload {
  pumpId: string;
  pump: PumpRuntimeState;
  reading?: PumpReading;
  status?: PumpDeviceStatus;
}

export class PumpSimulatorProcess extends EventEmitter {
  private pumps = new Map<string, PumpRuntimeState>();
  private timer: NodeJS.Timeout | null = null;

  constructor(pumps: PumpRow[]) {
    super();
    for (const pump of pumps) {
      this.pumps.set(pump.id, {
        id: pump.id,
        name: pump.name,
        nozzle: pump.nozzle,
        fuelType: pump.fuelType,
        pricePerLiter: pump.pricePerLiter,
        connected: true,
        status: "idle",
        liters: pump.liters,
        revenue: pump.revenue,
        lastReadingAt: pump.lastReadingAt
      });
    }
  }

  start() {
    if (this.timer) {
      return;
    }

    for (const pump of this.pumps.values()) {
      this.emitEvent("device:online", pump.id, {
        name: pump.name,
        connected: true
      });
    }

    this.timer = setInterval(() => {
      void this.tick();
    }, 2500);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }

    for (const pump of this.pumps.values()) {
      if (pump.connected) {
        pump.connected = false;
        pump.status = "offline";
        this.emitEvent("device:offline", pump.id, {
          name: pump.name,
          connected: false
        });
      }
    }
  }

  getSnapshot() {
    return [...this.pumps.values()].map((pump) => ({ ...pump }));
  }

  private async tick() {
    for (const pump of this.pumps.values()) {
      const becameOffline = pump.connected && Math.random() > 0.965;
      const becameOnline = !pump.connected && Math.random() > 0.35;

      if (becameOffline) {
        pump.connected = false;
        pump.status = "offline";
        this.emitEvent("device:offline", pump.id, {
          name: pump.name,
          connected: false
        });
        continue;
      }

      if (becameOnline) {
        pump.connected = true;
        pump.status = "idle";
        this.emitEvent("device:online", pump.id, {
          name: pump.name,
          connected: true
        });
      }

      if (!pump.connected) {
        continue;
      }

      const startChance = pump.status !== "dispensing" && Math.random() > 0.72;
      const stopChance = pump.status === "dispensing" && Math.random() > 0.55;

      if (startChance) {
        pump.status = "dispensing";
        this.emitEvent("pump:started", pump.id, {
          fuelType: pump.fuelType,
          nozzle: pump.nozzle
        });
      } else if (stopChance) {
        pump.status = "idle";
        this.emitEvent("pump:stopped", pump.id, {
          fuelType: pump.fuelType,
          nozzle: pump.nozzle
        });
      }

      const isDispensing = pump.status === "dispensing";
      const delta = isDispensing ? 4 + Math.random() * 12 : Math.random() * 0.5;
      pump.liters = Number((pump.liters + delta).toFixed(2));
      pump.revenue = Number((pump.liters * pump.pricePerLiter).toFixed(2));
      pump.lastReadingAt = new Date().toISOString();

      const reading: PumpReading = {
        id: crypto.randomUUID(),
        pumpId: pump.id,
        fuelType: pump.fuelType,
        status: pump.status,
        liters: pump.liters,
        revenue: pump.revenue,
        createdAt: pump.lastReadingAt
      };

      this.emitEvent("pump:reading", pump.id, {
        liters: reading.liters,
        revenue: reading.revenue,
        status: reading.status
      });

      this.emit("reading", {
        pumpId: pump.id,
        pump: { ...pump },
        reading
      } satisfies PumpSimulatorTickPayload);
    }
  }

  private emitEvent(type: PumpDeviceEvent["type"], pumpId: string, payload?: Record<string, unknown>) {
    const event: PumpDeviceEvent = {
      type,
      pumpId,
      timestamp: new Date().toISOString()
    };

    if (payload) {
      event.payload = payload;
    }

    this.emit("event", event);
  }
}
