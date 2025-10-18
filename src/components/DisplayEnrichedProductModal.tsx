// src/components/DisplayEnrichedProductModal.tsx
import { theme } from "../styles/theme";
import type { Product } from "../types/product";

interface Props {
  product: Product;
  onClose: () => void;
}

export default function DisplayEnrichedProductModal({ product, onClose }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "20px", // ✅ adds spacing around modal for small screens
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(600px, 90%)", // ✅ narrower and centered
          background: "#fff",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
          animation: "fadeIn 0.25s ease",
          transform: "translateY(0)", // ensures true center alignment
        }}
      >
        {/* 🖼 Image container */}
        <div
          style={{
            width: "100%",
            background: "#f7f7f7",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
          }}
        >
          <img
            src={product.generatedImageUrl || product.imageUrl || ""}
            alt={product.name}
            style={{
              width: "100%",
              height: "65vh", // ✅ slightly smaller than before
              objectFit: "cover", // fills frame nicely
              objectPosition: "center center",
              borderRadius: 0,
            }}
          />
        </div>

        <div style={{ padding: 24 }}>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              marginBottom: 8,
              color: theme.colors.textDark,
            }}
          >
            {product.name}
          </h2>

          <span
            style={{
              display: "inline-block",
              backgroundColor: theme.colors.primary + "22",
              color: theme.colors.primary,
              fontWeight: 600,
              fontSize: 12,
              borderRadius: theme.radii.full,
              padding: "4px 10px",
              marginBottom: 16,
            }}
          >
            ENRICHED
          </span>

          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: theme.colors.textMuted,
              whiteSpace: "pre-wrap",
            }}
          >
            {product.advertisementText || "No AI text generated."}
          </p>
        </div>

        <div
          style={{
            borderTop: "1px solid rgba(0,0,0,0.08)",
            padding: 16,
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: theme.colors.primary,
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "10px 16px",
              cursor: "pointer",
              fontWeight: 600,
              minWidth: 80,
            }}
          >
            סגור
          </button>
        </div>
      </div>
    </div>
  );
}
