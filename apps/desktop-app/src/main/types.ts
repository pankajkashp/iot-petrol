import type { PumpReading, PumpStatus } from "@fuel/device-core";

export interface PumpRow {
  id: string;
  name: string;
  nozzle: string;
  fuelType: PumpReading["fuelType"];
  pricePerLiter: number;
  status: PumpStatus;
  liters: number;
  revenue: number;
  lastReadingAt: string | null;
}

export interface OverviewStats {
  totalPumps: number;
  activePumps: number;
  onlinePumps: number;
  totalLiters: number;
  totalRevenue: number;
}

export interface DeviceLogRow {
  id: string;
  pumpId: string;
  message: string;
  level: "info" | "warn" | "error";
  createdAt: string;
}

export interface ReadingRow extends PumpReading {}
