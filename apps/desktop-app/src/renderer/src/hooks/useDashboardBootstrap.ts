import { useEffect, useRef } from "react";
import { useDashboardStore } from "../store/useDashboardStore";
import { resolveDesktopApi } from "../services/desktopApi";

export function useDashboardBootstrap() {
  const setOverview = useDashboardStore((state) => state.setOverview);
  const activePumpRef = useRef<string | null>(null);

  useEffect(() => {
    const api = resolveDesktopApi();
    let unsubscribe: (() => void) | undefined;
    let simulatorInterval: NodeJS.Timeout | undefined;

    const load = async () => {
      const overview = await api.getOverview();
      setOverview(overview);

      // Subscribe to live updates
      unsubscribe = api.onEvent(async () => {
        const refreshed = await api.getOverview();
        setOverview(refreshed);
      });

      // Start continuous simulation: generate random active pumps
      simulatorInterval = setInterval(async () => {
        const currentOverview = await api.getOverview();
        
        // If no active sessions, start one on a random pump
        if (currentOverview.activeSessions.length === 0 && currentOverview.pumps.length > 0) {
          const randomPump = currentOverview.pumps[
            Math.floor(Math.random() * currentOverview.pumps.length)
          ];
          activePumpRef.current = randomPump.pumpId;
          await api.toggleSensorFeed(randomPump.pumpId);
        } else if (
          // End active session randomly (5% chance per interval)
          currentOverview.activeSessions.length > 0 &&
          Math.random() < 0.05
        ) {
          const sessionToEnd = currentOverview.activeSessions[0];
          activePumpRef.current = null;
          await api.toggleSensorFeed(sessionToEnd.pumpId);
        }
      }, 3000); // Check every 3 seconds
    };

    void load();

    return () => {
      unsubscribe?.();
      if (simulatorInterval) clearInterval(simulatorInterval);
    };
  }, [setOverview]);
}
