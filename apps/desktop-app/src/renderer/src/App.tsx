import { useDashboardBootstrap } from "./hooks/useDashboardBootstrap";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { DevicesPage } from "./pages/DevicesPage";
import { PumpsPage } from "./pages/PumpsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PumpDetailPage } from "./pages/PumpDetailPage";
import { useDashboardStore } from "./store/useDashboardStore";

const pages = {
  dashboard: DashboardPage,
  pumps: PumpsPage,
  devices: DevicesPage,
  settings: SettingsPage,
  "pump-detail": PumpDetailPage
} as const;

export default function App() {
  useDashboardBootstrap();
  const activePage = useDashboardStore((state) => state.activePage);
  const Page = pages[activePage];

  return (
    <AppShell>
      <header className="topbar">
        <div className="topbar-title">
          <strong>Fuel Station Operations</strong>
          <span>Live local monitoring and device control</span>
        </div>
        <div className="topbar-meta">
          <span>Local-first</span>
          <span className="status-pill tone-dispensing">Sensor feed mode</span>
        </div>
      </header>
      <Page />
    </AppShell>
  );
}
