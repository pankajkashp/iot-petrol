import type { PumpCardModel } from "../../../store/useDashboardStore";
import { StatusBadge } from "../../../components/ui/StatusBadge";

export function DeviceStatusPanel({
  pumps
}: {
  pumps: PumpCardModel[];
}) {
  const onlinePumps = pumps.filter((pump) => pump.status !== "offline").length;
  const offlinePumps = pumps.filter((pump) => pump.status === "offline").length;
  const errorPumps = pumps.filter((pump) => pump.status === "error").length;

  return (
    <div className="status-stack">
      <div className="status-row">
        <span>Online devices</span>
        <strong>
          {onlinePumps}/{pumps.length}
        </strong>
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
        <span>System state</span>
        <StatusBadge status={errorPumps > 0 ? "error" : onlinePumps > 0 ? "idle" : "offline"} />
      </div>
    </div>
  );
}
