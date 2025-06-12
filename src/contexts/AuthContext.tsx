import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { AuthUser, AuthService } from "../lib/auth";

interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    password: string,
    name: string,
    role: "recruiter" | "applicant",
  ) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  setNavigationCallback: (callback: () => void) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [navigationCallback, setNavigationCallback] = useState<
    (() => void) | null
  >(null);

  useEffect(() => {
    const checkToken = async () => {
      // Check for stored token on app load
      const token = localStorage.getItem("auth_token");
      if (token) {
        try {
          const userData = await AuthService.verifyToken(token);
          setUser(userData);
        } catch (error) {
          localStorage.removeItem("auth_token");
        }
      }
      setIsLoading(false);
    };

    checkToken();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user: userData, token } = await AuthService.login(
        email,
        password,
      );
      localStorage.setItem("auth_token", token);
      setUser(userData);
    } catch (error) {
      throw error;
    }
  };

  const register = async (
    email: string,
    password: string,
    name: string,
    role: "recruiter" | "applicant",
  ) => {
    try {
      const userData = await AuthService.register(email, password, name, role);
      // Auto-login after registration
      await login(email, password);
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    setUser(null);
    if (navigationCallback) {
      navigationCallback();
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    isLoading,
    setNavigationCallback: (callback: () => void) =>
      setNavigationCallback(() => callback),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
