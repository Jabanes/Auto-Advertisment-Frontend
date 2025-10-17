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
  string, // accessToken
  { rejectValue: string }
>("products/fetchAll", async (token, { rejectWithValue }) => {
  try {
    return await productService.getAll(token);
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Failed to fetch products");
  }
});

// ✏️ UPDATE
export const updateProduct = createAsyncThunk<
  Product,
  { token: string; product: Product },
  { rejectValue: string }
>("products/update", async ({ token, product }, { rejectWithValue }) => {
  try {
    return await productService.update(token, product);
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Failed to update product");
  }
});

// ➕ CREATE
export const createProduct = createAsyncThunk<
  Product,
  { token: string; payload: Partial<Product> },
  { rejectValue: string }
>("products/create", async ({ token, payload }, { rejectWithValue }) => {
  try {
    return await productService.create(token, payload);
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Failed to create product");
  }
});

// ❌ DELETE
export const deleteProduct = createAsyncThunk<
  string,
  { token: string; id: string },
  { rejectValue: string }
>("products/delete", async ({ token, id }, { rejectWithValue }) => {
  try {
    await productService.remove(token, id);
    return id;
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
    // local/optimistic updates
    updateProductLocally: (state, action: PayloadAction<Product>) => {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    removeProductLocally: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
    },
    addProductLocally: (state, action: PayloadAction<Product>) => {
      state.items.unshift(action.payload);
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
        s.items.unshift(a.payload);
      })

      // DELETE
      .addCase(deleteProduct.fulfilled, (s, a) => {
        s.items = s.items.filter((p) => p.id !== a.payload);
      });
  },
});

export const {
  setProducts,
  updateProductLocally,
  removeProductLocally,
  addProductLocally,
  clearProducts,
} = productSlice.actions;

export default productSlice.reducer;
