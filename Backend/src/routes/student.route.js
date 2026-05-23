import express from "express";
import { 
    createStudent,
    getStudents,
    getDepartmentStudents,
    getStudentById,
    updateStudent,
    deleteStudent
 } from "../controllers/student.controller.js";

 const router = express.Router();

 router.post("/", createStudent);
 router.get("/", getStudents);
 router.get("/department/:departmentId", getDepartmentStudents);
 router.get("/:id", getStudentById);
 router.put("/:id", updateStudent);
 router.delete("/:id", deleteStudent);


 export default router;