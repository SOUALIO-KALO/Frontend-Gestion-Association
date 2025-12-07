import { useEffect, useState, useCallback } from "react";
import { Plus, Download, Filter, FileText, AlertTriangle } from "lucide-react";
import { format, addYears } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { cotisationService, membreService } from "../services/authService";
import {
  Button,
  Input,
  Select,
  Modal,
  ModalFooter,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableHeader,
  TableCell,
  Badge,
  Loading,
  EmptyState,
  Pagination,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui";

const STATUTS = [
  { value: "", label: "Tous les statuts" },
  { value: "A_JOUR", label: "À jour" },
  { value: "EXPIRE", label: "Expiré" },
  { value: "EN_ATTENTE", label: "En attente" },
];

const MODES_PAIEMENT = [
  { value: "ESPECES", label: "Espèces" },
  { value: "CHEQUE", label: "Chèque" },
  { value: "VIREMENT", label: "Virement" },
  { value: "CARTE_BANCAIRE", label: "Carte bancaire" },
];

export default function CotisationsPage() {
  const [cotisations, setCotisations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [filters, setFilters] = useState({ statut: "" });
  const [showFilters, setShowFilters] = useState(false);
  const [showAlertes, setShowAlertes] = useState(false);
  const [alertes, setAlertes] = useState([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [membres, setMembres] = useState([]);
  const [formData, setFormData] = useState({
    membreId: "",
    datePaiement: format(new Date(), "yyyy-MM-dd"),
    montant: "50",
    modePaiement: "ESPECES",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadCotisations = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cotisationService.getAllCotisations(
        page,
        10,
        filters.statut || null
      );
      setCotisations(response.data.data || []);
      setPagination(response.data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      toast.error("Erreur lors du chargement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  const loadAlertes = async () => {
    try {
      const response = await cotisationService.getAlertes();
      setAlertes(response.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMembres = async () => {
    try {
      const response = await membreService.getAllMembres(1, 100);
      setMembres(response.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadCotisations();
    loadAlertes();
  }, [loadCotisations]);

  const handleDownloadPDF = async (id) => {
    try {
      const response = await cotisationService.generatePDF(id);
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `recu_cotisation_${id}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Reçu PDF téléchargé");
    } catch (err) {
      toast.error("Erreur lors du téléchargement");
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await cotisationService.createCotisation(formData);
      toast.success("Cotisation créée avec succès");
      setShowCreateModal(false);
      resetForm();
      loadCotisations();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      membreId: "",
      datePaiement: format(new Date(), "yyyy-MM-dd"),
      montant: "50",
      modePaiement: "ESPECES",
    });
  };

  const openCreateModal = () => {
    loadMembres();
    setShowCreateModal(true);
  };

  // Calculer la date d'expiration preview
  const expirationPreview = formData.datePaiement
    ? format(addYears(new Date(formData.datePaiement), 1), "dd MMMM yyyy", { locale: fr })
    : "";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Cotisations</h1>
          <p className="text-gray-600">{pagination.total} cotisations au total</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showAlertes ? "warning" : "outline"}
            onClick={() => setShowAlertes(!showAlertes)}
          >
            <AlertTriangle className="w-4 h-4" />
            Alertes ({alertes.length})
          </Button>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nouvelle</span>
          </Button>
        </div>
      </div>

      {/* Alertes Panel */}
      {showAlertes && alertes.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">
              Cotisations expirant dans 30 jours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alertes.slice(0, 5).map((alerte) => (
                <div
                  key={alerte.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg"
                >
                  <div>
                    <p className="font-medium">
                      {alerte.membre?.prenom} {alerte.membre?.nom}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expire le{" "}
                      {format(new Date(alerte.dateExpiration), "d MMMM yyyy", {
                        locale: fr,
                      })}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Envoyer rappel
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant={showFilters ? "primary" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filtres
          </Button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 pt-4 border-t">
            <Select
              label="Statut"
              options={STATUTS}
              value={filters.statut}
              onChange={(e) => {
                setFilters({ ...filters, statut: e.target.value });
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <Loading text="Chargement des cotisations..." />
      ) : cotisations.length === 0 ? (
        <EmptyState
          title="Aucune cotisation trouvée"
          description="Créez une nouvelle cotisation"
          action={
            <Button onClick={openCreateModal}>
              <Plus className="w-4 h-4" />
              Nouvelle cotisation
            </Button>
          }
        />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Membre</TableHeader>
                <TableHeader>Date paiement</TableHeader>
                <TableHeader>Montant</TableHeader>
                <TableHeader className="hidden sm:table-cell">Mode</TableHeader>
                <TableHeader>Statut</TableHeader>
                <TableHeader className="hidden md:table-cell">Expiration</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {cotisations.map((cotisation) => (
                <TableRow key={cotisation.id}>
                  <TableCell>
                    <div className="font-medium">
                      {cotisation.membre?.prenom} {cotisation.membre?.nom}
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(cotisation.datePaiement), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {cotisation.montant} FCFA
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {cotisation.modePaiement?.replace("_", " ")}
                  </TableCell>
                  <TableCell>
                    <Badge status={cotisation.statut}>
                      {cotisation.statut?.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {format(new Date(cotisation.dateExpiration), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <button
                      onClick={() => handleDownloadPDF(cotisation.id)}
                      className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                      title="Télécharger reçu PDF"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Pagination
            currentPage={page}
            totalPages={pagination.pages}
            totalItems={pagination.total}
            itemsPerPage={10}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          resetForm();
        }}
        title="Nouvelle cotisation"
        size="md"
      >
        <form onSubmit={handleCreateSubmit}>
          <Select
            label="Membre"
            options={membres.map((m) => ({
              value: m.id,
              label: `${m.prenom} ${m.nom} (${m.email})`,
            }))}
            value={formData.membreId}
            onChange={(e) => setFormData({ ...formData, membreId: e.target.value })}
            placeholder="Sélectionner un membre"
            required
          />

          <Input
            label="Date de paiement"
            type="date"
            value={formData.datePaiement}
            onChange={(e) => setFormData({ ...formData, datePaiement: e.target.value })}
            required
          />

          <Input
            label="Montant (FCFA)"
            type="number"
            step="0.01"
            min="0"
            value={formData.montant}
            onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
            required
          />

          <Select
            label="Mode de paiement"
            options={MODES_PAIEMENT}
            value={formData.modePaiement}
            onChange={(e) => setFormData({ ...formData, modePaiement: e.target.value })}
          />

          {expirationPreview && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 mb-4">
              Date d'expiration prévue : <strong>{expirationPreview}</strong>
            </div>
          )}

          <ModalFooter>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setShowCreateModal(false);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button type="submit" loading={submitting}>
              Créer la cotisation
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
