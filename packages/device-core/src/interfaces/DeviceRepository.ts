import type {
  PumpDefinition,
  PumpReading,
  DeviceLog,
  DeviceOverview,
  FuelPrice,
  FuelType
} from "../types";

export interface PumpRepository {
  getPumps(): Promise<PumpDefinition[]>;
  savePumpState(
    pump: Pick<PumpDefinition, "pumpId" | "status" | "liters" | "revenue" | "lastReadingAt">
  ): Promise<void>;
}

export interface ReadingRepository {
  getReadings(limit?: number): Promise<PumpReading[]>;
  saveReading(reading: PumpReading): Promise<void>;
}

export interface LogRepository {
  getLogs(limit?: number): Promise<DeviceLog[]>;
  saveDeviceLog(log: DeviceLog): Promise<void>;
}

export interface FuelPriceRepository {
  getFuelPrices(city: string): Promise<FuelPrice[]>;
  saveFuelPrices(prices: FuelPrice[]): Promise<void>;
  getFuelPriceHistory(fuelType: FuelType, city: string, limit?: number): Promise<FuelPrice[]>;
}

export interface DeviceRepository
  extends PumpRepository,
    ReadingRepository,
    LogRepository,
    FuelPriceRepository {
  getOverview(): Promise<DeviceOverview>;
}
