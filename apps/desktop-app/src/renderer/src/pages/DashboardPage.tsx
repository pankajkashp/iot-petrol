import { PumpCard } from "../components/ui/PumpCard";
import { StatCard } from "../components/ui/StatCard";
import { useDashboardStore } from "../store/useDashboardStore";

export function DashboardPage() {
  const pumps = useDashboardStore((state) => state.pumps);
  const stats = useDashboardStore((state) => state.stats);

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Dashboard</p>
          <h2>Live pump operations</h2>
        </div>
      </header>

      <div className="stat-row">
        <StatCard label="Total pumps" value={`${stats.totalPumps}`} hint="Local devices registered" />
        <StatCard label="Online pumps" value={`${stats.onlinePumps}`} hint="Connected and reporting" />
        <StatCard label="Total liters" value={stats.totalLiters.toFixed(2)} hint="Running local total" />
        <StatCard label="Revenue" value={`₹${stats.totalRevenue.toFixed(2)}`} hint="Estimated value" />
      </div>

      <div className="pump-grid-layout">
        {pumps.map((pump) => (
          <PumpCard key={pump.id} pump={pump} />
        ))}
      </div>
    </section>
  );
}
