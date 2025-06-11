// Mock DuckDB implementation for browser compatibility

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

class DuckDBManager {
  private users: Map<string, User> = new Map();
  private jobs: Map<string, JobDescription> = new Map();
  private resumes: Map<string, Resume> = new Map();
  private usersByEmail: Map<string, User> = new Map();

  constructor() {
    // Initialize in-memory storage
  }

  // User operations
  async createUser(user: Omit<User, "id" | "created_at">): Promise<string> {
    const id = crypto.randomUUID();
    const newUser: User = {
      ...user,
      id,
      created_at: new Date().toISOString(),
    };
    this.users.set(id, newUser);
    this.usersByEmail.set(user.email, newUser);
    return id;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return this.usersByEmail.get(email) || null;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  // Job operations
  async createJob(
    job: Omit<JobDescription, "id" | "created_at">,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const newJob: JobDescription = {
      ...job,
      id,
      created_at: new Date().toISOString(),
    };
    this.jobs.set(id, newJob);
    return id;
  }

  async getAllJobs(): Promise<JobDescription[]> {
    return Array.from(this.jobs.values())
      .filter((job) => job.status === "active")
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }

  async getJobsByRecruiter(recruiterId: string): Promise<JobDescription[]> {
    return Array.from(this.jobs.values())
      .filter((job) => job.recruiter_id === recruiterId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  }

  // Resume operations
  async saveResume(
    resume: Omit<Resume, "id" | "uploaded_at">,
  ): Promise<string> {
    const id = crypto.randomUUID();
    const newResume: Resume = {
      ...resume,
      id,
      uploaded_at: new Date().toISOString(),
    };
    this.resumes.set(id, newResume);
    return id;
  }

  async getResumesByJob(jobId: string): Promise<Resume[]> {
    return Array.from(this.resumes.values())
      .filter((resume) => resume.job_id === jobId)
      .sort((a, b) => b.soft_skills_score - a.soft_skills_score);
  }

  async getResumesByApplicant(applicantId: string): Promise<Resume[]> {
    return Array.from(this.resumes.values())
      .filter((resume) => resume.applicant_id === applicantId)
      .sort(
        (a, b) =>
          new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime(),
      );
  }
}

export const duckDB = new DuckDBManager();
export type { User, JobDescription, Resume };
