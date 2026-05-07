import { useDashboardBootstrap } from "./hooks/useDashboardBootstrap";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { DevicesPage } from "./pages/DevicesPage";
import { PumpsPage } from "./pages/PumpsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { useDashboardStore } from "./store/useDashboardStore";

const pages = {
  dashboard: DashboardPage,
  pumps: PumpsPage,
  devices: DevicesPage,
  settings: SettingsPage
} as const;

export default function App() {
  useDashboardBootstrap();
  const activePage = useDashboardStore((state) => state.activePage);
  const Page = pages[activePage];

  return (
    <AppShell>
      <Page />
    </AppShell>
  );
}
