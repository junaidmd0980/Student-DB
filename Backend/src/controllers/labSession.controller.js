import mongoose from "mongoose";
import LabSession from "../models/labSession.model.js";
import LabAttendance from "../models/labAttendance.model.js";
import Student from "../models/student.model.js";

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const populateSessionRefs = [
  { path: "department", select: "name code" },
  { path: "batch", select: "name year startYear endYear" },
  { path: "section", select: "name code" },
  { path: "createdBy", select: "fullName email" }
];

// @desc Create lab session
// @route POST /api/lab-sessions
// @access Private
export const createLabSession = async (req, res) => {
  try {
    const {
      sessionName,
      date,
      startTime,
      endTime,
      department,
      batch,
      section,
      notes
    } = req.body;

    if (
      !sessionName ||
      !date ||
      !startTime ||
      !endTime ||
      !department ||
      !batch ||
      !section
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    if (
      !isValidObjectId(department) ||
      !isValidObjectId(batch) ||
      !isValidObjectId(section)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid department, batch, or section id"
      });
    }

    const session = await LabSession.create({
      sessionName: sessionName.trim(),
      date: date.trim(),
      startTime: startTime.trim(),
      endTime: endTime.trim(),
      department,
      batch,
      section,
      notes: notes ? notes.trim() : "",
      createdBy: req.user?._id || null
    });

    const populatedSession = await LabSession.findById(session._id).populate(populateSessionRefs);

    return res.status(201).json({
      success: true,
      message: "Lab session created successfully",
      data: populatedSession
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to create lab session",
      error: error.message
    });
  }
};

// @desc Get all lab sessions
// @route GET /api/lab-sessions
// @access Private
export const getLabSessions = async (req, res) => {
  try {
    const { department, batch, section, date, status } = req.query;

    const filter = {};

    if (department && isValidObjectId(department)) filter.department = department;
    if (batch && isValidObjectId(batch)) filter.batch = batch;
    if (section && isValidObjectId(section)) filter.section = section;
    if (date) filter.date = date;
    if (status) filter.status = status;

    const sessions = await LabSession.find(filter)
      .populate(populateSessionRefs)
      .sort({ date: -1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch lab sessions",
      error: error.message
    });
  }
};

// @desc Get single lab session with eligible students and attendance
// @route GET /api/lab-sessions/:sessionId
// @access Private
export const getLabSessionById = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session id"
      });
    }

    const session = await LabSession.findById(sessionId).populate(populateSessionRefs);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Lab session not found"
      });
    }

    const eligibleStudents = await Student.find({
      department: session.department._id,
      batch: session.batch._id,
      section: session.section._id,
      status: "active"
    })
      .select("_id rollNo fullName department batch section status")
      .sort({ rollNo: 1 });

    const attendance = await LabAttendance.find({ session: session._id })
      .populate({
        path: "student",
        select: "_id rollNo fullName"
      })
      .populate({
        path: "markedBy",
        select: "fullName email"
      })
      .sort({ markedAt: 1 });

    const markedStudentIds = new Set(
      attendance.map((item) => item.student?._id?.toString())
    );

    const studentsWithAttendance = eligibleStudents.map((student) => ({
      _id: student._id,
      rollNo: student.rollNo,
      fullName: student.fullName,
      status: student.status,
      isPresent: markedStudentIds.has(student._id.toString())
    }));

    return res.status(200).json({
      success: true,
      data: {
        session,
        eligibleStudents: studentsWithAttendance,
        attendance,
        totalEligibleStudents: eligibleStudents.length,
        totalPresent: attendance.length,
        totalAbsent: eligibleStudents.length - attendance.length
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch lab session details",
      error: error.message
    });
  }
};

// @desc Update full lab session
// @route PUT /api/lab-sessions/:sessionId
// @access Private
export const updateLabSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const {
      sessionName,
      date,
      startTime,
      endTime,
      department,
      batch,
      section,
      status,
      notes
    } = req.body;

    if (!isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session id"
      });
    }

    if (
      !sessionName ||
      !date ||
      !startTime ||
      !endTime ||
      !department ||
      !batch ||
      !section
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    if (!isValidObjectId(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department id"
      });
    }

    if (!isValidObjectId(batch)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch id"
      });
    }

    if (!isValidObjectId(section)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section id"
      });
    }

    if (status && !["scheduled", "active", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const existingSession = await LabSession.findById(sessionId);

    if (!existingSession) {
      return res.status(404).json({
        success: false,
        message: "Lab session not found"
      });
    }

    const updatedSession = await LabSession.findByIdAndUpdate(
      sessionId,
      {
        sessionName: sessionName.trim(),
        date: date.trim(),
        startTime: startTime.trim(),
        endTime: endTime.trim(),
        department,
        batch,
        section,
        status: status || existingSession.status,
        notes: notes ? notes.trim() : ""
      },
      {
        new: true,
        runValidators: true
      }
    ).populate(populateSessionRefs);

    return res.status(200).json({
      success: true,
      message: "Lab session updated successfully",
      data: updatedSession
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update lab session",
      error: error.message
    });
  }
};

