// MySQL implementation for storing users, jobs, resumes

import mysql from "mysql2/promise";
import { randomUUID } from "crypto";

class MySQLManager {
  constructor() {
    this.pool = null;
    this.init();
  }

  async init() {
    try {
      this.pool = mysql.createPool({
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 3306,
        database: process.env.DB_NAME || "resume_scanner",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
      });
      await this.createTables();
      console.log("MySQL initialized successfully");
    } catch (error) {
      console.error("Failed to initialize MySQL:", error);
    }
  }

  async createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role ENUM('recruiter', 'applicant') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS job_descriptions (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT NOT NULL,
        recruiter_id VARCHAR(255) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recruiter_id) REFERENCES users(id)
      )`,
      `CREATE TABLE IF NOT EXISTS resumes (
        id VARCHAR(255) PRIMARY KEY,
        applicant_id VARCHAR(255) NOT NULL,
        job_id VARCHAR(255) NOT NULL,
        resume_data LONGTEXT NOT NULL, -- Store resume as JSON string or file URL/path
        soft_skills_score INT NOT NULL,
        match_score INT NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (applicant_id) REFERENCES users(id),
        FOREIGN KEY (job_id) REFERENCES job_descriptions(id)
      )`,
    ];
    for (const query of queries) {
      await this.executeQuery(query);
    }
  }

  async executeQuery(query, params = []) {
    if (!this.pool) throw new Error("MySQL not connected");
    const [rows] = await this.pool.execute(query, params);
    return rows;
  }

  // User operations
  async createUser({ email, password, name, role }) {
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
  async createJob({ title, description, requirements, recruiter_id, status }) {
    const id = randomUUID();
    const query = `INSERT INTO job_descriptions (id, title, description, requirements, recruiter_id, status) VALUES (?, ?, ?, ?, ?, ?)`;
    await this.executeQuery(query, [id, title, description, requirements, recruiter_id, status || "active"]);
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
  async saveResume({ applicant_id, job_id, resume_data, soft_skills_score, match_score }) {
    const id = randomUUID();
    const query = `INSERT INTO resumes (id, applicant_id, job_id, resume_data, soft_skills_score, match_score) VALUES (?, ?, ?, ?, ?, ?)`;
    await this.executeQuery(query, [
      id,
      applicant_id,
      job_id,
      typeof resume_data === "string" ? resume_data : JSON.stringify(resume_data),
      soft_skills_score,
      match_score,
    ]);
    return id;
  }

  async getResumesByJob(jobId) {
    const query = `
      SELECT r.*, u.name as applicant_name
      FROM resumes r
      JOIN users u ON r.applicant_id = u.id
      WHERE r.job_id = ?
      ORDER BY r.soft_skills_score DESC
    `;
    const rows = await this.executeQuery(query, [jobId]);
    return rows.map(row => ({
      ...row,
      resume_data: typeof row.resume_data === "string" ? JSON.parse(row.resume_data) : row.resume_data,
    }));
  }

  async getResumesByApplicant(applicantId) {
    const query = `
      SELECT r.*, j.title as job_title
      FROM resumes r
      JOIN job_descriptions j ON r.job_id = j.id
      WHERE r.applicant_id = ?
      ORDER BY r.uploaded_at DESC
    `;
    const rows = await this.executeQuery(query, [applicantId]);
    return rows.map(row => ({
      ...row,
      resume_data: typeof row.resume_data === "string" ? JSON.parse(row.resume_data) : row.resume_data,
    }));
  }

  async close() {
    if (this.pool) await this.pool.end();
  }
}

export default MySQLManager;