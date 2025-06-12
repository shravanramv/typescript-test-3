// DuckDB integration for local development
import DuckDB from "duckdb";
import { randomUUID } from "crypto";

class DuckDBManager {
  constructor() {
    this.db = new DuckDB.Database("resume_scanner.duckdb");
    this.init();
  }

  async init() {
    try {
      await this.createTables();
      console.log("DuckDB initialized successfully");
    } catch (error) {
      console.error("Failed to initialize DuckDB:", error);
      console.log("Server will continue without database connection");
    }
  }

  async createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        role VARCHAR NOT NULL CHECK (role IN ('recruiter', 'applicant')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS job_descriptions (
        id VARCHAR PRIMARY KEY,
        title VARCHAR NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT NOT NULL,
        recruiter_id VARCHAR NOT NULL,
        status VARCHAR NOT NULL CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recruiter_id) REFERENCES users(id)
      )`,

      `CREATE TABLE IF NOT EXISTS resumes (
        id VARCHAR PRIMARY KEY,
        applicant_id VARCHAR NOT NULL,
        job_id VARCHAR NOT NULL,
        resume_data VARCHAR NOT NULL, -- JSON as string
        soft_skills_score INTEGER NOT NULL,
        match_score INTEGER NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (applicant_id) REFERENCES users(id),
        FOREIGN KEY (job_id) REFERENCES job_descriptions(id)
      )`
    ];

    for (const query of queries) {
      await this.executeQuery(query);
    }
  }

  executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(query, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  // User operations
  async createUser(userData) {
    const { email, password, name, role } = userData;
    const id = randomUUID();
    const query = `INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)`;
    await this.executeQuery(query, [id, email, password, name, role]);
    return id;
  }

  async getUserByEmail(email) {
    const query = `SELECT * FROM users WHERE email = ?`;
    const rows = await this.executeQuery(query, [email]);
    return rows.length > 0 ? rows[0] : null;
  }

  async getUserById(id) {
    const query = `SELECT * FROM users WHERE id = ?`;
    const rows = await this.executeQuery(query, [id]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Job operations
  async createJob(jobData) {
    const { title, description, requirements, recruiter_id, status } = jobData;
    const id = randomUUID();
    const query = `INSERT INTO job_descriptions (id, title, description, requirements, recruiter_id, status) VALUES (?, ?, ?, ?, ?, ?)`;
    await this.executeQuery(query, [id, title, description, requirements, recruiter_id, status]);
    return id;
  }

  async getAllJobs() {
    const query = `SELECT * FROM job_descriptions WHERE status = 'active' ORDER BY created_at DESC`;
    return await this.executeQuery(query);
  }

  async getJobsByRecruiter(recruiterId) {
    const query = `SELECT * FROM job_descriptions WHERE recruiter_id = ? ORDER BY created_at DESC`;
    return await this.executeQuery(query, [recruiterId]);
  }

  // Resume operations
  async saveResume(resumeData) {
    const { applicant_id, job_id, resume_data, soft_skills_score, match_score } = resumeData;
    const id = randomUUID();
    const query = `INSERT INTO resumes (id, applicant_id, job_id, resume_data, soft_skills_score, match_score) VALUES (?, ?, ?, ?, ?, ?)`;
    await this.executeQuery(query, [
      id,
      applicant_id,
      job_id,
      JSON.stringify(resume_data),
      soft_skills_score,
      match_score
    ]);
    return id;
  }

  async getResumesByJob(jobId) {
    const query = `SELECT * FROM resumes WHERE job_id = ?`;
    return await this.executeQuery(query, [jobId]);
  }

  async getResumesByApplicant(applicantId) {
    const query = `SELECT * FROM resumes WHERE applicant_id = ?`;
    return await this.executeQuery(query, [applicantId]);
  }

  async close() {
    // DuckDB closes automatically on process exit
  }
}

export default DuckDBManager;