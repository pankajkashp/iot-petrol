import { useEffect } from "react";
import { useDashboardStore } from "../store/useDashboardStore";
import { resolveDesktopApi } from "../services/desktopApi";

export function useDashboardBootstrap() {
  const setOverview = useDashboardStore((state) => state.setOverview);

  useEffect(() => {
    const api = resolveDesktopApi();
    let unsubscribe: (() => void) | undefined;

    const load = async () => {
      const overview = await api.getOverview();
      setOverview(overview);
      unsubscribe = api.onEvent(async () => {
        const refreshed = await api.getOverview();
        setOverview(refreshed);
      });
    };

    void load();

    return () => {
      unsubscribe?.();
    };
  }, [setOverview]);
}
