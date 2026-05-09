import { useNavigate, useLocation } from "react-router-dom";

export function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide back button on the dashboard (root)
  if (location.pathname === "/dashboard") {
    return null;
  }

  return (
    <button
      type="button"
      className="ghost-button back-button"
      onClick={() => navigate(-1)}
      aria-label="Go back"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "42px",
        height: "42px",
        padding: "0",
        borderRadius: "12px",
      }}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5" />
        <polyline points="12 19 5 12 12 5" />
      </svg>
    </button>
  );
}
