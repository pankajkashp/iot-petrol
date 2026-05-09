import { EventEmitter } from "node:events";
import type { PumpDevice } from "../interfaces/PumpDevice";
import type { PumpDeviceConfig, PumpDeviceStatus, PumpReading, PumpStatus } from "../types";

export class Esp32PumpDevice extends EventEmitter implements PumpDevice {
  constructor(private readonly config: PumpDeviceConfig) {
    super();
  }

  async connect() {
    throw new Error(
      `Esp32PumpDevice for ${this.config.pumpId} is a placeholder. Implement MQTT or serial transport here.`
    );
  }

  async disconnect() {
    return;
  }

  async getStatus(): Promise<PumpDeviceStatus> {
    return {
      pumpId: this.config.pumpId,
      connected: false,
      status: "offline" satisfies PumpStatus,
      lastSeenAt: new Date().toISOString()
    };
  }

  async getReading(): Promise<PumpReading> {
    throw new Error(
      `Esp32PumpDevice for ${this.config.pumpId} cannot provide a reading until hardware transport is implemented.`
    );
  }

  onReading(callback: (reading: PumpReading) => void) {
    this.on("reading", callback);
    return () => this.off("reading", callback);
  }

  onStatusChange(callback: (status: PumpDeviceStatus) => void) {
    this.on("status", callback);
    return () => this.off("status", callback);
  }
}
