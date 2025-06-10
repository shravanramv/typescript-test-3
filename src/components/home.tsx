import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UploadSection from "./UploadSection";
import ProcessingStatus from "./ProcessingStatus";
import ResultsDashboard from "./ResultsDashboard";

enum ProcessState {
  UPLOAD,
  PROCESSING,
  RESULTS,
}

const Home = () => {
  const [processState, setProcessState] = useState<ProcessState>(
    ProcessState.UPLOAD,
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [matchScore, setMatchScore] = useState<number>(0);
  const [matchedKeywords, setMatchedKeywords] = useState<string[]>([]);
  const [missingSkills, setMissingSkills] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSubmit = (file: File, description: string) => {
    setUploadedFile(file);
    setJobDescription(description);
    setProcessState(ProcessState.PROCESSING);

    // Simulate API call to Python backend
    setTimeout(() => {
      // Mock results
      setMatchScore(78);
      setMatchedKeywords([
        "Python",
        "React",
        "TypeScript",
        "UI/UX",
        "API Integration",
      ]);
      setMissingSkills(["Docker", "AWS", "CI/CD", "GraphQL"]);
      setSuggestions([
        "Add experience with containerization technologies like Docker",
        "Highlight any cloud platform experience, especially AWS",
        "Include examples of CI/CD pipeline implementation",
        "Mention any GraphQL experience or knowledge",
      ]);
      setProcessState(ProcessState.RESULTS);
    }, 3000);
  };

  const handleReset = () => {
    setUploadedFile(null);
    setJobDescription("");
    setProcessState(ProcessState.UPLOAD);
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
      <header className="w-full max-w-6xl mb-8">
        <h1 className="text-3xl font-bold text-center text-slate-800">
          AI Resume Scanner
        </h1>
        <p className="text-center text-slate-600 mt-2">
          Upload your resume and job description to get AI-powered insights and
          recommendations
        </p>
      </header>

      <main className="w-full max-w-6xl flex-1">
        <Card className="shadow-lg border-slate-200 bg-white">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Resume Analysis Tool</span>
              {processState === ProcessState.RESULTS && (
                <button
                  onClick={handleReset}
                  className="text-sm px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                >
                  Start New Analysis
                </button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="upload" value={processState.toString()}>
              <TabsList className="grid w-full grid-cols-3 mb-8">
                <TabsTrigger
                  value={ProcessState.UPLOAD.toString()}
                  disabled={processState !== ProcessState.UPLOAD}
                >
                  Upload
                </TabsTrigger>
                <TabsTrigger
                  value={ProcessState.PROCESSING.toString()}
                  disabled={processState !== ProcessState.PROCESSING}
                >
                  Processing
                </TabsTrigger>
                <TabsTrigger
                  value={ProcessState.RESULTS.toString()}
                  disabled={processState !== ProcessState.RESULTS}
                >
                  Results
                </TabsTrigger>
              </TabsList>

              <TabsContent value={ProcessState.UPLOAD.toString()}>
                <UploadSection onSubmit={handleSubmit} />
              </TabsContent>

              <TabsContent value={ProcessState.PROCESSING.toString()}>
                <ProcessingStatus fileName={uploadedFile?.name || ""} />
              </TabsContent>

              <TabsContent value={ProcessState.RESULTS.toString()}>
                <ResultsDashboard
                  matchScore={matchScore}
                  matchedKeywords={matchedKeywords}
                  missingSkills={missingSkills}
                  suggestions={suggestions}
                  resumeName={uploadedFile?.name || ""}
                  jobDescription={jobDescription}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>

      <footer className="w-full max-w-6xl mt-8 text-center text-slate-500 text-sm">
        <p>© 2023 AI Resume Scanner. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
