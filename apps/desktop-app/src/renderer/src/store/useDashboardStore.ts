import { create } from "zustand";
import type { DeviceOverview, PumpDefinition } from "@fuel/device-core";

export type PumpStatus = PumpDefinition["status"];
export type PumpCardModel = PumpDefinition;

interface DashboardState {
  pumps: PumpCardModel[];
  readings: DeviceOverview["readings"];
  logs: DeviceOverview["logs"];
  stats: DeviceOverview["stats"];
  setOverview: (overview: DeviceOverview) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
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
  setOverview: (overview) => set(overview)
}));
