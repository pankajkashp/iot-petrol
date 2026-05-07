import type { PumpCardModel } from "../../store/useDashboardStore";
import { StatusBadge } from "./StatusBadge";

export function PumpCard({ pump }: { pump: PumpCardModel }) {
  const statusLabel =
    pump.status === "dispensing" ? "Online" : pump.status === "idle" ? "Online" : "Offline";

  return (
    <article className="pump-card">
      <div className="pump-card-top">
        <div>
          <p className="pump-name">{pump.name}</p>
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
    </article>
  );
}
