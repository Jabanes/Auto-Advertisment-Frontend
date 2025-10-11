import { theme } from "../../styles/theme";

// Make sure the Material Symbols font is loaded globally
// (we already added it in globalStyles.ts or main.tsx)

export default function Sidebar() {
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
      {/* Logo */}
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
        {/* Active icon (home) */}
        <span
          className="material-symbols-outlined"
          style={{
            ...iconBase,
            backgroundColor: `${theme.colors.primary}20`, // subtle tint
            color: theme.colors.primary,
          }}
        >
          view_cozy
        </span>

        {/* Inactive icons */}
        <span
          className="material-symbols-outlined"
          style={iconBase}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = theme.colors.primary;
            (e.currentTarget as HTMLElement).style.backgroundColor =
              `${theme.colors.primary}20`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              theme.colors.textMuted;
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          }}
        >
          campaign
        </span>

        <span
          className="material-symbols-outlined"
          style={iconBase}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = theme.colors.primary;
            (e.currentTarget as HTMLElement).style.backgroundColor =
              `${theme.colors.primary}20`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              theme.colors.textMuted;
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          }}
        >
          settings
        </span>
      </nav>

      {/* Logout */}
      <div>
        <span
          className="material-symbols-outlined"
          style={iconBase}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = theme.colors.primary;
            (e.currentTarget as HTMLElement).style.backgroundColor =
              `${theme.colors.primary}20`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color =
              theme.colors.textMuted;
            (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
          }}
        >
          logout
        </span>
      </div>
    </aside>
  );
}
