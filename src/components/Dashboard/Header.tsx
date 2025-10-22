import { useSelector } from "react-redux";
import { theme } from "../../styles/theme";
import type { RootState } from "../../store";

export default function Header() {
  const user = useSelector((state: RootState) => state.auth.user);
  const userPhoto =
    user?.photoURL || localStorage.getItem("userPhoto") || undefined;

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${theme.spacing.lg}px ${theme.spacing.xl}px`,
        borderBottom: `1px solid ${theme.colors.borderLight}`,
        backgroundColor: theme.colors.surfaceLight,
      }}
    >
      <h1
        style={{
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.textDark,
        }}
      >
        פרסום אוטומטי
      </h1>

      <div style={{ display: "flex", alignItems: "center", gap: theme.spacing.lg }}>
        <span
          className="material-symbols-outlined"
          style={{
            color: theme.colors.textMuted,
            cursor: "pointer",
            fontSize: 24,
          }}
        >
          notifications
        </span>

        {/* Profile photo */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: theme.radii.full,
            backgroundColor: theme.colors.borderLight,
            backgroundImage: userPhoto
              ? `url(${userPhoto})`
              : "url('https://www.svgrepo.com/show/384674/account-avatar-profile-user.svg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      </div>
    </header>
  );
}
