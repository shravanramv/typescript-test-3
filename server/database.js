const Database = require("duckdb").Database;
const path = require("path");

class DuckDBManager {
  constructor() {
    this.db = null;
    this.connection = null;
    this.init();
  }

  async init() {
    try {
      // Create database file in server directory
      const dbPath = path.join(__dirname, "resume_scanner.db");
      this.db = new Database(dbPath);
      this.connection = this.db.connect();

      await this.createTables();
      console.log("DuckDB initialized successfully");
    } catch (error) {
      console.error("Failed to initialize DuckDB:", error);
      throw error;
    }
  }

  async createTables() {
    const queries = [
      `CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY,
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR NOT NULL,
        name VARCHAR NOT NULL,
        role VARCHAR CHECK (role IN ('recruiter', 'applicant')) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )`,

      `CREATE TABLE IF NOT EXISTS job_descriptions (
        id VARCHAR PRIMARY KEY,
        title VARCHAR NOT NULL,
        description TEXT NOT NULL,
        requirements TEXT NOT NULL,
        recruiter_id VARCHAR NOT NULL,
        status VARCHAR CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (recruiter_id) REFERENCES users(id)
      )`,

      `CREATE TABLE IF NOT EXISTS resumes (
        id VARCHAR PRIMARY KEY,
        applicant_id VARCHAR NOT NULL,
        job_id VARCHAR NOT NULL,
        resume_data JSON NOT NULL,
        soft_skills_score INTEGER NOT NULL,
        match_score INTEGER NOT NULL,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (applicant_id) REFERENCES users(id),
        FOREIGN KEY (job_id) REFERENCES job_descriptions(id)
      )`,
    ];

    for (const query of queries) {
      await this.executeQuery(query);
    }
  }

  executeQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.connection.all(query, ...params, (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  // User operations
  async createUser(userData) {
    const { email, password, name, role } = userData;
    const id = require("crypto").randomUUID();

    const query = `INSERT INTO users (id, email, password, name, role) VALUES (?, ?, ?, ?, ?)`;
    await this.executeQuery(query, [id, email, password, name, role]);
    return id;
  }

  async getUserByEmail(email) {
    const query = `SELECT * FROM users WHERE email = ?`;
    const result = await this.executeQuery(query, [email]);
    return result.length > 0 ? result[0] : null;
  }

  async getUserById(id) {
    const query = `SELECT * FROM users WHERE id = ?`;
    const result = await this.executeQuery(query, [id]);
    return result.length > 0 ? result[0] : null;
  }

  // Job operations
  async createJob(jobData) {
    const { title, description, requirements, recruiter_id, status } = jobData;
    const id = require("crypto").randomUUID();

    const query = `INSERT INTO job_descriptions (id, title, description, requirements, recruiter_id, status) VALUES (?, ?, ?, ?, ?, ?)`;
    await this.executeQuery(query, [
      id,
      title,
      description,
      requirements,
      recruiter_id,
      status,
    ]);
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
    const {
      applicant_id,
      job_id,
      resume_data,
      soft_skills_score,
      match_score,
    } = resumeData;
    const id = require("crypto").randomUUID();

    const query = `INSERT INTO resumes (id, applicant_id, job_id, resume_data, soft_skills_score, match_score) VALUES (?, ?, ?, ?, ?, ?)`;
    await this.executeQuery(query, [
      id,
      applicant_id,
      job_id,
      JSON.stringify(resume_data),
      soft_skills_score,
      match_score,
    ]);
    return id;
  }

  async getResumesByJob(jobId) {
    const query = `
      SELECT r.*, u.name as applicant_name, j.title as job_title 
      FROM resumes r 
      JOIN users u ON r.applicant_id = u.id 
      JOIN job_descriptions j ON r.job_id = j.id 
      WHERE r.job_id = ? 
      ORDER BY r.soft_skills_score DESC
    `;
    const result = await this.executeQuery(query, [jobId]);
    return result.map((row) => ({
      ...row,
      resume_data: JSON.parse(row.resume_data),
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
    const result = await this.executeQuery(query, [applicantId]);
    return result.map((row) => ({
      ...row,
      resume_data: JSON.parse(row.resume_data),
    }));
  }

  close() {
    if (this.connection) {
      this.connection.close();
    }
    if (this.db) {
      this.db.close();
    }
  }
}

module.exports = DuckDBManager;
