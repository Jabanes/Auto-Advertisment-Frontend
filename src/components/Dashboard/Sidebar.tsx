import { useNavigate, useLocation } from "react-router-dom";
import { theme } from "../../styles/theme";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: "view_cozy", path: "/dashboard/products" },
    { icon: "settings", path: "/dashboard/settings" },
    { icon: "campaign", path: "/dashboard/future" },
  ];

  const iconBase: React.CSSProperties = {
    padding: theme.spacing.sm,
    borderRadius: theme.radii.md,
    color: theme.colors.textMuted,
    cursor: "pointer",
    fontSize: 24,
    transition: "all 0.2s ease",
  };

  return (
    <aside
      style={{
        width: 80,
        backgroundColor: theme.colors.backgroundLight,
        borderRight: `1px solid ${theme.colors.borderLight}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: `${theme.spacing.lg}px 0`,
        justifyContent: "space-between",
      }}
    >
      <div style={{ color: theme.colors.primary, marginBottom: 40 }}>
        <svg width="32" height="32" fill="currentColor" viewBox="0 0 48 48">
          <path d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z" />
        </svg>
      </div>

      {/* Navigation */}
      <nav
        style={{
          display: "flex",
          flexDirection: "column",
          gap: theme.spacing.lg,
          flexGrow: 1,
          alignItems: "center",
        }}
      >
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <span
              key={item.path}
              className="material-symbols-outlined"
              style={{
                ...iconBase,
                backgroundColor: isActive ? `${theme.colors.primary}20` : "transparent",
                color: isActive ? theme.colors.primary : theme.colors.textMuted,
              }}
              onClick={() => navigate(item.path)}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = theme.colors.primary;
                (e.currentTarget as HTMLElement).style.backgroundColor =
                  `${theme.colors.primary}20`;
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  (e.currentTarget as HTMLElement).style.color = theme.colors.textMuted;
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                }
              }}
            >
              {item.icon}
            </span>
          );
        })}
      </nav>

      {/* Logout */}
      <div>
        <span className="material-symbols-outlined" style={iconBase}>
          logout
        </span>
      </div>
    </aside>
  );
}
