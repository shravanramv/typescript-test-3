const Database = require('better-sqlite3');
const path = require('path');
const bcrypt = require('bcrypt');

// Create database file in server directory
const dbPath = path.join(__dirname, 'app.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database tables
function initializeDatabase() {
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

  // Create sessions table
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

// Prepared statements for better performance
const queries = {
  // Applicant queries
  applicant: {
    create: db.prepare(`
      INSERT INTO applicants (email, password, first_name, last_name, phone, resume_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `),
    findByEmail: db.prepare(`SELECT * FROM applicants WHERE email = ?`),
    findById: db.prepare(`SELECT * FROM applicants WHERE id = ?`),
    update: db.prepare(`
      UPDATE applicants 
      SET first_name = ?, last_name = ?, phone = ?, resume_url = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    updatePassword: db.prepare(`
      UPDATE applicants 
      SET password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
  },

  // Recruiter queries
  recruiter: {
    create: db.prepare(`
      INSERT INTO recruiters (email, password, company_name, first_name, last_name, phone, company_website)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `),
    findByEmail: db.prepare(`SELECT * FROM recruiters WHERE email = ?`),
    findById: db.prepare(`SELECT * FROM recruiters WHERE id = ?`),
    update: db.prepare(`
      UPDATE recruiters 
      SET company_name = ?, first_name = ?, last_name = ?, phone = ?, company_website = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `),
    updatePassword: db.prepare(`
      UPDATE recruiters 
      SET password = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
  },

  // Session queries
  session: {
    create: db.prepare(`
      INSERT INTO sessions (id, user_id, user_type, expires_at)
      VALUES (?, ?, ?, ?)
    `),
    findById: db.prepare(`SELECT * FROM sessions WHERE id = ?`),
    delete: db.prepare(`DELETE FROM sessions WHERE id = ?`),
    deleteExpired: db.prepare(`DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP`),
    deleteAllForUser: db.prepare(`DELETE FROM sessions WHERE user_id = ? AND user_type = ?`)
  }
};

// Authentication functions
async function registerApplicant(email, password, firstName, lastName, phone = null, resumeUrl = null) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = queries.applicant.create.run(email, hashedPassword, firstName, lastName, phone, resumeUrl);
    return { success: true, userId: result.lastInsertRowid };
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: 'Email already exists' };
    }
    return { success: false, error: error.message };
  }
}

async function registerRecruiter(email, password, companyName, firstName, lastName, phone = null, companyWebsite = null) {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = queries.recruiter.create.run(email, hashedPassword, companyName, firstName, lastName, phone, companyWebsite);
    return { success: true, userId: result.lastInsertRowid };
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return { success: false, error: 'Email already exists' };
    }
    return { success: false, error: error.message };
  }
}

async function loginUser(email, password, userType) {
  try {
    const query = userType === 'applicant' ? queries.applicant.findByEmail : queries.recruiter.findByEmail;
    const user = query.get(email);

    if (!user) {
      return { success: false, error: 'Invalid credentials' };
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return { success: false, error: 'Invalid credentials' };
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Session management
function createSession(userId, userType) {
  const sessionId = require('crypto').randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  queries.session.create.run(sessionId, userId, userType, expiresAt.toISOString());
  return sessionId;
}

function getSession(sessionId) {
  return queries.session.findById.get(sessionId);
}

function deleteSession(sessionId) {
  queries.session.delete.run(sessionId);
}

function cleanupExpiredSessions() {
  queries.session.deleteExpired.run();
}

// Initialize database on module load
initializeDatabase();

// Cleanup expired sessions every hour
setInterval(cleanupExpiredSessions, 60 * 60 * 1000);

module.exports = {
  db,
  queries,
  registerApplicant,
  registerRecruiter,
  loginUser,
  createSession,
  getSession,
  deleteSession,
  cleanupExpiredSessions
};