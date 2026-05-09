import type { PumpCardModel } from "../../../store/useDashboardStore";
import { PumpCard } from "../../../components/ui/PumpCard";

export function PumpGrid({
  pumps,
  onToggleSensorFeed,
  onDetails
}: {
  pumps: PumpCardModel[];
  onToggleSensorFeed: (pumpId: string) => void;
  onDetails: (pumpId: string) => void;
}) {
  return (
    <div className="pump-grid-layout">
      {pumps.map((pump) => (
        <PumpCard
          key={pump.pumpId}
          pump={pump}
          onDetails={onDetails}
          onRecordReading={(pumpId) => onToggleSensorFeed(pumpId)}
        />
      ))}
    </div>
  );
}
