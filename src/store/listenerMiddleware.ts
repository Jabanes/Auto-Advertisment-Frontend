import { createListenerMiddleware, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";

// Import actions from other slices
import { loginWithGoogleIdToken, emailLogin, performLogout } from "./slices/authSlice";
import { fetchProducts, setProducts, clearProducts } from "./slices/productSlice";
import type { AuthResponse } from "../types/auth";

/**
 * 🎧 Creates a middleware instance to handle side effects.
 * This is the modern alternative to Redux Saga or Thunks for many use cases.
 * @see https://redux-toolkit.js.org/api/createListenerMiddleware
 */
export const listenerMiddleware = createListenerMiddleware();

// Type-safe versions of the helpers
export type AppStartListening = typeof listenerMiddleware.startListening;
export const startAppListening =
  listenerMiddleware.startListening as AppStartListening;

// 🚀 Login: Hydrate products from auth response
startAppListening({
  matcher: isAnyOf(loginWithGoogleIdToken.fulfilled, emailLogin.fulfilled),
  effect: async (action: PayloadAction<AuthResponse>, { dispatch }) => {
    console.log("[Listener] Login successful, checking for products...");

    const { products, serverToken } = action.payload;

    if (products && products.length > 0) {
      dispatch(setProducts(products));
      console.log(`[Listener] Hydrated ${products.length} products from login payload.`);
    } else if (serverToken) {
      dispatch(fetchProducts(serverToken));
      console.log("[Listener] No products in payload, fetching from API...");
    }
  },
});

// 🚪 Logout: Clear products to prevent stale data
startAppListening({
  actionCreator: performLogout.fulfilled,
  effect: async (_, { dispatch }) => {
    console.log("[Listener] Logout complete, clearing products...");
    dispatch(clearProducts());
  },
});