import express from "express";
import cors from "cors";
import batchRouter from "./routes/batch.route.js";
import departmentRouter from "./routes/depertment.route.js";
import sectionRouter from "./routes/section.route.js";
import studentRouter from "./routes/student.route.js";
import labSessionRouter from "./routes/labSession.route.js";


const app = express()

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: false
}));

app.use(express.json())

app.use("/api/departments", departmentRouter);
app.use("/api/batches", batchRouter);
app.use("/api/sections", sectionRouter);
app.use("/api/students", studentRouter);
app.use("/api/lab-sessions", labSessionRouter);

export default app;