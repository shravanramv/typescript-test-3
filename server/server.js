import express from "express";
import cors from "cors";
import multer from "multer";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DuckDBManager from "./database.js";

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-here";

// Initialize database
const db = new DuckDBManager();

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth routes
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    // Check if user exists
    const existingUser = await db.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = await db.createUser({
      email,
      password: hashedPassword,
      name,
      role,
    });

    res.status(201).json({ id: userId, email, name, role });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Get user
    const user = await db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "24h" },
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Job routes
app.post("/api/jobs", authenticateToken, async (req, res) => {
  try {
    const { title, description, requirements } = req.body;
    const jobId = await db.createJob({
      title,
      description,
      requirements,
      recruiter_id: req.user.id,
      status: "active",
    });
    res.status(201).json({ id: jobId });
  } catch (error) {
    console.error("Create job error:", error);
    res.status(500).json({ error: "Failed to create job" });
  }
});

app.get("/api/jobs", async (req, res) => {
  try {
    const jobs = await db.getAllJobs();
    res.json(jobs);
  } catch (error) {
    console.error("Get jobs error:", error);
    res.status(500).json({ error: "Failed to get jobs" });
  }
});

app.get(
  "/api/jobs/recruiter/:recruiterId",
  authenticateToken,
  async (req, res) => {
    try {
      const jobs = await db.getJobsByRecruiter(req.params.recruiterId);
      res.json(jobs);
    } catch (error) {
      console.error("Get recruiter jobs error:", error);
      res.status(500).json({ error: "Failed to get recruiter jobs" });
    }
  },
);

// Resume routes
app.post(
  "/api/resumes",
  authenticateToken,
  upload.single("resume"),
  async (req, res) => {
    try {
      const { job_id, soft_skills_score, match_score } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      // Mock resume data extraction (in real implementation, parse the file)
      const resumeData = {
        fileName: file.originalname,
        fileSize: file.size,
        uploadedAt: new Date().toISOString(),
        skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
        experience: "3+ years in software development",
        education: "Bachelor's in Computer Science",
        summary:
          "Experienced software developer with expertise in full-stack development",
      };

      const resumeId = await db.saveResume({
        applicant_id: req.user.id,
        job_id,
        resume_data: resumeData,
        soft_skills_score: parseInt(soft_skills_score),
        match_score: parseInt(match_score),
      });

      res.status(201).json({ id: resumeId });
    } catch (error) {
      console.error("Save resume error:", error);
      res.status(500).json({ error: "Failed to save resume" });
    }
  },
);

app.get("/api/resumes/job/:jobId", authenticateToken, async (req, res) => {
  try {
    const resumes = await db.getResumesByJob(req.params.jobId);
    res.json(resumes);
  } catch (error) {
    console.error("Get job resumes error:", error);
    res.status(500).json({ error: "Failed to get job resumes" });
  }
});

app.get(
  "/api/resumes/applicant/:applicantId",
  authenticateToken,
  async (req, res) => {
    try {
      const resumes = await db.getResumesByApplicant(req.params.applicantId);
      res.json(resumes);
    } catch (error) {
      console.error("Get applicant resumes error:", error);
      res.status(500).json({ error: "Failed to get applicant resumes" });
    }
  },
);

// AI Analysis endpoint (mock implementation)
app.post(
  "/api/analyze-resume",
  authenticateToken,
  upload.single("resume"),
  async (req, res) => {
    try {
      const { jobDescription } = req.body;
      const file = req.file;

      if (!file || !jobDescription) {
        return res
          .status(400)
          .json({ error: "Missing file or job description" });
      }

      // Simulate AI analysis delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock analysis results
      const keywords = [
        { text: "Python", matched: Math.random() > 0.3 },
        { text: "React", matched: Math.random() > 0.3 },
        { text: "TypeScript", matched: Math.random() > 0.3 },
        { text: "Machine Learning", matched: Math.random() > 0.5 },
        { text: "Data Analysis", matched: Math.random() > 0.4 },
        { text: "AWS", matched: Math.random() > 0.6 },
        { text: "Docker", matched: Math.random() > 0.5 },
        { text: "SQL", matched: Math.random() > 0.3 },
      ];

      const skills = [
        { name: "Communication", missing: Math.random() > 0.7 },
        { name: "Leadership", missing: Math.random() > 0.6 },
        { name: "Problem Solving", missing: Math.random() > 0.8 },
        { name: "Teamwork", missing: Math.random() > 0.7 },
        { name: "Adaptability", missing: Math.random() > 0.6 },
      ];

      const matchedKeywords = keywords.filter((k) => k.matched).length;
      const matchScore = Math.round((matchedKeywords / keywords.length) * 100);
      const softSkillsScore = Math.round(Math.random() * 40 + 60);

      const suggestions = [
        "Highlight your leadership experience with specific examples",
        "Add quantifiable achievements to demonstrate impact",
        "Include more technical keywords from the job description",
        "Emphasize your problem-solving abilities with concrete examples",
        "Add soft skills that align with the company culture",
      ];

      res.json({
        softSkillsScore,
        matchScore,
        keywords,
        skills,
        suggestions,
      });
    } catch (error) {
      console.error("Resume analysis error:", error);
      res.status(500).json({ error: "Analysis failed" });
    }
  },
);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Server error:", error);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  db.close();
  process.exit(0);
});
