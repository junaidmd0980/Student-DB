import { useCallback, useEffect, useState } from "react";
import {
  createDepartment,
  deleteDepartment,
  getDepartments,
  updateDepartment,
} from "../services/departmentService";
import {
  createBatch,
  deleteBatch,
  getBatches,
  updateBatch,
} from "../services/batchService";
import {
  createSection,
  deleteSection,
  getSections,
  updateSection,
} from "../services/sectionService";
import { useError } from "../../../shared/context/ErrorContext.jsx";

const initialModalState = {
  open: false,
  mode: null,
  entity: null,
  item: null,
};

const initialFormState = {
  departmentName: "",
  batchName: "",
  sectionName: "",
};

function useAcademicHierarchy() {
  const { showError, clearError } = useError();

  const [view, setView] = useState("home");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState({
    home: false,
    departments: false,
    batches: false,
    sections: false,
    submit: false,
  });

  const [modal, setModal] = useState(initialModalState);
  const [formState, setFormState] = useState(initialFormState);

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const getId = (item) => item?._id || item?.id || null;

  const loadDepartments = useCallback(async () => {
    try {
      setLoading((prev) => ({
        ...prev,
        home: true,
        departments: true,
      }));

      const data = await getDepartments();
      setDepartments(normalizeList(data));
    } catch (error) {
      setDepartments([]);
      showError(error.message || "Failed to load departments");
    } finally {
      setLoading((prev) => ({
        ...prev,
        home: false,
        departments: false,
      }));
    }
  }, [showError]);

  const loadBatches = useCallback(
    async (departmentId) => {
      if (!departmentId) {
        setBatches([]);
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, batches: true }));

        const data = await getBatches({ department: departmentId });
        setBatches(normalizeList(data));
      } catch (error) {
        setBatches([]);
        showError(error.message || "Failed to load batches");
      } finally {
        setLoading((prev) => ({ ...prev, batches: false }));
      }
    },
    [showError]
  );

  const loadSections = useCallback(
    async (departmentId, batchId) => {
      if (!departmentId || !batchId) {
        setSections([]);
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, sections: true }));

        const data = await getSections({
          department: departmentId,
          batch: batchId,
        });

        setSections(normalizeList(data));
      } catch (error) {
        setSections([]);
        showError(error.message || "Failed to load sections");
      } finally {
        setLoading((prev) => ({ ...prev, sections: false }));
      }
    },
    [showError]
  );

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const closeModal = () => {
    setModal(initialModalState);
    setFormState(initialFormState);
  };

  const goToOverview = () => {
    setView("home");
    setSelectedDepartment(null);
    setSelectedBatch(null);
    setBatches([]);
    setSections([]);
    closeModal();
    clearError();
  };

  const goToDepartments = useCallback(() => {
    setView("departments");
    setSelectedDepartment(null);
    setSelectedBatch(null);
    setBatches([]);
    setSections([]);
    clearError();
  }, [clearError]);

  const handleDepartmentClick = useCallback(
    async (department) => {
      setSelectedDepartment(department);
      setSelectedBatch(null);
      setSections([]);
      setView("batches");
      await loadBatches(getId(department));
    },
    [loadBatches]
  );

  const handleBatchClick = useCallback(
    async (batch) => {
      const departmentId = getId(selectedDepartment);

      setSelectedBatch(batch);
      setView("sections");
      await loadSections(departmentId, getId(batch));
    },
    [loadSections, selectedDepartment]
  );

  const openCreateModal = (entity) => {
    clearError();
    setFormState(initialFormState);
    setModal({
      open: true,
      mode: "create",
      entity,
      item: null,
    });
  };

  const openEditModal = (entity, item) => {
    clearError();
    setFormState({
      departmentName: entity === "department" ? item?.name || "" : "",
      batchName: entity === "batch" ? item?.name || "" : "",
      sectionName: entity === "section" ? item?.name || "" : "",
    });

    setModal({
      open: true,
      mode: "edit",
      entity,
      item,
    });
  };

  const openDeleteModal = (entity, item) => {
    clearError();
    setModal({
      open: true,
      mode: "delete",
      entity,
      item,
    });
  };

  const setFormValue = (entity, value) => {
    if (entity === "department") {
      setFormState((prev) => ({ ...prev, departmentName: value }));
    }

    if (entity === "batch") {
      setFormState((prev) => ({ ...prev, batchName: value }));
    }

    if (entity === "section") {
      setFormState((prev) => ({ ...prev, sectionName: value }));
    }
  };

  const getCurrentFormValue = () => {
    if (modal.entity === "department") return formState.departmentName;
    if (modal.entity === "batch") return formState.batchName;
    if (modal.entity === "section") return formState.sectionName;
    return "";
  };

  const submitForm = async () => {
    const currentValue = getCurrentFormValue().trim();
    const departmentId = getId(selectedDepartment);
    const batchId = getId(selectedBatch);
    const itemId = getId(modal.item);

    if (!currentValue) {
      showError("Name is required");
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, submit: true }));
      clearError();

      if (modal.mode === "create") {
        if (modal.entity === "department") {
          await createDepartment({ name: currentValue });
          await loadDepartments();
        }

        if (modal.entity === "batch") {
          await createBatch({
            name: currentValue,
            department: departmentId,
          });
          await loadBatches(departmentId);
        }

        if (modal.entity === "section") {
          await createSection({
            name: currentValue,
            department: departmentId,
            batch: batchId,
          });
          await loadSections(departmentId, batchId);
        }
      }

      if (modal.mode === "edit") {
        if (modal.entity === "department") {
          await updateDepartment(itemId, { name: currentValue });
          await loadDepartments();

          setSelectedDepartment((prev) =>
            prev && getId(prev) === itemId
              ? { ...prev, name: currentValue }
              : prev
          );
        }

        if (modal.entity === "batch") {
          await updateBatch(itemId, {
            name: currentValue,
            department: departmentId,
          });
          await loadBatches(departmentId);

          setSelectedBatch((prev) =>
            prev && getId(prev) === itemId
              ? { ...prev, name: currentValue }
              : prev
          );
        }

        if (modal.entity === "section") {
          await updateSection(itemId, {
            name: currentValue,
            department: departmentId,
            batch: batchId,
          });
          await loadSections(departmentId, batchId);
        }
      }

      closeModal();
    } catch (error) {
      showError(error.message || "Failed to save changes");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const confirmDelete = async () => {
    const departmentId = getId(selectedDepartment);
    const batchId = getId(selectedBatch);
    const itemId = getId(modal.item);

    try {
      setLoading((prev) => ({ ...prev, submit: true }));
      clearError();

      if (modal.entity === "department") {
        await deleteDepartment(itemId);
        await loadDepartments();

        if (departmentId === itemId) {
          setSelectedDepartment(null);
          setSelectedBatch(null);
          setBatches([]);
          setSections([]);
          setView("departments");
        }
      }

      if (modal.entity === "batch") {
        await deleteBatch(itemId);
        await loadBatches(departmentId);

        if (batchId === itemId) {
          setSelectedBatch(null);
          setSections([]);
          setView("batches");
        }
      }

      if (modal.entity === "section") {
        await deleteSection(itemId);
        await loadSections(departmentId, batchId);
      }

      closeModal();
    } catch (error) {
      showError(error.message || "Failed to delete item");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  return {
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
    goToOverview,
    goToDepartments,
    handleDepartmentClick,
    handleBatchClick,
  };
}

export default useAcademicHierarchy;