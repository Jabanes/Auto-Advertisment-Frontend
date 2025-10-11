import { theme } from "../../styles/theme";

export default function Header() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
        borderBottom: `1px solid ${theme.colors.borderLight}`,
        backgroundColor: theme.colors.surfaceLight,
      }}
    >
      <h1
        style={{
          fontWeight: 700,
          fontSize: theme.typography.fontSize.lg,
          color: theme.colors.textDark,
        }}
      >
        Auto-Advertisement
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.lg }}>
        <button
          style={{
            background: "none",
            border: "none",
            color: theme.colors.textMuted,
            cursor: "pointer",
          }}
        >
          🔔
        </button>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            backgroundImage:
              'url("https://lh3.googleusercontent.com/a/default-user")',
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>
    </header>
  );
}
