import type {
  PumpDefinition,
  DispensingSession,
  DeviceLog,
  DeviceOverview,
  FuelPrice,
  FuelType
} from "../types";

export interface PumpRepository {
  getPumps(): Promise<PumpDefinition[]>;
  savePumpState(
    pump: Pick<PumpDefinition, "pumpId" | "status" | "totalLitersLifetime" | "totalRevenueLifetime" | "lastSessionAt">
  ): Promise<void>;
}

export interface SessionRepository {
  getRecentSessions(limit?: number): Promise<DispensingSession[]>;
  saveSession(session: DispensingSession): Promise<void>;
}

export interface LogRepository {
  getLogs(limit?: number): Promise<DeviceLog[]>;
  saveDeviceLog(log: DeviceLog): Promise<void>;
}

export interface FuelPriceRepository {
  getPrices(city: string): Promise<FuelPrice[]>;
  savePrices(prices: FuelPrice[]): Promise<void>;
  getPriceHistory(fuelType: FuelType, city: string, limit?: number): Promise<FuelPrice[]>;
}

export interface DeviceRepository
  extends PumpRepository,
    SessionRepository,
    LogRepository,
    FuelPriceRepository {
  getOverview(): Promise<DeviceOverview>;
}
