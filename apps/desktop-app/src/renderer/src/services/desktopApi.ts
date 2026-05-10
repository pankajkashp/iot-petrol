import type { 
  DeviceEventModel, 
  DesktopApi, 
  DeviceLogModel, 
  OverviewModel, 
  PumpModel 
} from "../types/desktop-api";
import type { DispensingSession } from "@fuel/shared-types";

const fuelTypes = ["petrol", "diesel", "cng"] as const;

const createMockPump = (index: number): PumpModel => ({
  pumpId: `P-00${index + 1}`,
  pumpName: `Pump ${String.fromCharCode(65 + index)}-${String(index + 1).padStart(2, "0")}`,
  nozzle: `N-${index + 1}`,
  fuelType: fuelTypes[index % fuelTypes.length]!,
  pricePerLiter: [108.25, 92.75, 74.15, 91.1][index % 4]!,
  status: "idle",
  totalLitersLifetime: 1200 + index * 500,
  totalRevenueLifetime: 125000 + index * 45000,
  lastSessionAt: new Date(Date.now() - 3600000).toISOString()
});

const createInitialOverview = (): OverviewModel => {
  const pumps = [0, 1, 2, 3].map(createMockPump);
  return {
    pumps,
    activeSessions: [],
    recentSessions: [],
    logs: [],
    stats: {
      todayRevenue: 0,
      todayLiters: 0,
      todaySessions: 0,
      activePumps: 0
    }
  };
};

let mockDesktopApi: DesktopApi | null = null;

const createMockDesktopApi = (): DesktopApi => {
  const state = createInitialOverview();
  const listeners = new Set<(event: DeviceEventModel) => void>();
  const activeIntervals = new Map<string, ReturnType<typeof setInterval>>();

  const recomputeStats = () => {
    state.stats = {
      todayRevenue: state.recentSessions.reduce((sum, s) => sum + s.totalAmount, 0),
      todayLiters: state.recentSessions.reduce((sum, s) => sum + s.liters, 0),
      todaySessions: state.recentSessions.length,
      activePumps: state.activeSessions.length
    };
  };

  const broadcastOverview = () => {
    listeners.forEach(l => l({
      type: "DEVICE_ONLINE", // Generic event to trigger refresh
      pumpId: "system",
      timestamp: new Date().toISOString(),
      payload: { refresh: true }
    }));
  };

  return {
    getOverview: async () => state,
    getPumps: async () => state.pumps,
    getReadings: async () => [],
    getLogs: async () => state.logs,
    
    toggleSensorFeed: async (pumpId: string) => {
      const pump = state.pumps.find(p => p.pumpId === pumpId);
      if (!pump) return;

      if (activeIntervals.has(pumpId)) {
        // Finalize session
        const interval = activeIntervals.get(pumpId)!;
        clearInterval(interval);
        activeIntervals.delete(pumpId);

        const sessionIndex = state.activeSessions.findIndex(s => s.pumpId === pumpId);
        if (sessionIndex !== -1) {
          const session = state.activeSessions[sessionIndex]!;
          session.status = "completed";
          session.endedAt = new Date().toISOString();
          
          state.recentSessions = [session, ...state.recentSessions].slice(0, 20);
          state.activeSessions.splice(sessionIndex, 1);
          
          pump.status = "idle";
          pump.totalLitersLifetime += session.liters;
          pump.totalRevenueLifetime += session.totalAmount;
          pump.lastSessionAt = session.endedAt;

          state.logs = [{
            id: crypto.randomUUID(),
            pumpId,
            message: `Transaction Finalized: ${session.liters.toFixed(2)}L @ ${pump.pumpName}`,
            level: "info",
            createdAt: session.endedAt
          }, ...state.logs].slice(0, 50);
        }
      } else {
        // Start session
        pump.status = "dispensing";
        const session: DispensingSession = {
          id: crypto.randomUUID(),
          pumpId,
          fuelType: pump.fuelType,
          liters: 0,
          pricePerLiter: pump.pricePerLiter,
          totalAmount: 0,
          status: "active",
          startedAt: new Date().toISOString(),
          durationSeconds: 0,
          isSynced: false,
          createdAt: new Date().toISOString()
        };

        state.activeSessions.push(session);
        
        const interval = setInterval(() => {
          const delta = 0.5 + Math.random() * 1.5;
          session.liters += delta;
          session.totalAmount = Number((session.liters * session.pricePerLiter).toFixed(2));
          session.durationSeconds = Math.floor((Date.now() - new Date(session.startedAt).getTime()) / 1000);
          broadcastOverview();
        }, 1000);

        activeIntervals.set(pumpId, interval);
      }

      recomputeStats();
      broadcastOverview();
    },

    onEvent: (callback) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },

    getFuelPrices: async (city) => {
      return [
        { fuelType: "petrol", price: 104.50, city, provider: "Mock", updatedAt: new Date().toISOString() },
        { fuelType: "diesel", price: 92.10, city, provider: "Mock", updatedAt: new Date().toISOString() },
        { fuelType: "cng", price: 78.40, city, provider: "Mock", updatedAt: new Date().toISOString() },
      ];
    },

    getFuelHistory: async (fuelType, city) => {
      return Array.from({ length: 5 }).map((_, i) => ({
        fuelType,
        price: 100 + Math.random() * 10,
        city,
        provider: "Mock",
        updatedAt: new Date(Date.now() - i * 86400000).toISOString()
      }));
    }
  };
};

export function resolveDesktopApi(): DesktopApi {
  if (typeof window !== "undefined" && window.desktopApi) {
    return window.desktopApi;
  }

  mockDesktopApi ??= createMockDesktopApi();
  return mockDesktopApi;
}
