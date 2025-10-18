import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import type { AuthResponse, UserDTO } from "../../types/auth";
import type { Business } from "../../types/business";
import { RequestStatus } from "../../types/requestStatus";
import { persistor } from "../index";

type AuthState = {
  user: UserDTO | null;
  serverToken: string | null;
  businesses: Business[];
  status: RequestStatus;
  error?: string | null;
};

const initialState: AuthState = {
  user: null,
  serverToken: null,
  businesses: [],
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
  { email: string; password: string },
  { rejectValue: string }
>("auth/emailLogin", async (body, { rejectWithValue }) => {
  try {
    return await authService.emailLogin(body.email, body.password);
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
      state.businesses = [];
      state.status = RequestStatus.IDLE;
      state.error = null;
    },

    logoutSuccess(state) {
      state.user = null;
      state.serverToken = null;
      state.businesses = [];
      state.status = RequestStatus.IDLE;
      state.error = null;
    },

    // Socket event handler: business:created
    addBusinessLocally(state, action: PayloadAction<Business>) {
      // Avoid duplicates
      const exists = state.businesses.some(
        (b) => b.businessId === action.payload.businessId
      );
      if (!exists) {
        state.businesses.push(action.payload);
      }
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
        console.log("Auth Slice - Google login fulfilled:", (a.payload as any).accessToken );
        s.status = RequestStatus.SUCCEEDED;
        s.user = a.payload.user;
        // 🧩 FIX: support idToken as fallback
        s.serverToken =
          a.payload.serverToken ||
          (a.payload as any).token ||
          (a.payload as any).accessToken ||
          (a.payload as any).idToken ||
          null;
        s.businesses = a.payload.businesses || [];
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
        s.businesses = a.payload.businesses || [];
      })
      .addCase(emailLogin.rejected, (s, a) => {
        s.status = RequestStatus.FAILED;
        s.error = a.payload || "Login failed";
      });
  },
});

export const { clearAuth, logoutSuccess, addBusinessLocally } = authSlice.actions;
export default authSlice.reducer;
