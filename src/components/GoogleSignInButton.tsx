import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { useAppDispatch, useAppSelector } from "../store";
import { loginWithGoogleIdToken } from "../store/slices/authSlice";
import { theme } from "../styles/theme";
import { useNavigate } from "react-router-dom";

export default function GoogleSignInButton() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status } = useAppSelector((s) => s.auth);

  const handleGoogleSignIn = async () => {
    try {
      // 1️⃣ Sign in with Firebase client
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();

      // 2️⃣ Dispatch thunk → backend /auth/google
      const action = await dispatch(loginWithGoogleIdToken(idToken));

      // 3️⃣ Handle success or failure
      if (loginWithGoogleIdToken.fulfilled.match(action)) {
        console.log("✅ Google Sign-In success:", action.payload);
        
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
        alert(action.payload || "Google login failed");
      }
    } catch (error: any) {
      console.error("❌ Google Sign-In failed:", error);
      alert("Google Sign-In failed. Please try again.");
    }
  };

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={status === "loading"}
      style={{
        width: "100%",
        padding: `${theme.spacing.md}px`,
        borderRadius: theme.radii.lg,
        border: `1px solid ${theme.colors.borderLight}`,
        backgroundColor: `${theme.colors.backgroundLight}cc`,
        backdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: theme.typography.fontFamily.display,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.textDark,
        fontWeight: theme.typography.fontWeight.medium,
        cursor: "pointer",
        transition: "all 0.25s ease-in-out",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.backgroundColor = theme.colors.primaryLight + "22")
      }
      onMouseLeave={(e) =>
        (e.currentTarget.style.backgroundColor = theme.colors.backgroundLight + "cc")
      }
    >
      <svg
        aria-hidden="true"
        style={{ width: 18, height: 18, marginRight: 8 }}
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.01 12.015c0-5.45-4.418-9.868-9.868-9.868S2.274 6.565 2.274 12.015c0 4.93 3.593 9.023 8.287 9.775.25.045.341-.11.341-.243v-2.31c-3.49.758-4.228-1.68-4.228-1.68-.227-.578-.554-1.233-.554-1.233-1.002-.684.075-.67.075-.67 1.106.078 1.688 1.135 1.688 1.135.983 1.685 2.58 1.198 3.208.916.1-.712.385-1.198.704-1.472-2.445-.278-5.016-1.222-5.016-5.438 0-1.202.43-2.185 1.135-2.955-.113-.278-.492-1.398.108-2.912 0 0 .925-.296 3.03 1.13.878-.243 1.82-.365 2.75-.369.93.004 1.872.126 2.75.369 2.105-1.426 3.028-1.13 3.028-1.13.6 1.514.22 2.634.108 2.912.705.77 1.135 1.753 1.135 2.955 0 4.228-2.573 5.158-5.028 5.428.398.342.75 1.018.75 2.052v3.02c0 .135.09.29.343.243C18.42 21.038 22.01 16.945 22.01 12.015z"
        />
      </svg>
      {status === "loading" ? "Signing in..." : "Sign in with Google"}
    </button>
  );
}
