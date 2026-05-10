import { EventEmitter } from "node:events";
import type { 
  DispensingSession, 
  DeviceOverview, 
  PumpDefinition,
  DeviceLog,
  FuelType
} from "@fuel/shared-types";
import type { DispenserProtocol, DispensingUpdate } from "../interfaces/DispenserProtocol";

export interface DeviceManagerOptions {
  database: any; // LocalDatabase instance
  protocol: DispenserProtocol;
}

export class DeviceManager extends EventEmitter {
  private readonly database: any;
  private readonly protocol: DispenserProtocol;
  private activeSessions = new Map<string, DispensingSession>();

  constructor(options: DeviceManagerOptions) {
    super();
    this.database = options.database;
    this.protocol = options.protocol;
    this.setupProtocolListeners();
  }

  async start() {
    await this.protocol.connect();
    this.emitOverview();
  }

  async stop() {
    await this.protocol.disconnect();
  }

  private setupProtocolListeners() {
    this.protocol.on("nozzle_lifted", async (pumpId: string) => {
      const pumps: PumpDefinition[] = await this.database.getPumps();
      const pump = pumps.find((p: PumpDefinition) => p.pumpId === pumpId);
      if (!pump) return;

      const session: DispensingSession = {
        id: crypto.randomUUID(),
        pumpId,
        fuelType: pump.fuelType,
        liters: 0,
        pricePerLiter: pump.pricePerLiter,
        totalAmount: 0,
        status: "active",
        startedAt: new Date().toISOString(),
        durationSeconds: 0,
        isSynced: false,
        createdAt: new Date().toISOString()
      };

      this.activeSessions.set(pumpId, session);
      await this.database.updatePumpStatus(pumpId, "dispensing");
      this.emit("session_started", session);
      this.emitOverview();
      
      this.log({
        pumpId,
        message: `Transaction Started: Nozzle lifted at ${pumpId}`,
        level: "info"
      });
    });

    this.protocol.on("dispensing_update", (update: DispensingUpdate) => {
      const session = this.activeSessions.get(update.pumpId);
      if (!session) return;

      session.liters = update.liters;
      session.totalAmount = update.totalAmount;
      session.durationSeconds = update.durationSeconds;

      this.emit("session_updated", session);
      // We don't save to DB on every pulse, only on completion
    });

    this.protocol.on("nozzle_replaced", async (pumpId: string, finalLiters: number, finalAmount: number) => {
      const session = this.activeSessions.get(pumpId);
      if (!session) return;

      session.liters = finalLiters;
      session.totalAmount = finalAmount;
      session.status = "completed";
      session.endedAt = new Date().toISOString();

      await this.database.saveSession(session);
      await this.database.updatePumpStatus(pumpId, "idle");
      this.activeSessions.delete(pumpId);
      
      this.emit("session_completed", session);
      this.emitOverview();

      this.log({
        pumpId,
        message: `Transaction Completed: ${finalLiters.toFixed(2)}L dispensed at ${pumpId} (₹${finalAmount})`,
        level: "info"
      });
    });

    this.protocol.on("error", (pumpId: string, message: string) => {
      this.log({
        pumpId,
        message: `Hardware Error: ${message}`,
        level: "error"
      });
    });
  }

  async getOverview(): Promise<DeviceOverview> {
    const overview = await this.database.getOverview();
    return {
      ...overview,
      activeSessions: Array.from(this.activeSessions.values())
    };
  }

  private async log(entry: Omit<DeviceLog, "id" | "createdAt">) {
    const log: DeviceLog = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      ...entry
    };
    await this.database.saveDeviceLog(log);
    this.emit("log", log);
  }

  private emitOverview() {
    this.getOverview().then(overview => {
      this.emit("overview", overview);
    });
  }
}
