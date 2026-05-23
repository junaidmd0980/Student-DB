import express from "express";
import { createBatch, getBatches, updateBatch, deleteBatch } from "../controllers/batch.controller.js";


const router = express.Router()

router.post("/", createBatch);
router.get("/", getBatches);
router.put("/:id", updateBatch);
router.delete("/:id", deleteBatch);

export default router;