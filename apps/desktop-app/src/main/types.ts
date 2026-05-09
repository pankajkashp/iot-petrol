import type {
  DeviceLog,
  DeviceOverview,
  PumpDefinition,
  PumpReading,
  PumpStatus
} from "@fuel/device-core";

export type PumpRow = PumpDefinition;
export type DeviceLogRow = DeviceLog;
export type ReadingRow = PumpReading;
export type OverviewStats = DeviceOverview["stats"];
