/**
 * 🔄 PRODUCT SLICE - Socket-First State Management
 * 
 * DEBUG FLOW:
 * 1. Socket emits product:updated → useSocket dispatches updateProductLocally
 * 2. updateProductLocally normalizes id/_id, merges state immutably
 * 3. Redux notifies React → ProductCard re-renders with new status
 * 4. Logs show: [REDUX] updateProductLocally → [UI] Re-render with new status
 * 
 * FALLBACK: REST polling only if socket disconnected for >25s
 */

import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { productService } from "../../services/productService";
import type { Product } from "../../types/product";
import { RequestStatus } from "../../types/requestStatus";

// 🧠 STATE
type ProductState = {
  items: Product[];
  status: RequestStatus;
  error?: string | null;
};

const initialState: ProductState = {
  items: [],
  status: RequestStatus.IDLE,
  error: null,
};

// 📦 FETCH ALL
export const fetchProducts = createAsyncThunk<
  Product[],
  { token: string; businessId?: string }, // accessToken and optional businessId
  { rejectValue: string }
>("products/fetchAll", async ({ token, businessId }, { rejectWithValue }) => {
  try {
    return await productService.getAll(token, businessId);
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Failed to fetch products");
  }
});

// ✏️ UPDATE
export const updateProduct = createAsyncThunk<
  Product,
  { token: string; product: Partial<Product> & { id: string; businessId: string } },
  { rejectValue: string }
>("products/update", async ({ token, product }, { rejectWithValue }) => {
  try {
    return await productService.update(token, product as Product);
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Failed to update product");
  }
});

// ➕ CREATE
export const createProduct = createAsyncThunk<
  Product,
  { token: string; product: Partial<Product>; businessId: string },
  { rejectValue: string }
>("products/create", async ({ token, product, businessId }, { rejectWithValue }) => {
  try {
    return await productService.create(token, { ...product, businessId });
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Failed to create product");
  }
});

// ❌ DELETE
export const deleteProduct = createAsyncThunk<
  string,
  { token: string; businessId: string; id: string },
  { rejectValue: string }
>("products/delete", async ({ token, businessId, id }, { rejectWithValue }) => {
  try {
    await productService.remove(token, businessId, id);
    return id; // return deleted id for Redux
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Failed to delete product");
  }
});
// 🧱 SLICE
const productSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    // Hydrates products from login payload
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.status = RequestStatus.SUCCEEDED;
    },

    // 🔔 Socket event handler: product:updated
    // Merges incoming fields with existing product (idempotent)
    // Handles both id and _id keys for Firestore compatibility
    updateProductLocally: (state, action: PayloadAction<Partial<Product> & { id?: string; _id?: string }>) => {
      // ✅ Normalize ID: accept both "id" and "_id" from backend
      const productId = action.payload.id || action.payload._id;
      
      if (!productId) {
        console.warn("⚠️ [REDUX] updateProductLocally called with no id or _id — ignoring payload:", action.payload);
        return;
      }

      const idx = state.items.findIndex((p) => p.id === productId || (p as any)._id === productId);
      
      if (idx !== -1) {
        const oldStatus = state.items[idx].status;
        const newStatus = action.payload.status;
        
        // Merge incoming fields immutably
        state.items[idx] = {
          ...state.items[idx],
          ...action.payload,
          id: productId, // Normalize to always use "id"
        };
        
        console.log(
          `🧩 [REDUX] updateProductLocally → ID=${productId} | Found=true | StatusChange=${oldStatus}→${newStatus || oldStatus}`
        );
      } else {
        // Product doesn't exist locally yet - add it
        console.warn(
          `⚠️ [REDUX] Product not found locally (ID=${productId}) — adding new one | Status=${action.payload.status}`
        );
        state.items.unshift({ ...action.payload, id: productId } as Product);
      }
    },

    // 🔔 Socket event handler: product:deleted
    removeProductLocally: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },

    // 🔔 Socket event handler: product:created
    addProductLocally: (state, action: PayloadAction<Product>) => {
      // Avoid duplicates (idempotent)
      const exists = state.items.some((p) => p.id === action.payload.id);
      if (!exists) {
        state.items.unshift(action.payload);
      } else {
        console.log(`Product ${action.payload.id} already exists, skipping duplicate add`);
      }
    },

    // Optimistic update for UI responsiveness (e.g., "processing" state)
    // Will be reconciled by next socket event
    setProductStatus: (
      state,
      action: PayloadAction<{ id: string; status: Product["status"] }>
    ) => {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = {
          ...state.items[idx],
          status: action.payload.status,
        };
      }
    },

    clearProducts: (state) => {
      state.items = [];
      state.status = RequestStatus.IDLE;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchProducts.pending, (s) => {
        s.status = RequestStatus.LOADING;
        s.error = null;
      })
      .addCase(fetchProducts.fulfilled, (s, a) => {
        s.status = RequestStatus.SUCCEEDED;
        s.items = a.payload;
      })
      .addCase(fetchProducts.rejected, (s, a) => {
        s.status = RequestStatus.FAILED;
        s.error = a.payload || "Failed to fetch products";
      })

      // UPDATE
      .addCase(updateProduct.fulfilled, (s, a) => {
        const idx = s.items.findIndex((p) => p.id === a.payload.id);
        if (idx !== -1) s.items[idx] = a.payload;
      })

      // CREATE
      .addCase(createProduct.fulfilled, (s, a) => {
        // Don't add here - socket event will handle it
        // This prevents duplicates when backend emits product:created
        const exists = s.items.some((p) => p.id === a.payload.id);
        if (!exists) {
          s.items.unshift(a.payload);
        }
      })

      // DELETE
      .addCase(deleteProduct.fulfilled, (s, a) => {
        // Filter is idempotent, but socket event will also handle removal
        // Keep this for immediate feedback before socket event arrives
        s.items = s.items.filter((p) => p.id !== a.payload);
      });
  },
});

export const {
  setProducts,
  updateProductLocally,
  removeProductLocally,
  addProductLocally,
  setProductStatus,
  clearProducts,
} = productSlice.actions;

export default productSlice.reducer;
