import { theme } from "../../styles/theme";
import type { Product } from "../../types/product";

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div
      style={{
        backgroundColor: theme.colors.surfaceLight,
        borderRadius: theme.radii.md,
        padding: theme.spacing.md,
        boxShadow: `0 2px 6px ${theme.colors.shadow}`,
        transition: "0.3s",
      }}
    >
      <div
        style={{
          width: "100%",
          aspectRatio: "1/1",
          borderRadius: theme.radii.sm,
          backgroundImage: `url(${product.imageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          marginBottom: theme.spacing.md,
        }}
      />
      <p style={{ fontWeight: 600, marginBottom: 4 }}>{product.name}</p>
      <p
        style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.textMuted,
        }}
      >
        Status:{" "}
        <span
          style={{
            color:
              product.status === "pending"
                ? theme.colors.warningDark
                : theme.colors.success,
          }}
        >
          {product.status}
        </span>
      </p>
    </div>
  );
}
