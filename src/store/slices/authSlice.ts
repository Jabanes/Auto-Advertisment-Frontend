import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { authService } from "../../services/authService";
import type { AuthResponse, UserDTO } from "../../types/auth";
import { RequestStatus } from "../../types/requestStatus";
import { persistor } from "../index";

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
  { email: string; password: string },
  { rejectValue: string }
>("auth/emailLogin", async (body, { rejectWithValue }) => {
  try {
    return await authService.emailLogin(body.email, body.password);
  } catch (e: any) {
    return rejectWithValue(e?.response?.data?.message || "Login failed");
  }
});

// ✅ Safe logout thunk (handles side effects outside reducer)
export const performLogout = createAsyncThunk("auth/performLogout", async (_, { dispatch }) => {
  // Clear browser storage
  localStorage.clear();
  sessionStorage.clear();

  // Clear redux-persist
  await persistor.purge();

  // Dispatch the pure reducer to reset redux state
  dispatch(logoutSuccess());
});

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

    // Pure reducer only
    logoutSuccess(state) {
      state.user = null;
      state.serverToken = null;
      state.status = RequestStatus.IDLE;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithGoogleIdToken.pending, (s) => {
        s.status = RequestStatus.LOADING;
        s.error = null;
      })
      .addCase(
        loginWithGoogleIdToken.fulfilled,
        (s, a: PayloadAction<AuthResponse>) => {
          s.status = RequestStatus.SUCCEEDED;
          s.user = a.payload.user;
          s.serverToken = a.payload.serverToken;
        }
      )
      .addCase(loginWithGoogleIdToken.rejected, (s, a) => {
        s.status = RequestStatus.FAILED;
        s.error = a.payload || "Google login failed";
      })
      .addCase(emailLogin.pending, (s) => {
        s.status = RequestStatus.LOADING;
        s.error = null;
      })
      .addCase(emailLogin.fulfilled, (s, a: PayloadAction<AuthResponse>) => {
        s.status = RequestStatus.SUCCEEDED;
        s.user = a.payload.user;
        s.serverToken = a.payload.serverToken;
      })
      .addCase(emailLogin.rejected, (s, a) => {
        s.status = RequestStatus.FAILED;
        s.error = a.payload || "Login failed";
      });
  },
});

export const { clearAuth, logoutSuccess } = authSlice.actions;
export default authSlice.reducer;
