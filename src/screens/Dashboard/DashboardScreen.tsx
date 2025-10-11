import { Outlet } from "react-router-dom";
import Header from "../../components/Dashboard/Header";
import Sidebar from "../../components/Dashboard/Sidebar";
import FloatingAddButton from "../../components/Dashboard/FloatingAddButton";
import { theme } from "../../styles/theme";

export default function DashboardScreen() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        backgroundColor: theme.colors.backgroundLight,
        color: theme.colors.textDark,
        fontFamily: theme.typography.fontFamily.display,
        overflow: "hidden",
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1, padding: theme.spacing.xl }}>
          <Outlet />
        </main>
        <FloatingAddButton />
      </div>
    </div>
  );
}
