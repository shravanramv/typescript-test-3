import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, AlertCircle, Info } from "lucide-react";

interface SuggestionItem {
  id: string;
  text: string;
  priority: "high" | "medium" | "low";
  type: "missing-skill" | "rephrase" | "highlight";
}

interface SuggestionPanelProps {
  suggestions?: SuggestionItem[];
  isLoading?: boolean;
}

const SuggestionPanel = ({
  suggestions = [
    {
      id: "1",
      text: "Add experience with Docker containerization to highlight your DevOps skills",
      priority: "high",
      type: "missing-skill",
    },
    {
      id: "2",
      text: 'Rephrase "Worked on projects" to quantify your contributions with metrics',
      priority: "medium",
      type: "rephrase",
    },
    {
      id: "3",
      text: "Highlight your experience with data analysis using Python",
      priority: "high",
      type: "highlight",
    },
    {
      id: "4",
      text: "Add SQL database experience to match the job requirements",
      priority: "high",
      type: "missing-skill",
    },
    {
      id: "5",
      text: "Include specific examples of team leadership in your work experience",
      priority: "medium",
      type: "highlight",
    },
    {
      id: "6",
      text: "Consider adding a brief summary of your cloud computing knowledge",
      priority: "low",
      type: "missing-skill",
    },
  ],
  isLoading = false,
}: SuggestionPanelProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive text-destructive-foreground";
      case "medium":
        return "bg-warning text-warning-foreground";
      case "low":
        return "bg-secondary text-secondary-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "missing-skill":
        return <AlertCircle className="h-4 w-4 mr-1" />;
      case "rephrase":
        return <Info className="h-4 w-4 mr-1" />;
      case "highlight":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      default:
        return <Info className="h-4 w-4 mr-1" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "missing-skill":
        return "Add Skill";
      case "rephrase":
        return "Rephrase";
      case "highlight":
        return "Highlight";
      default:
        return "Suggestion";
    }
  };

  // Group suggestions by priority
  const highPriority = suggestions.filter((s) => s.priority === "high");
  const mediumPriority = suggestions.filter((s) => s.priority === "medium");
  const lowPriority = suggestions.filter((s) => s.priority === "low");

  return (
    <Card className="w-full h-full bg-background border shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center">
          <span className="mr-2">🚀</span> Improvement Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-pulse text-muted-foreground">
              Generating suggestions...
            </div>
          </div>
        ) : (
          <ScrollArea className="h-[300px] pr-4">
            {highPriority.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-destructive mb-2">
                  High Priority
                </h3>
                {highPriority.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="mb-3 bg-muted/50 p-3 rounded-md"
                  >
                    <div className="flex items-center mb-1">
                      <Badge
                        variant="outline"
                        className={`flex items-center ${getPriorityColor(suggestion.priority)}`}
                      >
                        {getTypeIcon(suggestion.type)}
                        {getTypeLabel(suggestion.type)}
                      </Badge>
                    </div>
                    <p className="text-sm">{suggestion.text}</p>
                  </div>
                ))}
              </div>
            )}

            {mediumPriority.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-amber-500 mb-2">
                  Medium Priority
                </h3>
                {mediumPriority.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="mb-3 bg-muted/50 p-3 rounded-md"
                  >
                    <div className="flex items-center mb-1">
                      <Badge
                        variant="outline"
                        className={`flex items-center ${getPriorityColor(suggestion.priority)}`}
                      >
                        {getTypeIcon(suggestion.type)}
                        {getTypeLabel(suggestion.type)}
                      </Badge>
                    </div>
                    <p className="text-sm">{suggestion.text}</p>
                  </div>
                ))}
              </div>
            )}

            {lowPriority.length > 0 && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">
                  Low Priority
                </h3>
                {lowPriority.map((suggestion) => (
                  <div
                    key={suggestion.id}
                    className="mb-3 bg-muted/50 p-3 rounded-md"
                  >
                    <div className="flex items-center mb-1">
                      <Badge
                        variant="outline"
                        className={`flex items-center ${getPriorityColor(suggestion.priority)}`}
                      >
                        {getTypeIcon(suggestion.type)}
                        {getTypeLabel(suggestion.type)}
                      </Badge>
                    </div>
                    <p className="text-sm">{suggestion.text}</p>
                  </div>
                ))}
              </div>
            )}

            {suggestions.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-muted-foreground mb-2">
                  No suggestions available
                </p>
                <p className="text-xs text-muted-foreground">
                  Your resume appears to be well-aligned with the job
                  description
                </p>
              </div>
            )}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestionPanel;
