import { MetricCard } from "../../../components/ui/MetricCard";
import { SectionCard } from "../../../components/ui/SectionCard";
import { useDashboardStore } from "../../../store/useDashboardStore";
import { PumpCard } from "../../../components/ui/PumpCard";
import { ActivityFeed } from "../../../components/ui/ActivityFeed";

export function DashboardOverview() {
  const { pumps, activeSessions, stats, logs, recentSessions } = useDashboardStore();

  return (
    <section className="page">
      <header className="page-header hero-header">
        <div>
          <p className="eyebrow">Forecourt Control Room</p>
          <h2>PumpCore Operational Dashboard</h2>
          <p className="page-copy">
            Monitoring live transactions, station revenue, and nozzle activity in real-time.
          </p>
        </div>
        <div className="hero-status">
          <span className="hero-status-label">Active Transacting</span>
          <span className="status-pill tone-dispensing">{stats.activePumps} Pumps</span>
        </div>
      </header>

      <div className="metric-row">
        <MetricCard
          label="Today's Revenue"
          value={`₹${Math.round(stats.todayRevenue).toLocaleString()}`}
          hint={`${stats.todaySessions} Transactions today`}
          tone="accent"
        />
        <MetricCard
          label="Total Fuel Sold"
          value={`${stats.todayLiters.toFixed(2)} L`}
          hint="Aggregate volume today"
          tone="success"
        />
        <MetricCard
          label="Active Load"
          value={activeSessions.length > 0 ? `${activeSessions.length} Active` : "Idle"}
          hint="Current ongoing dispensing"
          tone="warning"
        />
        <MetricCard
          label="Station ID"
          value="ST-IND-042"
          hint="Location: New Delhi"
          tone="accent"
        />
      </div>

      <div className="dashboard-grid">
        <SectionCard title="Nozzle Monitoring" subtitle="Live transacting status" className="span-2">
          <div className="pump-grid-layout">
            {pumps.map((pump) => (
              <PumpCard 
                key={pump.pumpId} 
                pump={pump} 
                activeSession={activeSessions.find(s => s.pumpId === pump.pumpId)}
              />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Recent Transactions" subtitle="Last finalized sessions">
          <div className="transaction-mini-list">
            {recentSessions.length === 0 ? (
              <p className="empty-state">No transactions recorded yet today.</p>
            ) : (
              recentSessions.map(s => (
                <div key={s.id} className="transaction-item">
                  <div className="tx-meta">
                    <strong>{s.pumpId}</strong>
                    <span>{new Date(s.createdAt).toLocaleTimeString()}</span>
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

        <SectionCard title="Device Intelligence" subtitle="System operational logs">
          <ActivityFeed items={logs.slice(0, 8)} />
        </SectionCard>
      </div>
    </section>
  );
}
