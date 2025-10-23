/**
 * 🔌 SOCKET HOOK - Real-Time Event Bridge
 * 
 * DEBUG FLOW:
 * 1. Connection lifecycle: connect → dispatch setSocketConnected(true)
 * 2. Backend emits product:updated → log event → dispatch updateProductLocally
 * 3. Redux updates state → ProductCard re-renders
 * 4. On disconnect: log reason → set isConnected=false → fallback polling activates
 * 
 * LOGS TO WATCH:
 * - 🟢 [SOCKET] Connected → socket is active
 * - 📡 [SOCKET] Received product:updated → event arrived
 * - 🔴 [SOCKET] Disconnected → socket is down
 * - 🔁 [SOCKET] Reconnecting... → attempting reconnect
 */

import { useEffect, useRef } from "react";
import { type Socket, io } from "socket.io-client";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  addProductLocally,
  removeProductLocally,
  updateProductLocally,
} from "../store/slices/productSlice";
import { addBusinessLocally, updateBusinessLocally, removeBusinessLocally } from "../store/slices/businessSlice";
import {
  setSocketConnected,
  setSocketDisconnectReason,
} from "../store/slices/socketSlice";


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
      `[SOCKET] Attempting to connect... (UID: ${uid}, Token: ${token ? "present" : "absent"
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


    // ✅ Update Redux on connect/disconnect
    socket.on("connect", () => {
      console.log(`🟢 [SOCKET] Connected successfully | Socket ID: ${socket.id} | User: ${uid}`);
      dispatch(setSocketConnected(true));
      dispatch(setSocketDisconnectReason(null));
    });

    socket.on("disconnect", (reason) => {
      console.log(`🔴 [SOCKET] Disconnected | Reason: ${reason} | User: ${uid}`);
      if (reason === "io server disconnect") {
        console.warn("⚠️ [SOCKET] Server forcibly disconnected — will NOT auto-reconnect");
      } else if (reason === "io client disconnect") {
        console.log("ℹ️ [SOCKET] Client initiated disconnect (e.g. logout)");
      } else {
        console.log("🔁 [SOCKET] Will attempt to reconnect automatically...");
      }
      dispatch(setSocketConnected(false));
      dispatch(setSocketDisconnectReason(reason));
    });

    socket.on("connect_error", (err) => {
      console.error(`❌ [SOCKET] Connection Error: ${err.message} | User: ${uid}`);
      dispatch(setSocketConnected(false));
      dispatch(setSocketDisconnectReason(err.message));
    });

    socket.io.on("reconnect_attempt", (attemptNumber) => {
      console.log(`🔁 [SOCKET] Reconnecting... (Attempt ${attemptNumber}/5) | User: ${uid}`);
    });

    socket.io.on("reconnect", (attemptNumber) => {
      console.log(`✅ [SOCKET] Reconnected successfully after ${attemptNumber} attempts | User: ${uid}`);
    });

    socket.io.on("reconnect_failed", () => {
      console.error(`❌ [SOCKET] Reconnection failed after maximum attempts | User: ${uid}`);
    });


    // PRODUCT EVENTS
    socket.on("product:created", (payload: any) => {
      console.log(
        `📡 [SOCKET] Received product:created → ID=${payload?.id || payload?._id} | Name="${payload?.name}" | Status=${payload?.status}`
      );
      dispatch(addProductLocally(payload));
    });
    
    socket.on("product:updated", (payload: any) => {
      const productId = payload?.id || payload?._id;
      console.log(
        `📡 [SOCKET] Received product:updated → ID=${productId} | Status=${payload?.status} | Business=${payload?.businessId}`
      );
      console.log(`  └─ Dispatching updateProductLocally with payload:`, payload);
      dispatch(updateProductLocally(payload));
      console.log(`  └─ ✅ Redux dispatch completed for product ${productId}`);
    });
    
    socket.on("product:deleted", (payload: { id: string }) => {
      console.log(`📡 [SOCKET] Received product:deleted → ID=${payload?.id}`);
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
      dispatch(setSocketConnected(false)); // ✅ also clear state on cleanup
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
