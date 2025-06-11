import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Resume } from "../../lib/duckdb";
import { FileText, Calendar, TrendingUp, Star } from "lucide-react";

interface ApplicationHistoryProps {
  applications: Resume[];
}

const ApplicationHistory: React.FC<ApplicationHistoryProps> = ({
  applications,
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (applications.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No applications yet
          </h3>
          <p className="text-gray-600">
            Your job applications will appear here once you start applying.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {applications.length} Application
          {applications.length !== 1 ? "s" : ""} Submitted
        </h3>
        <div className="text-sm text-gray-600">
          Average Match Score:{" "}
          {Math.round(
            applications.reduce((sum, app) => sum + app.match_score, 0) /
              applications.length,
          )}
          %
        </div>
      </div>

      {applications.map((application) => (
        <Card
          key={application.id}
          className="hover:shadow-md transition-shadow"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {(application as any).job_title}
                  </CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Applied{" "}
                        {new Date(application.uploaded_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getScoreBadgeVariant(application.match_score)}>
                  {application.match_score}% Match
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Scores Section */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      Overall Match Score
                    </span>
                    <span
                      className={`text-sm font-bold ${getScoreColor(application.match_score)}`}
                    >
                      {application.match_score}%
                    </span>
                  </div>
                  <Progress value={application.match_score} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Soft Skills Score
                    </span>
                    <span
                      className={`text-sm font-bold ${getScoreColor(application.soft_skills_score)}`}
                    >
                      {application.soft_skills_score}%
                    </span>
                  </div>
                  <Progress
                    value={application.soft_skills_score}
                    className="h-2"
                  />
                </div>
              </div>

              {/* Application Details */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Application Details
                </h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      <strong>Resume:</strong>{" "}
                      {application.resume_data.fileName}
                    </p>
                    <p>
                      <strong>File Size:</strong>{" "}
                      {(application.resume_data.fileSize / 1024 / 1024).toFixed(
                        2,
                      )}{" "}
                      MB
                    </p>
                    <p>
                      <strong>Skills Highlighted:</strong>{" "}
                      {application.resume_data.skills?.slice(0, 3).join(", ")}
                    </p>
                    <p>
                      <strong>Status:</strong>{" "}
                      <span className="text-blue-600">Under Review</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="mt-6 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">AI Analysis:</span> Your resume
                  shows strong alignment with the job requirements
                </div>
                <div className="text-xs text-gray-500">
                  Application ID: {application.id.slice(0, 8)}...
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ApplicationHistory;
