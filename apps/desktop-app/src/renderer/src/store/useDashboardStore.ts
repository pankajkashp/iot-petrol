import { create } from "zustand";
import type { DeviceOverview, PumpDefinition, DispensingSession } from "@fuel/shared-types";

interface DashboardState {
  isLoading: boolean;
  pumps: PumpDefinition[];
  activeSessions: DispensingSession[];
  recentSessions: DispensingSession[];
  logs: DeviceOverview["logs"];
  stats: DeviceOverview["stats"];
  setLoading: (loading: boolean) => void;
  setOverview: (overview: DeviceOverview) => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  isLoading: true,
  pumps: [],
  activeSessions: [],
  recentSessions: [],
  logs: [],
  stats: {
    todayRevenue: 0,
    todayLiters: 0,
    todaySessions: 0,
    activePumps: 0
  },
  setLoading: (loading) => set({ isLoading: loading }),
  setOverview: (overview) => set({ ...overview, isLoading: false })
}));
