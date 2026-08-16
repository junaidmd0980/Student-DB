import mongoose from "mongoose";
import Batch from "../models/batch.model.js";
import Department from "../models/department.model.js";
import Section from "../models/section.model.js";

export const createBatch = async (req, res) => {
  try {
    const { name, department } = req.body;
    const tenant = req.tenant;

    if (!name || !department) {
      return res.status(400).json({
        success: false,
        message: "Name and department are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department id"
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

    const trimmedName = name.trim();

    const existingBatch = await Batch.findOne({
      tenant: tenant._id,
      name: trimmedName,
      department,
      _id: { $ne: undefined } 
    });

    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: "Batch already exists in this department"
      });
    }

    const batch = await Batch.create({
      tenant: tenant._id,
      name: trimmedName,
      department
    });

    return res.status(201).json({
      success: true,
      message: "Batch created successfully",
      data: batch
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getBatches = async (req, res) => {
  try {
    const { department, status } = req.query;
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

    if (status) {
      matchStage.status = status;
    }

    const batches = await Batch.aggregate([
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
      { $unwind: "$department" },
      {
        $lookup: {
          from: "sections",
          let: { batchId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$tenant", tenant._id] },
                    { $eq: ["$batch", "$$batchId"] }
                  ]
                }
              }
            }
          ],
          as: "sections"
        }
      },
      { $addFields: { sectionCount: { $size: "$sections" } } },
      {
        $project: {
          sections: 0,
          "department.__v": 0
        }
      },
      { $sort: { name: 1 } }
    ]);

    return res.status(200).json({
      success: true,
      count: batches.length,
      data: batches
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const updateBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department } = req.body;
    const tenant = req.tenant;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch id"
      });
    }

    if (!name || !department) {
      return res.status(400).json({
        success: false,
        message: "Name and department are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(department)) {
      return res.status(400).json({
        success: false,
        message: "Invalid department id"
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

    const trimmedName = name.trim();

    const existingBatch = await Batch.findOne({
      tenant: tenant._id,
      name: trimmedName,
      department,
      _id: { $ne: id }
    });

    if (existingBatch) {
      return res.status(400).json({
        success: false,
        message: "Batch already exists in this department"
      });
    }

    const updatedBatch = await Batch.findOneAndUpdate(
      {
        _id: id,
        tenant: tenant._id
      },
      {
        name: trimmedName,
        department
      },
      {
        new: true,
        runValidators: true
      }
    ).populate("department", "name");

    if (!updatedBatch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Batch updated successfully",
      data: updatedBatch
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const tenant = req.tenant;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid batch id"
      });
    }

    const existingBatch = await Batch.findOne({
      _id: id,
      tenant: tenant._id
    });

    if (!existingBatch) {
      return res.status(404).json({
        success: false,
        message: "Batch not found"
      });
    }

    const deletedSectionsResult = await Section.deleteMany({
      tenant: tenant._id,
      batch: id
    });

    const deletedBatch = await Batch.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Batch deleted successfully",
      data: deletedBatch,
      deletedChildren: {
        sections: deletedSectionsResult.deletedCount || 0
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};