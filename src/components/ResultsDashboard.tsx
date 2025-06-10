import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, XCircle, Save, History, BarChart2 } from "lucide-react";
import SuggestionPanel from "./SuggestionPanel";

interface Keyword {
  text: string;
  matched: boolean;
}

interface Skill {
  name: string;
  missing: boolean;
}

interface ResultsDashboardProps {
  matchScore?: number;
  keywords?: Keyword[];
  skills?: Skill[];
  suggestions?: string[];
  onSaveResults?: () => void;
  onViewPreviousScans?: () => void;
}

const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  matchScore = 72,
  keywords = [
    { text: "Python", matched: true },
    { text: "React", matched: true },
    { text: "TypeScript", matched: true },
    { text: "Machine Learning", matched: false },
    { text: "Data Analysis", matched: true },
    { text: "AWS", matched: false },
    { text: "Docker", matched: true },
    { text: "SQL", matched: true },
  ],
  skills = [
    { name: "Python", missing: false },
    { name: "React", missing: false },
    { name: "TypeScript", missing: false },
    { name: "Machine Learning", missing: true },
    { name: "AWS", missing: true },
    { name: "Docker", missing: false },
    { name: "SQL", missing: false },
  ],
  suggestions = [
    "Add experience with Machine Learning frameworks like TensorFlow or PyTorch",
    "Include AWS certification or cloud experience",
    "Highlight any experience with data visualization tools",
    "Quantify your achievements with specific metrics",
    "Add more industry-specific keywords from the job description",
  ],
  onSaveResults = () => console.log("Saving results to database"),
  onViewPreviousScans = () => console.log("Viewing previous scans"),
}) => {
  const matchedKeywords = keywords.filter((k) => k.matched).length;
  const totalKeywords = keywords.length;
  const keywordPercentage = Math.round((matchedKeywords / totalKeywords) * 100);

  const matchedSkills = skills.filter((s) => !s.missing).length;
  const totalSkills = skills.length;
  const skillPercentage = Math.round((matchedSkills / totalSkills) * 100);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 bg-background">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Match Score Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <BarChart2 className="mr-2 h-5 w-5" />
              Match Score
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="relative w-40 h-40 mb-4">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-4xl font-bold">{matchScore}%</div>
              </div>
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="8"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={
                    matchScore >= 70
                      ? "#10b981"
                      : matchScore >= 50
                        ? "#f59e0b"
                        : "#ef4444"
                  }
                  strokeWidth="8"
                  strokeDasharray="283"
                  strokeDashoffset={283 - (283 * matchScore) / 100}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                />
              </svg>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-2">
                {matchScore >= 70
                  ? "Strong match for this position!"
                  : matchScore >= 50
                    ? "Moderate match - see suggestions to improve"
                    : "Low match - significant improvements needed"}
              </p>
              <div className="flex justify-center space-x-2">
                <Button
                  onClick={onSaveResults}
                  size="sm"
                  className="flex items-center"
                >
                  <Save className="mr-1 h-4 w-4" /> Save Results
                </Button>
                <Button
                  onClick={onViewPreviousScans}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <History className="mr-1 h-4 w-4" /> Previous Scans
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analysis Tabs */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Detailed Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="keywords">
              <TabsList className="mb-4">
                <TabsTrigger value="keywords">Keywords</TabsTrigger>
                <TabsTrigger value="skills">Skills</TabsTrigger>
              </TabsList>

              <TabsContent value="keywords">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Keyword Matches</p>
                      <p className="text-xs text-muted-foreground">
                        {matchedKeywords} of {totalKeywords} keywords found
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      {keywordPercentage}%
                    </div>
                  </div>
                  <Progress value={keywordPercentage} className="h-2" />

                  <div className="mt-6">
                    <p className="text-sm font-medium mb-2">Keyword Details</p>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword, index) => (
                        <Badge
                          key={index}
                          variant={keyword.matched ? "default" : "outline"}
                          className={`flex items-center ${keyword.matched ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-50 text-red-800 hover:bg-red-100"}`}
                        >
                          {keyword.matched ? (
                            <CheckCircle className="mr-1 h-3 w-3" />
                          ) : (
                            <XCircle className="mr-1 h-3 w-3" />
                          )}
                          {keyword.text}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="skills">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Skills Match</p>
                      <p className="text-xs text-muted-foreground">
                        {matchedSkills} of {totalSkills} required skills found
                      </p>
                    </div>
                    <div className="text-sm font-medium">
                      {skillPercentage}%
                    </div>
                  </div>
                  <Progress value={skillPercentage} className="h-2" />

                  <div className="mt-6">
                    <p className="text-sm font-medium mb-2">Skills Details</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {skills.map((skill, index) => (
                        <div
                          key={index}
                          className={`flex items-center p-2 rounded-md ${skill.missing ? "bg-red-50" : "bg-green-50"}`}
                        >
                          {skill.missing ? (
                            <XCircle className="mr-2 h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                          )}
                          <span
                            className={
                              skill.missing ? "text-red-800" : "text-green-800"
                            }
                          >
                            {skill.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Suggestions Panel */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Improvement Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <SuggestionPanel suggestions={suggestions} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ResultsDashboard;
