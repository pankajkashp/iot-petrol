import { EventEmitter } from "node:events";
import type { PumpDevice } from "../interfaces/PumpDevice";
import type { PumpDeviceConfig, PumpDeviceStatus, PumpReading } from "../types";

export class MockPumpDevice extends EventEmitter implements PumpDevice {
  private connected = false;
  private liters = 0;
  private lastStatus: PumpDeviceStatus["status"] = "offline";
  private online = false;
  private interval: NodeJS.Timeout | null = null;
  private sessionTicksRemaining = 0;
  private offlineTicksRemaining = 0;

  constructor(private readonly config: PumpDeviceConfig) {
    super();
  }

  async connect() {
    if (this.connected) {
      return;
    }

    this.connected = true;
    this.online = true;
    this.lastStatus = "idle";
    this.emitDebug("connected");
    this.emitStatus();
    this.startSimulation();
  }

  async disconnect() {
    if (!this.connected) {
      return;
    }

    this.connected = false;
    this.lastStatus = "offline";
    this.online = false;
    this.sessionTicksRemaining = 0;
    this.offlineTicksRemaining = 0;
    this.stopSimulation();
    this.emitDebug("disconnected");
    this.emitStatus();
  }

  async getStatus(): Promise<PumpDeviceStatus> {
    return {
      pumpId: this.config.pumpId,
      connected: this.connected,
      status: this.connected ? this.lastStatus : "offline",
      lastSeenAt: new Date().toISOString()
    };
  }

  async getReading(): Promise<PumpReading> {
    return this.createReading();
  }

  onReading(callback: (reading: PumpReading) => void) {
    this.on("reading", callback);
    return () => this.off("reading", callback);
  }

  onStatusChange(callback: (status: PumpDeviceStatus) => void) {
    this.on("status", callback);
    return () => this.off("status", callback);
  }

  private startSimulation() {
    if (this.interval) return;

    this.interval = setInterval(() => {
      if (!this.connected) return;

      if (this.offlineTicksRemaining > 0) {
        this.offlineTicksRemaining -= 1;
        if (this.offlineTicksRemaining === 0) {
          this.online = true;
          this.lastStatus = "idle";
          this.emitDebug("recovered-online");
          this.emitStatus();
        }
        return;
      }

      if (this.sessionTicksRemaining > 0) {
        this.sessionTicksRemaining -= 1;
        this.lastStatus = "dispensing";
        const flowRate = Number((0.8 + Math.random() * 2.7).toFixed(2));
        this.liters = Number((this.liters + flowRate).toFixed(2));
        this.emitDebug(`dispensing +${flowRate.toFixed(2)}L`);
        this.emitReading();
        if (this.sessionTicksRemaining === 0) {
          this.lastStatus = "idle";
          this.emitDebug("session-stopped");
          this.emitStatus();
        }
        return;
      }

      const offlineRoll = Math.random();
      if (offlineRoll < 0.03) {
        this.online = false;
        this.lastStatus = "offline";
        this.offlineTicksRemaining = 4 + Math.floor(Math.random() * 8);
        this.emitDebug(`offline-for-${this.offlineTicksRemaining}s`);
        this.emitStatus();
        return;
      }

      const startRoll = Math.random();
      if (startRoll < 0.18) {
        this.sessionTicksRemaining = 3 + Math.floor(Math.random() * 8);
        this.lastStatus = "dispensing";
        this.emitDebug(`session-started ticks=${this.sessionTicksRemaining}`);
        this.emitStatus();
        this.liters = Number((this.liters + Number((1 + Math.random() * 1.8).toFixed(2))).toFixed(2));
        this.emitReading();
      }
    }, 1000);
  }

  private stopSimulation() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  private createReading(): PumpReading {
    return {
      id: crypto.randomUUID(),
      pumpId: this.config.pumpId,
      fuelType: this.config.fuelType,
      status: this.lastStatus,
      liters: Number(this.liters.toFixed(2)),
      revenue: Number((this.liters * this.config.pricePerLiter).toFixed(2)),
      createdAt: new Date().toISOString()
    };
  }

  private emitReading() {
    this.emit("reading", this.createReading());
  }

  private emitStatus() {
    void this.getStatus().then((status) => {
      this.emit("status", status);
    });
  }

  private emitDebug(message: string) {
    console.debug(`[MockPumpDevice:${this.config.pumpId}] ${message}`);
  }
}
