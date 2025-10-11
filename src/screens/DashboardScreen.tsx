import Header from "../components/Dashboard/Header";
import Sidebar from "../components/Dashboard/Sidebar";
import ProductGrid from "../components/Dashboard/ProductGrid";
import FloatingAddButton from "../components/Dashboard/FloatingAddButton";
import { theme } from "../styles/theme";

export default function DashboardScreen() {
  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: theme.colors.backgroundLight,
        color: theme.colors.textDark,
        fontFamily: theme.typography.fontFamily.regular,
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <main style={{ flex: 1, padding: theme.spacing.xl }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: theme.spacing.xl,
            }}
          >
            <h2
              style={{
                fontSize: theme.typography.fontSize["2xl"],
                fontWeight: 700,
              }}
            >
              Products
            </h2>
          </div>
          <ProductGrid />
        </main>
        <FloatingAddButton />
      </div>
    </div>
  );
}
