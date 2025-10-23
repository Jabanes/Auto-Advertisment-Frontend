/**
 * 🎴 PRODUCT CARD - UI Component with Socket-First Updates
 * 
 * DEBUG FLOW:
 * 1. Component renders with current product status from Redux
 * 2. User clicks "Generate" → optimistic update to "processing"
 * 3. Socket receives product:updated → Redux updates → component re-renders
 * 4. Status badge and spinner update immediately
 * 
 * FALLBACK LOGIC:
 * - If socket connected: rely purely on socket events (no polling)
 * - If socket disconnected for >25s AND status=processing: start polling DB
 * - Once non-processing status detected: stop polling
 * 
 * LOGS TO WATCH:
 * - 🎴 [UI] Rendering ProductCard → shows current state
 * - ⚡ [UI] Status changed → shows transition
 * - ⏱️ [FALLBACK] Starting DB polling → fallback activated
 * - ✅ [FALLBACK] DB polling detected update → fallback succeeded
 */

import { useState, useEffect, useRef } from "react";
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
  const isSocketConnected = useAppSelector((s) => s.socket.isConnected);
  const lastDisconnectReason = useAppSelector((s) => s.socket.lastDisconnectReason);

  // Track previous status to detect changes
  const prevStatusRef = useRef<string | undefined>(product.status);

  // 🧪 Toggle this flag to switch between environments
  const IS_TESTING = false; // change to true when testing locally

  // ✅ Choose endpoint based on mode
  const N8N_WEBHOOK = IS_TESTING
    ? "https://n8n.srv1040889.hstgr.cloud/webhook-test/enrich-product" // test webhook
    : `${N8N_URL}/webhook/enrich-product`; // production webhook

  const [showMenu, setShowMenu] = useState(false);
  
  // Log render and status changes
  console.log(
    `🎴 [UI] Rendering ProductCard | ID=${product.id} | Status=${product.status} | SocketConnected=${isSocketConnected}`
  );
  
  if (prevStatusRef.current !== product.status) {
    console.log(
      `⚡ [UI] Status changed for ${product.id} | ${prevStatusRef.current}→${product.status} ${
        product.status !== "processing" ? "→ Stopping spinner ✓" : ""
      }`
    );
    prevStatusRef.current = product.status;
  }

  useEffect(() => {
    // Only act when the product is "processing"
    if (product.status !== "processing") {
      return;
    }

    console.log(
      `⏳ [FALLBACK] Product ${product.id} is processing | Socket=${isSocketConnected ? "✓ connected" : "✗ disconnected"} ${
        lastDisconnectReason ? `(reason: ${lastDisconnectReason})` : ""
      }`
    );

    // If socket is connected, rely purely on socket events (no fallback needed)
    if (isSocketConnected) {
      console.log(`  └─ Socket active → relying on real-time updates (no polling)`);
      return;
    }

    // ⏲️ Socket is disconnected - start grace period before fallback
    console.warn(
      `⚠️ [FALLBACK] Socket disconnected for product ${product.id} → starting 25s grace period before DB polling...`
    );

    const fallbackTimeout = setTimeout(() => {
      console.warn(
        `⏱️ [FALLBACK] Grace period elapsed for product ${product.id} → activating DB polling every 5s`
      );

      let pollCount = 0;
      const interval = setInterval(async () => {
        pollCount++;
        console.log(`🔄 [FALLBACK] Polling DB for product ${product.id} (attempt #${pollCount})...`);

        try {
          const res = await fetch(
            `${API_URL}/products?businessId=${product.businessId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          
          if (!res.ok) {
            console.error(`❌ [FALLBACK] API returned ${res.status} ${res.statusText}`);
            return;
          }

          const data = await res.json();
          const updated = data.products.find((p: Product) => p.id === product.id);

          if (updated && updated.status !== "processing") {
            console.log(
              `✅ [FALLBACK] DB polling detected product status update → ${updated.status} (after ${pollCount} attempts)`
            );
            dispatch(updateProductLocally(updated));
            clearInterval(interval);
          } else {
            console.log(`  └─ Still processing... will retry in 5s`);
          }
        } catch (err) {
          console.error(`❌ [FALLBACK] Polling error for product ${product.id}:`, err);
        }
      }, 5000);

      // Cleanup polling when product finishes or unmounts
      return () => {
        console.log(`🧹 [FALLBACK] Stopping DB polling for product ${product.id}`);
        clearInterval(interval);
      };
    }, 25000); // wait 25 seconds before fallback

    // 🧹 Cleanup timeout if the component unmounts or status changes
    return () => {
      console.log(`🧹 [FALLBACK] Clearing grace period timeout for product ${product.id}`);
      clearTimeout(fallbackTimeout);
    };
  }, [product.status, product.businessId, product.id, token, dispatch, API_URL, isSocketConnected, lastDisconnectReason]);

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
    if (!token || !businessId) {
      console.warn("⚠️ [UI] Cannot generate: missing token or businessId");
      return;
    }

    console.log(
      `🚀 [UI] User clicked Generate for product ${product?.id} | CurrentStatus=${product?.status}`
    );

    if (isProcessing) {
      console.log("⚠️ [UI] Generation already in progress. Ignoring duplicate click.");
      return;
    }

    // 1️⃣ Optimistic update: set status to "processing" immediately for UI responsiveness
    dispatch(setProductStatus({ id: product.id, status: "processing" }));
    console.log(`  └─ ✅ Optimistic Redux update: status → "processing"`);

    try {
      const API_URL = import.meta.env.VITE_API_URL;

      // 2️⃣ Update status in DB (backend will emit socket event after this)
      console.log(`  └─ 📤 Sending PATCH to backend to persist "processing" status...`);
      const updateRes = await fetch(`${API_URL}/products/update/${businessId}/${product.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "processing" }),
      });

      if (!updateRes.ok) {
        throw new Error(`Backend returned ${updateRes.status}`);
      }

      console.log(`  └─ ✅ Backend confirmed status update (socket event should follow)`);

      // 3️⃣ Trigger n8n workflow (fire & forget, handle empty response safely)
      console.log(`  └─ 📡 Triggering n8n webhook at: ${N8N_WEBHOOK}`);
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
          console.log("  └─ ✅ n8n workflow triggered successfully:", data);
        })
        .catch((err) => {
          console.error("  └─ ❌ n8n workflow trigger failed:", err);
          dispatch(setProductStatus({ id: product.id, status: "failed" }));
        });
    } catch (err) {
      console.error("❌ [UI] Failed to update status in DB:", err);
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
