import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/auth/AuthContext";
import { can } from "@/auth/can";

interface PermissionProtectedRouteProps {
  permission: string;
  children: React.ReactNode;
}

const PermissionProtectedRoute: React.FC<PermissionProtectedRouteProps> = ({
  permission,
  children,
}) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!can(user, permission)) {
    // You could redirect to a 403 page or dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PermissionProtectedRoute;
