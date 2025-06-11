import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../../contexts/AuthContext";
import { duckDB, JobDescription } from "../../lib/duckdb";
import { ResumeAnalyzer } from "../../lib/auth";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import ProcessingStatus from "../ProcessingStatus";
import ResultsDashboard from "../ResultsDashboard";

interface JobApplicationModalProps {
  job: JobDescription;
  isOpen: boolean;
  onClose: () => void;
  onApplicationComplete: () => void;
}

enum ApplicationState {
  UPLOAD,
  PROCESSING,
  RESULTS,
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  job,
  isOpen,
  onClose,
  onApplicationComplete,
}) => {
  const { user } = useAuth();
  const [applicationState, setApplicationState] = useState<ApplicationState>(
    ApplicationState.UPLOAD,
  );
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF or DOC/DOCX file");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size should be less than 5MB");
      return false;
    }
    setError("");
    return true;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length) {
      const file = files[0];
      if (validateFile(file)) {
        setResumeFile(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setResumeFile(file);
      }
    }
  };

  const handleSubmitApplication = async () => {
    if (!resumeFile || !user) return;

    setApplicationState(ApplicationState.PROCESSING);

    try {
      // Simulate file parsing to JSON
      const resumeData = {
        fileName: resumeFile.name,
        fileSize: resumeFile.size,
        uploadedAt: new Date().toISOString(),
        // Mock parsed data - in real implementation, this would be parsed from the file
        skills: ["JavaScript", "React", "Node.js", "Python", "SQL"],
        experience: "3+ years in software development",
        education: "Bachelor's in Computer Science",
        summary:
          "Experienced software developer with expertise in full-stack development",
      };

      // Analyze resume using mock AI service
      const analysis = await ResumeAnalyzer.analyzeResume(
        resumeData,
        job.description + " " + job.requirements,
      );

      // Save to database
      await duckDB.saveResume({
        applicant_id: user.id,
        job_id: job.id,
        resume_data: resumeData,
        soft_skills_score: analysis.softSkillsScore,
        match_score: analysis.matchScore,
      });

      setAnalysisResults(analysis);
      setApplicationState(ApplicationState.RESULTS);
    } catch (err: any) {
      setError(err.message || "Failed to submit application");
      setApplicationState(ApplicationState.UPLOAD);
    }
  };

  const handleComplete = () => {
    onApplicationComplete();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for {job.title}</DialogTitle>
        </DialogHeader>

        {applicationState === ApplicationState.UPLOAD && (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Job Overview</h3>
              <p className="text-blue-800 text-sm mb-2">{job.description}</p>
              <p className="text-blue-700 text-xs">
                <strong>Requirements:</strong> {job.requirements}
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upload Your Resume</h3>

              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  isDragging ? "border-primary bg-primary/5" : "border-border"
                } ${error ? "border-destructive" : ""}`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={handleDrop}
              >
                {!resumeFile ? (
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        Drag & drop your resume here
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, DOC or DOCX (max 5MB)
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() =>
                        document.getElementById("resume-upload-modal")?.click()
                      }
                    >
                      Browse Files
                    </Button>
                    <input
                      id="resume-upload-modal"
                      type="file"
                      className="hidden"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={handleFileChange}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div className="text-left">
                        <p className="text-sm font-medium truncate max-w-[200px]">
                          {resumeFile.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {(resumeFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setResumeFile(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSubmitApplication} disabled={!resumeFile}>
                Submit Application
              </Button>
            </div>
          </div>
        )}

        {applicationState === ApplicationState.PROCESSING && (
          <div className="py-8">
            <ProcessingStatus
              isProcessing={true}
              statusMessage="Analyzing your resume against job requirements..."
              estimatedTimeRemaining={30}
            />
          </div>
        )}

        {applicationState === ApplicationState.RESULTS && analysisResults && (
          <div className="space-y-6">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <h3 className="font-medium text-green-900 mb-2">
                Application Submitted Successfully!
              </h3>
              <p className="text-green-800 text-sm">
                Your resume has been analyzed and submitted to the recruiter.
              </p>
            </div>

            <ResultsDashboard
              matchScore={analysisResults.matchScore}
              keywords={analysisResults.keywords}
              skills={analysisResults.skills}
              suggestions={analysisResults.suggestions}
            />

            <div className="flex justify-end">
              <Button onClick={handleComplete}>Complete Application</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationModal;
