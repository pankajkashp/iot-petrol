import type {
  DeviceEvent,
  DeviceLog,
  DeviceOverview,
  PumpDefinition,
  PumpReading,
  FuelPrice,
  FuelType
} from "@fuel/device-core";

export type PumpModel = PumpDefinition;
export type ReadingModel = PumpReading;
export type DeviceLogModel = DeviceLog;
export type OverviewModel = DeviceOverview;
export type DeviceEventModel = DeviceEvent;

export interface DesktopApi {
  getOverview: () => Promise<OverviewModel>;
  getPumps: () => Promise<PumpModel[]>;
  getReadings: () => Promise<ReadingModel[]>;
  getLogs: () => Promise<DeviceLogModel[]>;
  onEvent: (callback: (event: DeviceEventModel) => void) => () => void;
  toggleSensorFeed: (pumpId: string) => Promise<void>;
  
  // Fuel Price Engine
  getFuelPrices: (city: string, refresh?: boolean) => Promise<FuelPrice[]>;
  getFuelHistory: (fuelType: FuelType, city: string, limit?: number) => Promise<FuelPrice[]>;
}
