import type {
  DesktopApi,
  DeviceEventModel,
  DeviceLogModel,
  OverviewModel,
  PumpModel,
  PumpStatus,
  ReadingModel
} from "../types/desktop-api";

const fuelTypes = ["petrol", "diesel", "cng"] as const;
const statuses: PumpStatus[] = ["idle", "dispensing", "idle", "idle"];

const createMockPump = (index: number): PumpModel => ({
  id: `mock-pump-${index + 1}`,
  name: `Pump ${String.fromCharCode(65 + index)}-${String(index + 1).padStart(2, "0")}`,
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

  const tick = () => {
    const now = new Date().toISOString();
    const nextReading = state.pumps.map((pump, index) => {
      const cycle = Math.floor(Date.now() / 1000) + index;
      const isOnline = cycle % 13 !== 0;
      const status = isOnline ? statuses[cycle % statuses.length] ?? "idle" : "offline";
      const delta = status === "dispensing" ? 4 + Math.random() * 11 : Math.random() * 0.6;
      const liters = Number((pump.liters + delta).toFixed(2));
      const revenue = Number((liters * pump.pricePerLiter).toFixed(2));
      const updatedPump: PumpModel = {
        ...pump,
        status,
        liters,
        revenue,
        lastReadingAt: now
      };

      const reading: ReadingModel = {
        id: crypto.randomUUID(),
        pumpId: pump.id,
        fuelType: pump.fuelType,
        status,
        liters,
        revenue,
        createdAt: now
      };

      if (!isOnline) {
        listeners.forEach((listener) =>
          listener({
            type: "device:offline",
            pumpId: pump.id,
            timestamp: now,
            payload: { name: pump.name }
          })
        );
      } else if (pump.status === "offline") {
        listeners.forEach((listener) =>
          listener({
            type: "device:online",
            pumpId: pump.id,
            timestamp: now,
            payload: { name: pump.name }
          })
        );
      }

      if (pump.status !== "dispensing" && status === "dispensing") {
        listeners.forEach((listener) =>
          listener({
            type: "pump:started",
            pumpId: pump.id,
            timestamp: now,
            payload: { fuelType: pump.fuelType }
          })
        );
      }

      if (pump.status === "dispensing" && status === "idle") {
        listeners.forEach((listener) =>
          listener({
            type: "pump:stopped",
            pumpId: pump.id,
            timestamp: now,
            payload: { fuelType: pump.fuelType }
          })
        );
      }

      listeners.forEach((listener) =>
        listener({
          type: "pump:reading",
          pumpId: pump.id,
          timestamp: now,
          payload: {
            liters,
            revenue,
            status
          }
        })
      );

      state.logs.unshift({
        id: crypto.randomUUID(),
        pumpId: pump.id,
        message: `${pump.name} reported ${liters.toFixed(2)}L`,
        level: "info",
        createdAt: now
      });

      return { updatedPump, reading };
    });

    state.pumps = nextReading.map((item) => item.updatedPump);
    state.readings = [...nextReading.map((item) => item.reading), ...state.readings].slice(0, 24);
    state.logs = state.logs.slice(0, 24);
    state.stats = {
      totalPumps: state.pumps.length,
      activePumps: state.pumps.filter((pump) => pump.status === "dispensing").length,
      onlinePumps: state.pumps.filter((pump) => pump.status !== "offline").length,
      totalLiters: Number(state.readings.reduce((sum, reading) => sum + reading.liters, 0).toFixed(2)),
      totalRevenue: Number(state.readings.reduce((sum, reading) => sum + reading.revenue, 0).toFixed(2))
    };
  };

  const interval = setInterval(tick, 3000);
  void interval;

  return {
    getOverview: async () => state,
    getPumps: async () => state.pumps,
    getReadings: async () => state.readings,
    getLogs: async () => state.logs,
    onEvent: (callback) => {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
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
