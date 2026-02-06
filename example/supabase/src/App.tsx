import { Routes, Route, HashRouter, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/Dashboard";
import UserManagement from "./pages/Admin/UserManagement";
import ChangePassword from "./pages/Auth/ChangePassword";
import "./App.css";

const App = (): JSX.Element => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* 公开路由 */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* 受保护路由 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/admin" element={<UserManagement />} />
            <Route path="/change-password" element={<ChangePassword />} />
          </Route>

          {/* 兜底路由 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
};

export default App;
