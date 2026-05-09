import type { PumpCardModel } from "../../../store/useDashboardStore";
import { PumpCard } from "../../../components/ui/PumpCard";

export function PumpGrid({
  pumps,
  onToggleSensorFeed
}: {
  pumps: PumpCardModel[];
  onToggleSensorFeed: (pumpId: string) => void;
}) {
  return (
    <div className="pump-grid-layout">
      {pumps.map((pump) => (
        <PumpCard
          key={pump.pumpId}
          pump={pump}
          onRecordReading={(pumpId) => onToggleSensorFeed(pumpId)}
        />
      ))}
    </div>
  );
}
