// Example usage of MySQLManager

import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import MySQLManager from "./database.js";

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";
const db = new MySQLManager();

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage() });

// Auth endpoints (register, login)
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name, role } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const id = await db.createUser({ email, password: hashedPassword, name, role });
    res.json({ id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await db.getUserByEmail(email);
  if (!user) return res.status(401).json({ error: "Invalid credentials" });
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ error: "Invalid credentials" });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET);
  res.json({ user: { id: user.id, email: user.email, role: user.role, name: user.name }, token });
});

// Job endpoints
app.post("/api/jobs", async (req, res) => {
  const { title, description, requirements, recruiter_id, status } = req.body;
  try {
    const id = await db.createJob({ title, description, requirements, recruiter_id, status });
    res.json({ id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/jobs", async (req, res) => {
  const jobs = await db.getAllJobs();
  res.json(jobs);
});

app.get("/api/jobs/recruiter/:recruiterId", async (req, res) => {
  const jobs = await db.getJobsByRecruiter(req.params.recruiterId);
  res.json(jobs);
});

// Resume endpoints
app.post("/api/resumes", upload.single("resume"), async (req, res) => {
  const { applicant_id, job_id, soft_skills_score, match_score } = req.body;
  // You can save req.file.buffer to file storage or DB, or just the metadata
  const resume_data = req.file ? req.file.buffer.toString("base64") : "{}";
  try {
    const id = await db.saveResume({ applicant_id, job_id, resume_data, soft_skills_score, match_score });
    res.json({ id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get("/api/resumes/job/:jobId", async (req, res) => {
  const resumes = await db.getResumesByJob(req.params.jobId);
  res.json(resumes);
});

app.get("/api/resumes/applicant/:applicantId", async (req, res) => {
  const resumes = await db.getResumesByApplicant(req.params.applicantId);
  res.json(resumes);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});