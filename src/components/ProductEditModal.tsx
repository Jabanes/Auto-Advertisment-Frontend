import { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateProduct } from "../store/slices/productSlice";
import { theme } from "../styles/theme";
import type { Product } from "../types/product";

interface Props {
  product: Product;
  onClose: () => void;
}

export default function ProductEditModal({ product, onClose }: Props) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.serverToken);
  const [form, setForm] = useState<Product>(product);
  const [loading, setLoading] = useState(false);

  const handleChange = (key: keyof Product, value: string | number) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!token) return;
    try {
      setLoading(true);
      await dispatch(updateProduct({ token, product: form })).unwrap();
      setLoading(false);
      onClose();
    } catch (err) {
      console.error("Failed to update product", err);
      setLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 10,
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: theme.colors.surfaceLight,
          borderRadius: theme.radii.xl,
          boxShadow: theme.shadows.xl,
          zIndex: 20,
          width: "90%",
          maxWidth: 800,
          padding: theme.spacing.xl,
          overflowY: "auto",
          maxHeight: "90vh",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: theme.spacing.lg,
          }}
        >
          <h1 style={{ fontSize: 24, fontWeight: 700 }}>Product Details</h1>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 20,
              color: theme.colors.textMuted,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: theme.spacing.lg,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label>ID</label>
            <div style={infoBox}>{form.id}</div>

            <label>Name</label>
            <input
              value={form.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              style={inputStyle}
            />

            <label>Price</label>
            <input
              type="number"
              value={form.price || ""}
              onChange={(e) => handleChange("price", parseFloat(e.target.value))}
              style={inputStyle}
            />

            <label>Advertisement Text</label>
            <textarea
              value={form.advertisementText || ""}
              onChange={(e) => handleChange("advertisementText", e.target.value)}
              style={{ ...inputStyle, height: 100 }}
            />

            <label>Image Prompt</label>
            <textarea
              value={form.imagePrompt || ""}
              onChange={(e) => handleChange("imagePrompt", e.target.value)}
              style={{ ...inputStyle, height: 100 }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <label>Product Image</label>
            <img
              src={form.imageUrl || "https://via.placeholder.com/250"}
              alt="Product"
              style={imageBox}
            />

            <label>Generated Ad Image</label>
            <img
              src={form.generatedImageUrl || "https://via.placeholder.com/250"}
              alt="Generated Ad"
              style={imageBox}
            />

            <label>Status</label>
            <div style={infoBox}>{form.status}</div>

            <label>Post Date</label>
            <div style={infoBox}>{form.postDate || "-"}</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: theme.spacing.xl,
            gap: theme.spacing.md,
          }}
        >
          <button
            onClick={onClose}
            style={{
              backgroundColor: theme.colors.backgroundLight,
              color: theme.colors.textDark,
              borderRadius: theme.radii.md,
              padding: "10px 24px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Close
          </button>
          <button
            disabled={loading}
            onClick={handleSave}
            style={{
              backgroundColor: theme.colors.primary,
              color: "white",
              borderRadius: theme.radii.md,
              padding: "10px 24px",
              border: "none",
              cursor: "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px",
  borderRadius: 8,
  border: "1px solid rgba(0,0,0,0.1)",
  fontSize: 14,
  outline: "none",
};

const infoBox: React.CSSProperties = {
  padding: "10px",
  borderRadius: 8,
  background: "#f9fafb",
  border: "1px solid rgba(0,0,0,0.1)",
};

const imageBox: React.CSSProperties = {
  borderRadius: 10,
  width: "100%",
  height: 130,
  objectFit: "cover",
};
