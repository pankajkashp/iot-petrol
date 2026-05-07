import { useEffect } from "react";
import { useDashboardStore } from "../store/useDashboardStore";

export function useDashboardBootstrap() {
  const setOverview = useDashboardStore((state) => state.setOverview);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const load = async () => {
      const overview = await window.desktopApi.getOverview();
      setOverview(overview);
      unsubscribe = window.desktopApi.onReading(async () => {
        const refreshed = await window.desktopApi.getOverview();
        setOverview(refreshed);
      });
    };

    void load();

    return () => {
      unsubscribe?.();
    };
  }, [setOverview]);
}
