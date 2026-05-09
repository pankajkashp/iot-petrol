import { Link } from "react-router-dom";
import type { PumpCardModel } from "../../store/useDashboardStore";
import { StatusBadge } from "./StatusBadge";

export function PumpCard({
  pump,
  onRecordReading
}: {
  pump: PumpCardModel;
  onRecordReading: (pumpId: string) => void;
}) {
  const statusLabel = pump.status === "dispensing" ? "Sensor live" : pump.status === "idle" ? "Ready" : "Offline";
  const actionLabel = pump.status === "dispensing" ? "Stop sensor feed" : "Start sensor feed";

  return (
    <article className="pump-card">
      <div className="pump-card-top">
        <Link 
          to={`/pumps/${pump.pumpId}`}
          style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
        >
          <p className="pump-name">{pump.pumpName}</p>
          <p className="pump-subtitle">
            {pump.nozzle} · {pump.fuelType.toUpperCase()} · {statusLabel}
          </p>
        </Link>
        <StatusBadge status={pump.status} />
      </div>
      <div className="pump-grid">
        <div>
          <span>Liters</span>
          <strong>{pump.liters.toFixed(2)}</strong>
        </div>
        <div>
          <span>Revenue</span>
          <strong>₹{Math.round(pump.revenue).toLocaleString()}</strong>
        </div>
        {pump.status === "dispensing" && (
          <>
            <div>
              <span>Flow Rate</span>
              <strong style={{ color: "var(--blue)" }}>{pump.flowRate?.toFixed(2)} L/s</strong>
            </div>
            <div>
              <span>Duration</span>
              <strong>{pump.sessionDuration}s</strong>
            </div>
          </>
        )}
      </div>
      <p className="pump-updated">
        Updated {pump.lastReadingAt ? new Date(pump.lastReadingAt).toLocaleTimeString() : "just now"}
      </p>
      <div className="pump-actions" style={{ gap: '8px' }}>
        <Link 
          to={`/pumps/${pump.pumpId}`}
          className="ghost-button"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          View Details
        </Link>
        <button type="button" className="ghost-button" onClick={() => onRecordReading(pump.pumpId)}>
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
