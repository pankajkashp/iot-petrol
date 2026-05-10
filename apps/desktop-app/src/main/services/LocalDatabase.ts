import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { app } from "electron";
import type {
  DeviceLog,
  DeviceOverview,
  DispensingSession,
  PumpDefinition,
  DailyReport,
  MonthlyReport,
  YearlyReport,
  FuelPrice,
  FuelType
} from "@fuel/shared-types";

type DatabaseInstance = ReturnType<typeof Database>;

export class LocalDatabase {
  private db!: DatabaseInstance;

  initialize() {
    const dataDir = path.join(app.getPath("userData"), "pumpcore-data");
    fs.mkdirSync(dataDir, { recursive: true });
    this.db = new Database(path.join(dataDir, "station.sqlite"));
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
        totalLitersLifetime REAL NOT NULL DEFAULT 0,
        totalRevenueLifetime REAL NOT NULL DEFAULT 0,
        lastSessionAt TEXT
      );

      CREATE TABLE IF NOT EXISTS dispensing_sessions (
        id TEXT PRIMARY KEY,
        pumpId TEXT NOT NULL,
        fuelType TEXT NOT NULL,
        liters REAL NOT NULL,
        pricePerLiter REAL NOT NULL,
        totalAmount REAL NOT NULL,
        status TEXT NOT NULL,
        startedAt TEXT NOT NULL,
        endedAt TEXT,
        durationSeconds INTEGER NOT NULL DEFAULT 0,
        isSynced INTEGER DEFAULT 0,
        createdAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS daily_reports (
        id TEXT PRIMARY KEY,
        date TEXT UNIQUE NOT NULL,
        totalLiters REAL NOT NULL,
        totalRevenue REAL NOT NULL,
        sessionCount INTEGER NOT NULL,
        timestamp TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS fuel_prices (
        fuelType TEXT NOT NULL,
        city TEXT NOT NULL,
        price REAL NOT NULL,
        provider TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        PRIMARY KEY (fuelType, city)
      );

      CREATE TABLE IF NOT EXISTS device_logs (
        id TEXT PRIMARY KEY,
        pumpId TEXT,
        message TEXT NOT NULL,
        level TEXT NOT NULL,
        createdAt TEXT NOT NULL
      );
    `);
  }

  private seedPumps() {
    const count = this.db.prepare("SELECT COUNT(*) as count FROM pumps").get() as { count: number };
    if (count.count > 0) return;

    const insert = this.db.prepare(`
      INSERT INTO pumps (id, name, nozzle, fuelType, pricePerLiter, status)
      VALUES (@id, @name, @nozzle, @fuelType, @pricePerLiter, @status)
    `);

    const defaults = [
      { id: "P-001", name: "Pump 01", nozzle: "N-1", fuelType: "petrol", pricePerLiter: 104.5, status: "idle" },
      { id: "P-002", name: "Pump 02", nozzle: "N-2", fuelType: "diesel", pricePerLiter: 92.1, status: "idle" },
      { id: "P-003", name: "Pump 03", nozzle: "N-1", fuelType: "petrol", pricePerLiter: 104.5, status: "idle" },
      { id: "P-004", name: "Pump 04", nozzle: "N-2", fuelType: "cng", pricePerLiter: 78.4, status: "idle" }
    ];

    const tx = this.db.transaction((rows) => {
      rows.forEach((row) => insert.run(row));
    });
    tx(defaults);
  }

  // --- Pump Operations ---

  async getPumps(): Promise<PumpDefinition[]> {
    const rows = this.db.prepare("SELECT * FROM pumps ORDER BY name ASC").all() as any[];
    return rows.map(r => ({
      pumpId: r.id,
      pumpName: r.name,
      nozzle: r.nozzle,
      fuelType: r.fuelType,
      pricePerLiter: r.pricePerLiter,
      status: r.status,
      totalLitersLifetime: r.totalLitersLifetime,
      totalRevenueLifetime: r.totalRevenueLifetime,
      lastSessionAt: r.lastSessionAt
    }));
  }

  async updatePumpStatus(pumpId: string, status: PumpStatus) {
    this.db.prepare("UPDATE pumps SET status = ? WHERE id = ?").run(status, pumpId);
  }

  // --- Session Operations ---

  async saveSession(session: DispensingSession) {
    const insert = this.db.prepare(`
      INSERT OR REPLACE INTO dispensing_sessions 
      (id, pumpId, fuelType, liters, pricePerLiter, totalAmount, status, startedAt, endedAt, durationSeconds, createdAt)
      VALUES (@id, @pumpId, @fuelType, @liters, @pricePerLiter, @totalAmount, @status, @startedAt, @endedAt, @durationSeconds, @createdAt)
    `);

    const updatePumpTotals = this.db.prepare(`
      UPDATE pumps 
      SET totalLitersLifetime = totalLitersLifetime + @liters,
          totalRevenueLifetime = totalRevenueLifetime + @totalAmount,
          lastSessionAt = @endedAt
      WHERE id = @pumpId
    `);

    const tx = this.db.transaction((s: DispensingSession) => {
      insert.run(s);
      if (s.status === "completed") {
        updatePumpTotals.run({ 
          pumpId: s.pumpId, 
          liters: s.liters, 
          totalAmount: s.totalAmount, 
          endedAt: s.endedAt 
        });
      }
    });

    tx(session);
  }

  async getRecentSessions(limit = 20): Promise<DispensingSession[]> {
    return this.db.prepare("SELECT * FROM dispensing_sessions ORDER BY createdAt DESC LIMIT ?").all(limit) as any[];
  }

  // --- Reporting & Overview ---

  async getOverview(): Promise<DeviceOverview> {
    const pumps = await this.getPumps();
    const today = new Date().toISOString().split("T")[0];
    
    const todayStats = this.db.prepare(`
      SELECT 
        SUM(totalAmount) as revenue, 
        SUM(liters) as liters, 
        COUNT(*) as sessions 
      FROM dispensing_sessions 
      WHERE startedAt LIKE ? AND status = 'completed'
    `).get(`${today}%`) as { revenue: number, liters: number, sessions: number };

    const recentSessions = await this.getRecentSessions(10);
    const activePumps = pumps.filter(p => p.status === "dispensing").length;

    return {
      pumps,
      activeSessions: [], // Managed by DeviceManager in memory
      recentSessions,
      stats: {
        todayRevenue: todayStats.revenue || 0,
        todayLiters: todayStats.liters || 0,
        todaySessions: todayStats.sessions || 0,
        activePumps
      }
    };
  }

  async saveDeviceLog(log: DeviceLog) {
    this.db.prepare(`
      INSERT INTO device_logs (id, pumpId, message, level, createdAt)
      VALUES (@id, @pumpId, @message, @level, @createdAt)
    `).run(log);
  }

  async getLogs(limit = 50): Promise<DeviceLog[]> {
    return this.db.prepare("SELECT * FROM device_logs ORDER BY createdAt DESC LIMIT ?").all(limit) as any[];
  }
}
