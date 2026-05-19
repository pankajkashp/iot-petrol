import { useNavigate } from "react-router-dom";
import type { PumpDefinition, DispensingSession } from "@fuel/shared-types";
import { StatusBadge } from "./StatusBadge";

interface PumpCardProps {
  pump: PumpDefinition;
  activeSession?: DispensingSession;
  onRecordReading?: (pumpId: string) => void;
}

export function PumpCard({ pump, activeSession }: PumpCardProps) {
  const navigate = useNavigate();
  const isDispensing = pump.status === "dispensing" && activeSession;
  
  const handleCardClick = () => {
    navigate(`/pumps/${pump.pumpId}`);
  };

  return (
    <article 
      className={`pump-card ${isDispensing ? 'active' : ''}`}
      onClick={handleCardClick}
      style={{ cursor: 'pointer' }}
      role="button"
      tabIndex={0}
    >
      <div className="pump-card-top">
        <div>
          <p className="pump-name">{pump.pumpName}</p>
          <p className="pump-subtitle">
            {pump.nozzle} · {pump.fuelType.toUpperCase()}
          </p>
        </div>
        <StatusBadge status={pump.status} />
      </div>

      <div className="pump-main-display">
        {isDispensing && activeSession ? (
          <div className="dispensing-display">
            <div className="live-metric">
              <span className="label">Amount</span>
              <strong className="value pulse">₹{activeSession.totalAmount.toFixed(2)}</strong>
            </div>
            <div className="live-metric">
              <span className="label">Liters</span>
              <strong className="value">{activeSession.liters.toFixed(2)} L</strong>
            </div>
            <div className="live-meta">
              <span>{activeSession.durationSeconds}s duration</span>
            </div>
          </div>
        ) : (
          <div className="idle-display">
            <div className="metric">
              <span>Total Liters (Lifetime)</span>
              <strong>{pump.totalLitersLifetime.toFixed(2)} L</strong>
            </div>
            <div className="metric">
              <span>Last Transaction</span>
              <strong>{pump.lastSessionAt ? new Date(pump.lastSessionAt).toLocaleTimeString() : "N/A"}</strong>
            </div>
          </div>
        )}
      </div>

      <div className="pump-footer">
        <span className="price-tag">₹{pump.pricePerLiter.toFixed(2)} / L</span>
      </div>
    </article>
  );
}
