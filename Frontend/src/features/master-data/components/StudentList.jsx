import { useEffect, useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import {
  getStudents,
  updateStudent,
  deleteStudent,
} from "../services/studentService";
import { getDepartments } from "../../master-data/services/departmentService";
import { getBatches } from "../../master-data/services/batchService";
import { getSections } from "../../master-data/services/sectionService";
import DeleteConfirmModal from "../../../shared/components/DeleteConfirmModel";
import CustomSelect from "../../../shared/components/CustomSelect";
import Loader from "../../../shared/components/Loader";
import { useError } from "../../../shared/context/ErrorContext.jsx";

function StudentList({
  students = [],
  selectedDepartment,
  selectedBatch,
  selectedSection,
  loading,
  onCreateStudent,
}) {
  const { showError, clearError } = useError();

  const [search, setSearch] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sectionsList, setSectionsList] = useState([]);

  const [editForm, setEditForm] = useState({
    fullName: "",
    rollNo: "",
    email: "",
    phone: "",
    department: "",
    batch: "",
    section: "",
  });

  const getErrorMessage = (error, fallback = "Something went wrong") => {
    return (
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      fallback
    );
  };

  const filteredStudents = students.filter((student) => {
    if (!search.trim()) return true;
    const searchText = search.trim().toLowerCase();
    const fullName = (student.fullName || "").toLowerCase();
    const rollNo = (student.rollNo || "").toLowerCase();
    return fullName.includes(searchText) || rollNo.includes(searchText);
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const departmentData = await getDepartments();
        setDepartments(
          Array.isArray(departmentData) ? departmentData : departmentData.data || []
        );
      } catch (error) {
        showError(getErrorMessage(error, "Failed to load form master data"));
        setDepartments([]);
      }
    };
    loadInitialData();
  }, [showError]);

  useEffect(() => {
    const loadBatchesForEdit = async () => {
      if (!editForm.department) {
        setBatches([]);
        return;
      }
      try {
        const data = await getBatches({ department: editForm.department });
        setBatches(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        showError(getErrorMessage(error, "Failed to load batches"));
        setBatches([]);
      }
    };
    if (isEditOpen) loadBatchesForEdit();
  }, [editForm.department, isEditOpen, showError]);

  useEffect(() => {
    const loadSectionsForEdit = async () => {
      if (!editForm.batch) {
        setSectionsList([]);
        return;
      }
      try {
        const data = await getSections({ batch: editForm.batch });
        setSectionsList(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        showError(getErrorMessage(error, "Failed to load sections"));
        setSectionsList([]);
      }
    };
    if (isEditOpen) loadSectionsForEdit();
  }, [editForm.batch, isEditOpen, showError]);

  const handleEditClick = (student) => {
    clearError();
    setSelectedStudent(student);
    setEditForm({
      fullName: student.fullName || "",
      rollNo: student.rollNo || "",
      email: student.email || "",
      phone: student.phone || "",
      department: student.department?._id || student.department || "",
      batch: student.batch?._id || student.batch || "",
      section: student.section?._id || student.section || "",
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (student) => {
    clearError();
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => {
      if (name === "department") {
        return { ...prev, department: value, batch: "", section: "" };
      }
      if (name === "batch") {
        return { ...prev, batch: value, section: "" };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      setActionLoading(true);
      clearError();

      const studentId = selectedStudent._id || selectedStudent.id;
      const payload = {
        fullName: editForm.fullName,
        rollNo: editForm.rollNo,
        email: editForm.email,
        phone: editForm.phone,
        department: editForm.department,
        batch: editForm.batch,
        section: editForm.section,
      };

      await updateStudent(studentId, payload);

      const departmentId = selectedDepartment?._id || selectedDepartment?.id;
      const batchId = selectedBatch?._id || selectedBatch?.id;
      const sectionId = selectedSection?._id || selectedSection?.id;

      const data = await getStudents({
        department: departmentId,
        batch: batchId,
        section: sectionId,
      });

      const newStudents = Array.isArray(data) ? data : data.data || [];
      students.splice(0, students.length, ...newStudents);

      setIsEditOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      showError(getErrorMessage(error, "Failed to update student"));
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedStudent) return;
    try {
      setActionLoading(true);
      clearError();

      const studentId = selectedStudent._id || selectedStudent.id;
      await deleteStudent(studentId);

      const departmentId = selectedDepartment?._id || selectedDepartment?.id;
      const batchId = selectedBatch?._id || selectedBatch?.id;
      const sectionId = selectedSection?._id || selectedSection?.id;

      const data = await getStudents({
        department: departmentId,
        batch: batchId,
        section: sectionId,
      });

      const newStudents = Array.isArray(data) ? data : data.data || [];
      students.splice(0, students.length, ...newStudents);

      setIsDeleteOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      showError(getErrorMessage(error, "Failed to delete student"));
    } finally {
      setActionLoading(false);
    }
  };

  const closeEditModal = () => {
    clearError();
    setIsEditOpen(false);
    setSelectedStudent(null);
    setEditForm({
      fullName: "",
      rollNo: "",
      email: "",
      phone: "",
      department: "",
      batch: "",
      section: "",
    });
    setBatches([]);
    setSectionsList([]);
  };

  const closeDeleteModal = () => {
    clearError();
    setIsDeleteOpen(false);
    setSelectedStudent(null);
  };

  const pageTitle = selectedSection
    ? `Students - ${selectedDepartment?.name || ""} / ${selectedBatch?.name || ""} / ${selectedSection?.name || ""}`
    : `Students - ${selectedDepartment?.name || ""} / ${selectedBatch?.name || ""}`;

  return (
    <div className="page student-list-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="page-title">{pageTitle}</h1>
          </div>
        </div>

        <div className="card filter-card">
          <div className="filter-grid">
            <input
              type="text"
              name="search"
              placeholder="Search by roll no or name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="button" className="table-action" onClick={onCreateStudent}>
            <UserPlus size={18} />
            Create Student
          </button>
        </div>

        {loading?.students && <Loader text="Loading students..." />}

        {!loading?.students && !filteredStudents.length && (
          <div className="empty-state">
            <p>No students found</p>
          </div>
        )}

        {!loading?.students && filteredStudents.length > 0 && (
          <div className="table-container">
            <table className="student-table">
              <thead>
                <tr>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Department</th>
                  <th>Batch</th>
                  <th>Section</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
                  const studentId = student._id || student.id;
                  return (
                    <tr key={studentId}>
                      <td>{student.rollNo || "-"}</td>
                      <td>{student.fullName || "-"}</td>
                      <td>{student.email || "-"}</td>
                      <td>{student.phone || "-"}</td>
                      <td>{student.department?.name || "-"}</td>
                      <td>{student.batch?.name || "-"}</td>
                      <td>{student.section?.name || "-"}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="icon-btn edit-btn"
                            aria-label={`Update ${student.fullName || "student"}`}
                            onClick={() => handleEditClick(student)}
                            disabled={actionLoading}
                          >
                            <Pencil size={18} />
                          </button>
                          <button
                            type="button"
                            className="icon-btn delete-btn"
                            aria-label={`Delete ${student.fullName || "student"}`}
                            onClick={() => handleDeleteClick(student)}
                            disabled={actionLoading}
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {isEditOpen && (
          <div className="modal-overlay" onClick={closeEditModal}>
            <div
              className="modal-card"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="update-student-title"
            >
              <div className="modal-header">
                <h2 id="update-student-title">Update Student</h2>
              </div>

              <form onSubmit={handleEditSave} className="edit-form">
                <div className="form-group">
                  <label htmlFor="fullName">Student Name</label>
                  <input
                    id="fullName"
                    type="text"
                    name="fullName"
                    value={editForm.fullName}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="rollNo">Roll Number</label>
                  <input
                    id="rollNo"
                    type="text"
                    name="rollNo"
                    value={editForm.rollNo}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={editForm.email}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone</label>
                  <input
                    id="phone"
                    type="text"
                    name="phone"
                    value={editForm.phone}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="department">Department</label>
                  <CustomSelect
                    name="department"
                    value={editForm.department}
                    onChange={handleEditChange}
                    options={departments.map((d) => ({
                      label: d.name,
                      value: d._id || d.id,
                    }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="batch">Batch</label>
                  <CustomSelect
                    name="batch"
                    value={editForm.batch}
                    onChange={handleEditChange}
                    options={batches.map((b) => ({
                      label: b.name,
                      value: b._id || b.id,
                    }))}
                    disabled={!editForm.department}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="section">Section</label>
                  <CustomSelect
                    name="section"
                    value={editForm.section}
                    onChange={handleEditChange}
                    options={sectionsList.map((s) => ({
                      label: s.name,
                      value: s._id || s.id,
                    }))}
                    disabled={!editForm.batch}
                    required
                  />
                </div>

                <div className="delete-actions">
                  <button type="submit" className="table-action" disabled={actionLoading}>
                    {actionLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={closeEditModal}
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <DeleteConfirmModal
          open={isDeleteOpen}
          entity="student"
          item={selectedStudent}
          loading={actionLoading}
          onClose={closeDeleteModal}
          onConfirm={confirmDelete}
          title="Delete Student"
          description={`You are about to delete ${selectedStudent?.fullName || "this student"}.`}
          warning="This action will permanently delete this student record. Type the student name to confirm."
          confirmLabel="Delete Student"
          cancelLabel="Keep Student"
          requireTypedConfirm={true}
          confirmKeyword={selectedStudent?.fullName || ""}
        />
      </div>
    </div>
  );
}

export default StudentList;