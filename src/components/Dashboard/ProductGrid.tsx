import { useAppDispatch, useAppSelector } from "../../store/hooks";
import ProductCard from "./ProductCard";
import { theme } from "../../styles/theme";

export default function ProductGrid() {
  const dispatch = useAppDispatch();
  const { items: products, status } = useAppSelector((state) => state.products);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: theme.spacing.lg,
      }}
    >
      {products && products.length > 0 ? (
        products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))
      ) : (
        <p
          style={{
            color: theme.colors.textMuted,
            fontSize: theme.typography.fontSize.md,
            textAlign: "center",
            marginTop: theme.spacing.xl,
          }}
        >
          No products found. Add one to get started.
        </p>
      )}
    </div>
  );
}
