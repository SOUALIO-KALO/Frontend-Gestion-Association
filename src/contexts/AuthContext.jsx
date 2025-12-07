import { useState, useContext, createContext, useEffect } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // Changé à true au départ
  const [error, setError] = useState(null);

  // Charger le profil utilisateur si token existe
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      loadProfile();
    } else {
      setLoading(false); // Important : arrêter le loading si pas de token
    }
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      setUser(response.data.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement du profil:", err);
      localStorage.removeItem("token");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, motDePasse) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, motDePasse);

      localStorage.setItem("token", response.data.token);
      if (response.data.refreshToken) {
        localStorage.setItem("refreshToken", response.data.refreshToken);
      }

      setUser(response.data.data.membre);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Erreur de connexion";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Erreur lors de la déconnexion:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  };

  const register = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(data);
      return response.data;
    } catch (err) {
      const errorMsg =
        err.response?.data?.message || "Erreur lors de l'inscription";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isAdmin: user?.role === "ADMIN",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé avec AuthProvider");
  }
  return context;
};