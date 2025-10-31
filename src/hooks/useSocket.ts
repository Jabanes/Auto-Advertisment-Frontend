// src/hooks/useSocket.ts

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  updateProductLocally,
  addProductLocally,
  removeProductLocally,
} from "../store/slices/productSlice";
import { addBusinessLocally, updateBusinessLocally, removeBusinessLocally } from "../store/slices/businessSlice";

export function useSocket() {
  const API_URL = import.meta.env.VITE_API_URL;
  const token = useAppSelector((s) => s.auth.serverToken);
  const uid = useAppSelector((s) => s.auth.user?.uid);
  const dispatch = useAppDispatch();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!token || !uid) {
      console.log("⚠️ No auth token or uid, skipping socket connection");
      return;
    }
    if (socketRef.current?.connected) {
      console.log("🔌 Socket already connected");
      return;
    }

    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`✅ Socket connected: ${socket.id} for user:${uid}`);
    });
    socket.on("disconnect", (reason) => {
      console.log(`🔌 Socket disconnected: ${reason}`);
    });
    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });

    // PRODUCT EVENTS
    socket.on("product:created", (payload: any) => {
      console.log("📦 Socket product:updated →", payload);
      dispatch(addProductLocally(payload));
    });
    socket.on("product:updated", (payload: any) => {
      const normalized = {
        id: payload.id || payload.productId,
        status: payload.status,
        ...payload,
      };

      if (!normalized.id) {
        console.warn("⚠️ Received product:updated without id/productId:", payload);
        return;
      }

      dispatch(updateProductLocally(normalized));
    });
    socket.on("product:deleted", (payload: { id: string }) => {
      dispatch(removeProductLocally(payload.id));
    });

    // BUSINESS EVENTS
    socket.on("business:created", (payload: any) => {
      dispatch(addBusinessLocally(payload));
    });
    socket.on("business:updated", (payload: any) => {
      dispatch(updateBusinessLocally(payload));
    });
    socket.on("business:deleted", (payload: { businessId: string }) => {
      dispatch(removeBusinessLocally(payload.businessId));
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
      socket.off("product:created");
      socket.off("product:updated");
      socket.off("product:deleted");
      socket.off("business:created");
      socket.off("business:updated");
      socket.off("business:deleted");
      socket.close();
      socketRef.current = null;
    };
  }, [API_URL, token, uid, dispatch]);
}
