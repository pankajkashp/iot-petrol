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

  // Calculate today's metrics for this pump
  const todayRevenue = pumpHistory.reduce((sum, s) => sum + s.totalAmount, 0);
  const todayLiters = pumpHistory.reduce((sum, s) => sum + s.liters, 0);
  const todayTransactions = pumpHistory.length;

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

      {/* Lifetime & Quick Stats */}
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

      {/* Today's Metrics */}
      <div className="metric-row" style={{ marginTop: '24px', marginBottom: '24px' }}>
        <MetricCard
          label="Today's Revenue"
          value={`₹${Math.round(todayRevenue).toLocaleString()}`}
          hint={`${todayTransactions} transactions`}
          tone="accent"
        />
        <MetricCard
          label="Today's Volume"
          value={`${todayLiters.toFixed(2)} L`}
          hint="Fuel dispensed today"
          tone="success"
        />
        <MetricCard
          label="Active Session"
          value={activeSession ? `${activeSession.durationSeconds}s` : "Idle"}
          hint={activeSession ? "Currently dispensing" : "Nozzle docked"}
        />
        <MetricCard
          label="Avg Transaction"
          value={todayTransactions > 0 ? `₹${Math.round(todayRevenue / todayTransactions)}` : "—"}
          hint="Average transaction value"
        />
      </div>

      <div className="dashboard-grid">
        {/* Active Dispensing */}
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
                <span className="label">Flow Rate</span>
                <strong className="value">{activeSession.durationSeconds > 0 ? (activeSession.liters / activeSession.durationSeconds).toFixed(2) : '0.00'} L/s</strong>
              </div>
            </div>
          ) : (
            <div className="detail-idle-state">
              <div className="idle-nozzle-icon">⛽</div>
              <p>Nozzle is currently docked. Waiting for next transaction.</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '8px' }}>
                Dispenser ready and online.
              </p>
            </div>
          )}
        </SectionCard>

        {/* Transaction History */}
        <SectionCard title="Session History" subtitle={`${pumpHistory.length} transactions recorded today`}>
          <div className="transaction-mini-list">
            {pumpHistory.length === 0 ? (
              <p className="empty-state">No historical sessions found today.</p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: '0.9rem'
                }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                      <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--muted)' }}>Time</th>
                      <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--muted)' }}>Liters</th>
                      <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--muted)' }}>Amount</th>
                      <th style={{ padding: '8px 12px', fontWeight: '600', color: 'var(--muted)' }}>Duration</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pumpHistory.map(s => (
                      <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                        <td style={{ padding: '10px 12px' }}>
                          {new Date(s.endedAt || s.createdAt).toLocaleTimeString()}
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <strong>{s.liters.toFixed(2)} L</strong>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <strong style={{ color: 'var(--success)' }}>₹{s.totalAmount.toFixed(2)}</strong>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {s.durationSeconds}s
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Hardware Status */}
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
            <div className="status-row">
              <span>Dispenser Mode</span>
              <strong>{pump.status === 'dispensing' ? 'ACTIVE' : 'IDLE'}</strong>
            </div>
            <div className="status-row">
              <span>Protocol</span>
              <strong>Modbus TCP v2</strong>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
