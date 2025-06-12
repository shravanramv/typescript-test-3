import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "../../contexts/AuthContext";
import { postgresDB } from "../../lib/duckdb";
import { Briefcase, FileText, List } from "lucide-react";

interface JobFormProps {
  onJobCreated: () => void;
}

const JobForm: React.FC<JobFormProps> = ({ onJobCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      await postgresDB.createJob({
        title: formData.title,
        description: formData.description,
        requirements: formData.requirements,
        recruiter_id: user.id,
        status: "active",
      });

      setSuccess("Job posted successfully!");
      setFormData({ title: "", description: "", requirements: "" });

      // Call the callback after a short delay to show success message
      setTimeout(() => {
        onJobCreated();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create job posting");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5" />
            <span>Create Job Posting</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-800">
                  {success}
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <div className="relative">
                <Briefcase className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="title"
                  type="text"
                  placeholder="e.g. Senior Software Engineer"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description</Label>
              <div className="relative">
                <FileText className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                  value={formData.description}
                  onChange={(e) =>
                    handleInputChange("description", e.target.value)
                  }
                  className="pl-10 min-h-[120px]"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">
                Requirements & Qualifications
              </Label>
              <div className="relative">
                <List className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Textarea
                  id="requirements"
                  placeholder="List the required skills, experience, education, and qualifications..."
                  value={formData.requirements}
                  onChange={(e) =>
                    handleInputChange("requirements", e.target.value)
                  }
                  className="pl-10 min-h-[100px]"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Creating Job..." : "Post Job"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default JobForm;
