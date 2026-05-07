import { EventEmitter } from "node:events";
import type { PumpDevice } from "@fuel/device-core";
import type { LocalDatabase } from "./LocalDatabase";
import { PumpSimulatorService } from "./PumpSimulatorService";
import type { PumpRow } from "../types";

type PumpReadingEvent = {
  pumpId: string;
  reading: Awaited<ReturnType<PumpDevice["getReading"]>>;
  overview: ReturnType<LocalDatabase["getOverview"]>;
};

export class DeviceManager extends EventEmitter {
  private devices = new Map<string, PumpDevice>();
  private pollingTimer: NodeJS.Timeout | null = null;
  private readonly simulator = new PumpSimulatorService();

  constructor(private readonly database: LocalDatabase) {
    super();
  }

  async start() {
    const pumps = this.database.getPumps();

    for (const pump of pumps) {
      this.devices.set(pump.id, this.simulator.createDevice(this.toSimulatorConfig(pump)));
    }

    for (const device of this.devices.values()) {
      await device.connect();
    }

    await this.pollOnce();
    this.pollingTimer = setInterval(() => {
      void this.pollOnce();
    }, 3000);
  }

  stop() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  async pollOnce() {
    for (const [pumpId, device] of this.devices.entries()) {
      const reading = await device.getReading();
      this.database.saveReading(reading);
      const overview = this.database.getOverview();
      this.emit("reading", { pumpId, reading, overview } satisfies PumpReadingEvent);
    }
  }

  getOverview() {
    return this.database.getOverview();
  }

  private toSimulatorConfig(pump: PumpRow) {
    return {
      pumpId: pump.id,
      pumpName: pump.name,
      nozzle: pump.nozzle,
      fuelType: pump.fuelType,
      pricePerLiter: pump.pricePerLiter
    };
  }
}
