import React from "react";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "./admin/AdminDashboard";
import OwnerDashboard from "./owner/OwnerDashboard";
import ManagerDashboard from "./manager/ManagerDashboard";
import StudentDashboard from "./student/StudentDashboard";

interface DashboardRouterProps {
  role: "Admin" | "Owner" | "Manager" | "Student";
}

const DashboardRouter: React.FC<DashboardRouterProps> = ({ role }) => {
  const { user } = useAuth();

  // Route to the appropriate dashboard based on the role prop
  // Note: we use the role passed from the navigator to determine which view to show
  switch (role) {
    case "Admin":
      return <AdminDashboard />;
    case "Owner":
      return <OwnerDashboard />;
    case "Manager":
      return <ManagerDashboard />;
    case "Student":
      return <StudentDashboard />;
    default:
      return <StudentDashboard />;
  }
};

export default DashboardRouter;
