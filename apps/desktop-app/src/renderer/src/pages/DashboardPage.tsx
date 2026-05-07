import { ActivityFeed } from "../components/ui/ActivityFeed";
import { MetricCard } from "../components/ui/MetricCard";
import { PumpCard } from "../components/ui/PumpCard";
import { SectionCard } from "../components/ui/SectionCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { useDashboardStore } from "../store/useDashboardStore";

export function DashboardPage() {
  const pumps = useDashboardStore((state) => state.pumps);
  const readings = useDashboardStore((state) => state.readings);
  const logs = useDashboardStore((state) => state.logs);
  const stats = useDashboardStore((state) => state.stats);

  const activePumps = stats.activePumps || pumps.filter((pump) => pump.status === "dispensing").length;
  const onlinePumps = stats.onlinePumps || pumps.filter((pump) => pump.status !== "offline").length;
  const offlinePumps = pumps.filter((pump) => pump.status === "offline").length;
  const errorPumps = pumps.filter((pump) => pump.status === "error").length;
  const fuelToday = readings.reduce((sum, reading) => sum + reading.liters, 0);
  const revenueToday = readings.reduce((sum, reading) => sum + reading.revenue, 0);

  return (
    <section className="page">
      <header className="page-header hero-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Industrial fuel management control room</h2>
          <p className="page-copy">
            Real-time visibility into pump activity, device health, and local-first operations.
          </p>
        </div>
        <div className="hero-status">
          <span className="hero-status-label">System status</span>
          <StatusBadge status={errorPumps > 0 ? "error" : onlinePumps > 0 ? "idle" : "offline"} />
        </div>
      </header>

      <div className="metric-row">
        <MetricCard
          label="Total Pumps"
          value={`${stats.totalPumps}`}
          hint="All pumps registered locally"
          tone="accent"
        />
        <MetricCard
          label="Active Pumps"
          value={`${activePumps}`}
          hint="Currently dispensing fuel"
          tone="success"
        />
        <MetricCard
          label="Total Fuel Today"
          value={`${fuelToday.toFixed(2)} L`}
          hint="From live simulator readings"
          tone="warning"
        />
        <MetricCard
          label="Revenue Today"
          value={`₹${revenueToday.toFixed(2)}`}
          hint="Estimated local revenue"
          tone="accent"
        />
      </div>

      <div className="dashboard-grid">
        <SectionCard title="Pump Cards" subtitle="Live pump readings" className="span-2">
          <div className="pump-grid-layout">
            {pumps.map((pump) => (
              <PumpCard key={pump.id} pump={pump} />
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Device Status" subtitle="Connectivity overview">
          <div className="status-stack">
            <div className="status-row">
              <span>Online devices</span>
              <strong>{onlinePumps}/{stats.totalPumps}</strong>
            </div>
            <div className="status-row">
              <span>Offline devices</span>
              <strong>{offlinePumps}</strong>
            </div>
            <div className="status-row">
              <span>Faults</span>
              <strong>{errorPumps}</strong>
            </div>
            <div className="status-row">
              <span>Sync state</span>
              <strong>Healthy</strong>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Recent Activity" subtitle="Latest device events">
          <ActivityFeed items={logs.slice(0, 8)} />
        </SectionCard>
      </div>
    </section>
  );
}
