import type { DeviceLog, DeviceOverview, PumpDefinition, PumpReading } from "../types";

export interface DeviceRepository {
  getPumps(): Promise<PumpDefinition[]>;
  getOverview(): Promise<DeviceOverview>;
  savePumpState(pump: Pick<PumpDefinition, "pumpId" | "status" | "liters" | "revenue" | "lastReadingAt">): Promise<void>;
  saveReading(reading: PumpReading): Promise<void>;
  saveDeviceLog(log: DeviceLog): Promise<void>;
}
