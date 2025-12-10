import axios from "axios";
import toast from "react-hot-toast";

const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, "")}/api`
  : "http://localhost:3001/api";

// Créer l'instance axios avec configuration de base
// Timeout augmenté à 60s pour gérer le "cold start" de Render (free tier)
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 secondes timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// Variable pour éviter les redirections multiples
let isRedirecting = false;

// Variable pour gérer le refresh token en cours
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Intercepteur de requêtes
 * - Ajoute le token JWT
 * - Ajoute un timestamp pour le debugging
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Ajouter un timestamp pour mesurer la durée
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de réponses
 * - Gère le refresh token automatique
 * - Log les temps de réponse en développement
 * - Gère les erreurs de manière centralisée
 */
api.interceptors.response.use(
  (response) => {
    // Log du temps de réponse en développement
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${
          response.config.url
        } - ${duration}ms`
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log de l'erreur
    if (import.meta.env.DEV) {
      const duration = originalRequest?.metadata
        ? new Date() - originalRequest.metadata.startTime
        : 0;
      console.error(
        `❌ ${originalRequest?.method?.toUpperCase()} ${
          originalRequest?.url
        } - ${duration}ms`,
        error.response?.data || error.message
      );
    }

    // Erreur réseau
    if (!error.response) {
      if (error.code === "ECONNABORTED") {
        toast.error("La requête a pris trop de temps. Veuillez réessayer.");
      } else if (error.message === "Network Error") {
        toast.error(
          "Impossible de contacter le serveur. Vérifiez votre connexion."
        );
      }
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Erreur 401 - Token invalide ou expiré
    if (status === 401 && !originalRequest._retry) {
      // Si le code est TOKEN_EXPIRED, essayer de rafraîchir le token
      if (data?.code === "TOKEN_EXPIRED") {
        const refreshToken = localStorage.getItem("refreshToken");

        if (refreshToken && !isRefreshing) {
          isRefreshing = true;
          originalRequest._retry = true;

          try {
            const response = await axios.post(
              `${API_BASE_URL}/auth/refresh-token`,
              {
                refreshToken,
              }
            );

            const { token: newToken } = response.data;
            localStorage.setItem("token", newToken);

            api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;

            processQueue(null, newToken);
            isRefreshing = false;

            return api(originalRequest);
          } catch (refreshError) {
            processQueue(refreshError, null);
            isRefreshing = false;
            handleAuthError();
            return Promise.reject(refreshError);
          }
        }

        // Si un refresh est déjà en cours, mettre la requête en file d'attente
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          }).then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          });
        }
      }

      // Autres erreurs 401 - Déconnecter l'utilisateur
      handleAuthError();
      return Promise.reject(error);
    }

    // Erreur 403 - Accès refusé
    if (status === 403) {
      toast.error("Vous n'avez pas les droits nécessaires pour cette action.");
    }

    // Erreur 404 - Non trouvé
    if (status === 404 && data?.code === "ROUTE_NOT_FOUND") {
      toast.error("Cette ressource n'existe pas.");
    }

    // Erreur 429 - Trop de requêtes
    if (status === 429) {
      toast.error("Trop de requêtes. Veuillez patienter avant de réessayer.");
    }

    // Erreur 500+ - Erreur serveur
    if (status >= 500) {
      toast.error(
        "Une erreur serveur s'est produite. Veuillez réessayer plus tard."
      );
    }

    return Promise.reject(error);
  }
);

/**
 * Gère la déconnexion en cas d'erreur d'authentification
 */
const handleAuthError = () => {
  if (isRedirecting) return;

  isRedirecting = true;
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");

  // Ne pas afficher de toast si on est déjà sur la page de login
  if (!window.location.pathname.includes("/login")) {
    toast.error("Votre session a expiré. Veuillez vous reconnecter.");
    setTimeout(() => {
      window.location.href = "/login";
      isRedirecting = false;
    }, 1000);
  } else {
    isRedirecting = false;
  }
};

/**
 * Vérifie si l'utilisateur est connecté (a un token)
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};

/**
 * Efface les tokens et déconnecte l'utilisateur
 */
export const clearAuth = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
};

export default api;
