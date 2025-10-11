import { Navigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../store";

export default function ProtectedRoute() {
  const user = useAppSelector((s) => s.auth.user);
  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
