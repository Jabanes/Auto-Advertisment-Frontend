import { theme } from "../../styles/theme";

export default function FloatingAddButton() {
  return (
    <button
      style={{
        position: "fixed",
        bottom: 32,
        right: 32,
        backgroundColor: theme.colors.primary,
        color: "#fff",
        border: "none",
        borderRadius: "50%",
        width: 56,
        height: 56,
        fontSize: 18,
        fontWeight: 600,
        boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
        cursor: "pointer",
      }}
    >
      +
    </button>
  );
}
