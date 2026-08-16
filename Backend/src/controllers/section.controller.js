import mongoose from "mongoose";
import Section from "../models/section.model.js";
import Department from "../models/department.model.js";
import Batch from "../models/batch.model.js";

export const createSection = async (req, res) => {
  try {
    const { name, department, batch, status } = req.body;
    const tenant = req.tenant;

    if (!name || !department || !batch) {
      return res.status(400).json({
        success: false,
        message: "name, department and batch are required"
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(department) ||
      !mongoose.Types.ObjectId.isValid(batch)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid department or batch id"
      });
    }

    const departmentDoc = await Department.findOne({
      _id: department,
      tenant: tenant._id
    });

    if (!departmentDoc) {
      return res.status(404).json({
        success: false,
        message: "Department not found in this organization"
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
        message: "Batch not found for selected department in this organization"
      });
    }

    const trimmedName = name.trim();

    const existingSection = await Section.findOne({
      tenant: tenant._id,
      name: trimmedName,
      department,
      batch
    });

    if (existingSection) {
      return res.status(400).json({
        success: false,
        message: "Section already exists in this department and batch"
      });
    }

    const section = await Section.create({
      tenant: tenant._id,
      name: trimmedName,
      department,
      batch,
      status
    });

    const populatedSection = await Section.findById(section._id)
      .populate("department", "name")
      .populate("batch", "name");

    return res.status(201).json({
      success: true,
      message: "Section created successfully",
      data: populatedSection
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getSections = async (req, res) => {
  try {
    const { department, batch, status } = req.query;
    const tenant = req.tenant;

    const matchStage = { tenant: tenant._id };

    if (department) {
      if (!mongoose.Types.ObjectId.isValid(department)) {
        return res.status(400).json({
          success: false,
          message: "Invalid department id"
        });
      }
      matchStage.department = new mongoose.Types.ObjectId(department);
    }

    if (batch) {
      if (!mongoose.Types.ObjectId.isValid(batch)) {
        return res.status(400).json({
          success: false,
          message: "Invalid batch id"
        });
      }
      matchStage.batch = new mongoose.Types.ObjectId(batch);
    }

    if (status) {
      matchStage.status = status;
    }

    const sections = await Section.aggregate([
      { $match: matchStage },
      {
        $lookup: {
          from: "departments",
          let: { deptId: "$department" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$deptId"] },
                    { $eq: ["$tenant", tenant._id] }
                  ]
                }
              }
            }
          ],
          as: "department"
        }
      },
      {
        $unwind: {
          path: "$department",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "batches",
          let: { batchId: "$batch" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$_id", "$$batchId"] },
                    { $eq: ["$tenant", tenant._id] }
                  ]
                }
              }
            }
          ],
          as: "batch"
        }
      },
      {
        $unwind: {
          path: "$batch",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $lookup: {
          from: "students",
          let: { sectionId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$tenant", tenant._id] },
                    { $eq: ["$section", "$$sectionId"] }
                  ]
                }
              }
            }
          ],
          as: "students"
        }
      },
      { $addFields: { studentCount: { $size: "$students" } } },
      {
        $project: {
          students: 0,
          "department.__v": 0,
          "batch.__v": 0
        }
      },
      { $sort: { name: 1 } }
    ]);

    return res.status(200).json({
      success: true,
      count: sections.length,
      data: sections
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateSection = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, batch, status } = req.body;
    const tenant = req.tenant;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section id"
      });
    }

    if (!name || !department || !batch) {
      return res.status(400).json({
        success: false,
        message: "name, department and batch are required"
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(department) ||
      !mongoose.Types.ObjectId.isValid(batch)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid department or batch id"
      });
    }

    const departmentDoc = await Department.findOne({
      _id: department,
      tenant: tenant._id
    });

    if (!departmentDoc) {
      return res.status(404).json({
        success: false,
        message: "Department not found in this organization"
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
        message: "Batch not found for selected department in this organization"
      });
    }

    const trimmedName = name.trim();

    const existingSection = await Section.findOne({
      tenant: tenant._id,
      name: trimmedName,
      department,
      batch,
      _id: { $ne: id }
    });

    if (existingSection) {
      return res.status(400).json({
        success: false,
        message: "Section already exists in this department and batch"
      });
    }

    const updatedSection = await Section.findOneAndUpdate(
      {
        _id: id,
        tenant: tenant._id
      },
      {
        name: trimmedName,
        department,
        batch,
        status
      },
      {
        new: true,
        runValidators: true
      }
    )
      .populate("department", "name")
      .populate("batch", "name");

    if (!updatedSection) {
      return res.status(404).json({
        success: false,
        message: "Section not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Section updated successfully",
      data: updatedSection
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteSection = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = req.tenant;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid section id"
      });
    }

    const deletedSection = await Section.findOneAndDelete({
      _id: id,
      tenant: tenant._id
    });

    if (!deletedSection) {
      return res.status(404).json({
        success: false,
        message: "Section not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Section deleted successfully",
      data: deletedSection
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};