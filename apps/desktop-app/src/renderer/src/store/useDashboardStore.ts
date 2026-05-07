import { create } from "zustand";

export type PumpStatus = "idle" | "dispensing" | "offline" | "error";

export interface PumpCardModel {
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

interface DashboardState {
  activePage: "dashboard" | "pumps" | "devices" | "settings";
  pumps: PumpCardModel[];
  readings: Array<{
    id: string;
    pumpId: string;
    fuelType: "petrol" | "diesel" | "cng";
    status: PumpStatus;
    liters: number;
    revenue: number;
    createdAt: string;
  }>;
  logs: Array<{
    id: string;
    pumpId: string;
    message: string;
    level: "info" | "warn" | "error";
    createdAt: string;
  }>;
  stats: {
    totalPumps: number;
    activePumps: number;
    onlinePumps: number;
    totalLiters: number;
    totalRevenue: number;
  };
  setActivePage: (page: DashboardState["activePage"]) => void;
  setOverview: (overview: {
    pumps: PumpCardModel[];
    readings: DashboardState["readings"];
    logs: DashboardState["logs"];
    stats: DashboardState["stats"];
  }) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activePage: "dashboard",
  pumps: [],
  readings: [],
  logs: [],
  stats: {
    totalPumps: 0,
    activePumps: 0,
    onlinePumps: 0,
    totalLiters: 0,
    totalRevenue: 0
  },
  setActivePage: (page) => set({ activePage: page }),
  setOverview: (overview) => set(overview)
}));
