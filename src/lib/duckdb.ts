// API client for PostgreSQL backend

interface User {
  id: string;
  email: string;
  password: string;
  role: "recruiter" | "applicant";
  name: string;
  created_at: string;
}

interface JobDescription {
  id: string;
  title: string;
  description: string;
  requirements: string;
  recruiter_id: string;
  created_at: string;
  status: "active" | "inactive";
}

interface Resume {
  id: string;
  applicant_id: string;
  job_id: string;
  resume_data: any; // JSON data
  soft_skills_score: number;
  match_score: number;
  uploaded_at: string;
}

class PostgreSQLManager {
  private baseURL: string;

  constructor() {
    this.baseURL = "https://sharp-mclean8-x66cv.view-3.tempo-dev.app/api";
  }

  private getAuthHeaders() {
    const token = localStorage.getItem("auth_token");
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async fetchAPI(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw new Error(error.error || "API request failed");
    }

    return response.json();
  }

  // User operations
  async createUser(user: Omit<User, "id" | "created_at">): Promise<string> {
    const result = await this.fetchAPI("/auth/register", {
      method: "POST",
      body: JSON.stringify(user),
    });
    return result.id;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    // This would typically be handled by the login endpoint
    // For security reasons, we don't expose user lookup by email
    return null;
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      return await this.fetchAPI(`/users/${id}`);
    } catch {
      return null;
    }
  }

  // Job operations
  async createJob(
    job: Omit<JobDescription, "id" | "created_at">,
  ): Promise<string> {
    const result = await this.fetchAPI("/jobs", {
      method: "POST",
      body: JSON.stringify(job),
    });
    return result.id;
  }

  async getAllJobs(): Promise<JobDescription[]> {
    return await this.fetchAPI("/jobs");
  }

  async getJobsByRecruiter(recruiterId: string): Promise<JobDescription[]> {
    return await this.fetchAPI(`/jobs/recruiter/${recruiterId}`);
  }

  // Resume operations
  async saveResume(
    resume: Omit<Resume, "id" | "uploaded_at">,
  ): Promise<string> {
    const result = await this.fetchAPI("/resumes", {
      method: "POST",
      body: JSON.stringify(resume),
    });
    return result.id;
  }

  async saveResumeWithFile(
    file: File,
    jobId: string,
    softSkillsScore: number,
    matchScore: number,
  ): Promise<string> {
    const formData = new FormData();
    formData.append("resume", file);
    formData.append("job_id", jobId);
    formData.append("soft_skills_score", softSkillsScore.toString());
    formData.append("match_score", matchScore.toString());

    const token = localStorage.getItem("auth_token");
    const response = await fetch(`${this.baseURL}/resumes`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ error: "Network error" }));
      throw new Error(error.error || "Failed to save resume");
    }

    const result = await response.json();
    return result.id;
  }

  async getResumesByJob(jobId: string): Promise<Resume[]> {
    return await this.fetchAPI(`/resumes/job/${jobId}`);
  }

  async getResumesByApplicant(applicantId: string): Promise<Resume[]> {
    return await this.fetchAPI(`/resumes/applicant/${applicantId}`);
  }

  // AI Analysis
  async analyzeResume(file: File, jobDescription: string) {
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
        .catch(() => ({ error: "Network error" }));
      throw new Error(error.error || "Analysis failed");
    }

    return response.json();
  }
}

export const postgresDB = new PostgreSQLManager();
export type { User, JobDescription, Resume };
