export {};

declare global {
  interface Window {
    desktopApi: {
      getOverview: () => Promise<{
        pumps: Array<{
          id: string;
          name: string;
          nozzle: string;
          fuelType: "petrol" | "diesel" | "cng";
          pricePerLiter: number;
          status: "idle" | "dispensing" | "offline" | "error";
          liters: number;
          revenue: number;
          lastReadingAt: string | null;
        }>;
        readings: Array<{
          id: string;
          pumpId: string;
          fuelType: "petrol" | "diesel" | "cng";
          status: "idle" | "dispensing" | "offline" | "error";
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
          onlinePumps: number;
          totalLiters: number;
          totalRevenue: number;
        };
      }>;
      getPumps: () => Promise<unknown>;
      getReadings: () => Promise<unknown>;
      getLogs: () => Promise<unknown>;
      onReading: (callback: (payload: unknown) => void) => () => void;
    };
  }
}
