import React, { Suspense, useState } from "react";
import { useRoutes, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import HomePage from "./components/HomePage";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import RecruiterDashboard from "./components/recruiter/RecruiterDashboard";
import ApplicantDashboard from "./components/applicant/ApplicantDashboard";
import Home from "./components/home";
import routes from "tempo-routes";

type AppView = "homepage" | "auth" | "register" | "app";

function AppContent() {
  const { user, isLoading, setNavigationCallback } = useAuth();
  const [currentView, setCurrentView] = useState<AppView>("homepage");

  // Set up navigation callback for logout
  React.useEffect(() => {
    setNavigationCallback(() => setCurrentView("homepage"));
  }, [setNavigationCallback]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show homepage first
  if (currentView === "homepage") {
    return (
      <HomePage
        onGetStarted={() => setCurrentView("app")}
        onNavigateToLogin={() => setCurrentView("auth")}
      />
    );
  }

  // Show resume scanner app
  if (currentView === "app") {
    return <Home />;
  }

  // Authentication flow (if needed later)
  if (!user) {
    if (currentView === "register") {
      return <RegisterPage onNavigateToLogin={() => setCurrentView("auth")} />;
    }
    if (currentView === "auth") {
      return (
        <LoginPage
          onNavigateToRegister={() => setCurrentView("register")}
          onNavigateToRecruiterRegister={() => setCurrentView("register")}
          onNavigateToApplicantRegister={() => setCurrentView("register")}
        />
      );
    }
  }

  // Authenticated user dashboards (if needed later)
  if (user) {
    if (user.role === "recruiter") {
      return <RecruiterDashboard />;
    } else {
      return <ApplicantDashboard />;
    }
  }

  return (
    <HomePage
      onGetStarted={() => setCurrentView("app")}
      onNavigateToLogin={() => setCurrentView("auth")}
    />
  );
}

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<p>Loading...</p>}>
        <>
          <Routes>
            <Route path="/" element={<AppContent />} />
          </Routes>
          {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
        </>
      </Suspense>
    </AuthProvider>
  );
}

export default App;
