import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "../styles/dashboard.css";

export default function DashboardPage() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  useEffect(() => {
    // Charger les stats si disponibles
    // À implémenter selon vos besoins
  }, []);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Tableau de bord</h1>
        <div className="user-info">
          <span>
            Bienvenue, {user?.prenom} {user?.nom}
          </span>
          {isAdmin && <span className="badge badge-admin">Admin</span>}
          <button onClick={handleLogout} className="btn btn-secondary">
            Déconnexion
          </button>
        </div>
      </header>

      {isAdmin && (
        <nav className="dashboard-nav">
          <button onClick={() => navigate("/membres")} className="nav-link">
            👥 Membres
          </button>
          <button onClick={() => navigate("/cotisations")} className="nav-link">
            💰 Cotisations
          </button>
          <button onClick={() => navigate("/evenements")} className="nav-link">
            📅 Événements
          </button>
        </nav>
      )}

      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Bienvenue sur Gestion Associative</h2>
          <p>
            {isAdmin
              ? "Gérez facilement les membres, cotisations et événements de votre association."
              : "Consultez votre profil et vos informations d'adhésion."}
          </p>
        </div>

        {isAdmin ? (
          <div className="admin-section">
            <h3>Fonctionnalités Admin</h3>
            <div className="admin-grid">
              <div className="admin-card" onClick={() => navigate("/membres")}>
                <h4>👥 Gestion des Membres</h4>
                <p>Consultez et gérez tous les membres de l'association</p>
              </div>
              <div
                className="admin-card"
                onClick={() => navigate("/cotisations")}
              >
                <h4>💰 Gestion des Cotisations</h4>
                <p>Suivez les cotisations et les paiements</p>
              </div>
              <div
                className="admin-card"
                onClick={() => navigate("/evenements")}
              >
                <h4>📅 Gestion des Événements</h4>
                <p>Organisez et gérez les événements</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="member-section">
            <h3>Profil Membre</h3>
            <div className="member-info">
              <div className="info-card">
                <label>Nom</label>
                <p>{user?.nom}</p>
              </div>
              <div className="info-card">
                <label>Prénom</label>
                <p>{user?.prenom}</p>
              </div>
              <div className="info-card">
                <label>Email</label>
                <p>{user?.email}</p>
              </div>
              <div className="info-card">
                <label>Téléphone</label>
                <p>{user?.telephone || "Non renseigné"}</p>
              </div>
              <div className="info-card">
                <label>Statut</label>
                <p>
                  <span
                    className={`badge badge-${
                      user?.statut?.toLowerCase() || "inactif"
                    }`}
                  >
                    {user?.statut || "Inactif"}
                  </span>
                </p>
              </div>
              <div className="info-card">
                <label>Rôle</label>
                <p>
                  <span className="badge badge-membre">{user?.role}</span>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
