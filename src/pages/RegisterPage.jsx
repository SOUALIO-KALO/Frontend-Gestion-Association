import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import { extractFormErrors } from "../utils/errorHandler";
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
  const [fieldErrors, setFieldErrors] = useState({});

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
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFieldErrors({});
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
      console.error("Response data:", err.response?.data);
      console.error("Status:", err.response?.status);

      const { message, fieldErrors: errors } = extractFormErrors(
        err,
        "Erreur lors de l'inscription"
      );

      setFormError(message);
      setFieldErrors(errors);
      toast.error(message);
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
              className={fieldErrors.nom ? "input-error" : ""}
            />
            {fieldErrors.nom && (
              <span className="field-error">{fieldErrors.nom}</span>
            )}
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
              className={fieldErrors.prenom ? "input-error" : ""}
            />
            {fieldErrors.prenom && (
              <span className="field-error">{fieldErrors.prenom}</span>
            )}
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
              className={fieldErrors.email ? "input-error" : ""}
            />
            {fieldErrors.email && (
              <span className="field-error">{fieldErrors.email}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="telephone">Téléphone</label>
            <input
              type="tel"
              id="telephone"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="0601020304"
              required
              className={fieldErrors.telephone ? "input-error" : ""}
            />
            {fieldErrors.telephone && (
              <span className="field-error">{fieldErrors.telephone}</span>
            )}
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
              className={fieldErrors.motDePasse ? "input-error" : ""}
            />
            {fieldErrors.motDePasse && (
              <span className="field-error">{fieldErrors.motDePasse}</span>
            )}
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
              className={fieldErrors.confirmMotDePasse ? "input-error" : ""}
            />
            {fieldErrors.confirmMotDePasse && (
              <span className="field-error">{fieldErrors.confirmMotDePasse}</span>
            )}
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
