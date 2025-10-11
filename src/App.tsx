import { Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "../src/screens/LoginScreen";
import DashboardScreen from "../src/screens/DashboardScreen";
import ProtectedRoute from "../src/navigation/ProtectedRoute";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginScreen />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardScreen />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
