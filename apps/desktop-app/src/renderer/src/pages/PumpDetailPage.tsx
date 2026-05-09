import { useParams, useNavigate } from "react-router-dom";
import { useDashboardStore } from "../store/useDashboardStore";
import { StatusBadge } from "../components/ui/StatusBadge";
import { SectionCard } from "../components/ui/SectionCard";

export function PumpDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pumps = useDashboardStore((state) => state.pumps);
  const readings = useDashboardStore((state) => state.readings);

  const pump = pumps.find((p) => p.pumpId === id);
  const pumpReadings = readings.filter((r) => r.pumpId === id).slice(0, 10);

  if (!pump) {
    return (
      <div className="page">
        <header className="page-header">
          <h2>Pump Not Found</h2>
          <button type="button" className="ghost-button" onClick={() => navigate("/pumps")}>
            Back to Pumps
          </button>
        </header>
      </div>
    );
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h2>{pump.pumpName}</h2>
          <p className="page-copy">
            {pump.nozzle} · {pump.fuelType.toUpperCase()} · ID: {pump.pumpId}
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <div className="hero-status">
            <span className="hero-status-label">Operational Status</span>
            <StatusBadge status={pump.status} />
          </div>
        </div>
      </header>

      <div className="metric-row">
        <div className="metric-card tone-accent">
          <span className="metric-label">Current Session Liters</span>
          <p className="metric-value">{pump.liters.toFixed(2)}L</p>
          <p className="metric-hint">Live flow reading</p>
        </div>
        <div className="metric-card tone-success">
          <span className="metric-label">Session Revenue</span>
          <p className="metric-value">₹{pump.revenue.toFixed(2)}</p>
          <p className="metric-hint">Based on ₹{pump.pricePerLiter}/L</p>
        </div>
        <div className="metric-card">
          <span className="metric-label">Nozzle Pressure</span>
          <p className="metric-value">2.4 bar</p>
          <p className="metric-hint">Normal range</p>
        </div>
        <div className="metric-card">
          <span className="metric-label">Last Reading</span>
          <p className="metric-value">
            {pump.lastReadingAt ? new Date(pump.lastReadingAt).toLocaleTimeString() : "N/A"}
          </p>
          <p className="metric-hint">Device timestamp</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <SectionCard title="Real-time Flow Velocity" className="span-2">
          <div style={{ height: "200px", display: "flex", alignItems: "flex-end", gap: "4px", padding: "20px 0" }}>
             {/* Simple simulated chart bars */}
             {Array.from({ length: 40 }).map((_, i) => (
               <div 
                 key={i} 
                 style={{ 
                   flex: 1, 
                   background: pump.status === 'dispensing' ? 'var(--blue)' : 'var(--line)',
                   height: pump.status === 'dispensing' ? `${20 + Math.random() * 80}%` : '10%',
                   borderRadius: '2px',
                   transition: 'height 0.3s ease'
                 }} 
               />
             ))}
          </div>
          <p className="metric-hint" style={{ textAlign: "center" }}>
            {pump.status === 'dispensing' ? 'Streaming live data from hardware...' : 'Pump is idle. No active flow detected.'}
          </p>
        </SectionCard>

        <SectionCard title="Recent Dispensing History">
          <div className="activity-feed">
            {pumpReadings.length > 0 ? (
              pumpReadings.map((reading) => (
                <div key={reading.id} className="activity-item">
                  <div className={`activity-dot ${reading.status === 'dispensing' ? 'tone-success' : 'tone-info'}`} />
                  <div>
                    <strong>{reading.liters.toFixed(2)}L Dispensed</strong>
                    <p>
                      Revenue: ₹{reading.revenue.toFixed(2)} · {new Date(reading.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">No recent readings for this pump.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Hardware Diagnostics">
          <div className="status-stack">
            <div className="status-row">
              <span>Controller Version</span>
              <strong>v2.4.1-esp32</strong>
            </div>
            <div className="status-row">
              <span>Signal Strength</span>
              <strong>-64 dBm (Stable)</strong>
            </div>
            <div className="status-row">
              <span>Uptime</span>
              <strong>4d 12h 31m</strong>
            </div>
            <div className="status-row">
              <span>Memory Usage</span>
              <strong>42%</strong>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
