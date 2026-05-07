import { EventEmitter } from "node:events";
import type {
  DeviceLogRow,
  OverviewStats,
  PumpRow,
  ReadingRow
} from "../types";
import { LocalDatabase } from "./LocalDatabase";
import { PumpSimulatorProcess, type PumpSimulatorTickPayload } from "./PumpSimulatorProcess";
import type { PumpDeviceEvent } from "@fuel/device-core";

export type DeviceManagerEvent =
  | { type: "overview"; overview: ReturnType<LocalDatabase["getOverview"]> }
  | { type: "reading"; payload: PumpSimulatorTickPayload }
  | { type: "event"; event: PumpDeviceEvent };

export class DeviceManager extends EventEmitter {
  private simulator: PumpSimulatorProcess | null = null;
  private started = false;

  constructor(private readonly database: LocalDatabase) {
    super();
  }

  async start() {
    if (this.started) {
      return;
    }

    this.simulator = new PumpSimulatorProcess(this.database.getPumps());
    this.simulator.on("event", (event: PumpDeviceEvent) => {
      this.handleDeviceEvent(event);
      this.emit("event", event);
    });
    this.simulator.on("reading", (payload: PumpSimulatorTickPayload) => {
      this.handleReading(payload);
      this.emit("reading", payload);
    });
    this.simulator.start();
    this.started = true;
    this.emitOverview();
  }

  stop() {
    this.simulator?.stop();
    this.simulator = null;
    this.started = false;
  }

  getOverview() {
    return this.database.getOverview();
  }

  private handleReading({ pumpId, pump, reading }: PumpSimulatorTickPayload) {
    if (!reading) {
      return;
    }

    this.database.saveReading(reading);
    this.database.savePumpState({
      id: pumpId,
      status: pump.status,
      liters: pump.liters,
      revenue: pump.revenue,
      lastReadingAt: pump.lastReadingAt
    });

    this.emitOverview();
  }

  private handleDeviceEvent(event: PumpDeviceEvent) {
    const messageMap: Record<PumpDeviceEvent["type"], string> = {
      "pump:started": "Pump started dispensing",
      "pump:stopped": "Pump stopped dispensing",
      "pump:reading": "Pump reading updated",
      "device:online": "Device came online",
      "device:offline": "Device went offline",
      "device:error": "Device error reported"
    };

    const level = event.type === "device:error" ? "error" : event.type === "device:offline" ? "warn" : "info";

    this.database.saveDeviceLog({
      id: crypto.randomUUID(),
      pumpId: event.pumpId,
      message: messageMap[event.type],
      level,
      createdAt: event.timestamp
    });

    if (event.type === "device:offline") {
      this.database.savePumpState({
        id: event.pumpId,
        status: "offline",
        liters: this.getPumpById(event.pumpId)?.liters ?? 0,
        revenue: this.getPumpById(event.pumpId)?.revenue ?? 0,
        lastReadingAt: event.timestamp
      });
    }

    if (event.type === "device:online") {
      const pump = this.getPumpById(event.pumpId);
      if (pump) {
        this.database.savePumpState({
          id: pump.id,
          status: "idle",
          liters: pump.liters,
          revenue: pump.revenue,
          lastReadingAt: event.timestamp
        });
      }
    }

    if (event.type === "pump:started" || event.type === "pump:stopped") {
      const pump = this.getPumpById(event.pumpId);
      if (pump) {
        this.database.savePumpState({
          id: pump.id,
          status: event.type === "pump:started" ? "dispensing" : "idle",
          liters: pump.liters,
          revenue: pump.revenue,
          lastReadingAt: event.timestamp
        });
      }
    }

    this.emitOverview();
  }

  private getPumpById(pumpId: string): PumpRow | undefined {
    return this.database.getPumps().find((pump) => pump.id === pumpId);
  }

  private emitOverview() {
    this.emit("overview", this.database.getOverview());
  }
}
