import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminLayout = ({ children, allowedRoles = [] }) => {
  const location = useLocation();
  const { isAuthenticated, adminInfo } = useSelector((state) => state.admin);

  // chưa login
  if (!isAuthenticated || !adminInfo) {
    return (
      <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
    );
  }

  // check role
  if (allowedRoles.length > 0 && !allowedRoles.includes(adminInfo.role)) {
    return <Navigate to="/" replace />; // hoặc trang 403
  }

  return <>{children}</>;
};

export default AdminLayout;
