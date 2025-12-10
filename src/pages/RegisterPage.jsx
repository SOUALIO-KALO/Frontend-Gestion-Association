import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import "../styles/auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    motDePasse: "",
    confirmMotDePasse: "",
  });
  const [formError, setFormError] = useState("");

  // Redirection automatique après succès
  useEffect(() => {
    if (registrationSuccess) {
      const timer = setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [registrationSuccess, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Effacer les erreurs quand l'utilisateur modifie le formulaire
    if (formError) setFormError("");
  };

  const validateForm = () => {
    if (!formData.nom.trim()) {
      setFormError("Le nom est requis");
      return false;
    }
    if (!formData.prenom.trim()) {
      setFormError("Le prénom est requis");
      return false;
    }
    if (!formData.email.trim()) {
      setFormError("L'email est requis");
      return false;
    }
    // Validation email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError("Format d'email invalide");
      return false;
    }
    if (formData.motDePasse.length < 8) {
      setFormError("Le mot de passe doit contenir au moins 8 caractères");
      return false;
    }
    // Validation force du mot de passe
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.motDePasse)) {
      setFormError("Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre");
      return false;
    }
    if (formData.motDePasse !== formData.confirmMotDePasse) {
      setFormError("Les mots de passe ne correspondent pas");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const { confirmMotDePasse, ...dataToSend } = formData;
      const response = await register(dataToSend);
      
      // Vérifier que l'inscription a réussi
      if (response?.success || response?.data || response) {
        setRegistrationSuccess(true);
        toast.success("Inscription réussie ! Redirection vers la connexion...", {
          duration: 3000,
          icon: "🎉",
        });
      }
    } catch (err) {
      console.error("Erreur inscription:", err);
      
      let errorMessage = "Erreur lors de l'inscription";
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        const firstError = err.response.data.errors[0];
        errorMessage = firstError?.message || firstError?.msg || "Erreur de validation";
      } else if (err.message === "Network Error") {
        errorMessage = "Impossible de contacter le serveur. Vérifiez votre connexion.";
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "La requête a pris trop de temps. Veuillez réessayer.";
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setFormError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Affichage du message de succès
  if (registrationSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="success-message">
            <div className="success-icon">✓</div>
            <h1>Inscription réussie !</h1>
            <p>Votre compte a été créé avec succès.</p>
            <p className="redirect-notice">Redirection vers la page de connexion...</p>
            <Link to="/login" className="btn btn-primary">
              Se connecter maintenant
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>Inscription</h1>
        <p className="subtitle">Créez un compte</p>

        {(formError || error) && (
          <div className="alert alert-error">{formError || error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nom">Nom</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              required
              placeholder="Votre nom"
            />
          </div>

          <div className="form-group">
            <label htmlFor="prenom">Prénom</label>
            <input
              type="text"
              id="prenom"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              required
              placeholder="Votre prénom"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="email@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="telephone">Téléphone (optionnel)</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="0601020304"
            />
          </div>

          <div className="form-group">
            <label htmlFor="motDePasse">Mot de passe</label>
            <input
              type="password"
              id="motDePasse"
              name="motDePasse"
              value={formData.motDePasse}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmMotDePasse">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmMotDePasse"
              name="confirmMotDePasse"
              value={formData.confirmMotDePasse}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading ? "Inscription en cours..." : "S'inscrire"}
          </button>
        </form>

        <div className="auth-links">
          <p>
            Déjà inscrit? <Link to="/login">Se connecter</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
