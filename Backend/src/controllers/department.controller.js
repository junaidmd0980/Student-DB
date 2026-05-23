import Department from "../models/department.model.js";
import Batch from "../models/batch.model.js";
import Section from "../models/section.model.js";

export const createDepartment = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Department name is required"
            });
        }

        const existingDepartment = await Department.findOne({ name: name.trim() });
        if (existingDepartment) {
            return res.status(400).json({
                success: false,
                message: "Department already exists"
            });
        }

        const department = await Department.create({
            name: name.trim()
        });

        res.status(201).json({
            success: true,
            message: "Department created successfully",
            data: department
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getDepartments = async (req, res) => {
  try {
    const departments = await Department.aggregate([
      {
        $lookup: {
          from: "batches",
          localField: "_id",
          foreignField: "department",
          as: "batches",
        },
      },
      {
        $addFields: {
          batchCount: { $size: "$batches" },
        },
      },
      {
        $project: {
          batches: 0,
        },
      },
      {
        $sort: { name: 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: departments.length,
      data: departments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateDepartment = async (req, res) => {
    try {
        const { id } = req.params;
        const { name } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Department name is required"
            });
        }

        const trimmedName = name.trim();

        const existingDepartment = await Department.findOne({
            name: trimmedName,
            _id: { $ne: id }
        });

        if (existingDepartment) {
            return res.status(400).json({
                success: false,
                message: "Department already exists"
            });
        }

        const updatedDepartment = await Department.findByIdAndUpdate(
            id,
            { name: trimmedName },
            { new: true, runValidators: true }
        );

        if (!updatedDepartment) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Department updated successfully",
            data: updatedDepartment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteDepartment = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Department id is required"
            });
        }

        const existingDepartment = await Department.findById(id);

        if (!existingDepartment) {
            return res.status(404).json({
                success: false,
                message: "Department not found"
            });
        }

        const deletedSectionsResult = await Section.deleteMany({ department: id });
        const deletedBatchesResult = await Batch.deleteMany({ department: id });
        const deletedDepartment = await Department.findByIdAndDelete(id);

        return res.status(200).json({
            success: true,
            message: "Department deleted successfully",
            data: deletedDepartment,
            deletedChildren: {
                batches: deletedBatchesResult.deletedCount || 0,
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