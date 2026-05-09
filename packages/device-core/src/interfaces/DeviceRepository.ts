import type { PumpDefinition, PumpReading, DeviceLog, DeviceOverview } from "../types";

export interface PumpRepository {
  getPumps(): Promise<PumpDefinition[]>;
  savePumpState(pump: Pick<PumpDefinition, "pumpId" | "status" | "liters" | "revenue" | "lastReadingAt">): Promise<void>;
}

export interface ReadingRepository {
  getReadings(limit?: number): Promise<PumpReading[]>;
  saveReading(reading: PumpReading): Promise<void>;
}

export interface LogRepository {
  getLogs(limit?: number): Promise<DeviceLog[]>;
  saveDeviceLog(log: DeviceLog): Promise<void>;
}

export interface DeviceRepository extends PumpRepository, ReadingRepository, LogRepository {
  getOverview(): Promise<DeviceOverview>;
}
