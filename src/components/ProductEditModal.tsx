import { useState, useRef, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { createProduct, updateProduct } from "../store/slices/productSlice";
import { theme } from "../styles/theme";
import type { Product } from "../types/product";
import { Upload } from "lucide-react";
import { productService } from "../services/productService";

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
};

export default function ProductEditModal({ mode, product, onClose }: Props) {
    const dispatch = useAppDispatch();
    const token = useAppSelector((s) => s.auth.serverToken);
    const businessId = useAppSelector((s) => s.auth.businesses[0]?.businessId);

    const [form, setForm] = useState<Partial<Product>>(
        mode === "edit" ? product! : EMPTY_PRODUCT
    );
    const [loading, setLoading] = useState(false);
    const imageInputRef = useRef<HTMLInputElement | null>(null);
    const isEdit = mode === "edit";

    // 🖼️ local preview + pending file
    const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleChange = (key: keyof Partial<Product>, value: any) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleImageClick = () => imageInputRef.current?.click();

    // 🖼️ Preview only (no upload yet)
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPendingImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    // 🧹 Cleanup preview URL on unmount
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
        console.log("[DEBUG] Save button clicked", { mode, token, businessId, form });
        if (!token || !businessId) return;

        try {
            setLoading(true);
            let imageUrl = form.imageUrl;
            let newProduct: Product | null = null;

            if (isEdit) {
                // --- UPDATE EXISTING PRODUCT ---
                if (pendingImageFile && (form.id || product?.id)) {
                    console.log("[UPLOAD] Uploading image to Firebase...");
                    imageUrl = await productService.uploadImage(
                        token,
                        businessId,
                        form.id || product!.id,
                        pendingImageFile
                    );
                    console.log("[UPLOAD] Done:", imageUrl);
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
                // --- CREATE NEW PRODUCT ---
                // 1️⃣ create the product first
                newProduct = await dispatch(
                    createProduct({
                        token,
                        product: { ...form },
                        businessId,
                    })
                ).unwrap();

                // 2️⃣ upload image if any
                if (pendingImageFile && newProduct?.id) {
                    console.log("[UPLOAD] Uploading new product image...");
                    imageUrl = await productService.uploadImage(
                        token,
                        businessId,
                        newProduct.id,
                        pendingImageFile
                    );
                    console.log("[UPLOAD] Done:", imageUrl);

                    // 3️⃣ patch product with imageUrl
                    await dispatch(
                        updateProduct({
                            token,
                            product: {
                                ...newProduct,
                                imageUrl,
                                businessId,
                                id: newProduct.id,
                            },
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

    // 🎨 Status badge
    const StatusBadge = ({ status }: { status: Product["status"] }) => {
        const color =
            status === "posted"
                ? theme.colors.success
                : status === "enriched"
                    ? theme.colors.primaryLight
                    : theme.colors.warningDark;

        return (
            <div
                style={{
                    display: "inline-block",
                    marginTop: 8,
                    backgroundColor: color + "22",
                    color,
                    fontWeight: 600,
                    borderRadius: theme.radii.full,
                    padding: "4px 10px",
                    fontSize: 12,
                }}
            >
                {status.toUpperCase()}
            </div>
        );
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
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: theme.spacing.lg,
                    }}
                >
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

                {/* Grid */}
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: theme.spacing.lg,
                    }}
                >
                    {/* Left Side (fields) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {isEdit && form.id && (
                            <>
                                <label>ID</label>
                                <div style={infoBox}>{form.id}</div>
                            </>
                        )}

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
                            onChange={(e) => {
                                const val = e.target.value;
                                handleChange("price", val === "" ? 0 : parseFloat(val));
                            }}
                            style={inputStyle}
                        />

                        <label>Description</label>
                        <textarea
                            value={form.description || ""}
                            onChange={(e) => handleChange("description", e.target.value)}
                            style={{ ...inputStyle, height: 80 }}
                        />

                        {form.advertisementText && (
                            <>
                                <label>Advertisement Text</label>
                                <textarea
                                    value={form.advertisementText}
                                    onChange={(e) => handleChange("advertisementText", e.target.value)}
                                    style={{ ...inputStyle, height: 100 }}
                                />
                            </>
                        )}

                        {form.imagePrompt && (
                            <>
                                <label>Image Prompt</label>
                                <textarea
                                    value={form.imagePrompt}
                                    onChange={(e) => handleChange("imagePrompt", e.target.value)}
                                    style={{ ...inputStyle, height: 100 }}
                                />
                            </>
                        )}
                    </div>

                    {/* Right Side (Image) */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        <div
                            style={{ position: "relative", cursor: "pointer" }}
                            onClick={handleImageClick}
                        >
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

                        <input
                            ref={imageInputRef}
                            type="file"
                            accept="image/*"
                            style={{ display: "none" }}
                            onChange={handleImageUpload}
                        />

                        {(previewUrl || form.imageUrl) && (
                            <button onClick={handleRemoveImage} style={removeBtn}>
                                Remove Image
                            </button>
                        )}

                        {form.generatedImageUrl && (
                            <>
                                <label>Generated Ad Image</label>
                                <img src={form.generatedImageUrl} alt="Generated Ad" style={imageLarge} />
                            </>
                        )}

                        {isEdit && form.status && <StatusBadge status={form.status} />}
                    </div>
                </div>

                {/* Footer */}
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

const infoBox: React.CSSProperties = {
    padding: "10px",
    borderRadius: 8,
    background: "#f9fafb",
    border: "1px solid rgba(0,0,0,0.1)",
    fontSize: 14,
    color: theme.colors.textDark,
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
