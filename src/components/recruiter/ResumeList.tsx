import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Resume } from "../../lib/duckdb";
import { User, Star, Download, Eye } from "lucide-react";

interface ResumeListProps {
  resumes: Resume[];
}

const ResumeList: React.FC<ResumeListProps> = ({ resumes }) => {
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

  if (resumes.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No applications yet
          </h3>
          <p className="text-gray-600">
            Applications will appear here once candidates start applying.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {resumes.length} Application{resumes.length !== 1 ? "s" : ""} Received
        </h3>
        <div className="text-sm text-gray-600">Sorted by Soft Skills Score</div>
      </div>

      {resumes.map((resume, index) => (
        <Card key={resume.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 rounded-full p-2">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">
                    {(resume as any).applicant_name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    Applied {new Date(resume.uploaded_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={getScoreBadgeVariant(resume.soft_skills_score)}>
                  #{index + 1} Ranked
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
                    <span className="text-sm font-medium">
                      Soft Skills Score
                    </span>
                    <span
                      className={`text-sm font-bold ${getScoreColor(resume.soft_skills_score)}`}
                    >
                      {resume.soft_skills_score}%
                    </span>
                  </div>
                  <Progress value={resume.soft_skills_score} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Match</span>
                    <span
                      className={`text-sm font-bold ${getScoreColor(resume.match_score)}`}
                    >
                      {resume.match_score}%
                    </span>
                  </div>
                  <Progress value={resume.match_score} className="h-2" />
                </div>
              </div>

              {/* Resume Preview */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-gray-900">
                  Resume Highlights
                </h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>
                      <strong>Skills:</strong>{" "}
                      {resume.resume_data.skills?.slice(0, 3).join(", ") ||
                        "Not specified"}
                    </p>
                    <p>
                      <strong>Experience:</strong>{" "}
                      {resume.resume_data.experience || "Not specified"}
                    </p>
                    <p>
                      <strong>Education:</strong>{" "}
                      {resume.resume_data.education || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">
                  Ranked #{index + 1} by AI analysis
                </span>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  Download
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ResumeList;
