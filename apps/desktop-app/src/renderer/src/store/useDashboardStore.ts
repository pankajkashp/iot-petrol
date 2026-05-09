import { create } from "zustand";
import type { DeviceOverview, PumpDefinition } from "@fuel/device-core";

export type PumpStatus = PumpDefinition["status"];
export type PumpCardModel = PumpDefinition;

interface DashboardState {
  activePage: "dashboard" | "pumps" | "devices" | "settings" | "pump-detail";
  selectedPumpId: string | null;
  pumps: PumpCardModel[];
  readings: DeviceOverview["readings"];
  logs: DeviceOverview["logs"];
  stats: DeviceOverview["stats"];
  setActivePage: (page: DashboardState["activePage"]) => void;
  setSelectedPumpId: (id: string | null) => void;
  setOverview: (overview: DeviceOverview) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  activePage: "dashboard",
  selectedPumpId: null,
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
  setSelectedPumpId: (id) => set({ selectedPumpId: id, activePage: id ? "pump-detail" : "pumps" }),
  setOverview: (overview) => set(overview)
}));
