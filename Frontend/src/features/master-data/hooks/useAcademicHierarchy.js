import { useCallback, useEffect, useState } from "react";
import { useTenant } from "../../tenants/context/TenantContext.jsx";
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
import { getStudents } from "../services/studentService";
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
  const { currentTenant } = useTenant();
  const tenantId = currentTenant?._id?.toString() || currentTenant?.id || null;

  const [view, setView] = useState("home");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);

  const [loading, setLoading] = useState({
    home: false,
    departments: false,
    batches: false,
    sections: false,
    students: false,
    submit: false,
  });

  const [modal, setModal] = useState(initialModalState);
  const [formState, setFormState] = useState(initialFormState);
  const [showStudentForm, setShowStudentForm] = useState(false);

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  const getId = (item) => item?._id || item?.id || null;

  const loadDepartments = useCallback(async (tenantId) => {
    if (!tenantId) {
      setDepartments([]);
      return;
    }

    try {
      setLoading((prev) => ({
        ...prev,
        home: true,
        departments: true,
      }));

      const data = await getDepartments(tenantId);
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
    async (tenantId, departmentId) => {
      if (!tenantId || !departmentId) {
        setBatches([]);
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, batches: true }));
        const data = await getBatches(tenantId, { department: departmentId });
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
    async (tenantId, departmentId, batchId) => {
      if (!tenantId || !departmentId || !batchId) {
        setSections([]);
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, sections: true }));
        const data = await getSections(tenantId, {
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

  const loadStudents = useCallback(
    async (tenantId, departmentId, batchId, sectionId) => {
      if (!tenantId || !departmentId || !batchId) {
        setStudents([]);
        return;
      }

      try {
        setLoading((prev) => ({ ...prev, students: true }));
        const data = await getStudents(tenantId, {
          department: departmentId,
          batch: batchId,
          section: sectionId || undefined,
        });
        setStudents(normalizeList(data));
      } catch (error) {
        setStudents([]);
        showError(error.message || "Failed to load students");
      } finally {
        setLoading((prev) => ({ ...prev, students: false }));
      }
    },
    [showError]
  );

  useEffect(() => {
    if (!tenantId) {
      setDepartments([]);
      return;
    }

    loadDepartments(tenantId);
  }, [tenantId, loadDepartments]);

  const closeModal = useCallback(() => {
    setModal(initialModalState);
    setFormState(initialFormState);
  }, []);

  const goToOverview = () => {
    setView("home");
    setSelectedDepartment(null);
    setSelectedBatch(null);
    setSelectedSection(null);
    setBatches([]);
    setSections([]);
    setStudents([]);
    setShowStudentForm(false);
    closeModal();
    clearError();
  };

  const goToDepartments = useCallback(() => {
    setView("departments");
    setSelectedDepartment(null);
    setSelectedBatch(null);
    setSelectedSection(null);
    setBatches([]);
    setSections([]);
    setStudents([]);
    setShowStudentForm(false);
    clearError();
  }, [clearError]);

  const handleDepartmentClick = useCallback(
    async (department) => {
      setSelectedDepartment(department);
      setSelectedBatch(null);
      setSelectedSection(null);
      setSections([]);
      setStudents([]);
      setShowStudentForm(false);
      setView("batches");
      await loadBatches(tenantId, getId(department));
    },
    [loadBatches]
  );

  const handleBatchClick = useCallback(
    async (batch) => {
      const departmentId = getId(selectedDepartment);

      setSelectedBatch(batch);
      setSelectedSection(null);
      setStudents([]);
      setShowStudentForm(false);
      setView("sections");
      await loadSections(tenantId, departmentId, getId(batch));
    },
    [loadSections, selectedDepartment]
  );

  const handleSectionClick = useCallback(
    async (section) => {
      const departmentId = getId(selectedDepartment);
      const batchId = getId(selectedBatch);

      setSelectedSection(section);
      setShowStudentForm(false);
      setView("students");
      await loadStudents(tenantId, departmentId, batchId, getId(section));
    },
    [loadStudents, selectedDepartment, selectedBatch]
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
    if (entity === "department") setFormState((prev) => ({ ...prev, departmentName: value }));
    if (entity === "batch") setFormState((prev) => ({ ...prev, batchName: value }));
    if (entity === "section") setFormState((prev) => ({ ...prev, sectionName: value }));
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
          await createDepartment({ name: currentValue }, tenantId);
          await loadDepartments(tenantId);
        }

        if (modal.entity === "batch") {
          await createBatch(
            {
              name: currentValue,
              department: departmentId,
            },
            tenantId
          );
          await loadBatches(tenantId, departmentId);
        }

        if (modal.entity === "section") {
          await createSection(
            {
              name: currentValue,
              department: departmentId,
              batch: batchId,
            },
            tenantId
          );
          await loadSections(tenantId, departmentId, batchId);
        }
      }

      if (modal.mode === "edit") {
        if (modal.entity === "department") {
          await updateDepartment(itemId, { name: currentValue }, tenantId);
          await loadDepartments(tenantId);
          setSelectedDepartment((prev) =>
            prev && getId(prev) === itemId ? { ...prev, name: currentValue } : prev
          );
        }

        if (modal.entity === "batch") {
          await updateBatch(
            itemId,
            {
              name: currentValue,
              department: departmentId,
            },
            tenantId
          );
          await loadBatches(tenantId, departmentId);
          setSelectedBatch((prev) =>
            prev && getId(prev) === itemId ? { ...prev, name: currentValue } : prev
          );
        }

        if (modal.entity === "section") {
          await updateSection(
            itemId,
            {
              name: currentValue,
              department: departmentId,
              batch: batchId,
            },
            tenantId
          );
          await loadSections(tenantId, departmentId, batchId);
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
        await deleteDepartment(itemId, tenantId);
        await loadDepartments(tenantId);

        if (departmentId === itemId) {
          setSelectedDepartment(null);
          setSelectedBatch(null);
          setSelectedSection(null);
          setBatches([]);
          setSections([]);
          setStudents([]);
          setView("departments");
        }
      }

      if (modal.entity === "batch") {
        await deleteBatch(itemId, tenantId);
        await loadBatches(tenantId, departmentId);

        if (batchId === itemId) {
          setSelectedBatch(null);
          setSelectedSection(null);
          setSections([]);
          setStudents([]);
          setView("batches");
        }
      }

      if (modal.entity === "section") {
        await deleteSection(itemId, tenantId);
        await loadSections(tenantId, departmentId, batchId);

        if (getId(selectedSection) === itemId) {
          setSelectedSection(null);
          setStudents([]);
          setView("sections");
        }
      }

      closeModal();
    } catch (error) {
      showError(error.message || "Failed to delete item");
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const refreshStudents = useCallback(async () => {
    const departmentId = getId(selectedDepartment);
    const batchId = getId(selectedBatch);
    const sectionId = getId(selectedSection);

    if (!tenantId || !departmentId || !batchId) {
      setStudents([]);
      return;
    }

    try {
      setLoading((prev) => ({ ...prev, students: true }));
      const data = await getStudents(
        {
          department: departmentId,
          batch: batchId,
          section: sectionId || undefined,
        },
        tenantId
      );
      setStudents(normalizeList(data));
    } catch (error) {
      setStudents([]);
      showError(error.message || "Failed to load students");
    } finally {
      setLoading((prev) => ({ ...prev, students: false }));
    }
  }, [selectedDepartment, selectedBatch, selectedSection, showError]);

  const openStudentForm = () => setShowStudentForm(true);
  const closeStudentForm = () => setShowStudentForm(false);

  return {
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
  };
}

export default useAcademicHierarchy;