import {
  PumpDevice,
  PumpDeviceConfig,
  PumpDeviceStatus,
  PumpReading
} from "./types";

const statuses: PumpDeviceStatus["status"][] = [
  "idle",
  "dispensing",
  "idle",
  "idle"
];

const randomFrom = <T,>(items: T[]): T => items[Math.floor(Math.random() * items.length)]!;

export class MockPumpDevice implements PumpDevice {
  private connected = false;
  private liters = 0;
  private lastStatus: PumpDeviceStatus["status"] = "offline";

  constructor(private readonly config: PumpDeviceConfig) {}

  async connect() {
    this.connected = true;
    this.lastStatus = "idle";
  }

  async disconnect() {
    this.connected = false;
    this.lastStatus = "offline";
  }

  async getStatus() {
    return {
      pumpId: this.config.pumpId,
      connected: this.connected,
      status: this.connected ? this.lastStatus : "offline",
      lastSeenAt: new Date().toISOString()
    };
  }

  async getReading() {
    if (!this.connected) {
      await this.connect();
    }

    this.lastStatus = randomFrom(statuses);
    const delta = this.lastStatus === "dispensing" ? 4 + Math.random() * 12 : Math.random() * 0.5;
    this.liters = Number((this.liters + delta).toFixed(2));

    return {
      id: crypto.randomUUID(),
      pumpId: this.config.pumpId,
      fuelType: this.config.fuelType,
      status: this.lastStatus,
      liters: this.liters,
      revenue: Number((this.liters * this.config.pricePerLiter).toFixed(2)),
      createdAt: new Date().toISOString()
    } satisfies PumpReading;
  }
}
