import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { User, Mail, Lock, Phone, Eye, EyeOff, UserPlus } from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { extractFormErrors } from "../utils/errorHandler";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    motDePasse: "",
    confirmMotDePasse: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.nom.trim()) {
      errors.nom = "Le nom est requis";
    }
    if (!formData.prenom.trim()) {
      errors.prenom = "Le prénom est requis";
    }
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    }
    if (formData.motDePasse.length < 8) {
      errors.motDePasse = "Le mot de passe doit contenir au moins 8 caractères";
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.motDePasse)) {
      errors.motDePasse = "Le mot de passe doit contenir une majuscule, une minuscule et un chiffre";
    }
    if (formData.motDePasse !== formData.confirmMotDePasse) {
      errors.confirmMotDePasse = "Les mots de passe ne correspondent pas";
    }
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});

    if (!validateForm()) return;

    try {
      const { confirmMotDePasse, ...dataToSend } = formData;
      await register(dataToSend);
      toast.success("Inscription réussie ! Vous pouvez vous connecter.");
      navigate("/login");
    } catch (err) {
      const { message, fieldErrors: errors } = extractFormErrors(err, "Erreur lors de l'inscription");
      toast.error(message);
      setFieldErrors(errors);
    }
  };

  const InputField = ({ icon: Icon, label, name, type = "text", placeholder, required = true, hint }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type={type}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          className={`
            block w-full pl-10 pr-3 py-2.5 
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
      </div>
      {fieldErrors[name] && (
        <p className="mt-1 text-sm text-red-600">{fieldErrors[name]}</p>
      )}
      {hint && !fieldErrors[name] && (
        <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );

  const PasswordField = ({ label, name, show, setShow, placeholder, hint }) => (
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
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          required
          className={`
            block w-full pl-10 pr-10 py-2.5 
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
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          {show ? (
            <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <UserPlus className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Créer un compte</h1>
            <p className="text-gray-600 mt-1">Rejoignez notre association</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nom & Prénom */}
            <div className="grid grid-cols-2 gap-4">
              <InputField
                icon={User}
                label="Nom"
                name="nom"
                placeholder="Dupont"
              />
              <InputField
                icon={User}
                label="Prénom"
                name="prenom"
                placeholder="Jean"
              />
            </div>

            {/* Email */}
            <InputField
              icon={Mail}
              label="Email"
              name="email"
              type="email"
              placeholder="jean.dupont@email.com"
            />

            {/* Téléphone */}
            <InputField
              icon={Phone}
              label="Téléphone"
              name="telephone"
              type="tel"
              placeholder="06 12 34 56 78"
              required={false}
              hint="Optionnel - Format français"
            />

            {/* Mot de passe */}
            <PasswordField
              label="Mot de passe"
              name="motDePasse"
              show={showPassword}
              setShow={setShowPassword}
              placeholder="••••••••"
              hint="Min. 8 caractères avec majuscule, minuscule et chiffre"
            />

            {/* Confirmation mot de passe */}
            <PasswordField
              label="Confirmer le mot de passe"
              name="confirmMotDePasse"
              show={showConfirmPassword}
              setShow={setShowConfirmPassword}
              placeholder="••••••••"
            />

            {/* Submit */}
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
                  Inscription...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  S'inscrire
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Déjà un compte ?{" "}
              <Link to="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                Se connecter
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
