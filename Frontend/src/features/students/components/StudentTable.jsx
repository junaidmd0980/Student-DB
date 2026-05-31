import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
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

function StudentTable({ filters }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);

  const [editForm, setEditForm] = useState({
    fullName: "",
    rollNo: "",
    email: "",
    phone: "",
    department: "",
    batch: "",
    section: "",
  });

  useEffect(() => {
    const loadStudents = async () => {
      try {
        setLoading(true);

        const [data] = await Promise.all([
          getStudents({
            department: filters.department,
            batch: filters.batch,
          }),
          new Promise((resolve) => setTimeout(resolve, 1000)),
        ]);

        setStudents(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Failed to load students:", error);
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };

    loadStudents();
  }, [filters.department, filters.batch]);


  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const departmentData = await getDepartments();

        setDepartments(
          Array.isArray(departmentData)
            ? departmentData
            : departmentData.data || []
        );
      } catch (error) {
        console.error("Failed to load form master data:", error);
        setDepartments([]);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const loadBatches = async () => {
      if (!editForm.department) {
        setBatches([]);
        return;
      }

      try {
        const data = await getBatches({ department: editForm.department });
        setBatches(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Failed to load batches:", error);
        setBatches([]);
      }
    };

    if (isEditOpen) {
      loadBatches();
    }
  }, [editForm.department, isEditOpen]);

  useEffect(() => {
    const loadSections = async () => {
      if (!editForm.batch) {
        setSections([]);
        return;
      }

      try {
        const data = await getSections({ batch: editForm.batch });
        setSections(Array.isArray(data) ? data : data.data || []);
      } catch (error) {
        console.error("Failed to load sections:", error);
        setSections([]);
      }
    };

    if (isEditOpen) {
      loadSections();
    }
  }, [editForm.batch, isEditOpen]);

  const filteredStudents = useMemo(() => {
    const searchText = (filters.search || "").trim().toLowerCase();

    if (!searchText) return students;

    return students.filter((student) => {
      const fullName = (student.fullName || "").toLowerCase();
      const rollNo = (student.rollNo || "").toLowerCase();

      return fullName.includes(searchText) || rollNo.includes(searchText);
    });
  }, [students, filters.search]);

  const handleEditClick = (student) => {
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
    setSelectedStudent(student);
    setIsDeleteOpen(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;

    setEditForm((prev) => {
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

  const handleEditSave = async (e) => {
    e.preventDefault();

    if (!selectedStudent) return;

    try {
      setActionLoading(true);

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

      const response = await updateStudent(studentId, payload);
      const updatedStudent = response?.data || response;

      setStudents((prev) =>
        prev.map((student) =>
          (student._id || student.id) === studentId
            ? {
                ...student,
                ...updatedStudent,
                department: updatedStudent.department || student.department,
                batch: updatedStudent.batch || student.batch,
                section: updatedStudent.section || student.section,
              }
            : student
        )
      );

      closeEditModal();
    } catch (error) {
      console.error("Failed to update student:", error);
      alert("Failed to update student");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedStudent) return;

    try {
      setActionLoading(true);
      const studentId = selectedStudent._id || selectedStudent.id;
      await deleteStudent(studentId);

      setStudents((prev) =>
        prev.filter((student) => (student._id || student.id) !== studentId)
      );

      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete student:", error);
      alert("Failed to delete student");
    } finally {
      setActionLoading(false);
    }
  };

  const closeEditModal = () => {
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
    setSections([]);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return <Loader text="Loading students..."/>;
  }

  if (!filteredStudents.length) {
    return <p>No students found</p>;
  }

  return (
    <>
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
                  placeholder="Enter student name"
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
                  placeholder="Enter roll number"
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
                  placeholder="Enter email"
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
                  placeholder="Enter phone number"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="department">Department</label>
                <CustomSelect
                  name="department"
                  value={editForm.department}
                  onChange={handleEditChange}
                  options={departments.map((department) => ({
                    label: department.name,
                    value: department._id || department.id
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
                  options={batches.map((batch) => ({
                    label: batch.name,
                    value: batch._id || batch.id
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
                  options={sections.map((section) => ({
                    label: section.name,
                    value: section._id || section.id
                  }))}
                  disabled={!editForm.batch}
                  required
                />
              </div>

              <div className="delete-actions">
                <button
                  type="submit"
                  className="table-action"
                  disabled={actionLoading}
                >
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
    </>
  );
}

export default StudentTable;