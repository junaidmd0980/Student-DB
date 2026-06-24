import { useEffect, useState } from "react";
import { getDepartments } from "../../master-data/services/departmentService.js";
import { getBatches } from "../../master-data/services/batchService.js";
import { getSections } from "../../master-data/services/sectionService.js";
import { createStudent } from "../services/studentService.js";
import CustomSelect from "../../../shared/components/CustomSelect.jsx";
import { useError } from "../../../shared/context/ErrorContext.jsx";

function StudentForm({ onClose, onCreated, selectedDepartment, selectedBatch, selectedSection }) {
  const { showError, clearError } = useError();

  const [formData, setFormData] = useState({
    rollNo: "",
    fullName: "",
    email: "",
    phone: "",
    department: selectedDepartment?._id || selectedDepartment?.id || "",
    batch: selectedBatch?._id || selectedBatch?.id || "",
    section: selectedSection?._id || selectedSection?.id || "",
  });

  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  const getErrorMessage = (error, fallback = "Something went wrong") => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback
    );
  };

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        showError(getErrorMessage(error, "Failed to load departments"));
      }
    };

    loadDepartments();
  }, [showError]);

  useEffect(() => {
    const loadBatches = async () => {
      if (!formData.department) {
        setBatches([]);
        setSections([]);
        return;
      }

      try {
        const data = await getBatches({ department: formData.department });
        setBatches(Array.isArray(data) ? data : data.data || []);
        setSections([]);
      } catch (error) {
        setBatches([]);
        setSections([]);
        showError(getErrorMessage(error, "Failed to load batches"));
      }
    };

    loadBatches();
  }, [formData.department, showError]);

  useEffect(() => {
    const loadSections = async () => {
      if (!formData.batch) {
        setSections([]);
        return;
      }

      try {
        const data = await getSections({
          department: formData.department,
          batch: formData.batch,
        });
        setSections(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        setSections([]);
        showError(getErrorMessage(error, "Failed to load sections"));
      }
    };

    loadSections();
  }, [formData.department, formData.batch, showError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.rollNo.trim() ||
      !formData.fullName.trim() ||
      !formData.department ||
      !formData.batch ||
      !formData.section
    ) {
      showError("Please fill all required fields");
      return;
    }

    try {
      setLoading(true);
      clearError();

      await createStudent({
        rollNo: formData.rollNo.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        department: formData.department,
        batch: formData.batch,
        section: formData.section,
      });

      if (onCreated) {
        await onCreated();
      }

      if (onClose) onClose();
    } catch (error) {
      showError(getErrorMessage(error, "Failed to create student"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-form">
      <div className="form-group">
        <label htmlFor="fullName">Full Name</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter full name"
        />
      </div>

      <div className="form-group">
        <label htmlFor="rollNo">Roll Number</label>
        <input
          id="rollNo"
          name="rollNo"
          type="text"
          value={formData.rollNo}
          onChange={handleChange}
          placeholder="Enter roll number"
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          name="phone"
          type="text"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter phone"
        />
      </div>

      {/* <div className="form-group">
        <label htmlFor="department">Department</label>
        <CustomSelect
          name="department"
          value={formData.department}
          onChange={handleChange}
          options={departments.map((department) => ({
            label: department.name,
            value: department._id || department.id,
          }))}
        />
      </div>

      <div className="form-group">
        <label htmlFor="batch">Batch</label>
        <CustomSelect
          name="batch"
          value={formData.batch}
          onChange={handleChange}
          options={batches.map((batch) => ({
            label: batch.name,
            value: batch._id || batch.id,
          }))}
          disabled={!formData.department}
        />
      </div>

      <div className="form-group">
        <label htmlFor="section">Section</label>
        <CustomSelect
          name="section"
          value={formData.section}
          onChange={handleChange}
          options={sections.map((section) => ({
            label: section.name,
            value: section._id || section.id,
          }))}
          disabled={!formData.batch}
        />
      </div> */}

      <div className="delete-actions">
        <button type="submit" className="table-action" disabled={loading}>
          {loading ? "Saving..." : "Create Student"}
        </button>
        <button type="button" className="btn-secondary" onClick={onClose} disabled={loading}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default StudentForm;