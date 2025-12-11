import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { extractFormErrors } from "../utils/errorHandler";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    motDePasse: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Validation du formulaire
  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(formData.email) && formData.motDePasse.length >= 1;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    try {
      await login(formData.email, formData.motDePasse);
      toast.success("Connexion réussie !");
      navigate("/dashboard");
    } catch (err) {
      const { message, fieldErrors: errors } = extractFormErrors(err, "Erreur de connexion");
      toast.error(message);
      setFieldErrors(errors);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LogIn className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Bienvenue</h1>
            <p className="text-gray-600 mt-1">Connectez-vous à votre compte</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="votre@email.com"
                  required
                  className={`
                    block w-full pl-10 pr-3 py-3 
                    border rounded-lg text-gray-900 
                    placeholder-gray-400
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${fieldErrors.email 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-300 hover:border-gray-400"
                    }
                  `}
                />
              </div>
              {fieldErrors.email && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="motDePasse"
                  value={formData.motDePasse}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  className={`
                    block w-full pl-10 pr-10 py-3 
                    border rounded-lg text-gray-900 
                    placeholder-gray-400
                    transition-all duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    ${fieldErrors.motDePasse 
                      ? "border-red-500 bg-red-50" 
                      : "border-gray-300 hover:border-gray-400"
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-auto"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                  )}
                </button>
              </div>
              {fieldErrors.motDePasse && (
                <p className="mt-1 text-sm text-red-600">{fieldErrors.motDePasse}</p>
              )}
            </div>

            {/* Forgot password link */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Pas encore de compte ?{" "}
              <Link to="/register" className="text-blue-600 hover:text-blue-700 font-semibold">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom text */}
        <p className="text-center text-white/80 text-sm mt-6">
          Gestion Associative © 2024
        </p>
      </div>
    </div>
  );
}
