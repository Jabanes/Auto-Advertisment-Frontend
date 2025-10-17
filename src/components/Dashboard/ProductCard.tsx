import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { deleteProduct } from "../../store/slices/productSlice";
import { theme } from "../../styles/theme";
import type { Product } from "../../types/product";

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.serverToken);
  const businessId = useAppSelector((s) => s.auth.businesses[0]?.businessId);

  const [showDelete, setShowDelete] = useState(false);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // 🧱 block bubbling to parent (no modal)
    setShowDelete((prev) => !prev);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 🧱 block click bubbling
    if (!token || !businessId || !product.id) return;

    const confirmDelete = window.confirm(
      `Are you sure you want to permanently delete "${product.name}"?`
    );
    if (!confirmDelete) return;

    try {
      await dispatch(deleteProduct({ token, businessId, id: product.id })).unwrap();
    } catch (err) {
      console.error("❌ Failed to delete product", err);
      alert("Failed to delete product");
    }

    setShowDelete(false);
  };

  return (
    <div
      onContextMenu={handleRightClick}
      style={{
        position: "relative",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.1)",
        overflow: "hidden",
        backgroundColor: "#fff",
        cursor: "pointer",
        transition: "transform 0.15s ease",
      }}
    >
      <img
        src={product.imageUrl || "/placeholder.jpg"}
        alt={product.name}
        style={{
          width: "100%",
          height: 200,
          objectFit: "cover",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      />

      <div style={{ padding: "10px 12px" }}>
        <h3
          style={{
            fontSize: 16,
            fontWeight: 600,
            marginBottom: 6,
            color: theme.colors.textDark,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {product.name || "Unnamed Product"}
        </h3>

        {product.status && (
          <div
            style={{
              display: "inline-block",
              fontSize: 12,
              fontWeight: 600,
              color:
                product.status === "posted"
                  ? theme.colors.success
                  : product.status === "enriched"
                    ? theme.colors.primaryLight
                    : theme.colors.warningDark,
              backgroundColor:
                product.status === "posted"
                  ? theme.colors.success + "22"
                  : product.status === "enriched"
                    ? theme.colors.primaryLight + "22"
                    : theme.colors.warningDark + "22",
              padding: "4px 10px",
              borderRadius: theme.radii.full,
            }}
          >
            {product.status.toUpperCase()}
          </div>
        )}
      </div>

      {/* ⚙️ Popup actions (Delete + Generate) */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          zIndex: 10,
          transform: showDelete ? "scale(1)" : "scale(0)",
          opacity: showDelete ? 1 : 0,
          transition: "all 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
          display: "flex",
          gap: 8,
        }}
      >
        {/* 🟢 Generate button */}
        <button
          onClick={async (e) => {
            e.stopPropagation();
            if (!token || !businessId) return;
            try {
              const res = await fetch(
                "https://n8n.srv1040889.hstgr.cloud/webhook/enrich-product",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    accessToken: token,
                    businessId,
                    product,
                  }),
                }
              );
              const data = await res.json();
              console.log("✅ Enrichment workflow triggered:", data);
              alert("AI enrichment started! Check status shortly.");
            } catch (err) {
              console.error("❌ Failed to trigger enrichment:", err);
              alert("Failed to trigger enrichment workflow.");
            } finally {
              setShowDelete(false);
            }
          }}
          style={{
            background: theme.colors.success,
            border: "none",
            color: "white",
            fontWeight: 600,
            padding: "8px 14px",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          }}
        >
          Generate
        </button>

        {/* 🗑️ Delete button */}
        <button
          onClick={handleDelete}
          style={{
            background: theme.colors.error,
            border: "none",
            color: "white",
            fontWeight: 600,
            padding: "8px 14px",
            borderRadius: 8,
            cursor: "pointer",
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
