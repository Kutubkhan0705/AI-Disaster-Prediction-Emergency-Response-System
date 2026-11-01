import { useState, useEffect, useCallback } from "react";
import * as authService from "../services/authService.js";

// Simple auth hook backed by localStorage. Wrap App in an AuthProvider
// context if you need this shared across many components without prop drilling.
export const useAuth = () => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));
    } else {
      localStorage.removeItem("user");
    }
  }, [user]);

  const loginUser = useCallback(async (credentials) => {
    const data = await authService.login(credentials);
    setUser(data);
    return data;
  }, []);

  const registerUser = useCallback(async (payload) => {
    const data = await authService.register(payload);
    setUser(data);
    return data;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
  }, []);

  return { user, loginUser, registerUser, logout, isAuthenticated: !!user };
};
