import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import authRouter from "./routes/auth.route.js"
import tenantRouter from "./routes/tenant.route.js"
import batchRouter from "./routes/batch.route.js";
import departmentRouter from "./routes/depertment.route.js";
import sectionRouter from "./routes/section.route.js";
import studentRouter from "./routes/student.route.js";
import labSessionRouter from "./routes/labSession.route.js";
import { register } from "./controllers/auth.controller.js";


const app = express()

app.use(cors({
  origin: [process.env.VITE_API_FRONTEND_URL, process.env.VITE_API_CUSTOM_DOMAIN, "http://localhost:5173"], 
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization", "X-Tenant-Id"],
}));

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRouter);
app.use("/api/tenants", tenantRouter);
app.use("/api/departments", departmentRouter);
app.use("/api/batches", batchRouter);
app.use("/api/sections", sectionRouter);
app.use("/api/students", studentRouter);
app.use("/api/lab-sessions", labSessionRouter);

export default app;