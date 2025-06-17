import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "../../contexts/AuthContext";
import { postgresDB, JobDescription, Resume } from "../../lib/sqlite";
import { User, Briefcase, FileText, LogOut, Search } from "lucide-react";
import JobList from "./JobList";
import ApplicationHistory from "./ApplicationHistory";

const ApplicantDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [jobs, setJobs] = useState<JobDescription[]>([]);
  const [applications, setApplications] = useState<Resume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    try {
      const [jobList, applicationList] = await Promise.all([
        postgresDB.getAllJobs(),
        postgresDB.getResumesByApplicant(user.id),
      ]);
      setJobs(jobList);
      setApplications(applicationList);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationSubmitted = () => {
    loadData(); // Refresh data after new application
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <User className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Job Search Dashboard
                </h1>
                <p className="text-gray-600">Welcome back, {user?.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {applications.length} Application
                {applications.length !== 1 ? "s" : ""} Submitted
              </div>
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
            <TabsTrigger value="jobs" className="flex items-center space-x-2">
              <Search className="h-4 w-4" />
              <span>Browse Jobs</span>
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="flex items-center space-x-2"
            >
              <FileText className="h-4 w-4" />
              <span>My Applications</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Available Positions
                </h2>
                <p className="text-gray-600">Find your next opportunity</p>
              </div>
              <div className="text-sm text-gray-600">
                {jobs.length} job{jobs.length !== 1 ? "s" : ""} available
              </div>
            </div>

            <JobList
              jobs={jobs}
              appliedJobs={applications.map((app) => app.job_id)}
              onApplicationSubmitted={handleApplicationSubmitted}
            />
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Application History
              </h2>
              <p className="text-gray-600">
                Track your job applications and their status
              </p>
            </div>

            <ApplicationHistory applications={applications} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ApplicantDashboard;
