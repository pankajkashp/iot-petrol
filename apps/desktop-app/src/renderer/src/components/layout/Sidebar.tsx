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
      <div>
        <p className="eyebrow">Fuel Operations</p>
        <h1 className="brand">Dispatcher</h1>
      </div>
      <nav className="nav">
        {items.map((item) => (
          <button
            key={item.id}
            className={activePage === item.id ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <span>Offline-first desktop</span>
        <span>SQLite local store</span>
      </div>
    </aside>
  );
}
