import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  updateProductLocally,
  addProductLocally,
  removeProductLocally,
} from "../store/slices/productSlice";
import { addBusinessLocally } from "../store/slices/authSlice";

/**
 * 🔌 WebSocket hook for real-time data synchronization
 * 
 * Connects once at app root, automatically joins user-specific room,
 * handles reconnection, and dispatches Redux actions for all server events.
 * 
 * Events handled:
 * - product:created → adds product to Redux
 * - product:updated → updates product in Redux (status changes, enrichment, etc.)
 * - product:deleted → removes product from Redux
 * - business:created → adds business to Redux
 */
export function useProductSocket() {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = useAppSelector((s) => s.auth.serverToken);
  const uid = useAppSelector((s) => s.auth.user?.uid);
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Only connect if user is authenticated
    if (!token || !uid) {
      console.log("⚠️ No auth token, skipping socket connection");
      return;
    }

    // Prevent duplicate connections
    if (socketRef.current?.connected) {
      console.log("🔌 Socket already connected, reusing existing connection");
      return;
    }

    console.log("🔌 Initializing socket connection...");

    const socket = io(API_URL, {
      transports: ["websocket", "polling"], // fallback to polling if websocket fails
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketRef.current = socket;

    // Connection lifecycle events
    socket.on("connect", () => {
      console.log(`✅ Socket connected: ${socket.id} → user:${uid}`);
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: ${reason}`);
    });

    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    socket.on("reconnect", (attemptNumber) => {
      console.log(`🔄 Socket reconnected after ${attemptNumber} attempts`);
    });

    socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔄 Socket reconnection attempt ${attemptNumber}...`);
    });

    socket.on("reconnect_failed", () => {
      console.error("❌ Socket reconnection failed after max attempts");
    });

    // ========================================
    // PRODUCT EVENTS
    // ========================================

    socket.on("product:created", (payload: any) => {
      console.log("📦 product:created", payload.id);
      dispatch(addProductLocally(payload));
    });

    socket.on("product:updated", (payload: any) => {
      console.log("📦 product:updated", payload.id, "status:", payload.status);
      dispatch(updateProductLocally(payload));
    });

    socket.on("product:deleted", (payload: { id: string; businessId: string }) => {
      console.log("📦 product:deleted", payload.id);
      dispatch(removeProductLocally(payload.id));
    });

    // ========================================
    // BUSINESS EVENTS
    // ========================================

    socket.on("business:created", (payload: any) => {
      console.log("🏢 business:created", payload.businessId);
      dispatch(addBusinessLocally(payload));
    });

    // ========================================
    // USER EVENTS (future)
    // ========================================

    socket.on("user:updated", (payload: any) => {
      console.log("👤 user:updated", payload.uid);
      // TODO: dispatch action to update user in auth slice
    });

    // Cleanup on unmount or token change
    return () => {
      console.log("🔌 Closing socket connection");
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("reconnect");
      socket.off("reconnect_attempt");
      socket.off("reconnect_failed");
      socket.off("product:created");
      socket.off("product:updated");
      socket.off("product:deleted");
      socket.off("business:created");
      socket.off("user:updated");
      socket.close();
      socketRef.current = null;
    };
  }, [API_URL, token, uid, dispatch]);
}
