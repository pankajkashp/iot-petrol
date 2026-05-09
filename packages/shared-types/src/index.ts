export type PumpStatus = "idle" | "dispensing" | "offline" | "error";

export interface PumpReading {
  id: string;
  pumpId: string;
  fuelType: "petrol" | "diesel" | "cng";
  status: PumpStatus;
  liters: number;
  revenue: number;
  createdAt: string;
}

export interface PumpDeviceStatus {
  pumpId: string;
  connected: boolean;
  status: PumpStatus;
  lastSeenAt: string;
}

export interface PumpDeviceConfig {
  pumpId: string;
  pumpName: string;
  fuelType: PumpReading["fuelType"];
  pricePerLiter: number;
}

export interface PumpDefinition extends PumpDeviceConfig {
  nozzle: string;
  status: PumpStatus;
  liters: number;
  revenue: number;
  lastReadingAt: string | null;
}

export interface DeviceOverview {
  pumps: PumpDefinition[];
  readings: PumpReading[];
  logs: DeviceLog[];
  stats: {
    totalPumps: number;
    activePumps: number;
    onlinePumps: number;
    totalLiters: number;
    totalRevenue: number;
  };
}

export interface DeviceLog {
  id: string;
  pumpId: string;
  message: string;
  level: "info" | "warn" | "error";
  createdAt: string;
}
