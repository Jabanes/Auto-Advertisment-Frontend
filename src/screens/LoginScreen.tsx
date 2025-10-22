import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { emailLogin } from "../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { theme } from "../styles/theme";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((s) => s.auth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 1️⃣ Sign in with Firebase Client SDK
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();

      // 2️⃣ Send ID token to backend
      const action = await dispatch(emailLogin(idToken));
      
      if (emailLogin.fulfilled.match(action)) {
        // Check if user has businesses
        const { businesses } = action.payload;
        
        if (!businesses || businesses.length === 0) {
          // No businesses - redirect to create mode
          console.log("No businesses found, redirecting to create business...");
          navigate("/dashboard/business?mode=create", { replace: true });
        } else {
          // Has businesses - go to dashboard
          navigate("/dashboard", { replace: true });
        }
      } else {
        alert(action.payload || "Login failed");
      }
    } catch (error: any) {
      console.error("❌ Email login failed:", error);
      alert(error.message || "Login failed. Please check your credentials.");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        backgroundColor: theme.colors.backgroundLight,
      }}
    >
      {/* 🔮 Gradient Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: theme.gradients.background,
          opacity: 0.2,
          zIndex: 1,
        }}
      ></div>

      {/* 🔲 Login Container */}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          maxWidth: 420,
          padding: theme.spacing.xl,
          borderRadius: theme.radii.xl,
          boxShadow: theme.shadows.xl,
          backgroundColor: `${theme.colors.backgroundLight}cc`, // semi-transparent for blur
          backdropFilter: "blur(12px)",
        }}
      >
        {/* 💡 Logo + Title */}
        <div style={{ textAlign: "center", marginBottom: theme.spacing.lg }}>
          <div
            style={{
              backgroundColor: theme.colors.overlayLight,
              padding: theme.spacing.sm,
              borderRadius: theme.radii.full,
              marginBottom: theme.spacing.md,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg
              width="40"
              height="40"
              stroke={theme.colors.primary}
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              viewBox="0 0 24 24"
            >
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: theme.typography.fontFamily.display,
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.textDark,
            }}
          >
            Auto-Advertisement
          </h1>
        </div>

        {/* 🧾 Form */}
        <form
          onSubmit={handleSubmit}
          style={{ width: "100%", display: "flex", flexDirection: "column" }}
        >
          <div style={{ marginBottom: theme.spacing.md }}>
            <input
              type="email"
              placeholder="מייל"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                backgroundColor: `${theme.colors.backgroundLight}80`,
                border: `1px solid ${theme.colors.borderLight}`,
                borderRadius: theme.radii.lg,
                color: theme.colors.textDark,
                fontSize: theme.typography.fontSize.md,
                outline: "none",
              }}
            />
          </div>

          <div style={{ marginBottom: theme.spacing.lg }}>
            <input
              type="password"
              placeholder="סיסמה חזקה"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 14px",
                backgroundColor: `${theme.colors.backgroundLight}80`,
                border: `1px solid ${theme.colors.borderLight}`,
                borderRadius: theme.radii.lg,
                color: theme.colors.textDark,
                fontSize: theme.typography.fontSize.md,
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: theme.radii.lg,
              backgroundColor: theme.colors.primary,
              color: theme.colors.textLight,
              border: "none",
              fontWeight: theme.typography.fontWeight.medium,
              cursor: "pointer",
              fontSize: theme.typography.fontSize.md,
              boxShadow: theme.shadows.sm,
              transition: "background 0.2s ease-in-out",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = theme.colors.primaryLight)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = theme.colors.primary)
            }
          >
            {status === "loading" ? "Signing In..." : "Sign In"}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            position: "relative",
            margin: `${theme.spacing.lg}px 0`,
            width: "100%",
            textAlign: "center",
          }}
        >
          <div
            style={{
              borderTop: `1px solid ${theme.colors.borderLight}`,
              position: "absolute",
              top: "50%",
              width: "100%",
              zIndex: 0,
            }}
          ></div>
          <span
            style={{
              position: "relative",
              zIndex: 1,
              backgroundColor: theme.colors.backgroundLight,
              padding: "0 8px",
              color: theme.colors.textMutedLight,
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            Or continue with
          </span>
        </div>

        {/* Google Button */}
        <GoogleSignInButton />

        {/* Error Message */}
        {error && (
          <p
            style={{
              color: theme.colors.error,
              marginTop: theme.spacing.sm,
              textAlign: "center",
              fontSize: theme.typography.fontSize.sm,
            }}
          >
            {error}
          </p>
        )}

        {/* Footer */}
        <p
          style={{
            textAlign: "center",
            marginTop: theme.spacing.lg,
            color: theme.colors.textMutedLight,
            fontSize: theme.typography.fontSize.sm,
          }}
        >
          Don’t have an account?{" "}
          <span
            style={{
              color: theme.colors.primary,
              cursor: "pointer",
              fontWeight: theme.typography.fontWeight.medium,
            }}
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
