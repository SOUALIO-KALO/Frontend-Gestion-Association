import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { extractFormErrors } from '../utils/errorHandler';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({
    motDePasse: '',
    confirmMotDePasse: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (formData.motDePasse.length < 8) {
      errors.motDePasse = 'Le mot de passe doit contenir au moins 8 caractères';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.motDePasse)) {
      errors.motDePasse = 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre';
    }
    
    if (formData.motDePasse !== formData.confirmMotDePasse) {
      errors.confirmMotDePasse = 'Les mots de passe ne correspondent pas';
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setFieldErrors({});

    try {
      await authService.resetPassword(token, formData.motDePasse, formData.confirmMotDePasse);
      setSuccess(true);
      toast.success('Mot de passe modifié avec succès !');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      const { message, fieldErrors: errors } = extractFormErrors(
        err, 
        'Une erreur est survenue. Le lien est peut-être expiré.'
      );
      toast.error(message);
      setFieldErrors(errors);
    } finally {
      setLoading(false);
    }
  };

  const PasswordField = ({ label, name, value, show, setShow, placeholder, hint }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Lock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={show ? "text" : "password"}
          name={name}
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          required
          className={`
            block w-full pl-10 pr-10 py-3 
            border rounded-lg text-gray-900 
            placeholder-gray-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            ${fieldErrors[name] 
              ? "border-red-500 bg-red-50" 
              : "border-gray-300 hover:border-gray-400"
            }
          `}
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-auto"
        >
          {show ? (
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
          )}
        </button>
      </div>
      {fieldErrors[name] && (
        <p className="mt-1 text-sm text-red-600">{fieldErrors[name]}</p>
      )}
      {hint && !fieldErrors[name] && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Lien invalide
            </h2>
            <p className="text-gray-600 mb-6">
              Ce lien de réinitialisation est invalide ou a expiré.
              Veuillez demander un nouveau lien.
            </p>
            <Link
              to="/forgot-password"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
            >
              Demander un nouveau lien
            </Link>
          </div>
          <p className="text-center text-white/80 text-sm mt-6">
            Gestion Associative © 2024
          </p>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Mot de passe modifié !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre mot de passe a été réinitialisé avec succès.
              Vous allez être redirigé vers la page de connexion...
            </p>
            <Link
              to="/login"
              className="block w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition-all duration-200"
            >
              Se connecter maintenant
            </Link>
          </div>
          <p className="text-center text-white/80 text-sm mt-6">
            Gestion Associative © 2024
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <KeyRound className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              Nouveau mot de passe
            </h1>
            <p className="text-gray-600 mt-2">
              Créez un nouveau mot de passe sécurisé
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordField
              label="Nouveau mot de passe"
              name="motDePasse"
              value={formData.motDePasse}
              show={showPassword}
              setShow={setShowPassword}
              placeholder="••••••••"
              hint="Min. 8 caractères avec majuscule, minuscule et chiffre"
            />

            <PasswordField
              label="Confirmer le mot de passe"
              name="confirmMotDePasse"
              value={formData.confirmMotDePasse}
              show={showConfirmPassword}
              setShow={setShowConfirmPassword}
              placeholder="••••••••"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Modification...
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  Réinitialiser le mot de passe
                </>
              )}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Retour à la connexion
            </Link>
          </div>
        </div>

        <p className="text-center text-white/80 text-sm mt-6">
          Gestion Associative © 2024
        </p>
      </div>
    </div>
  );
}
