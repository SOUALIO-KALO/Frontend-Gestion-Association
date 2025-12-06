import { useEffect, useState } from "react";
import { membreService } from "../services/authService";
import "../styles/pages.css";

export default function MembresPage() {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    loadMembres();
  }, [page]);

  const loadMembres = async () => {
    try {
      setLoading(true);
      const response = await membreService.getAllMembres(page, 10);
      console.log("Membres API Response:", response);
      setMembres(response.data.data || []);
      setTotal(response.data.pagination?.total || 0);
      setError("");
    } catch (err) {
      setError("Erreur lors du chargement des membres");
      console.error("Error loading membres:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1>Gestion des Membres</h1>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading">Chargement...</div>
      ) : (
        <div className="content">
          <table className="table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Statut</th>
                <th>Rôle</th>
              </tr>
            </thead>
            <tbody>
              {membres.map((membre) => (
                <tr key={membre.id}>
                  <td>
                    {membre.nom} {membre.prenom}
                  </td>
                  <td>{membre.email}</td>
                  <td>{membre.telephone || "-"}</td>
                  <td>
                    <span
                      className={`badge badge-${membre.statut.toLowerCase()}`}
                    >
                      {membre.statut}
                    </span>
                  </td>
                  <td>{membre.role}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {total === 0 && <p className="no-data">Aucun membre trouvé</p>}
        </div>
      )}
    </div>
  );
}
