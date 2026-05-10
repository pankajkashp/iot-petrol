export type PumpStatus = "idle" | "dispensing" | "offline" | "error";
export type FuelType = "petrol" | "diesel" | "cng";

/**
 * Core Transactional Entity
 * Represents a single nozzle lift to nozzle replace event
 */
export interface DispensingSession {
  id: string;             // UUID
  pumpId: string;
  fuelType: FuelType;
  liters: number;
  pricePerLiter: number;
  totalAmount: number;
  status: "active" | "completed" | "cancelled";
  startedAt: string;
  endedAt?: string;
  durationSeconds: number;
  isSynced: boolean;      // For future cloud sync
  createdAt: string;
}

/**
 * Physical Pump/Nozzle Configuration
 */
export interface PumpDefinition {
  pumpId: string;
  pumpName: string;
  nozzle: string;
  fuelType: FuelType;
  pricePerLiter: number;
  status: PumpStatus;
  totalLitersLifetime: number;
  totalRevenueLifetime: number;
  lastSessionAt: string | null;
}

/**
 * Hierarchical Reporting Models
 */
export interface BaseReport {
  id: string;
  fuelType?: FuelType;
  pumpId?: string;
  totalLiters: number;
  totalRevenue: number;
  sessionCount: number;
  timestamp: string;
}

export interface DailyReport extends BaseReport {
  date: string; // YYYY-MM-DD
}

export interface MonthlyReport extends BaseReport {
  month: string; // YYYY-MM
}

export interface YearlyReport extends BaseReport {
  year: string; // YYYY
}

/**
 * System Context / Overview
 */
export interface DeviceOverview {
  pumps: PumpDefinition[];
  activeSessions: DispensingSession[];
  recentSessions: DispensingSession[];
  logs: DeviceLog[];
  stats: {
    todayRevenue: number;
    todayLiters: number;
    todaySessions: number;
    activePumps: number;
  };
}

export interface DeviceLog {
  id: string;
  pumpId?: string;
  message: string;
  level: "info" | "warn" | "error";
  createdAt: string;
}

/**
 * Fuel Pricing
 */
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

/**
 * Legacy Types (For incremental refactor)
 */
export interface PumpReading {
  id: string;
  pumpId: string;
  fuelType: FuelType;
  status: PumpStatus;
  liters: number;
  revenue: number;
  flowRate?: number;
  sessionDuration?: number;
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
