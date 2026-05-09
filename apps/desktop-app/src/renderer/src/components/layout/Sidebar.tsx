import { NavLink } from "react-router-dom";

const items = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard" },
  { id: "pumps", label: "Pumps", path: "/pumps" },
  { id: "devices", label: "Devices", path: "/devices" },
  { id: "settings", label: "Settings", path: "/settings" }
] as const;

export function Sidebar() {
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
          <NavLink
            key={item.id}
            to={item.path}
            className={({ isActive }) => (isActive ? "nav-item active" : "nav-item")}
            style={{ textDecoration: "none", display: "flex", alignItems: "center" }}
          >
            {item.label}
          </NavLink>
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
