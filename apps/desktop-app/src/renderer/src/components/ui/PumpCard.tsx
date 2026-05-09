import type { PumpCardModel } from "../../store/useDashboardStore";
import { StatusBadge } from "./StatusBadge";

export function PumpCard({
  pump,
  onRecordReading,
  onDetails
}: {
  pump: PumpCardModel;
  onRecordReading: (pumpId: string) => void;
  onDetails: (pumpId: string) => void;
}) {
  const statusLabel = pump.status === "dispensing" ? "Sensor live" : pump.status === "idle" ? "Ready" : "Offline";
  const actionLabel = pump.status === "dispensing" ? "Stop sensor feed" : "Start sensor feed";

  return (
    <article className="pump-card">
      <div className="pump-card-top">
        <div style={{ cursor: 'pointer' }} onClick={() => onDetails(pump.pumpId)}>
          <p className="pump-name">{pump.pumpName}</p>
          <p className="pump-subtitle">
            {pump.nozzle} · {pump.fuelType.toUpperCase()} · {statusLabel}
          </p>
        </div>
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
      </div>
      <p className="pump-updated">
        Updated {pump.lastReadingAt ? new Date(pump.lastReadingAt).toLocaleTimeString() : "just now"}
      </p>
      <div className="pump-actions" style={{ gap: '8px' }}>
        <button type="button" className="ghost-button" onClick={() => onDetails(pump.pumpId)}>
          View Details
        </button>
        <button type="button" className="ghost-button" onClick={() => onRecordReading(pump.pumpId)}>
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
