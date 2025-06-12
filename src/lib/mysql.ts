// API client for MySQL backend (API endpoints remain the same)

export interface User {
    id: string;
    email: string;
    password: string;
    role: "recruiter" | "applicant";
    name: string;
    created_at: string;
}

export interface JobDescription {
    id: string;
    title: string;
    description: string;
    requirements: string;
    recruiter_id: string;
    created_at: string;
    status: "active" | "inactive";
}

export interface Resume {
    id: string;
    applicant_id: string;
    job_id: string;
    resume_data: any;
    soft_skills_score: number;
    match_score: number;
    uploaded_at: string;
}

class MySQLAPIClient {
    private baseURL: string;

    constructor() {
        this.baseURL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";
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
            const error = await response.json().catch(() => ({ error: "Network error" }));
            throw new Error(error.error || "API request failed");
        }

        return response.json();
    }

    async createUser(user: Omit<User, "id" | "created_at">): Promise<string> {
        const result = await this.fetchAPI("/auth/register", {
            method: "POST",
            body: JSON.stringify(user),
        });
        return result.id;
    }

    async getUserById(id: string): Promise<User | null> {
        try {
            return await this.fetchAPI(`/users/${id}`);
        } catch {
            return null;
        }
    }

    async createJob(job: Omit<JobDescription, "id" | "created_at">): Promise<string> {
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

    async saveResume(resume: Omit<Resume, "id" | "uploaded_at">): Promise<string> {
        const result = await this.fetchAPI("/resumes", {
            method: "POST",
            body: JSON.stringify(resume),
        });
        return result.id;
    }

    async getResumesByJob(jobId: string): Promise<Resume[]> {
        return await this.fetchAPI(`/resumes/job/${jobId}`);
    }

    async getResumesByApplicant(applicantId: string): Promise<Resume[]> {
        return await this.fetchAPI(`/resumes/applicant/${applicantId}`);
    }
}

export const mysqlAPI = new MySQLAPIClient();
