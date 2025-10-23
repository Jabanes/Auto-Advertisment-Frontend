import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  deleteProduct,
  setProductStatus,
  updateProductLocally,
  
} from "../../store/slices/productSlice";
import { theme } from "../../styles/theme";
import type { Product } from "../../types/product";

export default function ProductCard({ product }: { product: Product }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.serverToken);
  const businessId = useAppSelector((s) => s.business.currentBusiness?.businessId);
  const business = useAppSelector((s) => s.business.currentBusiness);
  const API_URL = import.meta.env.VITE_API_URL;
  const N8N_URL = import.meta.env.VITE_N8N_URL;


   // 🧪 Toggle this flag to switch between environments
  const IS_TESTING = true; // change to true when testing locally

  // ✅ Choose endpoint based on mode
  const N8N_WEBHOOK = IS_TESTING
    ? "https://n8n.srv1040889.hstgr.cloud/webhook-test/enrich-product" // test webhook
    : `${N8N_URL}/webhook/enrich-product`; // production webhook

  const [showMenu, setShowMenu] = useState(false);

   useEffect(() => {
    if (product.status === "processing") {
      console.log("⏳ Polling for product status...");

      const interval = setInterval(async () => {
        try {
          const res = await fetch(
            `${API_URL}/products?businessId=${product.businessId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          const data = await res.json();
          const updated = data.products.find((p) => p.id === product.id);

          if (updated && updated.status !== "processing") {
            console.log("✅ Product updated via polling:", updated.status);
            dispatch(updateProductLocally(updated));
            clearInterval(interval);
          }
        } catch (err) {
          console.error("⚠️ Polling error:", err);
        }
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [product.status, product.businessId, product.id, token, dispatch, API_URL]);
  
  // ✅ Inject CSS keyframes once (only on first mount)
  useEffect(() => {
    const existingStyle = document.getElementById("product-card-animations");
    if (!existingStyle) {
      const style = document.createElement("style");
      style.id = "product-card-animations";
      style.innerHTML = `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }
    // No cleanup - keep animations for all cards
  }, []);

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowMenu((p) => !p);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token || !businessId || !product.id) return;
    if (!window.confirm(`Delete "${product.name}" permanently?`)) return;
    try {
      await dispatch(deleteProduct({ token, businessId, id: product.id })).unwrap();
    } catch {
      alert("Failed to delete product");
    }
    setShowMenu(false);
  };

  const handleGenerate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token || !businessId) return;

    console.log(
      `[PRODUCT] Starting generation for ${product?.id} | Status: ${product?.status}`
    );

    if (isProcessing) {
      console.log("[PRODUCT] ⚠️ Generation already in progress. Ignoring.");
      return;
    }

    dispatch(setProductStatus({ id: product.id, status: "processing" }));
    console.log("[PRODUCT] ✅ Optimistic status set to 'processing'");
    
    try {
      const API_URL = import.meta.env.VITE_API_URL;

      // 1️⃣ Update status in DB
      await fetch(`${API_URL}/products/update/${businessId}/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "processing" }),
      });

      console.log("[PRODUCT] ✅ Status updated to 'processing' in DB via PATCH");

      // 2️⃣ Trigger n8n (fire & forget, handle empty response safely)
      console.log("📡 [PRODUCT] Triggering n8n webhook...");
      // fetch(`${N8N_URL}/webhook/enrich-product`, {
      fetch(N8N_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: token,
          businessId,
          business,
          product,
        }),
      })
        .then(async (r) => {
          const text = await r.text();
          return text ? JSON.parse(text) : {};
        })
        .then((data) => {
          console.log("✅ [PRODUCT] n8n workflow triggered successfully:", data);
        })
        .catch((err) => {
          console.error("❌ [PRODUCT] n8n workflow trigger failed:", err);
          dispatch(setProductStatus({ id: product.id, status: "failed" }));
        });
    } catch (err) {
      console.error("❌ [PRODUCT] Failed to update status in DB:", err);
      dispatch(setProductStatus({ id: product.id, status: "failed" }));
    }

    // ✅ Always close menu after the action finishes (success or error)
    setShowMenu(false);
  };

  const isProcessing = product.status === "processing";

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
      {/* Image */}
      <img
        src={
          product.status === "enriched"
            ? product.generatedImageUrl ?? product.imageUrl ?? "/placeholder.jpg"
            : product.imageUrl ?? "/placeholder.jpg"
        }
        alt={product.name}
        style={{
          width: "100%",
          height: 200,
          objectFit: "cover",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          filter: isProcessing ? "grayscale(0.4)" : "none",
        }}
      />

      {/* ✅ Animated overlay spinner */}
      {isProcessing && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(255,255,255,0.85)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 600,
            fontSize: 16,
            color: theme.colors.primary,
            animation: "fadeIn 0.3s ease",
          }}
        >
          <div
            style={{
              width: 28,
              height: 28,
              border: "3px solid rgba(0,0,0,0.1)",
              borderTop: `3px solid ${theme.colors.primary}`,
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: 8,
            }}
          />
          Processing...
        </div>
      )}

      {/* Details */}
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

        {/* Status badge */}
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
                    : product.status === "processing"
                      ? theme.colors.warningDark
                      : product.status === "failed"
                        ? theme.colors.error
                        : theme.colors.textMuted,
              backgroundColor:
                product.status === "posted"
                  ? theme.colors.success + "22"
                  : product.status === "enriched"
                    ? theme.colors.primaryLight + "22"
                    : product.status === "processing"
                      ? theme.colors.warningDark + "22"
                      : product.status === "failed"
                        ? theme.colors.error + "22"
                        : theme.colors.backgroundLight,
              padding: "4px 10px",
              borderRadius: theme.radii.full,
            }}
          >
            {product.status.toUpperCase()}
          </div>
        )}
      </div>

      {/* Context menu */}
      <div
        style={{
          position: "absolute",
          bottom: 10,
          right: 10,
          zIndex: 10,
          transform: showMenu ? "scale(1)" : "scale(0)",
          opacity: showMenu ? 1 : 0,
          transition: "all 0.25s cubic-bezier(0.25, 1, 0.5, 1)",
          display: "flex",
          gap: 8,
        }}
      >
        <button
          onClick={handleGenerate}
          disabled={isProcessing}
          style={{
            background: theme.colors.success,
            border: "none",
            color: "white",
            fontWeight: 600,
            padding: "8px 14px",
            borderRadius: 8,
            cursor: isProcessing ? "not-allowed" : "pointer",
            opacity: isProcessing ? 0.7 : 1,
            boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
          }}
        >
          {isProcessing ? "Processing..." : "Generate"}
        </button>

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
