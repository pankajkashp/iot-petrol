export function SettingsPage() {
  return (
    <section className="page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Settings</p>
          <h2>Local-first configuration</h2>
        </div>
      </header>

      <div className="settings-grid">
        <div className="panel-card">
          <strong>SQLite storage</strong>
          <p>All pump readings, device logs, and local state are stored on the device.</p>
        </div>
        <div className="panel-card">
          <strong>Device abstraction</strong>
          <p>The UI only speaks to `DeviceManager` over IPC, never directly to hardware.</p>
        </div>
        <div className="panel-card">
          <strong>Offline mode</strong>
          <p>The simulator keeps the dashboard alive even when cloud services are unavailable.</p>
        </div>
      </div>
    </section>
  );
}
