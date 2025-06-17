import Database from 'better-sqlite3';
import path from 'path';

// Create database file in server directory
const dbPath = path.join(process.cwd(), 'server', 'app.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
export function initializeDatabase() {
    // Create applicants table
    const createApplicantsTable = `
    CREATE TABLE IF NOT EXISTS applicants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      resume_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

    // Create recruiters table
    const createRecruitersTable = `
    CREATE TABLE IF NOT EXISTS recruiters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      company_name TEXT NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      company_website TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

    // Create sessions table for authentication
    const createSessionsTable = `
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      user_type TEXT NOT NULL CHECK (user_type IN ('applicant', 'recruiter')),
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `;

    // Execute table creation
    db.exec(createApplicantsTable);
    db.exec(createRecruitersTable);
    db.exec(createSessionsTable);

    console.log('SQLite database initialized successfully');
}

// Applicant operations
export const applicantQueries = {
    // Create new applicant
    create: db.prepare(`
    INSERT INTO applicants (email, password, first_name, last_name, phone, resume_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `),

    // Find applicant by email
    findByEmail: db.prepare(`
    SELECT * FROM applicants WHERE email = ?
  `),

    // Find applicant by ID
    findById: db.prepare(`
    SELECT * FROM applicants WHERE id = ?
  `),

    // Update applicant
    update: db.prepare(`
    UPDATE applicants 
    SET first_name = ?, last_name = ?, phone = ?, resume_url = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

    // Update password
    updatePassword: db.prepare(`
    UPDATE applicants 
    SET password = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
};

// Recruiter operations
export const recruiterQueries = {
    // Create new recruiter
    create: db.prepare(`
    INSERT INTO recruiters (email, password, company_name, first_name, last_name, phone, company_website)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),

    // Find recruiter by email
    findByEmail: db.prepare(`
    SELECT * FROM recruiters WHERE email = ?
  `),

    // Find recruiter by ID
    findById: db.prepare(`
    SELECT * FROM recruiters WHERE id = ?
  `),

    // Update recruiter
    update: db.prepare(`
    UPDATE recruiters 
    SET company_name = ?, first_name = ?, last_name = ?, phone = ?, company_website = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

    // Update password
    updatePassword: db.prepare(`
    UPDATE recruiters 
    SET password = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `)
};

// Session operations
export const sessionQueries = {
    // Create session
    create: db.prepare(`
    INSERT INTO sessions (id, user_id, user_type, expires_at)
    VALUES (?, ?, ?, ?)
  `),

    // Find session by ID
    findById: db.prepare(`
    SELECT * FROM sessions WHERE id = ?
  `),

    // Delete session
    delete: db.prepare(`
    DELETE FROM sessions WHERE id = ?
  `),

    // Delete expired sessions
    deleteExpired: db.prepare(`
    DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP
  `),

    // Delete all sessions for user
    deleteAllForUser: db.prepare(`
    DELETE FROM sessions WHERE user_id = ? AND user_type = ?
  `)
};

// Helper functions
export function closeDatabase() {
    db.close();
}

export function runTransaction(fn: () => void) {
    const transaction = db.transaction(fn);
    return transaction();
}

// Initialize database on import
initializeDatabase();

export default db;