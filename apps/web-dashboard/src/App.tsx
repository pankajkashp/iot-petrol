const metrics = [
  { label: "Active pumps", value: "128" },
  { label: "Offline queue", value: "6" },
  { label: "Sync health", value: "98.4%" },
  { label: "Tenants online", value: "42" }
];

const activity = [
  "Pump 04 reported 12.4L diesel dispensed",
  "Device simulator sent heartbeat from bay 2",
  "Sync engine committed 3 queued operations",
  "Owner dashboard generated day summary"
];

function App() {
  return (
    <div className="shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Fuel IoT Platform</p>
          <h1>Offline-first operations for dispensing networks</h1>
        </div>
        <div className="status-pill">Live preview</div>
      </header>

      <main className="grid">
        <section className="hero card">
          <p className="section-label">Command Center</p>
          <h2>Monitor pumps, sync local data, and keep operating even when the network drops.</h2>
          <p className="body">
            This preview is the first browser slice of the monorepo architecture:
            multi-tenant cloud control, local-first desktop workflows, and a
            hardware-independent device layer.
          </p>
          <div className="cta-row">
            <button className="primary-btn">Open dashboard</button>
            <button className="secondary-btn">View sync status</button>
          </div>
        </section>

        <section className="metrics card">
          <p className="section-label">System health</p>
          <div className="metric-grid">
            {metrics.map((metric) => (
              <div key={metric.label} className="metric">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="card split">
          <div>
            <p className="section-label">Realtime activity</p>
            <ul className="activity-list">
              {activity.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="panel">
            <p className="section-label">Architecture</p>
            <ul className="stack-list">
              <li>Electron desktop shell</li>
              <li>React web dashboard</li>
              <li>Node.js + Express API</li>
              <li>Prisma + PostgreSQL + SQLite</li>
              <li>MQTT + Socket.IO realtime layer</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