// @desc Delete lab session and its attendance
// @route DELETE /api/lab-sessions/:sessionId
// @access Private
export const deleteLabSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session id"
      });
    }

    const session = await LabSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Lab session not found"
      });
    }

    const attendanceDeleteResult = await LabAttendance.deleteMany({
      session: session._id
    });

    await LabSession.findByIdAndDelete(sessionId);

    return res.status(200).json({
      success: true,
      message: "Lab session and related attendance deleted successfully",
      data: {
        deletedSessionId: session._id,
        deletedAttendanceCount: attendanceDeleteResult.deletedCount || 0
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to delete lab session",
      error: error.message
    });
  }
};

// @desc Mark attendance by rollNo or studentId
// @route POST /api/lab-sessions/:sessionId/attendance
// @access Private
export const markLabAttendance = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { rollNo, studentId, method } = req.body;

    if (!isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session id"
      });
    }

    if (!rollNo && !studentId) {
      return res.status(400).json({
        success: false,
        message: "Provide either rollNo or studentId"
      });
    }

    const session = await LabSession.findById(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Lab session not found"
      });
    }

    if (session.status === "scheduled") {
      return res.status(400).json({
        success: false,
        message: "Attendance cannot be marked for a scheduled session"
      });
    }

    if (session.status === "closed") {
      return res.status(400).json({
        success: false,
        message: "Attendance cannot be marked for a closed session"
      });
    }

    let student = null;

    if (studentId) {
      if (!isValidObjectId(studentId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid student id"
        });
      }

      student = await Student.findOne({
        _id: studentId,
        department: session.department,
        batch: session.batch,
        section: session.section,
        status: "active"
      });
    } else if (rollNo) {
      student = await Student.findOne({
        rollNo: rollNo.trim().toUpperCase(),
        department: session.department,
        batch: session.batch,
        section: session.section,
        status: "active"
      });
    }

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found in this department, batch, and section"
      });
    }

    const existingAttendance = await LabAttendance.findOne({
      session: session._id,
      student: student._id
    });

    if (existingAttendance) {
      return res.status(409).json({
        success: false,
        message: "Attendance already marked for this student"
      });
    }

    const attendance = await LabAttendance.create({
      session: session._id,
      student: student._id,
      rollNo: student.rollNo.toUpperCase(),
      method: method === "manual" ? "manual" : "scanner",
      markedBy: req.user?._id || null
    });

    const populatedAttendance = await LabAttendance.findById(attendance._id)
      .populate({
        path: "student",
        select: "_id rollNo fullName"
      })
      .populate({
        path: "markedBy",
        select: "fullName email"
      });

    return res.status(201).json({
      success: true,
      message: "Attendance marked successfully",
      data: populatedAttendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Attendance already exists for this student in the session"
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to mark attendance",
      error: error.message
    });
  }
};

// @desc Remove attendance for a student from session
// @route DELETE /api/lab-sessions/:sessionId/attendance/:studentId
// @access Private
export const removeLabAttendance = async (req, res) => {
  try {
    const { sessionId, studentId } = req.params;

    if (!isValidObjectId(sessionId) || !isValidObjectId(studentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session id or student id"
      });
    }

    const attendance = await LabAttendance.findOneAndDelete({
      session: sessionId,
      student: studentId
    });

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: "Attendance record not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Attendance removed successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to remove attendance",
      error: error.message
    });
  }
};

// @desc Update lab session status
// @route PATCH /api/lab-sessions/:sessionId/status
// @access Private
export const updateLabSessionStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { status } = req.body;

    if (!isValidObjectId(sessionId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid session id"
      });
    }

    if (!["scheduled", "active", "closed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value"
      });
    }

    const session = await LabSession.findByIdAndUpdate(
      sessionId,
      { status },
      { new: true, runValidators: true }
    ).populate(populateSessionRefs);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Lab session not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Session status updated successfully",
      data: session
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to update session status",
      error: error.message
    });
  }
};