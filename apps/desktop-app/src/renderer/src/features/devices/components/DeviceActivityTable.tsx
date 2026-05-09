import { useDashboardStore } from "../../../store/useDashboardStore";

export function DeviceActivityTable() {
  const logs = useDashboardStore((state) => state.logs);

  return (
    <div className="table-card">
      {logs.map((log) => (
        <div className="table-row" key={log.id}>
          <div>
            <strong>{log.message}</strong>
            <p>{log.pumpId}</p>
          </div>
          <div>{log.level}</div>
          <div>{new Date(log.createdAt).toLocaleTimeString()}</div>
        </div>
      ))}
    </div>
  );
}
