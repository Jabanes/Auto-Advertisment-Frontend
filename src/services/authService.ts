import axios from "axios";
import type { AuthResponse } from "../types/auth";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const authService = {
  /**
   * 🔐 Google Sign-In using Firebase ID token
   */
  async googleSignInWithIdToken(idToken: string): Promise<AuthResponse> {
    const { data } = await axios.post<AuthResponse>(
      `${BASE_URL}/auth/google`,
      { idToken },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  },

  /**
   * 📧 Email + Password Login
   */
  async emailLogin(email: string, password: string): Promise<AuthResponse> {
    const { data } = await axios.post<AuthResponse>(
      `${BASE_URL}/auth/login`,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  },
};
