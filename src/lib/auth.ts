import { duckDB, User } from "./duckdb";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "recruiter" | "applicant";
}

export class AuthService {
  private static baseURL =
    import.meta.env.VITE_API_URL || "http://localhost:3001/api";

  static async register(
    email: string,
    password: string,
    name: string,
    role: "recruiter" | "applicant",
  ): Promise<AuthUser> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, name, role }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Registration failed" }));
      throw new Error(error.error || "Registration failed");
    }

    const userData = await response.json();
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      role: userData.role,
    };
  }

  static async login(
    email: string,
    password: string,
  ): Promise<{ user: AuthUser; token: string }> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Login failed" }));
      throw new Error(error.error || "Invalid email or password");
    }

    const data = await response.json();
    return {
      user: data.user,
      token: data.token,
    };
  }

  static async verifyToken(token: string): Promise<AuthUser> {
    try {
      // Decode JWT token (basic implementation)
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Check if token is expired
      if (payload.exp && payload.exp < Date.now() / 1000) {
        throw new Error("Token expired");
      }

      return {
        id: payload.id,
        email: payload.email,
        name: payload.name || "",
        role: payload.role,
      };
    } catch (error) {
      throw new Error("Invalid token");
    }
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

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${this.baseURL}/analyze-resume`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
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
