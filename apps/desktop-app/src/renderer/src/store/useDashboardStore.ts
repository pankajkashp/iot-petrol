import { create } from "zustand";
import type { DeviceOverview, PumpDefinition } from "@fuel/device-core";

export type PumpStatus = PumpDefinition["status"];
export type PumpCardModel = PumpDefinition;

interface DashboardState {
  isLoading: boolean;
  pumps: PumpCardModel[];
  readings: DeviceOverview["readings"];
  logs: DeviceOverview["logs"];
  stats: DeviceOverview["stats"];
  setLoading: (loading: boolean) => void;
  setOverview: (overview: DeviceOverview) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isLoading: true,
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
  setLoading: (loading) => set({ isLoading: loading }),
  setOverview: (overview) => set({ ...overview, isLoading: false })
}));
