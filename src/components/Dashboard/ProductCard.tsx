import { useState } from "react";
import { theme } from "../../styles/theme";
import type { Product } from "../../types/product";
import ProductEditModal from "../ProductEditModal";

export default function ProductCard({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);

  const displayStatus =
    product.status.charAt(0).toUpperCase() + product.status.slice(1);

  const statusColor =
    product.status === "posted"
      ? theme.colors.success
      : product.status === "enriched"
      ? theme.colors.primaryLight
      : theme.colors.warningDark;

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        style={{
          backgroundColor: theme.colors.surfaceLight,
          borderRadius: theme.radii.md,
          padding: theme.spacing.md,
          boxShadow: theme.shadows.md,
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1.03)";
          (e.currentTarget as HTMLElement).style.boxShadow = theme.shadows.lg;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          (e.currentTarget as HTMLElement).style.boxShadow = theme.shadows.md;
        }}
      >
        <div
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: theme.radii.sm,
            backgroundImage: `url(${
              product.imageUrl ||
              product.generatedImageUrl ||
              "https://via.placeholder.com/250"
            })`,
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
          <span style={{ color: statusColor }}>
            {displayStatus || "Pending"}
          </span>
        </p>
      </div>

      {open && (
        <ProductEditModal product={product} onClose={() => setOpen(false)} />
      )}
    </>
  );
}
