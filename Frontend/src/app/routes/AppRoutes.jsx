import {
  Route,
  Routes,
  Outlet,
  useNavigate,
} from "react-router-dom";

import { useState } from "react";

import StudentDbLanding from "../../features/master-data/pages/StudentDBLanding.jsx";
import Login from "../../Auth/components/Login.jsx";
import Register from "../../Auth/components/Register.jsx";
import VerifyEmail from "../../Auth/components/VerifyEmail.jsx";
import ProtectedRoute from "../../Auth/components/ProtectedRoute.jsx";

import DashBoard from "../../features/master-data/pages/Dashboard.jsx";
import AccessManagementPage from "../../features/master-data/pages/AccessManagementPage.jsx";
import StudentCreatePage from "../../features/students/pages/StudentCreatePage.jsx";
import StudentListPage from "../../features/students/pages/StudentListPage.jsx";
import LabSessionsPage from "../../features/lab-sessions/pages/LabSessionsPage.jsx";

import NotFoundPage from "../../shared/components/NotFoundPage.jsx";
import Navbar from "../../shared/components/Navbar.jsx";
import Sidebar from "../../shared/components/Sidebar.jsx";

import TenantsPage from "../../features/tenants/pages/TenantsPage.jsx";
import AccountPage from "../../Auth/pages/AccountPage.jsx";

import { ErrorProvider } from "../../shared/context/ErrorContext.jsx";
import Notification from "../../shared/components/Notification.jsx";
import { TenantProvider } from "../../features/tenants/context/TenantContext.jsx";


function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] =
    useState(false);

  return (
    <div className="app">
      <Navbar />

      <div className="app__body">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() =>
            setIsSidebarOpen((previous) => !previous)
          }
        />

        <main className="app__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}


function TenantsRoute() {
  const navigate = useNavigate();

  const handleSelectTenant = (tenant) => {
    navigate("/dashboard");
  };

  return (
    <TenantsPage
      onSelectTenant={handleSelectTenant}
    />
  );
}


function ProtectedApp() {
  return (
    <ErrorProvider>
      <TenantProvider>
        <Notification />

        <Outlet />
      </TenantProvider>
    </ErrorProvider>
  );
}


function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}

      <Route
        path="/"
        element={<StudentDbLanding />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/verify-email"
        element={<VerifyEmail />}
      />


      {/* Protected routes */}

      <Route element={<ProtectedRoute />}>
        <Route element={<ProtectedApp />}>
          <Route element={<AppLayout />}>
            <Route
              path="/account"
              element={<AccountPage />}
            />

            <Route
              path="/tenants"
              element={<TenantsRoute />}
            />

            <Route
              path="/access-management"
              element={<AccessManagementPage />}
            />

            <Route
              path="/dashboard"
              element={<DashBoard />}
            />

            <Route
              path="/students/create"
              element={<StudentCreatePage />}
            />

            <Route
              path="/students/list"
              element={<StudentListPage />}
            />

            <Route
              path="/lab-sessions"
              element={<LabSessionsPage />}
            />
          </Route>
        </Route>
      </Route>



      <Route
        path="*"
        element={<NotFoundPage />}
      />
    </Routes>
  );
}


export default AppRoutes;