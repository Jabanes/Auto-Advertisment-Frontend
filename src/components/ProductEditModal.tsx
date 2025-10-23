import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createProduct, updateProduct } from "../store/slices/productSlice";
import { theme } from "../styles/theme";
import type { Product } from "../types/product";
import { Upload, Settings } from "lucide-react";
import { productService } from "../services/productService";
import config from "../config/productConfig.json"; // 🧩 JSON with dropdown options (you’ll create this later)

interface Props {
  mode: "create" | "edit";
  product?: Product;
  onClose: () => void;
}

const EMPTY_PRODUCT: Partial<Product> = {
  name: "",
  price: 0,
  description: "",
  imageUrl: "",
  preserveOriginalProduct: true,
};

export default function ProductEditModal({ mode, product, onClose }: Props) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.serverToken);
  const businessId = useAppSelector((s) => s.business.currentBusiness?.businessId);

  const [form, setForm] = useState<Partial<Product>>(mode === "edit" ? product! : EMPTY_PRODUCT);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const isEdit = mode === "edit";
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleChange = (key: keyof Partial<Product>, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageClick = () => imageInputRef.current?.click();

  // 🖼️ Preview only
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleRemoveImage = () => {
    setPendingImageFile(null);
    setPreviewUrl(null);
    handleChange("imageUrl", "");
  };

  const handleSave = async () => {
    if (!token || !businessId) return;
    try {
      setLoading(true);
      let imageUrl = form.imageUrl;
      let newProduct: Product | null = null;

      if (isEdit) {
        // --- UPDATE PRODUCT ---
        if (pendingImageFile && (form.id || product?.id)) {
          imageUrl = await productService.uploadImage(
            token,
            businessId,
            form.id || product!.id,
            pendingImageFile
          );
        }

        const updates: Partial<Product> = {};
        for (const key in form) {
          if ((form as any)[key] !== (product as any)[key]) {
            updates[key as keyof Product] = (form as any)[key];
          }
        }
        updates.imageUrl = imageUrl;

        await dispatch(
          updateProduct({
            token,
            product: {
              ...(product as Product),
              ...form,
              ...updates,
              imageUrl,
              businessId,
              id: form.id || product!.id,
            },
          })
        ).unwrap();
      } else {
        // --- CREATE PRODUCT ---
        newProduct = await dispatch(
          createProduct({
            token,
            product: { ...form },
            businessId,
          })
        ).unwrap();

        if (pendingImageFile && newProduct?.id) {
          imageUrl = await productService.uploadImage(token, businessId, newProduct.id, pendingImageFile);
          await dispatch(
            updateProduct({
              token,
              product: { ...newProduct, imageUrl, businessId, id: newProduct.id },
            })
          ).unwrap();
        }
      }

      setLoading(false);
      setPendingImageFile(null);
      setPreviewUrl(null);
      onClose();
    } catch (err) {
      console.error("Failed to save product", err);
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
          maxWidth: 900,
          padding: theme.spacing.xl,
          overflowY: "auto",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: theme.colors.textDark }}>
            {isEdit ? "Edit Product" : "Create New Product"}
          </h1>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 22,
              color: theme.colors.textMuted,
              cursor: "pointer",
            }}
          >
            ✕
          </button>
        </div>

        {/* Basic Fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <label>Name</label>
            <input
              value={form.name || ""}
              onChange={(e) => handleChange("name", e.target.value)}
              style={inputStyle}
            />

            <label>Price</label>
            <input
              type="number"
              value={form.price ?? ""}
              onChange={(e) => handleChange("price", parseFloat(e.target.value) || 0)}
              style={inputStyle}
            />

            <label>Description</label>
            <textarea
              value={form.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              style={{ ...inputStyle, height: 80 }}
            />

            <label>
              <input
                type="checkbox"
                checked={!!form.preserveOriginalProduct}
                onChange={(e) => handleChange("preserveOriginalProduct", e.target.checked)}
                style={{ marginRight: 8 }}
              />
              Preserve Original Product Image
            </label>
          </div>

          {/* Image */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div onClick={handleImageClick} style={{ position: "relative", cursor: "pointer" }}>
              {previewUrl || form.imageUrl ? (
                <img src={previewUrl || form.imageUrl!} alt="Product" style={imageLarge} />
              ) : (
                <div
                  style={{
                    ...imageLarge,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#f3f4f6",
                    color: theme.colors.textMuted,
                  }}
                >
                  <Upload size={36} />
                </div>
              )}
            </div>
            <input ref={imageInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
            {(previewUrl || form.imageUrl) && (
              <button onClick={handleRemoveImage} style={removeBtn}>
                Remove Image
              </button>
            )}
          </div>
        </div>

        {/* 🧩 Advanced Settings Toggle */}
        <button
          onClick={() => setShowAdvanced((p) => !p)}
          style={{
            marginTop: 24,
            background: theme.colors.backgroundLight,
            border: `1px solid ${theme.colors.borderLight}`,
            borderRadius: 12,
            padding: "10px 16px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 600,
          }}
        >
          <Settings size={18} /> {showAdvanced ? "Hide Advanced Settings" : "Show Advanced Settings"}
        </button>

        {/* 🧠 Advanced Settings Section */}
        {showAdvanced && (
          <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
            <label>
              {config.productType.label}
              <select
                value={form.productType || ""}
                onChange={(e) => handleChange("productType", e.target.value)}
                style={inputStyle}
              >
                <option value="">בחר...</option>
                {Object.entries(config.productType.options).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>

            <label>
              {config.productCategory.label}
              <select
                value={form.productCategory || ""}
                onChange={(e) => handleChange("productCategory", e.target.value)}
                style={inputStyle}
              >
                <option value="">בחר...</option>
                {Object.entries(config.productCategory.options).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>

            <label>
              {config.visualMood.label}
              <select
                value={form.visualMood || ""}
                onChange={(e) => handleChange("visualMood", e.target.value)}
                style={inputStyle}
              >
                <option value="">בחר...</option>
                {Object.entries(config.visualMood.options).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>

            <label>
              {config.photoStyle.label}
              <select
                value={form.photoStyle || ""}
                onChange={(e) => handleChange("photoStyle", e.target.value)}
                style={inputStyle}
              >
                <option value="">בחר...</option>
                {Object.entries(config.photoStyle.options).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>

            <label>
              {config.backgroundStyle.label}
              <select
                value={form.backgroundStyle || ""}
                onChange={(e) => handleChange("backgroundStyle", e.target.value)}
                style={inputStyle}
              >
                <option value="">בחר...</option>
                {Object.entries(config.backgroundStyle.options).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>

            <label>
              {config.aspectRatio.label}
              <select
                value={form.aspectRatio || ""}
                onChange={(e) => handleChange("aspectRatio", e.target.value)}
                style={inputStyle}
              >
                <option value="">בחר...</option>
                {Object.entries(config.aspectRatio.options).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </label>

            <label>
              קהל יעד
              <input
                placeholder="לדוגמה: נשים צעירות, ילדים, אנשי מקצוע בתחום העיצוב..."
                value={form.targetAudience || ""}
                onChange={(e) => handleChange("targetAudience", e.target.value)}
                style={inputStyle}
              />
            </label>

            {/* 🧩 Checkboxes */}
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={!!form.includePriceInAd}
                onChange={(e) => handleChange("includePriceInAd", e.target.checked)}
              />
              הצג מחיר במודעה
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={!!form.emphasizeBrandIdentity}
                onChange={(e) => handleChange("emphasizeBrandIdentity", e.target.checked)}
              />
              כלול לוגו של העסק בתמונה
            </label>
          </div>
        )}
        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 24, gap: 12 }}>
          <button onClick={onClose} style={cancelBtn}>
            Close
          </button>
          <button disabled={loading} onClick={handleSave} style={saveBtn}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Product"}
          </button>
        </div>
      </div>
    </>
  );
}

// ---- Styles ----
const inputStyle: React.CSSProperties = {
  padding: "10px",
  borderRadius: 8,
  border: "1px solid rgba(0,0,0,0.1)",
  fontSize: 14,
  outline: "none",
};

const imageLarge: React.CSSProperties = {
  borderRadius: 14,
  width: "100%",
  height: 260,
  objectFit: "cover",
  border: "1px solid rgba(0,0,0,0.1)",
};

const removeBtn: React.CSSProperties = {
  background: "none",
  border: "none",
  color: theme.colors.textMuted,
  textDecoration: "underline",
  fontSize: 13,
  cursor: "pointer",
  alignSelf: "flex-start",
};

const cancelBtn: React.CSSProperties = {
  backgroundColor: theme.colors.backgroundLight,
  color: theme.colors.textDark,
  borderRadius: 8,
  padding: "10px 24px",
  border: "none",
  cursor: "pointer",
};

const saveBtn: React.CSSProperties = {
  backgroundColor: theme.colors.primary,
  color: "white",
  borderRadius: 8,
  padding: "10px 24px",
  border: "none",
  cursor: "pointer",
};
