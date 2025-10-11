import ProductGrid from "../../components/Dashboard/ProductGrid";
import { theme } from "../../styles/theme";

export default function ProductsScreen() {
  return (
    <div>
      <h2
        style={{
          fontSize: theme.typography.fontSize["2xl"],
          fontWeight: 700,
          marginBottom: theme.spacing.xl,
        }}
      >
        Products
      </h2>
      <ProductGrid />
    </div>
  );
}
