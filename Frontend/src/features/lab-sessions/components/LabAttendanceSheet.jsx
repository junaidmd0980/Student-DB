import { useEffect, useRef, useState } from "react";
import { Printer, Trash2 } from "lucide-react";
import {
  getLabSessionById,
  markLabAttendance,
  removeLabAttendance,
} from "../services/labSessionService";

function LabAttendanceSheet({ session }) {
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [scanStatus, setScanStatus] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);

  const scanBufferRef = useRef("");
  const scanTimeoutRef = useRef(null);

  const sessionId = session?._id || session?.id;

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const data = await getLabSessionById(sessionId);
      setSessionData(data?.data || data);
    } catch (error) {
      console.error("Failed to load session attendance:", error);
      setSessionData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      loadAttendanceData();
    }
  }, [sessionId]);

  const submitScannedRoll = async (scannedValue) => {
    const cleanRollNo = scannedValue.trim().toUpperCase();

    if (!cleanRollNo) return;

    try {
      setActionLoading(true);
      setScanStatus(`Scanning: ${cleanRollNo}`);

      await markLabAttendance(sessionId, {
        rollNo: cleanRollNo,
        method: "scanner",
      });

      setScanStatus(`Added: ${cleanRollNo}`);
      await loadAttendanceData();
    } catch (error) {
      console.error("Failed to scan attendance:", error);
      setScanStatus(
        error?.response?.data?.message || `Failed for ${cleanRollNo}`
      );
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionId) return;

    const clearScanTimeout = () => {
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = null;
      }
    };

    const resetBuffer = () => {
      scanBufferRef.current = "";
      clearScanTimeout();
    };

    const handleKeyDown = (event) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      const isTypingField =
        activeTag === "input" ||
        activeTag === "textarea" ||
        activeTag === "select" ||
        document.activeElement?.isContentEditable;

      if (isTypingField) return;

      if (event.key === "Enter") {
        event.preventDefault();

        const finalValue = scanBufferRef.current.trim();
        if (finalValue) {
          submitScannedRoll(finalValue);
        }

        resetBuffer();
        return;
      }

      if (
        event.key === "Shift" ||
        event.key === "Control" ||
        event.key === "Alt" ||
        event.key === "Meta"
      ) {
        return;
      }

      if (event.key === "Backspace") {
        scanBufferRef.current = scanBufferRef.current.slice(0, -1);
        return;
      }

      if (event.key.length === 1) {
        scanBufferRef.current += event.key;

        clearScanTimeout();
        scanTimeoutRef.current = setTimeout(() => {
          scanBufferRef.current = "";
        }, 300);
      }
    };

    document.body.addEventListener("keydown", handleKeyDown, true);

    return () => {
      document.body.removeEventListener("keydown", handleKeyDown, true);
      clearScanTimeout();
    };
  }, [sessionId]);

  const handleDeleteClick = (entry) => {
    setSelectedAttendance(entry);
    setIsDeleteOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteOpen(false);
    setSelectedAttendance(null);
  };

  const confirmDelete = async () => {
    if (!selectedAttendance) return;

    try {
      setActionLoading(true);

      const studentId =
        selectedAttendance.student?._id || selectedAttendance.student?.id;

      await removeLabAttendance(sessionId, studentId);
      await loadAttendanceData();
      closeDeleteModal();
    } catch (error) {
      console.error("Failed to remove attendance:", error);
      alert(error?.response?.data?.message || "Failed to remove student");
    } finally {
      setActionLoading(false);
    }
  };

  const formatMarkedTime = (value) => {
    if (!value) return "-";

    const date = new Date(value);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  const formatTo12Hour = (timeValue) => {
    if (!timeValue) return "-";

    const timeParts = timeValue.split(":");
    if (timeParts.length < 2) return timeValue;

    const [hours, minutes, seconds = "00"] = timeParts;

    const date = new Date();
    date.setHours(Number(hours), Number(minutes), Number(seconds), 0);

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  if (loading) {
    return <p>Loading attendance...</p>;
  }

  if (!sessionData?.session) {
    return <p>No attendance data found.</p>;
  }

  const { session: sessionInfo, attendance = [] } = sessionData;

  return (
    <>
      <div className="attendance-sheet-wrapper">
        <div className="attendance-toolbar no-print">
          <div>
            <h2>Attendance</h2>
            <p className="scanner-hint">
              Scanner is active. Scan student ID to add attendance.
            </p>
            {scanStatus ? <p className="scanner-status">{scanStatus}</p> : null}
          </div>

          <button
            type="button"
            className="table-action"
            onClick={() => window.print()}
          >
            <Printer size={18} />
            Print / Save PDF
          </button>
        </div>

        <div className="attendance-document print-area">
          <div className="attendance-document__header">
            <h3>Lab Attendance Sheet</h3>
            <div className="attendance-document__meta">
              <p>
                <strong>Session:</strong> {sessionInfo.sessionName}
              </p>
              <p>
                <strong>Date:</strong> {sessionInfo.date}
              </p>
              <p>
                <strong>Time:</strong> {formatTo12Hour(sessionInfo.startTime)} -{" "}
                {formatTo12Hour(sessionInfo.endTime)}
              </p>
              <p>
                <strong>Department:</strong> {sessionInfo.department?.name}
              </p>
              <p>
                <strong>Batch:</strong> {sessionInfo.batch?.name}
              </p>
              <p>
                <strong>Section:</strong> {sessionInfo.section?.name}
              </p>
              <p>
                <strong>Total Present:</strong> {attendance.length}
              </p>
            </div>
          </div>

          <div className="table-container">
            <table className="student-table attendance-table">
              <thead>
                <tr>
                  <th>S.No</th>
                  <th>Roll No</th>
                  <th>Name</th>
                  <th>Recorded Time</th>
                  <th className="no-print">Actions</th>
                </tr>
              </thead>

              <tbody>
                {attendance.length > 0 ? (
                  attendance.map((entry, index) => {
                    const studentKey = entry.student?._id || entry.student?.id;

                    return (
                      <tr key={entry._id || `${studentKey}-${index}`}>
                        <td>{index + 1}</td>
                        <td>{entry.student?.rollNo || entry.rollNo || "-"}</td>
                        <td>{entry.student?.fullName || "-"}</td>
                        <td>{formatMarkedTime(entry.markedAt)}</td>
                        <td className="no-print">
                          <button
                            type="button"
                            className="icon-btn delete-btn"
                            onClick={() => handleDeleteClick(entry)}
                            disabled={actionLoading}
                            aria-label={`Delete attendance for ${
                              entry.student?.fullName || "student"
                            }`}
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5">No students scanned yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isDeleteOpen && (
        <div className="modal-overlay" onClick={closeDeleteModal}>
          <div
            className="modal-card delete-form"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-attendance-title"
          >
            <div className="modal-header">
              <h2 id="delete-attendance-title">Delete Attendance</h2>
            </div>

            <div className="warning-bar warning-bar--danger">
              <p>
                Are you sure you want to delete{" "}
                <strong>
                  {selectedAttendance?.student?.fullName || "this student"}
                </strong>
                ?
              </p>
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

export default LabAttendanceSheet;