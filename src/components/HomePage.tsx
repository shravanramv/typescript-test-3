import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Upload,
  BarChart3,
  Lightbulb,
  Database,
  Users,
  Briefcase,
  CheckCircle,
} from "lucide-react";

interface HomePageProps {
  onGetStarted: () => void;
  onNavigateToLogin: () => void;
}

const HomePage: React.FC<HomePageProps> = ({
  onGetStarted,
  onNavigateToLogin,
}) => {
  const features = [
    {
      icon: <Upload className="h-8 w-8 text-blue-600" />,
      title: "Smart Upload",
      description:
        "Drag & drop your resume and paste job descriptions for instant analysis",
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-green-600" />,
      title: "AI Match Score",
      description:
        "Get detailed compatibility scores with color-coded insights",
    },
    {
      icon: <Lightbulb className="h-8 w-8 text-yellow-600" />,
      title: "Smart Suggestions",
      description: "Receive AI-powered recommendations to improve your resume",
    },
    {
      icon: <Database className="h-8 w-8 text-purple-600" />,
      title: "History Tracking",
      description: "Store and compare previous scans with DuckDB integration",
    },
  ];

  const benefits = [
    "Increase your interview chances by 40%",
    "Save hours of manual resume optimization",
    "Get insights from industry-leading AI",
    "Track your improvement over time",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="w-full px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              AI Resume Scanner
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              <Users className="h-3 w-3 mr-1" />
              For Job Seekers
            </Badge>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <Briefcase className="h-3 w-3 mr-1" />
              For Recruiters
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full px-6 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Optimize Your Resume with
            <span className="text-blue-600 block mt-2">
              AI-Powered Analysis
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Upload your resume and job description to get instant AI insights,
            match scores, and personalized recommendations to land your dream
            job.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button
              size="lg"
              className="px-8 py-3 text-lg"
              onClick={onNavigateToLogin}
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <p className="text-sm text-gray-500">Instant results</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full px-6 py-16 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Powerful Features for Job Success
            </h2>
            <p className="text-lg text-gray-600">
              Everything you need to create a winning resume
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-shadow"
              >
                <CardHeader className="text-center pb-2">
                  <div className="mx-auto mb-4 p-3 bg-gray-50 rounded-full w-fit">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="w-full px-6 py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose AI Resume Scanner?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                <p className="text-lg text-gray-700">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-6 py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Boost Your Career?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of job seekers who have improved their resumes with
            our AI technology.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="px-8 py-3 text-lg bg-white text-blue-600 hover:bg-gray-50"
            onClick={onNavigateToLogin}
          >
            Start Your Analysis Now
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full px-6 py-8 bg-gray-900">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-400">
            © 2025 AI-Based Resume Scanner - Shravan Ram.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
