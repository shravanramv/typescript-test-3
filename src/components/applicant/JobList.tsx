import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { JobDescription } from "../../lib/duckdb";
import { Briefcase, MapPin, Clock, CheckCircle } from "lucide-react";
import JobApplicationModal from "./JobApplicationModal";

interface JobListProps {
  jobs: JobDescription[];
  appliedJobs: string[];
  onApplicationSubmitted: () => void;
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  appliedJobs,
  onApplicationSubmitted,
}) => {
  const [selectedJob, setSelectedJob] = useState<JobDescription | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);

  const handleApplyClick = (job: JobDescription) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
  };

  const handleApplicationComplete = () => {
    setShowApplicationModal(false);
    setSelectedJob(null);
    onApplicationSubmitted();
  };

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No jobs available
          </h3>
          <p className="text-gray-600">
            Check back later for new opportunities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {jobs.map((job) => {
          const hasApplied = appliedJobs.includes(job.id);

          return (
            <Card key={job.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          Posted {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <Badge
                      variant={
                        job.status === "active" ? "default" : "secondary"
                      }
                    >
                      {job.status}
                    </Badge>
                    {hasApplied && (
                      <Badge
                        variant="outline"
                        className="text-green-600 border-green-600"
                      >
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Applied
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Job Description
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-3">
                      {job.description}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">
                      Requirements
                    </h4>
                    <p className="text-gray-600 text-sm line-clamp-2">
                      {job.requirements}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-gray-500">
                      Job ID: {job.id.slice(0, 8)}...
                    </div>
                    <Button
                      onClick={() => handleApplyClick(job)}
                      disabled={hasApplied || job.status !== "active"}
                      className={
                        hasApplied ? "bg-green-600 hover:bg-green-700" : ""
                      }
                    >
                      {hasApplied ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Applied
                        </>
                      ) : (
                        "Apply Now"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {showApplicationModal && selectedJob && (
        <JobApplicationModal
          job={selectedJob}
          isOpen={showApplicationModal}
          onClose={() => setShowApplicationModal(false)}
          onApplicationComplete={handleApplicationComplete}
        />
      )}
    </>
  );
};

export default JobList;
