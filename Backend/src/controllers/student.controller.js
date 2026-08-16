import mongoose from "mongoose";
import Student from "../models/student.model.js";
import Department from "../models/department.model.js";
import Batch from "../models/batch.model.js";
import Section from "../models/section.model.js";

export const createStudent = async (req, res) => {
  try {
    const {
      rollNo,
      fullName,
      gender,
      phone,
      email,
      department,
      batch,
      section,
      status
    } = req.body;

    const tenant = req.tenant;

    if (!rollNo || !fullName || !department || !batch || !section) {
      return res.status(400).json({
        success: false,
        message: "rollNo, fullName, department, batch and section are required"
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(department) ||
      !mongoose.Types.ObjectId.isValid(batch) ||
      !mongoose.Types.ObjectId.isValid(section)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid department, batch or section id"
      });
    }

    const departmentDoc = await Department.findOne({
      _id: department,
      tenant: tenant._id
    });

    if (!departmentDoc) {
      return res.status(404).json({
        success: false,
        message: "Department not found in this tenant"
      });
    }

    const batchDoc = await Batch.findOne({
      _id: batch,
      tenant: tenant._id,
      department
    });

    if (!batchDoc) {
      return res.status(404).json({
        success: false,
        message: "Batch not found for selected department in this tenant"
      });
    }

    const sectionDoc = await Section.findOne({
      _id: section,
      tenant: tenant._id,
      batch
    });

    if (!sectionDoc) {
      return res.status(404).json({
        success: false,
        message: "Section not found for selected batch in this tenant"
      });
    }

    const trimmedRollNo = rollNo.trim();

    const existingRollNo = await Student.findOne({
      tenant: tenant._id,
      rollNo: trimmedRollNo
    });

    if (existingRollNo) {
      return res.status(400).json({
        success: false,
        message: "Roll number already exists in this tenant"
      });
    }

    const student = await Student.create({
      tenant: tenant._id,
      rollNo: trimmedRollNo,
      fullName: fullName.trim(),
      gender,
      phone,
      email,
      department,
      batch,
      section,
      status
    });

    const populatedStudent = await Student.findById(student._id)
      .populate("department", "name")
      .populate("batch", "name")
      .populate("section", "name");

    return res.status(201).json({
      success: true,
      message: "Student created successfully",
      data: populatedStudent
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getStudents = async (req, res) => {
  try {
    const { department, batch, section, status } = req.query;
    const tenant = req.tenant;

    const filter = { tenant: tenant._id };

    if (department) filter.department = department;
    if (batch) filter.batch = batch;
    if (section) filter.section = section;
    if (status) filter.status = status;

    const students = await Student.find(filter)
      .populate("department", "name")
      .populate("batch", "name")
      .populate("section", "name")
      .sort({ rollNo: 1, fullName: 1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getDepartmentStudents = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const tenant = req.tenant;

    if (!mongoose.Types.ObjectId.isValid(departmentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department id"
      });
    }

    const departmentDoc = await Department.findOne({
      _id: departmentId,
      tenant: tenant._id
    });

    if (!departmentDoc) {
      return res.status(404).json({
        success: false,
        message: "Department not found in this tenant"
      });
    }

    const students = await Student.find({
      tenant: tenant._id,
      department: departmentId
    })
      .populate("department", "name")
      .populate("batch", "name")
      .populate("section", "name")
      .sort({ batch: 1, section: 1, rollNo: 1 });

    return res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = req.tenant;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student id"
      });
    }

    const student = await Student.findOne({
      _id: id,
      tenant: tenant._id
    })
      .populate("department", "name")
      .populate("batch", "name")
      .populate("section", "name");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      rollNo,
      fullName,
      gender,
      phone,
      email,
      department,
      batch,
      section,
      status
    } = req.body;

    const tenant = req.tenant;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student id"
      });
    }

    const existingStudent = await Student.findOne({
      _id: id,
      tenant: tenant._id
    });

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    const nextDepartment = department || existingStudent.department;
    const nextBatch = batch || existingStudent.batch;
    const nextSection = section || existingStudent.section;

    if (
      !mongoose.Types.ObjectId.isValid(nextDepartment) ||
      !mongoose.Types.ObjectId.isValid(nextBatch) ||
      !mongoose.Types.ObjectId.isValid(nextSection)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid department, batch or section id"
      });
    }

    const departmentDoc = await Department.findOne({
      _id: nextDepartment,
      tenant: tenant._id
    });

    if (!departmentDoc) {
      return res.status(404).json({
        success: false,
        message: "Department not found in this tenant"
      });
    }

    const batchDoc = await Batch.findOne({
      _id: nextBatch,
      tenant: tenant._id,
      department: nextDepartment
    });

    if (!batchDoc) {
      return res.status(404).json({
        success: false,
        message: "Batch not found for the selected department in this tenant"
      });
    }

    const sectionDoc = await Section.findOne({
      _id: nextSection,
      tenant: tenant._id,
      batch: nextBatch
    });

    if (!sectionDoc) {
      return res.status(404).json({
        success: false,
        message: "Section not found for selected batch in this tenant"
      });
    }

    if (rollNo && rollNo.trim() !== existingStudent.rollNo) {
      const duplicateRollNo = await Student.findOne({
        tenant: tenant._id,
        rollNo: rollNo.trim(),
        _id: { $ne: id }
      });

      if (duplicateRollNo) {
        return res.status(400).json({
          success: false,
          message: "Roll number already exists in this tenant"
        });
      }
    }

    existingStudent.rollNo = rollNo?.trim() ?? existingStudent.rollNo;
    existingStudent.fullName = fullName?.trim() ?? existingStudent.fullName;
    existingStudent.gender = gender ?? existingStudent.gender;
    existingStudent.phone = phone ?? existingStudent.phone;
    existingStudent.email = email ?? existingStudent.email;
    existingStudent.department = nextDepartment;
    existingStudent.batch = nextBatch;
    existingStudent.section = nextSection;
    existingStudent.status = status ?? existingStudent.status;

    await existingStudent.save();

    const updatedStudent = await Student.findById(id)
      .populate("department", "name")
      .populate("batch", "name")
      .populate("section", "name");

    return res.status(200).json({
      success: true,
      message: "Student updated successfully",
      data: updatedStudent
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = req.tenant;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student id"
      });
    }

    const student = await Student.findOneAndDelete({
      _id: id,
      tenant: tenant._id
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};