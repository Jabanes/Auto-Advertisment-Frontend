import axios from "axios";
import type { AuthResponse } from "../types/auth";

const API_URL = import.meta.env.VITE_API_URL;

export const authService = {
  /**
   * 🔐 Google Sign-In using Firebase ID token
   */
  async googleSignInWithIdToken(idToken: string): Promise<AuthResponse> {
    const { data } = await axios.post<AuthResponse>(`${API_URL}/auth/google`,
      { idToken },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  },

  /**
   * 📧 Email + Password Login
   * Uses Firebase Client SDK for authentication, then sends ID token to backend
   */
  async emailLogin(idToken: string): Promise<AuthResponse> {
    const { data } = await axios.post<AuthResponse>(`${API_URL}/auth/login`,
      { idToken },
      { headers: { "Content-Type": "application/json" } }
    );
    return data;
  },
};
