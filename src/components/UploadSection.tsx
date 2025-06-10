import React, { useState, useCallback } from "react";
import { Upload, FileText, X, Check, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Card, CardContent } from "./ui/card";
import { Progress } from "./ui/progress";

interface UploadSectionProps {
  onSubmit: (resumeFile: File, jobDescription: string) => void;
  isProcessing?: boolean;
}

const UploadSection = ({
  onSubmit,
  isProcessing = false,
}: UploadSectionProps) => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File): boolean => {
    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!validTypes.includes(file.type)) {
      setFileError("Please upload a PDF or DOC/DOCX file");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setFileError("File size should be less than 5MB");
      return false;
    }
    setFileError("");
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
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
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (validateFile(file)) {
        setResumeFile(file);
      }
    }
  };

  const handleRemoveFile = () => {
    setResumeFile(null);
    setFileError("");
  };

  const handleSubmit = () => {
    if (!resumeFile) {
      setFileError("Please upload a resume file");
      return;
    }
    if (!jobDescription.trim()) {
      return;
    }
    onSubmit(resumeFile, jobDescription);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-background">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Upload Resume & Job Description
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Resume Upload Section */}
        <Card className="bg-card">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Resume Upload</h3>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? "border-primary bg-primary/5" : "border-border"} ${fileError ? "border-destructive" : ""}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
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
                      document.getElementById("resume-upload")?.click()
                    }
                  >
                    Browse Files
                  </Button>
                  <input
                    id="resume-upload"
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
                  <Button variant="ghost" size="sm" onClick={handleRemoveFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {fileError && (
              <p className="text-destructive text-sm mt-2">{fileError}</p>
            )}
          </CardContent>
        </Card>

        {/* Job Description Section */}
        <Card className="bg-card">
          <CardContent className="pt-6">
            <h3 className="text-lg font-semibold mb-4">Job Description</h3>
            <Textarea
              placeholder="Paste the job description here..."
              className="min-h-[200px]"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={isProcessing}
            />
            {jobDescription.trim() === "" && (
              <p className="text-amber-500 text-sm mt-2">
                Job description is required
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <div className="mt-8 flex justify-center">
        <Button
          className="w-full max-w-xs"
          size="lg"
          onClick={handleSubmit}
          disabled={!resumeFile || jobDescription.trim() === "" || isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="mr-2">Processing</span>
              <Progress value={65} className="w-16 h-2" />
            </>
          ) : (
            <>
              Analyze Resume
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default UploadSection;
