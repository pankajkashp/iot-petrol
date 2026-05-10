import { useParams } from "react-router-dom";
import { useDashboardStore } from "../store/useDashboardStore";
import { StatusBadge } from "../components/ui/StatusBadge";
import { SectionCard } from "../components/ui/SectionCard";
import { MetricCard } from "../components/ui/MetricCard";

export function PumpDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { pumps, activeSessions, recentSessions } = useDashboardStore();

  const pump = pumps.find((p) => p.pumpId === id);
  const activeSession = activeSessions.find((s) => s.pumpId === id);
  const pumpHistory = recentSessions.filter((s) => s.pumpId === id);

  if (!pump) {
    return (
      <div className="page">
        <header className="page-header">
          <h2>Pump ID {id} not found</h2>
        </header>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Operational Detail</p>
          <h2>{pump.pumpName}</h2>
          <p className="page-copy">
            {pump.nozzle} · {pump.fuelType.toUpperCase()} · Controller v2.4.1
          </p>
        </div>
        <div className="hero-status">
          <span className="hero-status-label">Live State</span>
          <StatusBadge status={pump.status} />
        </div>
      </header>

      <div className="metric-row">
        <MetricCard
          label="Lifetime Volume"
          value={`${pump.totalLitersLifetime.toFixed(2)} L`}
          hint="Total fuel dispensed"
        />
        <MetricCard
          label="Lifetime Revenue"
          value={`₹${Math.round(pump.totalRevenueLifetime).toLocaleString()}`}
          hint="Total value captured"
          tone="success"
        />
        <MetricCard
          label="Current Price"
          value={`₹${pump.pricePerLiter.toFixed(2)}`}
          hint="Price per Liter"
          tone="accent"
        />
        <MetricCard
          label="Last Activity"
          value={pump.lastSessionAt ? new Date(pump.lastSessionAt).toLocaleTimeString() : "Never"}
          hint="Last completed session"
        />
      </div>

      <div className="dashboard-grid">
        <SectionCard 
          title="Active Dispensing Cycle" 
          subtitle="Real-time transaction data"
          className="span-2"
        >
          {activeSession ? (
            <div className="detail-dispensing-grid">
              <div className="big-metric">
                <span className="label">Amount Transacted</span>
                <strong className="value pulse">₹{activeSession.totalAmount.toFixed(2)}</strong>
              </div>
              <div className="big-metric">
                <span className="label">Volume Delivered</span>
                <strong className="value">{activeSession.liters.toFixed(2)} L</strong>
              </div>
              <div className="big-metric">
                <span className="label">Session Duration</span>
                <strong className="value">{activeSession.durationSeconds}s</strong>
              </div>
              <div className="big-metric">
                <span className="label">Nozzle Pressure</span>
                <strong className="value">2.4 bar</strong>
              </div>
            </div>
          ) : (
            <div className="detail-idle-state">
              <div className="idle-nozzle-icon">⛽</div>
              <p>Nozzle is currently docked. Waiting for next transaction.</p>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Session History" subtitle="Last 10 transactions on this pump">
          <div className="transaction-mini-list">
            {pumpHistory.length === 0 ? (
              <p className="empty-state">No historical sessions found.</p>
            ) : (
              pumpHistory.map(s => (
                <div key={s.id} className="transaction-item">
                  <div className="tx-meta">
                    <strong>{new Date(s.endedAt || s.createdAt).toLocaleDateString()}</strong>
                    <span>{new Date(s.endedAt || s.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="tx-data">
                    <span className="tx-liters">{s.liters.toFixed(2)} L</span>
                    <span className="tx-amount">₹{s.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </SectionCard>

        <SectionCard title="Hardware Status" subtitle="Diagnostic feedback">
          <div className="status-stack">
            <div className="status-row">
              <span>Connection</span>
              <strong style={{ color: 'var(--success)' }}>Online (WiFi)</strong>
            </div>
            <div className="status-row">
              <span>Latency</span>
              <strong>24ms</strong>
            </div>
            <div className="status-row">
              <span>Last Sync</span>
              <strong>Just now</strong>
            </div>
            <div className="status-row">
              <span>Hardware ID</span>
              <strong>{pump.pumpId}</strong>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
