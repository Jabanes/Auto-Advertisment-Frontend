import { createListenerMiddleware, isAnyOf, type PayloadAction } from "@reduxjs/toolkit";

// Import actions from other slices
import { loginWithGoogleIdToken, emailLogin, performLogout } from "./slices/authSlice";
import { fetchProducts, setProducts, clearProducts } from "./slices/productSlice";
import { setBusinesses, clearBusinesses, fetchAllBusinesses, setCurrentBusinessId, fetchBusiness } from "./slices/businessSlice";
import type { AuthResponse } from "../types/auth";
import type { RootState } from "./index";

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

// 🚀 Login: Hydrate businesses + products safely and avoid overwriting good data
startAppListening({
  matcher: isAnyOf(loginWithGoogleIdToken.fulfilled, emailLogin.fulfilled),
  effect: async (action: PayloadAction<AuthResponse>, { dispatch, getState }) => {
    console.log("[Listener] Login successful, hydrating data...");

    const { products, businesses, serverToken } = action.payload;
    const state = getState() as RootState;

    // --- Businesses ---
    if (businesses?.length) {
      dispatch(setBusinesses(businesses));
      console.log(`[Listener] Hydrated ${businesses.length} businesses from login payload.`);
    } else if (serverToken) {
      const existingCount = state.business.businesses.length;
      if (existingCount === 0) {
        console.log("[Listener] No businesses in payload, fetching from API...");
        // ✅ small delay to let Redux Persist rehydrate first
        setTimeout(() => dispatch(fetchAllBusinesses(serverToken)), 400);
      } else {
        console.log("[Listener] Skipping fetchAllBusinesses – already have businesses in state.");
      }
    }

    // --- Products ---
    if (products?.length) {
      dispatch(setProducts(products));
      console.log(`[Listener] Hydrated ${products.length} products from login payload.`);
    } else if (serverToken) {
      console.log("[Listener] No products in payload, fetching from API...");
      dispatch(fetchProducts({ token: serverToken }));
    }
  },
});

// 🚪 Logout: Clear products and businesses to prevent stale data
startAppListening({
  actionCreator: performLogout.fulfilled,
  effect: async (_, { dispatch }) => {
    console.log("[Listener] Logout complete, clearing data...");
    dispatch(clearProducts());
    dispatch(clearBusinesses());
  },
});

// 🔄 Business Switch: Refetch business details AND products when business changes
startAppListening({
  actionCreator: setCurrentBusinessId,
  effect: async (action, { dispatch, getState }) => {
    const businessId = action.payload;
    if (!businessId) return;

    const state = getState() as RootState;
    const token = state.auth.serverToken;

    if (token) {
      console.log(`[Listener] Business switched to ${businessId}, rehydrating data...`);

      // Fetch fresh business details
      try {
        await dispatch(fetchBusiness({ token, businessId })).unwrap();
        console.log(`[Listener] ✅ Business details refreshed`);
      } catch (error) {
        console.error(`[Listener] ❌ Failed to fetch business details:`, error);
      }

      // Fetch products for the specific business (not all products)
      try {
        await dispatch(fetchProducts({ token, businessId })).unwrap();
        console.log(`[Listener] ✅ Products refreshed for business ${businessId}`);
      } catch (error) {
        console.error(`[Listener] ❌ Failed to fetch products:`, error);
      }
    }
  },
});