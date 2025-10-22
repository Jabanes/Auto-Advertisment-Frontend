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

// 🚀 Login: Hydrate products and businesses from auth response
startAppListening({
  matcher: isAnyOf(loginWithGoogleIdToken.fulfilled, emailLogin.fulfilled),
  effect: async (action: PayloadAction<AuthResponse>, { dispatch }) => {
    console.log("[Listener] Login successful, hydrating data...");

    const { products, businesses, serverToken } = action.payload;

    // Hydrate businesses
    if (businesses && businesses.length > 0) {
      dispatch(setBusinesses(businesses));
      console.log(`[Listener] Hydrated ${businesses.length} businesses from login payload.`);
    } else if (serverToken) {
      dispatch(fetchAllBusinesses(serverToken));
      console.log("[Listener] No businesses in payload, fetching from API...");
    }

    // Hydrate products
    if (products && products.length > 0) {
      dispatch(setProducts(products));
      console.log(`[Listener] Hydrated ${products.length} products from login payload.`);
    } else if (serverToken) {
      dispatch(fetchProducts({ token: serverToken }));
      console.log("[Listener] No products in payload, fetching from API...");
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