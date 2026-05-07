export type PumpStatus = "idle" | "dispensing" | "offline" | "error";

export interface PumpModel {
  id: string;
  name: string;
  nozzle: string;
  fuelType: "petrol" | "diesel" | "cng";
  pricePerLiter: number;
  status: PumpStatus;
  liters: number;
  revenue: number;
  lastReadingAt: string | null;
}

export interface ReadingModel {
  id: string;
  pumpId: string;
  fuelType: "petrol" | "diesel" | "cng";
  status: PumpStatus;
  liters: number;
  revenue: number;
  createdAt: string;
}

export interface DeviceLogModel {
  id: string;
  pumpId: string;
  message: string;
  level: "info" | "warn" | "error";
  createdAt: string;
}

export interface OverviewModel {
  pumps: PumpModel[];
  readings: ReadingModel[];
  logs: DeviceLogModel[];
  stats: {
    totalPumps: number;
    onlinePumps: number;
    totalLiters: number;
    totalRevenue: number;
  };
}

export interface DesktopApi {
  getOverview: () => Promise<OverviewModel>;
  getPumps: () => Promise<PumpModel[]>;
  getReadings: () => Promise<ReadingModel[]>;
  getLogs: () => Promise<DeviceLogModel[]>;
  onReading: (callback: (payload: unknown) => void) => () => void;
}
