import { EventEmitter } from "node:events";
import type { PumpDevice } from "../interfaces/PumpDevice";
import type { PumpDeviceConfig, PumpDeviceStatus, PumpReading } from "../types";

export class MockPumpDevice extends EventEmitter implements PumpDevice {
  private connected = false;
  private liters = 0;
  private currentFlowRate = 0;
  private lastStatus: PumpDeviceStatus["status"] = "offline";
  private interval: NodeJS.Timeout | null = null;
  
  // Session tracking
  private sessionStartTime: number | null = null;
  private sessionTicksRemaining = 0;
  private offlineTicksRemaining = 0;

  constructor(private readonly config: PumpDeviceConfig) {
    super();
  }

  async connect() {
    if (this.connected) return;
    this.connected = true;
    this.lastStatus = "idle";
    this.emitDebug("connected");
    this.emitStatus();
    this.startSimulation();
  }

  async disconnect() {
    if (!this.connected) return;
    this.connected = false;
    this.lastStatus = "offline";
    this.stopSimulation();
    this.emitDebug("disconnected");
    this.emitStatus();
  }

  async getStatus(): Promise<PumpDeviceStatus> {
    return {
      pumpId: this.config.pumpId,
      connected: this.connected,
      status: this.lastStatus,
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

      // Handle Offline state
      if (this.offlineTicksRemaining > 0) {
        this.offlineTicksRemaining--;
        if (this.offlineTicksRemaining === 0) {
          this.lastStatus = "idle";
          this.emitDebug("Back online");
          this.emitStatus();
        }
        return;
      }

      // Randomly go offline (1% chance per second)
      if (Math.random() < 0.01) {
        this.lastStatus = "offline";
        this.offlineTicksRemaining = 5 + Math.floor(Math.random() * 10);
        this.currentFlowRate = 0;
        this.sessionTicksRemaining = 0;
        this.sessionStartTime = null;
        this.emitDebug(`Hardware failure! Offline for ${this.offlineTicksRemaining}s`);
        this.emitStatus();
        return;
      }

      // Handle Dispensing state
      if (this.sessionTicksRemaining > 0) {
        this.sessionTicksRemaining--;
        
        // Realistic flow rate variation
        const targetFlow = 1.2 + Math.random() * 2.5;
        this.currentFlowRate = Number((this.currentFlowRate * 0.7 + targetFlow * 0.3).toFixed(2));
        this.liters += this.currentFlowRate;
        
        this.emitReading();

        if (this.sessionTicksRemaining === 0) {
          this.lastStatus = "idle";
          this.currentFlowRate = 0;
          this.sessionStartTime = null;
          this.emitDebug("Session complete");
          this.emitStatus();
        }
        return;
      }

      // Handle Idle state -> Start new session (10% chance per second)
      if (this.lastStatus === "idle" && Math.random() < 0.1) {
        this.lastStatus = "dispensing";
        this.sessionTicksRemaining = 5 + Math.floor(Math.random() * 20);
        this.sessionStartTime = Date.now();
        this.emitDebug(`Session started: ${this.sessionTicksRemaining}s duration`);
        this.emitStatus();
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
    const sessionDuration = this.sessionStartTime 
      ? Math.floor((Date.now() - this.sessionStartTime) / 1000) 
      : 0;

    return {
      id: crypto.randomUUID(),
      pumpId: this.config.pumpId,
      fuelType: this.config.fuelType,
      status: this.lastStatus,
      liters: Number(this.liters.toFixed(2)),
      revenue: Number((this.liters * this.config.pricePerLiter).toFixed(2)),
      flowRate: this.currentFlowRate,
      sessionDuration,
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
