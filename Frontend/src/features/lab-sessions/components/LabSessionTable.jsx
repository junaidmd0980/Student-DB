import { lazy, useEffect, useMemo, useState } from "react";
import { Pencil, Trash2, Eye, ArrowLeft } from "lucide-react";
import {
  getLabSessions,
  updateLabSession,
  deleteLabSession,
} from "../services/labSessionService";
import { getDepartments } from "../../master-data/services/departmentService";
import { getBatches } from "../../master-data/services/batchService";
import { getSections } from "../../master-data/services/sectionService";
import LabAttendanceSheet from "./LabAttendanceSheet";
import CustomSelect from "../../../shared/components/CustomSelect";

function LabSessionTable({ filters, refreshKey, onAttendanceViewChange }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [openedSession, setOpenedSession] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [sections, setSections] = useState([]);

  const [editForm, setEditForm] = useState({
    sessionName: "",
    date: "",
    startTime: "",
    endTime: "",
    department: "",
    batch: "",
    section: "",
    status: "",
    notes: "",
  });

  const formatTo12Hour = (time) => {
    if (!time) return "-";

    const [hourString = "0", minuteString = "00"] = time.split(":");
    let hours = Number(hourString);
    const minutes = minuteString;
    const suffix = hours >= 12 ? "PM" : "AM";

    hours = hours % 12 || 12;

    return `${hours}:${minutes} ${suffix}`;
  };

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await getLabSessions();
      setSessions(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      console.error("Failed to load lab sessions:", error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, [refreshKey]);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const departmentData = await getDepartments();
        setDepartments(
          Array.isArray(departmentData)
            ? departmentData
            : departmentData?.data || []
        );
      } catch (error) {
        console.error("Failed to load departments:", error);
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
        setBatches(Array.isArray(data) ? data : data?.data || []);
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
        setSections(Array.isArray(data) ? data : data?.data || []);
      } catch (error) {
        console.error("Failed to load sections:", error);
        setSections([]);
      }
    };

    if (isEditOpen) {
      loadSections();
    }
  }, [editForm.batch, isEditOpen]);

  useEffect(() => {
    if (onAttendanceViewChange) {
      onAttendanceViewChange(Boolean(openedSession));
    }
  }, [openedSession, onAttendanceViewChange]);

  const filteredSessions = useMemo(() => {
    const searchText = (filters.search || "").trim().toLowerCase();

    return sessions.filter((session) => {
      const sessionName = (session.sessionName || "").toLowerCase();
      const matchesSearch = !searchText || sessionName.includes(searchText);
      const matchesStatus =
        !filters.status || session.status === filters.status;

      return matchesSearch && matchesStatus;
    });
  }, [sessions, filters]);

  const handleEditClick = (session) => {
    setSelectedSession(session);
    setEditForm({
      sessionName: session.sessionName || "",
      date: session.date || "",
      startTime: session.startTime || "",
      endTime: session.endTime || "",
      department: session.department?._id || session.department || "",
      batch: session.batch?._id || session.batch || "",
      section: session.section?._id || session.section || "",
      status: session.status || "scheduled",
      notes: session.notes || "",
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (session) => {
    setSelectedSession(session);
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

   if (!selectedSession) return;

   const sessionId = selectedSession._id || selectedSession.id;

   const payload = {
    sessionName: editForm.sessionName.trim(),
    date: editForm.date,
    startTime: editForm.startTime,
    endTime: editForm.endTime,
    department: editForm.department,
    batch: editForm.batch,
    section: editForm.section,
    status: editForm.status,
    notes: editForm.notes?.trim() || "",
   };

   if (
     !payload.sessionName ||
     !payload.date ||
     !payload.startTime ||
     !payload.endTime ||
     !payload.department ||
     !payload.batch ||
     !payload.section ||
     !payload.status
   ) {
     alert("Please fill all required fields");
     return;
   }

   try {
     setActionLoading(true);

     await updateLabSession(sessionId, payload);
     await loadSessions();
     closeEditModal();
    } catch (error) {
      console.error("Failed to update lab session:", error);
      console.log("Update payload:", payload);
      console.log("Backend error response:", error?.response?.data);

      alert(error?.response?.data?.message || "Failed to update session");
    } finally {
      setActionLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedSession) return;

    try {
      setActionLoading(true);
      const sessionId = selectedSession._id || selectedSession.id;

      await deleteLabSession(sessionId);

      setSessions((prev) =>
        prev.filter((session) => (session._id || session.id) !== sessionId)
      );

      if ((openedSession?._id || openedSession?.id) === sessionId) {
        setOpenedSession(null);
      }

      closeDeleteModal();
    } catch (error) {
      console.error("Failed to delete lab session:", error);
      alert(error?.response?.data?.message || "Failed to delete session");
    } finally {
      setActionLoading(false);
    }
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setSelectedSession(null);
    setEditForm({
      sessionName: "",
      date: "",
      startTime: "",
      endTime: "",
      department: "",
      batch: "",
      section: "",
      status: "",
      notes: "",
    });
    setBatches([]);
    setSections([]);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
    setSelectedSession(null);
  };

  const handleBackToList = () => {
    setOpenedSession(null);
  };

  if (loading) {
    return <p>Loading lab sessions...</p>;
  }

  if (openedSession) {
    return (
      <div className="attendance-view-wrapper">
        <div className="attendance-view-header">
          <button
            type="button"
            className="btn-secondary"
            onClick={handleBackToList}
          >
            <ArrowLeft size={16} />
            Back
          </button>
        </div>

        <LabAttendanceSheet
          session={openedSession}
          onSessionRefresh={(updatedSession) => {
            setOpenedSession(updatedSession);
            setSessions((prev) =>
              prev.map((item) =>
                (item._id || item.id) === (updatedSession._id || updatedSession.id)
                  ? updatedSession
                  : item
              )
            );
          }}
        />
      </div>
    );
  }

  if (!filteredSessions.length) {
    return <p>No lab sessions found</p>;
  }

  return (
    <>
      <div className="session-bar-list">
        {filteredSessions.map((session) => {
          const sessionId = session._id || session.id;

          return (
            <div key={sessionId} className="session-bar-card">
              <div
                className="session-bar-card__body"
                onClick={() => setOpenedSession(session)}
              >
                <div className="session-bar-card__primary">
                  <h3>{session.sessionName || "-"}</h3>
                  <p>
                    {session.department?.name || "-"} • {session.batch?.name || "-"} •{" "}
                    {session.section?.name || "-"}
                  </p>
                </div>

                <div className="session-bar-card__meta">
                  <span>{session.date || "-"}</span>
                  <span>
                    {formatTo12Hour(session.startTime)} -{" "}
                    {formatTo12Hour(session.endTime)}
                  </span>
                  <span className={`status-badge status-${session.status}`}>
                    {session.status || "-"}
                  </span>
                </div>
              </div>

              <div className="lab-table-actions">
                <button
                  type="button"
                  className="lab-icon-btn"
                  aria-label={`Open ${session.sessionName || "session"}`}
                  onClick={() => setOpenedSession(session)}
                  disabled={actionLoading}
                >
                  <Eye size={18} />
                </button>

                <button
                  type="button"
                  className="lab-icon-btn lab-edit-btn"
                  aria-label={`Update ${session.sessionName || "session"}`}
                  onClick={() => handleEditClick(session)}
                  disabled={actionLoading}
                >
                  <Pencil size={18} />
                </button>

                <button
                  type="button"
                  className="lab-icon-btn lab-delete-btn"
                  aria-label={`Delete ${session.sessionName || "session"}`}
                  onClick={() => handleDeleteClick(session)}
                  disabled={actionLoading}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {isEditOpen && (
        <div className="modal-overlay" onClick={closeEditModal}>
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="update-session-title"
          >
            <div className="modal-header">
              <h2 id="update-session-title">Update Lab Session</h2>
            </div>

            <form onSubmit={handleEditSave} className="edit-form">
              <div className="form-group">
                <label htmlFor="sessionName">Session Name</label>
                <input
                  id="sessionName"
                  type="text"
                  name="sessionName"
                  value={editForm.sessionName}
                  onChange={handleEditChange}
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
                  value={editForm.date}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="startTime">Start Time</label>
                <input
                  id="startTime"
                  type="time"
                  name="startTime"
                  value={editForm.startTime}
                  onChange={handleEditChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <input
                  id="endTime"
                  type="time"
                  name="endTime"
                  value={editForm.endTime}
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

              <div className="form-group">
                <label htmlFor="status">Status</label>
                <CustomSelect
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  options={[
                    { label: "Scheduled", value: "scheduled" },
                    { label: "Active", value: "active" },
                    { label: "Closed", value: "closed" }
                  ]}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="notes">Notes</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={editForm.notes}
                  onChange={handleEditChange}
                  placeholder="Add notes"
                  rows="4"
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

      {isDeleteOpen && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div
            className="modal-card delete-form"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-session-title"
          >
            <div className="modal-header">
              <h2 id="delete-session-title">Delete Lab Session</h2>
            </div>

            <div className="warning-bar warning-bar--danger">
              <p>
                Are you sure you want to delete{" "}
                <strong>{selectedSession?.sessionName || "this session"}</strong>?
              </p>
              <p>This will also delete all attendance records of this session.</p>
            </div>

            <div className="delete-actions">
              <button
                type="button"
                className="btn-danger"
                onClick={confirmDelete}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </button>

              <button
                type="button"
                className="btn-secondary"
                onClick={closeDeleteModal}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default LabSessionTable;