import { useDashboardStore } from "../../store/useDashboardStore";

const items = [
  { id: "dashboard", label: "Dashboard" },
  { id: "pumps", label: "Pumps" },
  { id: "devices", label: "Devices" },
  { id: "settings", label: "Settings" }
] as const;

export function Sidebar() {
  const activePage = useDashboardStore((state) => state.activePage);
  const setActivePage = useDashboardStore((state) => state.setActivePage);

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <p className="eyebrow">Station Console</p>
        <h1 className="brand">Dispatcher</h1>
        <p className="sidebar-copy">
          Daily operations for fuel stations, devices, billing, and offline-first syncing.
        </p>
      </div>
      <nav className="nav">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activePage === item.id ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div>
          <span className="footer-label">Mode</span>
          <strong>Touchscreen ready</strong>
        </div>
        <div>
          <span className="footer-label">Store</span>
          <strong>SQLite local-first</strong>
        </div>
      </div>
    </aside>
  );
}
