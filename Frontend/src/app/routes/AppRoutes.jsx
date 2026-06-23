import { Navigate, Route, Routes, Outlet } from "react-router-dom";
import { useState } from "react";
import AcademicHierarchyPage from "../../features/master-data/pages/AcademicHierarchyPage.jsx";
import StudentCreatePage from "../../features/students/pages/StudentCreatePage.jsx";
import StudentListPage from "../../features/students/pages/StudentListPage.jsx";
import LabSessionsPage from "../../features/lab-sessions/pages/LabSessionsPage.jsx";
import NotFoundPage from "../../shared/components/NotFoundPage.jsx";
import Navbar from "../../shared/components/Navbar.jsx";
import Sidebar from "../../shared/components/Sidebar.jsx";

function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app">
      <Navbar />

      <div className="app__body">
        <Sidebar
          isOpen={isSidebarOpen}
          toggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />

        <main className="app__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<AcademicHierarchyPage />} />
        <Route path="/students/list" element={<StudentListPage />} />
        <Route path="/lab-sessions" element={<LabSessionsPage />} />
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;