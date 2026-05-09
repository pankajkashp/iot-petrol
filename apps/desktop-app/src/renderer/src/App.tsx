import { Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useDashboardBootstrap } from "./hooks/useDashboardBootstrap";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { DevicesPage } from "./pages/DevicesPage";
import { PumpsPage } from "./pages/PumpsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PumpDetailPage } from "./pages/PumpDetailPage";
import { BackButton } from "./components/ui/BackButton";
import { Breadcrumbs } from "./components/ui/Breadcrumbs";

export default function App() {
  useDashboardBootstrap();
  const location = useLocation();

  return (
    <AppShell>
      <header className="topbar">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <BackButton />
          <div className="topbar-title">
            <Breadcrumbs />
          </div>
        </div>
        <div className="topbar-meta">
          <span>Local-first</span>
          <span className="status-pill tone-dispensing">Sensor feed mode</span>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/pumps" element={<PumpsPage />} />
        <Route path="/pumps/:id" element={<PumpDetailPage />} />
        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        {/* Fallback for invalid routes */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}
