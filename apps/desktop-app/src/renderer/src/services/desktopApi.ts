import type { DeviceEventModel, DesktopApi, DeviceLogModel, OverviewModel, PumpModel, ReadingModel } from "../types/desktop-api";

const fuelTypes = ["petrol", "diesel", "cng"] as const;

const createMockPump = (index: number): PumpModel => ({
  pumpId: `mock-pump-${index + 1}`,
  pumpName: `Pump ${String.fromCharCode(65 + index)}-${String(index + 1).padStart(2, "0")}`,
  nozzle: `Nozzle ${index + 1}`,
  fuelType: fuelTypes[index % fuelTypes.length]!,
  pricePerLiter: [108.25, 92.75, 74.15, 91.1][index % 4]!,
  status: "idle",
  liters: 0,
  revenue: 0,
  lastReadingAt: null
});

const createInitialOverview = (): OverviewModel => {
  const pumps = [0, 1, 2, 3].map(createMockPump);
  return {
    pumps,
    readings: [],
    logs: [],
    stats: {
      totalPumps: pumps.length,
      activePumps: 0,
      onlinePumps: pumps.length,
      totalLiters: 0,
      totalRevenue: 0
    }
  };
};

let mockDesktopApi: DesktopApi | null = null;

const createMockDesktopApi = (): DesktopApi => {
  const state = createInitialOverview();
  const listeners = new Set<(event: DeviceEventModel) => void>();
  const sensorTimers = new Map<string, ReturnType<typeof setInterval>>();

  const recomputeStats = () => {
    state.stats = {
      totalPumps: state.pumps.length,
      activePumps: state.pumps.filter((item) => item.status === "dispensing").length,
      onlinePumps: state.pumps.filter((item) => item.status !== "offline").length,
      totalLiters: Number(state.readings.reduce((sum, item) => sum + item.liters, 0).toFixed(2)),
      totalRevenue: Number(state.readings.reduce((sum, item) => sum + item.revenue, 0).toFixed(2))
    };
  };

  const pushReading = (pump: PumpModel, delta: number, now: string) => {
    pump.lastReadingAt = now;

    const reading: ReadingModel = {
      id: crypto.randomUUID(),
      pumpId: pump.pumpId,
      fuelType: pump.fuelType,
      status: pump.status,
      liters: pump.liters,
      revenue: pump.revenue,
      createdAt: now
    };

    state.readings = [reading, ...state.readings].slice(0, 24);
    state.logs = [
      {
        id: crypto.randomUUID(),
        pumpId: pump.pumpId,
        message: `${pump.pumpName} sensor reading: ${pump.liters.toFixed(2)}L`,
        level: "info" as const,
        createdAt: now
      },
      ...state.logs
    ].slice(0, 24);

    recomputeStats();

    listeners.forEach((listener) =>
      listener({
        type: "FLOW_UPDATED",
        pumpId: pump.pumpId,
        timestamp: now,
        payload: { liters: pump.liters, revenue: pump.revenue, status: pump.status, delta }
      })
    );
  };

  return {
    getOverview: async () => state,
    getPumps: async () => state.pumps,
    getReadings: async () => state.readings,
    getLogs: async () => state.logs,
    toggleSensorFeed: async (pumpId: string) => {
      const pump = state.pumps.find((item) => item.pumpId === pumpId);
      if (!pump) {
        return;
      }

      const activeTimer = sensorTimers.get(pumpId);
      const now = new Date().toISOString();

      if (activeTimer) {
        clearInterval(activeTimer);
        sensorTimers.delete(pumpId);
        pump.status = "idle";
        state.logs = [
          {
            id: crypto.randomUUID(),
            pumpId: pump.pumpId,
            message: `${pump.pumpName} sensor stopped`,
            level: "info" as const,
            createdAt: now
          },
          ...state.logs
        ].slice(0, 24);
        recomputeStats();
        listeners.forEach((listener) =>
          listener({
            type: "PUMP_STOPPED",
            pumpId: pump.pumpId,
            timestamp: now,
            payload: { fuelType: pump.fuelType }
          })
        );
        return;
      }

      const startedAt = new Date().toISOString();
      pump.status = "dispensing";
      state.logs = [
        {
          id: crypto.randomUUID(),
          pumpId: pump.pumpId,
          message: `${pump.pumpName} sensor started`,
          level: "info" as const,
          createdAt: startedAt
        },
        ...state.logs
      ].slice(0, 24);
      recomputeStats();
      listeners.forEach((listener) =>
        listener({
          type: "PUMP_STARTED",
          pumpId: pump.pumpId,
          timestamp: startedAt,
          payload: { fuelType: pump.fuelType }
        })
      );

      const tick = () => {
        const delta = Number((1.5 + Math.random() * 8.5).toFixed(2));
        pump.liters = Number((pump.liters + delta).toFixed(2));
        pump.revenue = Number((pump.revenue + delta * pump.pricePerLiter).toFixed(2));
        pushReading(pump, delta, new Date().toISOString());
      };

      tick();
      const timer = setInterval(tick, 2500);
      sensorTimers.set(pumpId, timer);
    },
    onEvent: (callback) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    getFuelPrices: async (city) => {
      return [
        { fuelType: "petrol", price: 108.25, city, provider: "Mock", updatedAt: new Date().toISOString() },
        { fuelType: "diesel", price: 92.75, city, provider: "Mock", updatedAt: new Date().toISOString() },
        { fuelType: "cng", price: 74.15, city, provider: "Mock", updatedAt: new Date().toISOString() },
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
