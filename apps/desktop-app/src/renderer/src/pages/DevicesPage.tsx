import { useDashboardStore } from "../store/useDashboardStore";

export function DevicesPage() {
  const logs = useDashboardStore((state) => state.logs);

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Devices</p>
          <h2>Simulator activity</h2>
        </div>
      </header>

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
    </section>
  );
}
