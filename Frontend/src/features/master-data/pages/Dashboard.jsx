import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import HierarchyBreadcrumbs from "../components/HierarchyBreadcrumbs.jsx";
import HierarchySummaryCard from "../components/HierarchySummaryCard.jsx";
import EntityGrid from "../components/EntityGrid.jsx";
import EntityFormModal from "../components/EntityFormModal.jsx";
import DeleteConfirmModal from "../../../shared/components/DeleteConfirmModel.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingGrid from "../components/LoadingGrid.jsx";
import Loader from "../../../shared/components/Loader.jsx";
import StudentList from "../components/StudentList.jsx";
import StudentForm from "../../students/components/StudentForm.jsx";
import useAcademicHierarchy from "../hooks/useAcademicHierarchy.js";
import { useTenant } from "../../tenants/context/TenantContext.jsx";


function DashBoard() {
  const navigate = useNavigate();
  const { currentTenant, loading: tenantLoading } = useTenant();
  const {
    view,
    departments,
    batches,
    sections,
    students,
    selectedDepartment,
    selectedBatch,
    selectedSection,
    loading,
    modal,
    formState,
    showStudentForm,
    openStudentForm,
    closeStudentForm,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
    setFormValue,
    submitForm,
    confirmDelete,
    goToOverview,
    goToDepartments,
    handleDepartmentClick,
    handleBatchClick,
    handleSectionClick,
    refreshStudents,
  } = useAcademicHierarchy();

  const breadcrumbs = useMemo(() => {
    const items = [
      { label: "Overview", onClick: goToOverview },
      { label: "Departments", onClick: goToDepartments },
    ];

    if (selectedDepartment) {
      items.push({
        label: selectedDepartment.name,
        onClick: () => handleDepartmentClick(selectedDepartment),
      });
    }

    if (selectedBatch) {
      items.push({
        label: selectedBatch.name,
        onClick: () => handleBatchClick(selectedBatch),
      });
    }

    if (selectedSection) {
      items.push({
        label: selectedSection.name,
        onClick: null,
      });
    }

    return items;
  }, [
    selectedDepartment,
    selectedBatch,
    selectedSection,
    goToOverview,
    goToDepartments,
    handleDepartmentClick,
    handleBatchClick,
  ]);

  const getGridData = () => {
    if (view === "departments") {
      return {
        entity: "department",
        items: departments,
        onCardClick: handleDepartmentClick,
      };
    }

    if (view === "batches") {
      return {
        entity: "batch",
        items: batches,
        onCardClick: handleBatchClick,
      };
    }

    if (view === "sections") {
      return {
        entity: "section",
        items: sections,
        onCardClick: handleSectionClick,
      };
    }

    return {
      entity: "student",
      items: [],
      onCardClick: null,
    };
  };

  const gridData = getGridData();

  // if (!currentTenant) {
  //   return (
  //     <div className="page">
  //       <p>Please select a tenant first.</p>
  //     </div>
  //   );
  // }

  return (
    <div className="page academic-hierarchy-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Academic Dashboard</h1>
            <p className="page-subtitle">
              View and manage the academic hierarchy of your institution, including departments, batches, sections, and students.
            </p>
          </div>
          {view !== "home" && <HierarchyBreadcrumbs items={breadcrumbs} />}
        </div>

        {view === "home" && (
          loading.home ? (
            <div>
              <Loader />
            </div>
          ) : (
            <div className="home-grid">
                <div className="home-cards">
                  <div className="home-card">
                    <HierarchySummaryCard
                      title="Total Departments"
                      count={departments.length}
                      description="View and manage all departments"
                      onClick={goToDepartments}
                    />
                  </div>

                  <div className="home-card-grid">
                    <button className="card home-action" onClick={() => navigate('/tenants')}>
                      <div>
                        <h3 style={{ margin: 0 }}>Organizations</h3>
                        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Create and manage organizations</p>
                      </div>
                    </button>

                    <button className="card home-action" onClick={() => navigate('/access-management')}>
                      <div>
                        <h3 style={{ margin: 0 }}>Manage Roles</h3>
                        <p style={{ margin: '6px 0 0', color: '#6b7280' }}>Manage users and access for organizations</p>
                      </div>
                    </button>
                  </div>
                </div>
            </div>
          )
        )}

        {view !== "home" && view !== "students" && (
          <>
            {loading[view] ? (
              <LoadingGrid />
            ) : gridData.items.length === 0 ? (
              <EmptyState
                title={
                  view === "departments"
                    ? "No departments yet"
                    : view === "batches"
                    ? `No batches in ${selectedDepartment?.name} yet`
                    : `No sections in ${selectedBatch?.name} yet`
                }
                actionLabel={
                  view === "departments"
                    ? "Create Department"
                    : view === "batches"
                    ? "Create Batch"
                    : "Create Section"
                }
                onAction={() => openCreateModal(gridData.entity)}
              />
            ) : (
              <EntityGrid
                entity={gridData.entity}
                items={gridData.items}
                onCreate={() => openCreateModal(gridData.entity)}
                onCardClick={gridData.onCardClick}
                onEdit={openEditModal}
                onDelete={openDeleteModal}
              />
            )}
            {/* ManageRolesGrid intentionally not inside academic grid anymore (see Access Management section below) */}
          </>
        )}

        {view === "students" && (
          <>
            <StudentList
              students={students}
              selectedDepartment={selectedDepartment}
              selectedBatch={selectedBatch}
              selectedSection={selectedSection}
              loading={loading}
              goToOverview={goToOverview}
              goToDepartments={goToDepartments}
              onCreateStudent={openStudentForm}
            />

            {showStudentForm && (
              <div className="modal-overlay" onClick={closeStudentForm}>
                <div
                  className="modal-card"
                  onClick={(e) => e.stopPropagation()}
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="create-student-title"
                >
                  <div className="modal-header">
                    <h2 id="create-student-title">Create Student</h2>
                  </div>

                  <StudentForm 
                    onClose={closeStudentForm} 
                    onCreated={refreshStudents}
                    selectedDepartment={selectedDepartment}
                    selectedBatch={selectedBatch}
                    selectedSection={selectedSection}
                  />
                </div>
              </div>
            )}
          </>
        )}

        <EntityFormModal
          open={modal.open && (modal.mode === "create" || modal.mode === "edit")}
          mode={modal.mode}
          entity={modal.entity}
          value={
            modal.entity === "department"
              ? formState.departmentName
              : modal.entity === "batch"
              ? formState.batchName
              : formState.sectionName
          }
          contextLabel={
            modal.entity === "batch"
              ? `Creating inside ${selectedDepartment?.name}`
              : modal.entity === "section"
              ? `Creating inside ${selectedDepartment?.name} / ${selectedBatch?.name}`
              : ""
          }
          onChange={(value) => setFormValue(modal.entity, value)}
          onClose={closeModal}
          onSubmit={submitForm}
          loading={loading.submit}
        />

        <DeleteConfirmModal
          open={modal.open && modal.mode === "delete"}
          entity={modal.entity}
          item={modal.item}
          loading={loading.submit}
          onClose={closeModal}
          onConfirm={confirmDelete}
        />

        

        
      </div>
    </div>
  );
}

export default DashBoard;