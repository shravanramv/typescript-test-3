import pkg from "pg";
const { Pool } = pkg;
import { randomUUID } from "crypto";

class PostgreSQLManager {
  constructor() {
    this.pool = null;
    this.init();
  }

  async init() {
    try {
      // Initialize PostgreSQL connection pool
      this.pool = new Pool({
        connectionString:
          process.env.DATABASE_URL ||
          "postgresql://postgres:password@localhost:5432/resume_scanner",
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || "resume_scanner",
        user: process.env.DB_USER || "postgres",
        password: process.env.DB_PASSWORD || "password",
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      });

      await this.createTables();
      console.log("PostgreSQL initialized successfully");
    } catch (error) {
      console.error("Failed to initialize PostgreSQL:", error);
      // Don't throw error to allow server to start without DB
      console.log("Server will continue without database connection");
    }
  }

  async createTables() {
    if (!this.pool) return;

    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) CHECK (role IN ('recruiter', 'applicant')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS job_descriptions (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT NOT NULL,
        recruiter_id VARCHAR(255) NOT NULL,
        status VARCHAR(50) CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recruiter_id) REFERENCES users(id)
      )`,

      `CREATE TABLE IF NOT EXISTS resumes (
        id VARCHAR(255) PRIMARY KEY,
        applicant_id VARCHAR(255) NOT NULL,
        job_id VARCHAR(255) NOT NULL,
        resume_data JSONB NOT NULL,
        soft_skills_score INTEGER NOT NULL,
        match_score INTEGER NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (applicant_id) REFERENCES users(id),
        FOREIGN KEY (job_id) REFERENCES job_descriptions(id)
      )`,
    ];

    for (const query of queries) {
      try {
        await this.executeQuery(query);
      } catch (error) {
        console.error("Error creating table:", error);
      }
    }
  }

  async executeQuery(query, params = []) {
    if (!this.pool) {
      throw new Error("Database not connected");
    }

    const client = await this.pool.connect();
    try {
      const result = await client.query(query, params);
      return result.rows;
    } finally {
      client.release();
    }
  }

  // User operations
  async createUser(userData) {
    const { email, password, name, role } = userData;
    const id = randomUUID();

    const query = `INSERT INTO users (id, email, password, name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id`;
    const result = await this.executeQuery(query, [
      id,
      email,
      password,
      name,
      role,
    ]);
    return result[0].id;
  }

  async getUserByEmail(email) {
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await this.executeQuery(query, [email]);
    return result.length > 0 ? result[0] : null;
  }

  async getUserById(id) {
    const query = `SELECT * FROM users WHERE id = $1`;
    const result = await this.executeQuery(query, [id]);
    return result.length > 0 ? result[0] : null;
  }

  // Job operations
  async createJob(jobData) {
    const { title, description, requirements, recruiter_id, status } = jobData;
    const id = randomUUID();

    const query = `INSERT INTO job_descriptions (id, title, description, requirements, recruiter_id, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    const result = await this.executeQuery(query, [
      id,
      title,
      description,
      requirements,
      recruiter_id,
      status,
    ]);
    return result[0].id;
  }

  async getAllJobs() {
    const query = `SELECT * FROM job_descriptions WHERE status = 'active' ORDER BY created_at DESC`;
    return await this.executeQuery(query);
  }

  async getJobsByRecruiter(recruiterId) {
    const query = `SELECT * FROM job_descriptions WHERE recruiter_id = $1 ORDER BY created_at DESC`;
    return await this.executeQuery(query, [recruiterId]);
  }

  // Resume operations
  async saveResume(resumeData) {
    const {
      applicant_id,
      job_id,
      resume_data,
      soft_skills_score,
      match_score,
    } = resumeData;
    const id = randomUUID();

    const query = `INSERT INTO resumes (id, applicant_id, job_id, resume_data, soft_skills_score, match_score) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`;
    const result = await this.executeQuery(query, [
      id,
      applicant_id,
      job_id,
      JSON.stringify(resume_data),
      soft_skills_score,
      match_score,
    ]);
    return result[0].id;
  }

  async getResumesByJob(jobId) {
    const query = `
      SELECT r.*, u.name as applicant_name, j.title as job_title 
      FROM resumes r 
      JOIN users u ON r.applicant_id = u.id 
      JOIN job_descriptions j ON r.job_id = j.id 
      WHERE r.job_id = $1 
      ORDER BY r.soft_skills_score DESC
    `;
    const result = await this.executeQuery(query, [jobId]);
    return result.map((row) => ({
      ...row,
      resume_data:
        typeof row.resume_data === "string"
          ? JSON.parse(row.resume_data)
          : row.resume_data,
    }));
  }

  async getResumesByApplicant(applicantId) {
    const query = `
      SELECT r.*, j.title as job_title 
      FROM resumes r 
      JOIN job_descriptions j ON r.job_id = j.id 
      WHERE r.applicant_id = $1 
      ORDER BY r.uploaded_at DESC
    `;
    const result = await this.executeQuery(query, [applicantId]);
    return result.map((row) => ({
      ...row,
      resume_data:
        typeof row.resume_data === "string"
          ? JSON.parse(row.resume_data)
          : row.resume_data,
    }));
  }

  async close() {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

export default PostgreSQLManager;
