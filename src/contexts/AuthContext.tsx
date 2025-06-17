import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  company_name?: string; // For recruiters
  company_website?: string; // For recruiters
  resume_url?: string; // For applicants
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  userType: 'applicant' | 'recruiter' | null;
  login: (email: string, password: string, type: 'applicant' | 'recruiter') => Promise<boolean>;
  register: (userData: RegisterData, type: 'applicant' | 'recruiter') => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  companyName?: string; // For recruiters
  companyWebsite?: string; // For recruiters
  resumeUrl?: string; // For applicants
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userType, setUserType] = useState<'applicant' | 'recruiter' | null>(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on component mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      const storedUserType = localStorage.getItem('userType') as 'applicant' | 'recruiter' | null;

      if (sessionId && storedUserType) {
        const response = await fetch('/api/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId, userType: storedUserType }),
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setUserType(storedUserType);
        } else {
          // Invalid session, clear storage
          localStorage.removeItem('sessionId');
          localStorage.removeItem('userType');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, type: 'applicant' | 'recruiter'): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, userType: type }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setUser(data.user);
        setUserType(type);
        localStorage.setItem('sessionId', data.sessionId);
        localStorage.setItem('userType', type);
        return true;
      } else {
        console.error('Login failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterData, type: 'applicant' | 'recruiter'): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...userData, userType: type }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Auto-login after successful registration
        return await login(userData.email, userData.password, type);
      } else {
        console.error('Registration failed:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const sessionId = localStorage.getItem('sessionId');
      if (sessionId) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setUserType(null);
      localStorage.removeItem('sessionId');
      localStorage.removeItem('userType');
    }
  };

  const value = {
    user,
    userType,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}