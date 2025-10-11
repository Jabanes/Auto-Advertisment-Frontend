import { theme } from "../../styles/theme";

export default function SettingsScreen() {
  return (
    <div>
      <h2
        style={{
          fontSize: theme.typography.fontSize["2xl"],
          fontWeight: 700,
          marginBottom: theme.spacing.xl,
        }}
      >
        Settings
      </h2>
      <p style={{ color: theme.colors.textMuted }}>
        Manage your preferences and business info here.
      </p>
    </div>
  );
}
