import { useEffect, useState } from "react";
import { createLabSession } from "../services/labSessionService";
import { getDepartments } from "../../master-data/services/departmentService";
import { getBatches } from "../../master-data/services/batchService";
import { getSections } from "../../master-data/services/sectionService";
import CustomSelect from "../../../shared/components/CustomSelect";

function LabSessionFilters({ filters, setFilters, onSessionCreated }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    sessionName: "",
    date: "",
    startTime: "",
    endTime: "",
    department: "",
    batch: "",
    section: "",
    notes: "",
  });

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Failed to load departments:", error);
        setDepartments([]);
      }
    };

    loadDepartments();
  }, []);

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
      } catch (error) {
        console.error("Failed to load batches:", error);
        setBatches([]);
      }
    };

    loadBatches();
  }, [formData.department]);

  useEffect(() => {
    const loadSections = async () => {
      if (!formData.batch) {
        setSections([]);
        return;
      }

      try {
        const data = await getSections({ batch: formData.batch });
        setSections(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Failed to load sections:", error);
        setSections([]);
      }
    };

    loadSections();
  }, [formData.batch]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      if (name === "department") {
        return {
          ...prev,
          department: value,
          batch: "",
          section: "",
        };
      }

      if (name === "batch") {
        return {
          ...prev,
          batch: value,
          section: "",
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const resetForm = () => {
    setFormData({
      sessionName: "",
      date: "",
      startTime: "",
      endTime: "",
      department: "",
      batch: "",
      section: "",
      notes: "",
    });
    setBatches([]);
    setSections([]);
  };

  const closeCreateModal = () => {
    setIsCreateOpen(false);
    resetForm();
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const response = await createLabSession(formData);
      const createdSession = response?.data || response;

      if (onSessionCreated) {
        onSessionCreated(createdSession);
      }

      closeCreateModal();
    } catch (error) {
      console.error("Failed to create lab session:", error);
      alert(error?.response?.data?.message || "Failed to create lab session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="card filter-card">
        <div className="filter-grid">
          <input
            type="text"
            name="search"
            placeholder="Search by session name"
            value={filters.search || ""}
            onChange={handleFilterChange}
          />

          <CustomSelect
            name="status"
            value={filters.status || ""}
            onChange={handleFilterChange}
            options={[
              { label: "All Status", value: "" },
              { label: "Scheduled", value: "scheduled" },
              { label: "Active", value: "active" },
              { label: "Closed", value: "closed"}
            ]}
          />

          <button
            type="button"
            className="table-action"
            onClick={() => setIsCreateOpen(true)}
          >
            Create Lab Session
          </button>
        </div>
      </div>

      {isCreateOpen && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-session-title"
          >
            <div className="modal-header">
              <h2 id="create-session-title">Create Lab Session</h2>
            </div>

            <form onSubmit={handleCreateSubmit} className="edit-form">
              <div className="form-group">
                <label htmlFor="sessionName">Session Name</label>
                <input
                  id="sessionName"
                  type="text"
                  name="sessionName"
                  value={formData.sessionName}
                  onChange={handleFormChange}
                  placeholder="Enter session name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="startTime">Start Time</label>
                <input
                  id="startTime"
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <input
                  id="endTime"
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="createDepartment">Department</label>
                <CustomSelect
                  name="department"
                  value={formData.department}
                  onChange={handleFormChange}
                  options={departments.map((department) => ({
                    label: department.name,
                    value: department._id || department.id
                  }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="createBatch">Batch</label>
                <CustomSelect
                  name="batch"
                  value={formData.batch}
                  onChange={handleFormChange}
                  options={batches.map((batch) => ({
                    label: batch.name,
                    value: batch._id || batch.id
                  }))}
                  disabled={!formData.department}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="createSection">Section</label>
                <CustomSelect
                  name="section"
                  value={formData.section}
                  onChange={handleFormChange}
                  options={sections.map((section) => ({
                    label: section.name,
                    value: section._id || section.id
                  }))}
                  disabled={!formData.batch}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleFormChange}
                  placeholder="Add notes"
                  rows="4"
                />
              </div>

              <div className="delete-actions">
                <button
                  type="submit"
                  className="table-action"
                  disabled={loading}
                >
                  {loading ? "Creating..." : "Create Session"}
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeCreateModal}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default LabSessionFilters;