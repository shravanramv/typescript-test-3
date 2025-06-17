// Define Job and Resume types
export interface JobDescription {
    id: number;
    title: string;
    description: string;
    created_at: string;
    recruiter_id: number;
}

export interface Resume {
    id: number;
    applicant_id: number;
    job_id: number;
    resume_url: string;
    submitted_at: string;
}

// Job and Resume operations (you may need to create these tables if not already created)
const jobQueries = {
    getAllJobs: db.prepare(`
    SELECT * FROM jobs
  `),

    getResumesByApplicant: db.prepare(`
    SELECT * FROM resumes WHERE applicant_id = ?
  `)
};

// Export combined interface
export const sqliteDB = {
    getAllJobs: () => jobQueries.getAllJobs.all() as JobDescription[],
    getResumesByApplicant: (applicantId: number) =>
        jobQueries.getResumesByApplicant.all(applicantId) as Resume[]
};
