import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import type { AuthResponse, UserDTO } from "../../types/auth";
import { RequestStatus } from "../../types/requestStatus";
import { persistor } from "../index";
import { setBusinesses } from "../slices/businessSlice";
import { setProducts } from "../slices/productSlice";

type AuthState = {
  user: UserDTO | null;
  serverToken: string | null;
  status: RequestStatus;
  error?: string | null;
};

const initialState: AuthState = {
  user: null,
  serverToken: null,
  status: RequestStatus.IDLE,
  error: null,
};

// 🔐 Google login
export const loginWithGoogleIdToken = createAsyncThunk<
  AuthResponse,
  string,
  { rejectValue: string }
>("auth/loginWithGoogleIdToken", async (idToken, { rejectWithValue }) => {
  try {
    return await authService.googleSignInWithIdToken(idToken);
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Google login failed");
  }
});

// 📧 Email login
export const emailLogin = createAsyncThunk<
  AuthResponse,
  string, // Just the idToken
  { rejectValue: string }
>("auth/emailLogin", async (idToken, { rejectWithValue }) => {
  try {
    return await authService.emailLogin(idToken);
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Login failed");
  }
});

// 🚪 Safe logout thunk (handles full clear)
export const performLogout = createAsyncThunk(
  "auth/performLogout",
  async (_, { dispatch }) => {
    try {
      // Clear browser storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear redux-persist
      await persistor.purge();

      // Reset redux state
      dispatch(logoutSuccess());
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth(state) {
      state.user = null;
      state.serverToken = null;
      state.status = RequestStatus.IDLE;
      state.error = null;
    },

    logoutSuccess(state) {
      state.user = null;
      state.serverToken = null;
      state.status = RequestStatus.IDLE;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 🔐 Google login
      .addCase(loginWithGoogleIdToken.pending, (s) => {
        s.status = RequestStatus.LOADING;
        s.error = null;
      })
      .addCase(loginWithGoogleIdToken.fulfilled, (s, a: PayloadAction<AuthResponse>) => {
        console.log("Auth Slice - Google login fulfilled:", a.payload);

        s.status = RequestStatus.SUCCEEDED;
        s.user = a.payload.user;
        s.serverToken =
          a.payload.serverToken ||
          (a.payload as any).token ||
          (a.payload as any).accessToken ||
          (a.payload as any).idToken ||
          null;

        // ✅ Hydrate other slices
        const { businesses, products } = a.payload;
        if (businesses?.length) {
          window.store?.dispatch(setBusinesses(businesses)); // assuming window.store = configured redux store
        }
        if (products?.length) {
          window.store?.dispatch(setProducts(products));
        }
      })
      .addCase(loginWithGoogleIdToken.rejected, (s, a) => {
        s.status = RequestStatus.FAILED;
        s.error = a.payload || "Google login failed";
      })

      // 📧 Email login
      .addCase(emailLogin.pending, (s) => {
        s.status = RequestStatus.LOADING;
        s.error = null;
      })
      .addCase(emailLogin.fulfilled, (s, a: PayloadAction<AuthResponse>) => {
        s.status = RequestStatus.SUCCEEDED;
        s.user = a.payload.user;
        s.serverToken =
          a.payload.serverToken ||
          (a.payload as any).token ||
          (a.payload as any).accessToken ||
          (a.payload as any).idToken ||
          null;
      })
      .addCase(emailLogin.rejected, (s, a) => {
        s.status = RequestStatus.FAILED;
        s.error = a.payload || "Login failed";
      });
  },
});

export const { clearAuth, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;
