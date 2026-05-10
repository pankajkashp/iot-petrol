import { NavLink } from "react-router-dom";
import { Logo } from "../ui/Logo";

const items = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard" },
  { id: "pumps", label: "Pumps", path: "/pumps" },
  { id: "transactions", label: "Transactions", path: "/transactions" },
  { id: "reports", label: "Reports", path: "/reports" },
  { id: "devices", label: "Devices", path: "/devices" },
  { id: "settings", label: "Settings", path: "/settings" }
] as const;

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <Logo size={36} />
        <p className="eyebrow" style={{ marginTop: "16px" }}>Station Console</p>
        <p className="sidebar-copy">
          Forecourt operational control system.
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
