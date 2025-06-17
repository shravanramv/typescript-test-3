import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "../../contexts/AuthContext";
import { postgresDB, JobDescription, Resume } from "../../lib/sqlite";
import { Plus, Briefcase, Users, Eye, LogOut } from "lucide-react";
import JobForm from "./JobForm";
import ResumeList from "./ResumeList";

const RecruiterDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [showJobForm, setShowJobForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, [user]);

  const loadJobs = async () => {
    if (!user) return;
    try {
      const jobList = await postgresDB.getJobsByRecruiter(user.id);
      setJobs(jobList);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadResumes = async (jobId: string) => {
    try {
      const resumeList = await postgresDB.getResumesByJob(jobId);
      setResumes(resumeList);
    } catch (error) {
      console.error("Error loading resumes:", error);
    }
  };

  const handleJobCreated = () => {
    setShowJobForm(false);
    loadJobs();
  };

  const handleViewResumes = (job: JobDescription) => {
    setSelectedJob(job);
    loadResumes(job.id);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (showJobForm) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Create New Job</h1>
            <Button variant="outline" onClick={() => setShowJobForm(false)}>
              Back to Dashboard
            </Button>
          </div>
          <JobForm onJobCreated={handleJobCreated} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Briefcase className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Recruiter Dashboard
                </h1>
                <p className="text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowJobForm(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Post New Job</span>
              </Button>
              <Button
                variant="outline"
                onClick={logout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="jobs" className="space-y-6">
          <TabsList>
            <TabsTrigger value="jobs">My Job Posts</TabsTrigger>
            <TabsTrigger value="resumes">Resume Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <Card
                  key={job.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{job.title}</CardTitle>
                      <Badge
                        variant={
                          job.status === "active" ? "default" : "secondary"
                        }
                      >
                        {job.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {job.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewResumes(job)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>View Resumes</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {jobs.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No job posts yet
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Create your first job posting to start receiving
                    applications.
                  </p>
                  <Button onClick={() => setShowJobForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resumes" className="space-y-6">
            {selectedJob ? (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedJob.title}
                    </h2>
                    <p className="text-gray-600">
                      Resumes received for this position
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedJob(null)}
                  >
                    Back to Jobs
                  </Button>
                </div>
                <ResumeList resumes={resumes} />
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a job to view resumes
                  </h3>
                  <p className="text-gray-600">
                    Choose a job from the "My Job Posts" tab to see
                    applications.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default RecruiterDashboard;
