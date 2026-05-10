import { Routes, Route, Navigate } from "react-router-dom";
import { useDashboardBootstrap } from "./hooks/useDashboardBootstrap";
import { AppShell } from "./components/layout/AppShell";
import { DashboardPage } from "./pages/DashboardPage";
import { DevicesPage } from "./pages/DevicesPage";
import { PumpsPage } from "./pages/PumpsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PumpDetailPage } from "./pages/PumpDetailPage";
import { BackButton } from "./components/ui/BackButton";
import { Breadcrumbs } from "./components/ui/Breadcrumbs";
import { useDashboardStore } from "./store/useDashboardStore";
import { Logo } from "./components/ui/Logo";

// Placeholder for missing pages
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="page">
    <header className="page-header">
      <h2>{title}</h2>
      <p className="page-copy">This module is currently being initialized.</p>
    </header>
  </div>
);

export default function App() {
  useDashboardBootstrap();
  const isLoading = useDashboardStore((state) => state.isLoading);

  if (isLoading) {
    return (
      <div 
        style={{ 
          height: "100vh", 
          display: "flex", 
          flexDirection: "column",
          alignItems: "center", 
          justifyContent: "center",
          background: "#F8FAFC"
        }}
      >
        <Logo size={80} />
        <div style={{ marginTop: "24px", color: "var(--muted)", fontSize: "0.9rem" }}>
          Initializing system modules...
        </div>
      </div>
    );
  }

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
          <span className="status-pill tone-dispensing">Forecourt Mode</span>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        
        <Route path="/pumps">
          <Route index element={<PumpsPage />} />
          <Route path=":id" element={<PumpDetailPage />} />
          <Route path=":id/transactions" element={<PlaceholderPage title="Pump Transactions" />} />
        </Route>

        <Route path="/transactions" element={<PlaceholderPage title="All Transactions" />} />
        
        <Route path="/reports">
          <Route index element={<PlaceholderPage title="Reports Overview" />} />
          <Route path="daily" element={<PlaceholderPage title="Daily Reports" />} />
          <Route path="monthly" element={<PlaceholderPage title="Monthly Reports" />} />
          <Route path="yearly" element={<PlaceholderPage title="Yearly Reports" />} />
        </Route>

        <Route path="/devices" element={<DevicesPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppShell>
  );
}
