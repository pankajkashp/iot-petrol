import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { app } from "electron";
import type {
  DeviceLog,
  DeviceOverview,
  DeviceRepository,
  PumpDefinition,
  PumpReading
} from "@fuel/device-core";

type DatabaseInstance = ReturnType<typeof Database>;

export class LocalDatabase implements DeviceRepository {
  private db!: DatabaseInstance;

  initialize() {
    const dataDir = path.join(app.getPath("userData"), "fuel-local");
    fs.mkdirSync(dataDir, { recursive: true });
    this.db = new Database(path.join(dataDir, "desktop.sqlite"));
    this.db.pragma("journal_mode = WAL");
    this.createTables();
    this.seedPumps();
  }

  private createTables() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pumps (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        nozzle TEXT NOT NULL,
        fuelType TEXT NOT NULL,
        pricePerLiter REAL NOT NULL,
        status TEXT NOT NULL,
        liters REAL NOT NULL DEFAULT 0,
        revenue REAL NOT NULL DEFAULT 0,
        lastReadingAt TEXT
      );

      CREATE TABLE IF NOT EXISTS readings (
        id TEXT PRIMARY KEY,
        pumpId TEXT NOT NULL,
        fuelType TEXT NOT NULL,
        status TEXT NOT NULL,
        liters REAL NOT NULL,
        revenue REAL NOT NULL,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS device_logs (
        id TEXT PRIMARY KEY,
        pumpId TEXT NOT NULL,
        message TEXT NOT NULL,
        level TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);
  }

  private seedPumps() {
    const count = this.db.prepare("SELECT COUNT(*) as count FROM pumps").get() as { count: number };
    if (count.count > 0) {
      return;
    }

    const insert = this.db.prepare(`
      INSERT INTO pumps (id, name, nozzle, fuelType, pricePerLiter, status, liters, revenue, lastReadingAt)
      VALUES (@pumpId, @pumpName, @nozzle, @fuelType, @pricePerLiter, @status, @liters, @revenue, @lastReadingAt)
    `);

    const defaults: PumpDefinition[] = [
      {
        pumpId: "pump-1",
        pumpName: "Pump A-01",
        nozzle: "Nozzle 1",
        fuelType: "diesel",
        pricePerLiter: 92.75,
        status: "idle",
        liters: 0,
        revenue: 0,
        lastReadingAt: null
      },
      {
        pumpId: "pump-2",
        pumpName: "Pump A-02",
        nozzle: "Nozzle 2",
        fuelType: "petrol",
        pricePerLiter: 108.25,
        status: "idle",
        liters: 0,
        revenue: 0,
        lastReadingAt: null
      },
      {
        pumpId: "pump-3",
        pumpName: "Pump B-01",
        nozzle: "Nozzle 1",
        fuelType: "cng",
        pricePerLiter: 74.15,
        status: "idle",
        liters: 0,
        revenue: 0,
        lastReadingAt: null
      },
      {
        pumpId: "pump-4",
        pumpName: "Pump B-02",
        nozzle: "Nozzle 2",
        fuelType: "diesel",
        pricePerLiter: 91.1,
        status: "idle",
        liters: 0,
        revenue: 0,
        lastReadingAt: null
      }
    ];

    const transaction = this.db.transaction((rows: PumpDefinition[]) => {
      rows.forEach((row) => insert.run(row));
    });
    transaction(defaults);
  }

  async getPumps() {
    const rows = this.db.prepare("SELECT * FROM pumps ORDER BY name ASC").all() as Array<{
      id: string;
      name: string;
      nozzle: string;
      fuelType: PumpDefinition["fuelType"];
      pricePerLiter: number;
      status: PumpDefinition["status"];
      liters: number;
      revenue: number;
      lastReadingAt: string | null;
    }>;

    return rows.map((row) => ({
      pumpId: row.id,
      pumpName: row.name,
      nozzle: row.nozzle,
      fuelType: row.fuelType,
      pricePerLiter: row.pricePerLiter,
      status: row.status,
      liters: row.liters,
      revenue: row.revenue,
      lastReadingAt: row.lastReadingAt
    }));
  }

  private getReadings(limit = 24) {
    return this.db
      .prepare("SELECT * FROM readings ORDER BY createdAt DESC LIMIT ?")
      .all(limit) as PumpReading[];
  }

  private getLogs(limit = 24) {
    return this.db
      .prepare("SELECT * FROM device_logs ORDER BY createdAt DESC LIMIT ?")
      .all(limit) as DeviceLog[];
  }

  async savePumpState(
    pump: Pick<PumpDefinition, "pumpId" | "status" | "liters" | "revenue" | "lastReadingAt">
  ) {
    this.db
      .prepare(
        `
      UPDATE pumps
      SET status = @status,
          liters = @liters,
          revenue = @revenue,
          lastReadingAt = @lastReadingAt
      WHERE id = @pumpId
    `
      )
      .run(pump);
  }

  async saveReading(reading: PumpReading) {
    const updatePump = this.db.prepare(`
      UPDATE pumps
      SET status = @status,
          liters = @liters,
          revenue = @revenue,
          lastReadingAt = @createdAt
      WHERE id = @pumpId
    `);

    const insertReading = this.db.prepare(`
      INSERT INTO readings (id, pumpId, fuelType, status, liters, revenue, createdAt)
      VALUES (@id, @pumpId, @fuelType, @status, @liters, @revenue, @createdAt)
    `);

    const insertLog = this.db.prepare(`
      INSERT INTO device_logs (id, pumpId, message, level, createdAt)
      VALUES (@id, @pumpId, @message, @level, @createdAt)
    `);

    const logId = crypto.randomUUID();

    const tx = this.db.transaction(() => {
      insertReading.run(reading);
      updatePump.run(reading);
      insertLog.run({
        id: logId,
        pumpId: reading.pumpId,
        message: `Stored ${reading.liters.toFixed(2)}L for ${reading.pumpId}`,
        level: "info",
        createdAt: reading.createdAt
      });
    });

    tx();
  }

  async saveDeviceLog(log: DeviceLog) {
    this.db
      .prepare(
        `
      INSERT INTO device_logs (id, pumpId, message, level, createdAt)
      VALUES (@id, @pumpId, @message, @level, @createdAt)
    `
      )
      .run(log);
  }

  async getOverview(): Promise<DeviceOverview> {
    const pumps = await this.getPumps();
    const readings = this.getReadings(50);
    const totalLiters = readings.reduce((sum, item) => sum + item.liters, 0);
    const totalRevenue = readings.reduce((sum, item) => sum + item.revenue, 0);
    const online = pumps.filter((pump) => pump.status !== "offline").length;
    const active = pumps.filter((pump) => pump.status === "dispensing").length;

    return {
      pumps,
      readings,
      logs: this.getLogs(12),
      stats: {
        totalPumps: pumps.length,
        activePumps: active,
        onlinePumps: online,
        totalLiters: Number(totalLiters.toFixed(2)),
        totalRevenue: Number(totalRevenue.toFixed(2))
      }
    };
  }
}
