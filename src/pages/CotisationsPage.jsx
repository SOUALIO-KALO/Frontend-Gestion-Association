import { useEffect, useState } from "react";
import { cotisationService } from "../services/authService";
import "../styles/pages.css";

export default function CotisationsPage() {
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadCotisations();
  }, [page]);

  const loadCotisations = async () => {
    try {
      setLoading(true);
      const response = await cotisationService.getAllCotisations(page, 10);
      console.log("Cotisations API Response:", response);
      setCotisations(response.data.data || []);
      setError("");
    } catch (err) {
      setError("Erreur lors du chargement des cotisations");
      console.error("Error loading cotisations:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Gestion des Cotisations</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="content">
          <table className="table">
            <thead>
              <tr>
                <th>Référence</th>
                <th>Montant</th>
                <th>Mode de paiement</th>
                <th>Statut</th>
                <th>Expiration</th>
              </tr>
            </thead>
            <tbody>
              {cotisations.map((cotisation) => (
                <tr key={cotisation.id}>
                  <td>{cotisation.reference}</td>
                  <td>{cotisation.montant}€</td>
                  <td>{cotisation.modePaiement}</td>
                  <td>
                    <span
                      className={`badge badge-${cotisation.statut.toLowerCase()}`}
                    >
                      {cotisation.statut}
                    </span>
                  </td>
                  <td>
                    {new Date(cotisation.dateExpiration).toLocaleDateString(
                      "fr-FR"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {cotisations.length === 0 && (
            <p className="no-data">Aucune cotisation trouvée</p>
          )}
        </div>
      )}
    </div>
  );
}
