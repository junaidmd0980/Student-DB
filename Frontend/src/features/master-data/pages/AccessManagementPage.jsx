import React, { useMemo } from "react";
import ManageRolesGrid from "../components/ManageRolesGrid.jsx";
import HierarchyBreadcrumbs from "../components/HierarchyBreadcrumbs.jsx";
import { useNavigate } from "react-router-dom";

export default function AccessManagementPage() {
  const navigate = useNavigate();

  const breadcrumbs = useMemo(() => {
    return [
      { label: "Overview", onClick: () => navigate('/dashboard') },
      { label: "Access Management", onClick: null },
    ];
  }, [navigate]);

  return (
    <div className="page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Access Management</h1>
            <p className="page-subtitle">Manage users and roles for the selected institution.</p>
          </div>
          <HierarchyBreadcrumbs items={breadcrumbs} />
        </div>

        <div style={{ marginTop: '1rem' }}>
          <ManageRolesGrid />
        </div>
      </div>
    </div>
  );
}
