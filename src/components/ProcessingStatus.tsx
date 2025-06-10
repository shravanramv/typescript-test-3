import React, { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ProcessingStatusProps {
  isProcessing?: boolean;
  progress?: number;
  statusMessage?: string;
  estimatedTimeRemaining?: number;
}

const ProcessingStatus = ({
  isProcessing = true,
  progress = 0,
  statusMessage = "Analyzing your resume...",
  estimatedTimeRemaining = 30,
}: ProcessingStatusProps) => {
  const [currentProgress, setCurrentProgress] = useState(progress);
  const [timeRemaining, setTimeRemaining] = useState(estimatedTimeRemaining);

  // Simulate progress if processing is active
  useEffect(() => {
    if (!isProcessing) return;

    const interval = setInterval(() => {
      setCurrentProgress((prev) => {
        // Gradually increase progress, slowing down as it approaches 100%
        const increment = Math.max(1, 10 * (1 - prev / 100));
        return Math.min(95, prev + increment);
      });

      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isProcessing]);

  // Reset when processing starts/stops
  useEffect(() => {
    if (isProcessing) {
      setCurrentProgress(progress);
      setTimeRemaining(estimatedTimeRemaining);
    } else {
      setCurrentProgress(100);
      setTimeRemaining(0);
    }
  }, [isProcessing, progress, estimatedTimeRemaining]);

  if (!isProcessing) return null;

  return (
    <Card className="w-full max-w-md mx-auto bg-white shadow-md">
      <CardContent className="pt-6 pb-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
          </div>

          <h3 className="text-lg font-medium text-center">{statusMessage}</h3>

          <div className="w-full space-y-2">
            <Progress value={currentProgress} className="h-2" />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{currentProgress.toFixed(0)}% complete</span>
              {timeRemaining > 0 && (
                <span>Estimated time: {timeRemaining}s</span>
              )}
            </div>
          </div>

          <p className="text-sm text-center text-muted-foreground">
            Our AI is analyzing your resume against the job description. This
            may take a moment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessingStatus;
