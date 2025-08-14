// src/pages/core/ProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ children, requiredRoles }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  // دعم الأدوار (اختياري)
  if (requiredRoles?.length) {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || localStorage.getItem('role');
    if (role && !requiredRoles.includes(role)) {
      return <Navigate to="/login" replace />; // أو صفحة 403 لو عندك
    }
  }

  // يدعم الاستخدامين:
  // <Route element={<ProtectedRoute/>}><Route .../></Route>
  // <ProtectedRoute requiredRoles={...}><Component/></ProtectedRoute>
  return children ?? <Outlet />;
}
