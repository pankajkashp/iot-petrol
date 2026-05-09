export type PumpStatus = "idle" | "dispensing" | "offline" | "error";
export type FuelType = "petrol" | "diesel" | "cng";

export interface PumpReading {
  id: string;
  pumpId: string;
  fuelType: FuelType;
  status: PumpStatus;
  liters: number;
  revenue: number;
  flowRate?: number; // L/s
  sessionDuration?: number; // seconds
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
  fuelType: FuelType;
  pricePerLiter: number;
}

export interface PumpDefinition extends PumpDeviceConfig {
  nozzle: string;
  status: PumpStatus;
  liters: number;
  revenue: number;
  flowRate?: number;
  sessionDuration?: number;
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

// Fuel Price Types
export interface FuelPrice {
  fuelType: FuelType;
  price: number;
  city: string;
  provider: string;
  updatedAt: string;
}

export interface FuelPriceUpdate {
  city: string;
  prices: Array<{
    fuelType: FuelType;
    price: number;
  }>;
}
