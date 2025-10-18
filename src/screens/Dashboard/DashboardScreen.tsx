import { Outlet } from "react-router-dom";
import Header from "../../components/Dashboard/Header";
import Sidebar from "../../components/Dashboard/Sidebar";
import FloatingAddButton from "../../components/Dashboard/FloatingAddButton";
import { theme } from "../../styles/theme";

export default function DashboardScreen() {
  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: theme.colors.backgroundLight,
        color: theme.colors.textDark,
        fontFamily: theme.typography.fontFamily.display,
        overflow: "hidden",
        direction: "rtl", // ✅ keep text direction RTL inside all children
      }}
    >
      <Sidebar />

      {/* 🧱 Main content area */}
      <div
        style={{
          marginLeft: 80, // Same as sidebar width
          width: "calc(100% - 80px)",
          position: "relative", // For floating button positioning
        }}
      >
        <Header />

        <main style={{ flex: 1, padding: theme.spacing.xl }}>
          <Outlet />
        </main>

        <FloatingAddButton />
      </div>
    </div>
  );
}
