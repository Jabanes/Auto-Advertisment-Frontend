import { theme } from "../../styles/theme";

export default function FutureScreen() {
  return (
    <div>
      <h2
        style={{
          fontSize: theme.typography.fontSize["2xl"],
          fontWeight: 700,
          marginBottom: theme.spacing.xl,
        }}
      >
        Coming Soon
      </h2>
      <p style={{ color: theme.colors.textMuted }}>
        This area is reserved for future updates.
      </p>
    </div>
  );
}
