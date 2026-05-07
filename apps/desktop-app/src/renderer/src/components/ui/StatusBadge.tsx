import type { PumpStatus } from "../../store/useDashboardStore";

const toneMap: Record<PumpStatus, string> = {
  idle: "tone-idle",
  dispensing: "tone-dispensing",
  offline: "tone-offline",
  error: "tone-error"
};

export function StatusBadge({ status }: { status: PumpStatus }) {
  const label =
    status === "dispensing" ? "Active" : status === "idle" ? "Idle" : status === "offline" ? "Offline" : "Alert";

  return <span className={`status-pill ${toneMap[status]}`}>{label}</span>;
}
