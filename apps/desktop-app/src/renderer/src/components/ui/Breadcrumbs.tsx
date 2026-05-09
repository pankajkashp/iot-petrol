import { useLocation, Link } from "react-router-dom";

const routeMap: Record<string, string> = {
  dashboard: "Overview",
  pumps: "Pump Inventory",
  devices: "Hardware Status",
  settings: "Settings",
};

export function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="breadcrumbs" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <strong>Fuel Station Operations</strong>
      <span style={{ color: "var(--subtle)", fontSize: "1.2rem", fontWeight: "300" }}>/</span>
      {pathnames.length === 0 ? (
        <span style={{ color: "var(--muted)", fontSize: "0.92rem" }}>Dashboard</span>
      ) : (
        pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const isLast = index === pathnames.length - 1;
          const label = routeMap[name] || name;

          return (
            <div key={routeTo} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {index > 0 && (
                <span style={{ color: "var(--subtle)", fontSize: "1.2rem", fontWeight: "300" }}>/</span>
              )}
              {isLast ? (
                <span style={{ color: "var(--muted)", fontSize: "0.92rem", fontWeight: "500" }}>
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </span>
              ) : (
                <Link
                  to={routeTo}
                  style={{
                    color: "var(--blue)",
                    fontSize: "0.92rem",
                    textDecoration: "none",
                    fontWeight: "500",
                  }}
                >
                  {label.charAt(0).toUpperCase() + label.slice(1)}
                </Link>
              )}
            </div>
          );
        })
      )}
    </nav>
  );
}
