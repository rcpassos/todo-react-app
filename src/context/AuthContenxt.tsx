import React, { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, User } from "@/services/api";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const user = await api.auth.login(email, password);
      setUser(user);
      toast.success("Welcome back!", {
        description: "Successfully logged in.",
      });
      navigate("/dashboard");
    } catch (error) {
      toast.error("Error", {
        description: "Invalid credentials",
      });
      throw error;
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const user = await api.auth.register(email, password, name);
      setUser(user);
      toast.success("Welcome!", {
        description: "Account created successfully.",
      });
      navigate("/dashboard");
    } catch (error) {
      toast.error("Error", {
        description: "Registration failed",
      });
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
