import { Routes, Route, Navigate } from "react-router-dom";
import LoginScreen from "./screens/LoginScreen";
import DashboardScreen from "./screens/Dashboard/DashboardScreen";
import ProductsScreen from "./screens/Dashboard/ProductsScreen";
import SettingsScreen from "./screens/Dashboard/SettingsScreen";
import FutureScreen from "./screens/Dashboard/FutureScreen";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginScreen />} />

      {/* Nested dashboard */}
      <Route path="/dashboard" element={<DashboardScreen />}>
        <Route index element={<ProductsScreen />} />
        <Route path="products" element={<ProductsScreen />} />
        <Route path="settings" element={<SettingsScreen />} />
        <Route path="future" element={<FutureScreen />} />
      </Route>
    </Routes>
  );
}