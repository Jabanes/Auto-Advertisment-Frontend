import { Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/Dashboard/DashboardScreen";
import ProductsScreen from "./screens/Dashboard/ProductsScreen";
import SettingsScreen from "./screens/Dashboard/SettingsScreen";
import FutureScreen from "./screens/Dashboard/FutureScreen";
import BusinessProfileScreen from "./components/businessProfile"
import ProtectedRoute from "./navigation/ProtectedRoute";
import { useSocket } from "./hooks/useSocket";

export default function App() {
  useSocket();

  return (
    <Routes>
      <Route path="/login" element={<LoginScreen />} />
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/business-profile" element={<BusinessProfileScreen />} />
        <Route path="/dashboard" element={<DashboardScreen />}>
          <Route index element={<ProductsScreen />} />
          <Route path="products" element={<ProductsScreen />} />
          <Route path="settings" element={<SettingsScreen />} />
          <Route path="future" element={<FutureScreen />} />
        </Route>
      </Route>
    </Routes>
  );
}