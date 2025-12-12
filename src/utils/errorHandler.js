// frontend/src/utils/errorHandler.js
import toast from "react-hot-toast";

/**
 * Codes d'erreur et leurs messages utilisateur
 */
const ERROR_MESSAGES = {
  // Erreurs d'authentification
  INVALID_TOKEN: "Votre session n'est pas valide. Veuillez vous reconnecter.",
  TOKEN_EXPIRED: "Votre session a expiré. Veuillez vous reconnecter.",
  UNAUTHORIZED: "Vous devez être connecté pour effectuer cette action.",
  FORBIDDEN: "Vous n'avez pas les droits nécessaires pour cette action.",

  // Erreurs de validation
  VALIDATION_ERROR: "Les données fournies sont invalides.",
  DUPLICATE_ENTRY: "Un enregistrement avec ces informations existe déjà.",
  NOT_FOUND: "L'élément demandé n'existe pas ou a été supprimé.",

  // Erreurs réseau
  NETWORK_ERROR: "Impossible de contacter le serveur. Vérifiez votre connexion internet.",
  TIMEOUT: "La requête a pris trop de temps. Veuillez réessayer.",
  SERVER_ERROR: "Une erreur serveur s'est produite. Veuillez réessayer plus tard.",

  // Erreurs génériques
  UNKNOWN_ERROR: "Une erreur inattendue s'est produite.",
  ROUTE_NOT_FOUND: "Cette ressource n'existe pas.",
};

/**
 * Extrait le message d'erreur d'une réponse API
 * @param {Error} error - L'erreur Axios
 * @returns {string} Message d'erreur formaté
 */
export const getErrorMessage = (error) => {
  // Erreur réseau (pas de réponse du serveur)
  if (!error.response) {
    if (error.code === "ECONNABORTED") {
      return ERROR_MESSAGES.TIMEOUT;
    }
    if (error.message === "Network Error") {
      return ERROR_MESSAGES.NETWORK_ERROR;
    }
    return error.message || ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  const { data, status } = error.response;

  // Utiliser le code d'erreur si disponible
  if (data?.code && ERROR_MESSAGES[data.code]) {
    return ERROR_MESSAGES[data.code];
  }

  // Utiliser le message de l'API si disponible
  if (data?.message) {
    return data.message;
  }

  // Messages par défaut selon le code HTTP
  switch (status) {
    case 400:
      return "Requête invalide. Vérifiez les données envoyées.";
    case 401:
      return ERROR_MESSAGES.UNAUTHORIZED;
    case 403:
      return ERROR_MESSAGES.FORBIDDEN;
    case 404:
      return ERROR_MESSAGES.NOT_FOUND;
    case 409:
      return ERROR_MESSAGES.DUPLICATE_ENTRY;
    case 422:
      return ERROR_MESSAGES.VALIDATION_ERROR;
    case 429:
      return "Trop de requêtes. Veuillez patienter avant de réessayer.";
    case 500:
    case 502:
    case 503:
      return ERROR_MESSAGES.SERVER_ERROR;
    default:
      return ERROR_MESSAGES.UNKNOWN_ERROR;
  }
};

/**
 * Extrait les erreurs de validation d'une réponse API
 * @param {Error} error - L'erreur Axios
 * @returns {Object} Objet avec les champs en erreur
 */
export const getValidationErrors = (error) => {
  const errors = error.response?.data?.errors || error.response?.data?.details;
  
  if (!errors) return {};

  // Si c'est un tableau d'erreurs express-validator
  if (Array.isArray(errors)) {
    return errors.reduce((acc, err) => {
      const field = err.path || err.param || err.field;
      if (field) {
        acc[field] = err.msg || err.message;
      }
      return acc;
    }, {});
  }

  // Si c'est déjà un objet
  return errors;
};

/**
 * Extrait le message d'erreur principal et les erreurs par champ
 * Utile pour les formulaires
 * @param {Error} error - L'erreur Axios
 * @param {string} defaultMessage - Message par défaut si aucun message trouvé
 * @returns {{ message: string, fieldErrors: Object }}
 */
export const extractFormErrors = (error, defaultMessage = "Une erreur s'est produite") => {
  const data = error.response?.data;
  
  if (!data) {
    return { 
      message: "Erreur de connexion au serveur", 
      fieldErrors: {} 
    };
  }

  // Si on a un tableau d'erreurs de validation
  if (data.errors && Array.isArray(data.errors)) {
    const fieldErrors = {};
    data.errors.forEach((e) => {
      const field = e.field || e.path || e.param;
      if (field) {
        fieldErrors[field] = e.message || e.msg;
      }
    });
    
    // Prendre le premier message d'erreur comme message principal
    const firstError = data.errors[0];
    return {
      message: firstError?.message || firstError?.msg || data.message || "Erreur de validation",
      fieldErrors,
    };
  }

  // Cas d'une erreur ciblée sur un seul champ (ex: DUPLICATE_ENTRY avec un champ unique)
  if (data.field && data.message) {
    return {
      message: data.message || defaultMessage,
      fieldErrors: {
        [data.field]: data.message,
      },
    };
  }

  return { 
    message: data.message || defaultMessage, 
    fieldErrors: {} 
  };
};

/**
 * Affiche une notification d'erreur avec toast
 * @param {Error} error - L'erreur à afficher
 * @param {Object} options - Options supplémentaires
 */
export const showError = (error, options = {}) => {
  const message = typeof error === "string" ? error : getErrorMessage(error);
  
  toast.error(message, {
    duration: options.duration || 5000,
    position: options.position || "top-right",
    ...options,
  });
};

/**
 * Affiche une notification de succès avec toast
 * @param {string} message - Le message à afficher
 * @param {Object} options - Options supplémentaires
 */
export const showSuccess = (message, options = {}) => {
  toast.success(message, {
    duration: options.duration || 3000,
    position: options.position || "top-right",
    ...options,
  });
};

/**
 * Vérifie si l'erreur nécessite une déconnexion
 * @param {Error} error - L'erreur à vérifier
 * @returns {boolean}
 */
export const isAuthError = (error) => {
  const status = error.response?.status;
  const code = error.response?.data?.code;
  
  return (
    status === 401 ||
    code === "INVALID_TOKEN" ||
    code === "TOKEN_EXPIRED"
  );
};

/**
 * Vérifie si l'erreur est une erreur réseau
 * @param {Error} error - L'erreur à vérifier
 * @returns {boolean}
 */
export const isNetworkError = (error) => {
  return !error.response && (
    error.message === "Network Error" ||
    error.code === "ECONNABORTED" ||
    error.code === "ERR_NETWORK"
  );
};

/**
 * Handler global pour les erreurs non gérées
 */
export const setupGlobalErrorHandler = () => {
  // Erreurs JavaScript non gérées
  window.onerror = (message, source, lineno, colno, error) => {
    console.error("Global error:", { message, source, lineno, colno, error });
    // En production, on pourrait envoyer à un service de monitoring
    return false;
  };

  // Promesses rejetées non gérées
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled promise rejection:", event.reason);
    // Éviter d'afficher des erreurs techniques à l'utilisateur
    event.preventDefault();
  });
};

export default {
  getErrorMessage,
  getValidationErrors,
  extractFormErrors,
  showError,
  showSuccess,
  isAuthError,
  isNetworkError,
  setupGlobalErrorHandler,
};
