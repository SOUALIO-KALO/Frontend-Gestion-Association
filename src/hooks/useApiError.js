// frontend/src/hooks/useApiError.js
import { useState, useCallback } from "react";
import { 
  getErrorMessage, 
  getValidationErrors, 
  showError,
  isAuthError,
  isNetworkError 
} from "../utils/errorHandler";

/**
 * Hook personnalisé pour gérer les erreurs API de manière uniforme
 * 
 * @example
 * const { error, validationErrors, handleError, clearError, isLoading, withErrorHandling } = useApiError();
 * 
 * // Utilisation simple
 * const fetchData = async () => {
 *   try {
 *     await api.getData();
 *   } catch (err) {
 *     handleError(err);
 *   }
 * };
 * 
 * // Utilisation avec wrapper
 * const fetchData = withErrorHandling(async () => {
 *   return await api.getData();
 * });
 */
export const useApiError = (options = {}) => {
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { 
    showToast = true, 
    onAuthError = null,
    onNetworkError = null,
  } = options;

  /**
   * Efface toutes les erreurs
   */
  const clearError = useCallback(() => {
    setError(null);
    setValidationErrors({});
  }, []);

  /**
   * Gère une erreur API
   * @param {Error} err - L'erreur à gérer
   * @param {Object} options - Options supplémentaires
   */
  const handleError = useCallback((err, handleOptions = {}) => {
    const { silent = false, customMessage = null } = handleOptions;

    // Vérifier si c'est une erreur d'authentification
    if (isAuthError(err)) {
      if (onAuthError) {
        onAuthError(err);
      }
      return;
    }

    // Vérifier si c'est une erreur réseau
    if (isNetworkError(err)) {
      if (onNetworkError) {
        onNetworkError(err);
      }
    }

    // Récupérer le message d'erreur
    const message = customMessage || getErrorMessage(err);
    setError(message);

    // Récupérer les erreurs de validation
    const valErrors = getValidationErrors(err);
    setValidationErrors(valErrors);

    // Afficher un toast si activé et non silencieux
    if (showToast && !silent) {
      showError(message);
    }

    return message;
  }, [showToast, onAuthError, onNetworkError]);

  /**
   * Wrapper pour les appels API avec gestion d'erreurs automatique
   * @param {Function} asyncFn - Fonction async à exécuter
   * @param {Object} options - Options supplémentaires
   * @returns {Promise} Résultat de la fonction ou null en cas d'erreur
   */
  const withErrorHandling = useCallback((asyncFn, wrapperOptions = {}) => {
    return async (...args) => {
      clearError();
      setIsLoading(true);

      try {
        const result = await asyncFn(...args);
        return result;
      } catch (err) {
        handleError(err, wrapperOptions);
        return null;
      } finally {
        setIsLoading(false);
      }
    };
  }, [clearError, handleError]);

  /**
   * Exécute une fonction async avec gestion d'erreurs
   * @param {Function} asyncFn - Fonction async à exécuter
   * @returns {Promise} Résultat ou null
   */
  const execute = useCallback(async (asyncFn, executeOptions = {}) => {
    clearError();
    setIsLoading(true);

    try {
      const result = await asyncFn();
      return { success: true, data: result };
    } catch (err) {
      handleError(err, executeOptions);
      return { success: false, error: getErrorMessage(err) };
    } finally {
      setIsLoading(false);
    }
  }, [clearError, handleError]);

  /**
   * Vérifie si un champ a une erreur de validation
   * @param {string} fieldName - Nom du champ
   * @returns {string|null} Message d'erreur ou null
   */
  const getFieldError = useCallback((fieldName) => {
    return validationErrors[fieldName] || null;
  }, [validationErrors]);

  /**
   * Vérifie si un champ a une erreur
   * @param {string} fieldName - Nom du champ
   * @returns {boolean}
   */
  const hasFieldError = useCallback((fieldName) => {
    return !!validationErrors[fieldName];
  }, [validationErrors]);

  return {
    // État
    error,
    validationErrors,
    isLoading,
    
    // Actions
    handleError,
    clearError,
    setError,
    setValidationErrors,
    
    // Helpers
    withErrorHandling,
    execute,
    getFieldError,
    hasFieldError,
    
    // Checks
    hasError: !!error,
    hasValidationErrors: Object.keys(validationErrors).length > 0,
  };
};

export default useApiError;
