// src/hooks/useSocket.ts

import { useEffect, useRef } from "react";
import { type Socket, io } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addProductLocally,
  removeProductLocally,
  updateProductLocally,
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
      console.log("⚠️ [SOCKET] No auth token or UID, skipping connection.");
      return;
    }
    if (socketRef.current?.connected) {
      console.log("🔌 [SOCKET] Connection already active.");
      return;
    }

    console.log(
      `[SOCKET] Attempting to connect... (UID: ${uid}, Token: ${
        token ? "present" : "absent"
      })`
    );

    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`🟢 [SOCKET] Connected: ${socket.id} | User: ${uid}`);
    });
    socket.on("disconnect", (reason) => {
      console.log(`🔴 [SOCKET] Disconnected: ${reason}`);
    });
    socket.on("connect_error", (err) => {
      console.error("❌ [SOCKET] Connection Error:", err.message);
    });

    // PRODUCT EVENTS
    socket.on("product:created", (payload: any) => {
      console.log("📩 [SOCKET] Received product:created | ID:", payload?.id);
      dispatch(addProductLocally(payload));
    });
    socket.on("product:updated", (payload: any) => {
      console.log(
        `📩 [SOCKET] Received product:updated | ID: ${payload?.id}, Status: ${payload?.status}, Business: ${payload?.businessId}`
      );
      dispatch(updateProductLocally(payload));
    });
    socket.on("product:deleted", (payload: { id: string }) => {
      console.log("📩 [SOCKET] Received product:deleted | ID:", payload?.id);
      dispatch(removeProductLocally(payload.id));
    });

    // BUSINESS EVENTS
    socket.on("business:created", (payload: any) => {
      console.log(
        "📩 [SOCKET] Received business:created | ID:",
        payload?.businessId
      );
      dispatch(addBusinessLocally(payload));
    });
    socket.on("business:updated", (payload: any) => {
      dispatch(updateBusinessLocally(payload));
    });
    socket.on("business:deleted", (payload: { businessId: string }) => {
      dispatch(removeBusinessLocally(payload.businessId));
    });

    return () => {
      console.log("🧹 [SOCKET] Cleaning up connection for", uid);
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
