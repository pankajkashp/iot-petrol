import type { PumpCardModel } from "../../store/useDashboardStore";

const statusTone: Record<PumpCardModel["status"], string> = {
  idle: "tone-idle",
  dispensing: "tone-dispensing",
  offline: "tone-offline",
  error: "tone-error"
};

export function PumpCard({ pump }: { pump: PumpCardModel }) {
  return (
    <article className="pump-card">
      <div className="pump-card-top">
        <div>
          <p className="pump-name">{pump.name}</p>
          <p className="pump-subtitle">
            {pump.nozzle} · {pump.fuelType.toUpperCase()}
          </p>
        </div>
        <span className={`status-pill ${statusTone[pump.status]}`}>{pump.status}</span>
      </div>
      <div className="pump-grid">
        <div>
          <span>Liters</span>
          <strong>{pump.liters.toFixed(2)}</strong>
        </div>
        <div>
          <span>Revenue</span>
          <strong>₹{pump.revenue.toFixed(2)}</strong>
        </div>
      </div>
    </article>
  );
}
