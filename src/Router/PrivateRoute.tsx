import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../features/store";
import { Navigate, Outlet } from "react-router-dom";

const PrivateRoute: React.FC = () => {
  const { status } = useSelector((state: RootState) => state.account);

  return status ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
