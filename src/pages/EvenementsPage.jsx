import { useEffect, useState } from "react";
import { evenementService } from "../services/authService";
import "../styles/pages.css";

export default function EvenementsPage() {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadEvenements();
  }, [page]);

  const loadEvenements = async () => {
    try {
      setLoading(true);
      const response = await evenementService.getAllEvenements(page, 10);
      console.log("Evenements API Response:", response);
      setEvenements(response.data.data || []);
      setError("");
    } catch (err) {
      setError("Erreur lors du chargement des événements");
      console.error("Error loading evenements:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Gestion des Événements</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="content">
          <div className="events-grid">
            {evenements.map((event) => (
              <div key={event.id} className="event-card">
                <h3>{event.titre}</h3>
                <p className="description">{event.description}</p>
                <div className="event-info">
                  <p>
                    <strong>📍 Lieu:</strong> {event.lieu}
                  </p>
                  <p>
                    <strong>📅 Date:</strong>{" "}
                    {new Date(event.dateDebut).toLocaleDateString("fr-FR")}
                  </p>
                  <p>
                    <strong>👥 Places:</strong> {event.placesRestantes}/
                    {event.placesTotal} disponibles
                  </p>
                </div>
              </div>
            ))}
          </div>

          {evenements.length === 0 && (
            <p className="no-data">Aucun événement trouvé</p>
          )}
        </div>
      )}
    </div>
  );
}
