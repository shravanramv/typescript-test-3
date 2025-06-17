// Remove the problematic import since we're using API calls
// import { postgresDB, User } from "./sqlite";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "recruiter" | "applicant";
}

// Add interface that matches our SQLite database structure
export interface DatabaseUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string; // For recruiters
  company_website?: string; // For recruiters
  resume_url?: string; // For applicants
  created_at: string;
  updated_at: string;
}

export class AuthService {
  private static baseURL =
    import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  static async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: "recruiter" | "applicant",
    additionalData?: {
      phone?: string;
      companyName?: string;
      companyWebsite?: string;
      resumeUrl?: string;
    }
  ): Promise<AuthUser> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        lastName,
        userType: role,
        ...additionalData
      }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Registration failed" }));
      throw new Error(error.error || "Registration failed");
    }

    const data = await response.json();
    return {
      id: data.user.id.toString(),
      email: data.user.email,
      name: `${data.user.first_name} ${data.user.last_name}`,
      role: role,
    };
  }

  static async login(
    email: string,
    password: string,
    userType: "recruiter" | "applicant"
  ): Promise<{ user: AuthUser; sessionId: string }> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, userType }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Login failed" }));
      throw new Error(error.error || "Invalid email or password");
    }

    const data = await response.json();
    return {
      user: {
        id: data.user.id.toString(),
        email: data.user.email,
        name: `${data.user.first_name} ${data.user.last_name}`,
        role: userType,
      },
      sessionId: data.sessionId,
    };
  }

  static async verifySession(sessionId: string, userType: "recruiter" | "applicant"): Promise<AuthUser> {
    const response = await fetch(`${this.baseURL}/auth/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId, userType }),
    });

    if (!response.ok) {
      throw new Error("Session invalid");
    }

    const data = await response.json();
    return {
      id: data.user.id.toString(),
      email: data.user.email,
      name: `${data.user.first_name} ${data.user.last_name}`,
      role: userType,
    };
  }

  static async logout(sessionId: string): Promise<void> {
    await fetch(`${this.baseURL}/auth/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ sessionId }),
    });
  }

  // Helper method to convert database user to auth user
  static convertDatabaseUserToAuthUser(dbUser: DatabaseUser, role: "recruiter" | "applicant"): AuthUser {
    return {
      id: dbUser.id.toString(),
      email: dbUser.email,
      name: `${dbUser.first_name} ${dbUser.last_name}`,
      role: role,
    };
  }
}

// Resume analyzer using backend API
export class ResumeAnalyzer {
  private static baseURL =
    import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  static async analyzeResume(
    file: File,
    jobDescription: string,
  ): Promise<{
    softSkillsScore: number;
    matchScore: number;
    keywords: Array<{ text: string; matched: boolean }>;
    skills: Array<{ name: string; missing: boolean }>;
    suggestions: string[];
  }> {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("jobDescription", jobDescription);

    const sessionId = localStorage.getItem("sessionId");
    const response = await fetch(`${this.baseURL}/analyze-resume`, {
      method: "POST",
      headers: {
        ...(sessionId && { Authorization: `Bearer ${sessionId}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Analysis failed" }));
      throw new Error(error.error || "Resume analysis failed");
    }

    return response.json();
  }
}