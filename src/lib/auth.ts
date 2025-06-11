import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { duckDB, User } from "./duckdb";

const JWT_SECRET = new TextEncoder().encode("your-secret-key-here"); // In production, use environment variable

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: "recruiter" | "applicant";
}

export class AuthService {
  static async register(
    email: string,
    password: string,
    name: string,
    role: "recruiter" | "applicant",
  ): Promise<AuthUser> {
    // Check if user already exists
    const existingUser = await duckDB.getUserByEmail(email);
    if (existingUser) {
      throw new Error("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = await duckDB.createUser({
      email,
      password: hashedPassword,
      name,
      role,
    });

    return {
      id: userId,
      email,
      name,
      role,
    };
  }

  static async login(
    email: string,
    password: string,
  ): Promise<{ user: AuthUser; token: string }> {
    // Get user by email
    const user = await duckDB.getUserByEmail(email);
    if (!user) {
      throw new Error("Invalid email or password");
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new Error("Invalid email or password");
    }

    // Generate JWT token
    const token = await new SignJWT({
      id: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    };
  }

  static async verifyToken(token: string): Promise<AuthUser> {
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);
      return {
        id: payload.id as string,
        email: payload.email as string,
        name: payload.name as string,
        role: payload.role as "recruiter" | "applicant",
      };
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}

// Mock Python model for soft skills ranking
export class ResumeAnalyzer {
  static async analyzeResume(
    resumeData: any,
    jobDescription: string,
  ): Promise<{
    softSkillsScore: number;
    matchScore: number;
    keywords: Array<{ text: string; matched: boolean }>;
    skills: Array<{ name: string; missing: boolean }>;
    suggestions: string[];
  }> {
    // Simulate API call delay
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
    const softSkillsScore = Math.round(Math.random() * 40 + 60); // 60-100

    const suggestions = [
      "Highlight your leadership experience with specific examples",
      "Add quantifiable achievements to demonstrate impact",
      "Include more technical keywords from the job description",
      "Emphasize your problem-solving abilities with concrete examples",
      "Add soft skills that align with the company culture",
    ];

    return {
      softSkillsScore,
      matchScore,
      keywords,
      skills,
      suggestions,
    };
  }
}
