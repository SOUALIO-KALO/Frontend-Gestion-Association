import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import "../styles/auth.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, error } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    motDePasse: "",
    confirmMotDePasse: "",
  });
  const [formError, setFormError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    if (formData.motDePasse.length < 8) {
      setFormError("Le mot de passe doit contenir au moins 8 caractères");
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
      await register(dataToSend);
      toast.success("Inscription réussie ! Vous pouvez vous connecter.");
      navigate("/login");
    } catch (err) {
      // Debug: afficher l'erreur complète dans la console
      console.error("Erreur inscription:", err);
      console.error("err.response:", err.response);
      console.error("err.message:", err.message);
      
      // Récupérer le message d'erreur du backend ou un message par défaut
      let errorMessage = "Erreur lors de l'inscription";
      
      if (err.response?.data?.message) {
        // Erreur du backend
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.errors) {
        // Erreurs de validation
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
