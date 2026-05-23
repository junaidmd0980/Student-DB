import { useMemo } from "react";
import HierarchyBreadcrumbs from "../components/HierarchyBreadcrumbs.jsx";
import HierarchySummaryCard from "../components/HierarchySummaryCard.jsx";
import EntityGrid from "../components/EntityGrid.jsx";
import EntityFormModal from "../components/EntityFormModal.jsx";
import DeleteConfirmModal from "../components/DeleteConfirmModal.jsx";
import EmptyState from "../components/EmptyState.jsx";
import LoadingGrid from "../components/LoadingGrid.jsx";
import useAcademicHierarchy from "../hooks/useAcademicHierarchy.js";

function AcademicHierarchyPage() {
  const {
    view,
    departments,
    batches,
    sections,
    selectedDepartment,
    selectedBatch,
    loading,
    modal,
    formState,
    openCreateModal,
    openEditModal,
    openDeleteModal,
    closeModal,
    setFormValue,
    submitForm,
    confirmDelete,
    goToDepartments,
    handleDepartmentClick,
    handleBatchClick,
  } = useAcademicHierarchy();

  const breadcrumbs = useMemo(() => {
    const items = [
      {
        label: "Departments",
        onClick: goToDepartments,
      },
    ];

    if (selectedDepartment) {
      items.push({
        label: selectedDepartment.name,
        onClick: () => handleDepartmentClick(selectedDepartment, { preserveView: true }),
      });
    }

    if (selectedBatch) {
      items.push({
        label: selectedBatch.name,
        onClick: null,
      });
    }

    return items;
  }, [selectedDepartment, selectedBatch, goToDepartments, handleDepartmentClick]);

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

    return {
      entity: "section",
      items: sections,
      onCardClick: null,
    };
  };

  const gridData = getGridData();

  return (
    <div className="page academic-hierarchy-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Academic Setup</h1>
            <p className="page-subtitle">
              Manage departments, batches, and sections through contextual drill-down cards.
            </p>
          </div>

          {view !== "home" && <HierarchyBreadcrumbs items={breadcrumbs} />}
        </div>

        {view === "home" && (
          <HierarchySummaryCard
            title="Total Departments"
            count={departments.length}
            description="View and manage all departments"
            onClick={goToDepartments}
          />
        )}

        {view !== "home" && (
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

export default AcademicHierarchyPage;