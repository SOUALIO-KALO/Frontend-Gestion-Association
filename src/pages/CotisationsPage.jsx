import { useEffect, useState, useCallback } from "react";
import { Plus, Download, Filter, FileText, AlertTriangle, Mail, Loader2, Edit } from "lucide-react";
import { format, addMonths } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { extractFormErrors } from "../utils/errorHandler";
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
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCotisation, setSelectedCotisation] = useState(null);
  const [membres, setMembres] = useState([]);
  const [formData, setFormData] = useState({
    membreId: "",
    datePaiement: format(new Date(), "yyyy-MM-dd"),
    dateExpiration: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
    montant: "50",
    modePaiement: "ESPECES",
    periode: format(new Date(), "MM/yyyy"),
  });
  const [submitting, setSubmitting] = useState(false);
  const [sendingRappel, setSendingRappel] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

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
      const response = await cotisationService.getAlertes(10);
      setAlertes(response.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleEnvoyerRappel = async (cotisationId, membreNom) => {
    setSendingRappel(cotisationId);
    try {
      await cotisationService.envoyerRappel(cotisationId);
      toast.success(`Rappel envoyé à ${membreNom}`);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi du rappel");
    } finally {
      setSendingRappel(null);
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
    setFieldErrors({});
    setSubmitting(true);

    try {
      await cotisationService.createCotisation(formData);
      toast.success("Cotisation créée avec succès");
      setShowCreateModal(false);
      resetForm();
      loadCotisations();
    } catch (err) {
      const { message, fieldErrors: errors } = extractFormErrors(
        err,
        "Erreur lors de la création"
      );
      toast.error(message);
      setFieldErrors(errors);
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      membreId: "",
      datePaiement: format(new Date(), "yyyy-MM-dd"),
      dateExpiration: format(addMonths(new Date(), 1), "yyyy-MM-dd"),
      montant: "50",
      modePaiement: "ESPECES",
      periode: format(new Date(), "MM/yyyy"),
    });
  };

  const openCreateModal = () => {
    loadMembres();
    setShowCreateModal(true);
  };

  const openEditModal = (cotisation) => {
    setSelectedCotisation(cotisation);
    setFormData({
      membreId: cotisation.membreId,
      datePaiement: format(new Date(cotisation.datePaiement), "yyyy-MM-dd"),
      dateExpiration: format(new Date(cotisation.dateExpiration), "yyyy-MM-dd"),
      montant: cotisation.montant.toString(),
      modePaiement: cotisation.modePaiement,
      periode: cotisation.periode || "",
      statut: cotisation.statut,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setSubmitting(true);

    try {
      await cotisationService.updateCotisation(selectedCotisation.id, formData);
      toast.success("Cotisation modifiée avec succès");
      setShowEditModal(false);
      setSelectedCotisation(null);
      resetForm();
      loadCotisations();
    } catch (err) {
      const { message, fieldErrors: errors } = extractFormErrors(
        err,
        "Erreur lors de la modification"
      );
      toast.error(message);
      setFieldErrors(errors);
    } finally {
      setSubmitting(false);
    }
  };

  // Validation du formulaire de création
  const isFormValid = () => {
    return (
      formData.membreId &&
      formData.datePaiement &&
      formData.dateExpiration &&
      formData.montant &&
      parseFloat(formData.montant) > 0 &&
      formData.modePaiement
    );
  };

  // Fonction pour formater le nom du mois à partir de la période
  const getMonthName = (periode) => {
    if (!periode || !/^(0[1-9]|1[0-2])\/\d{4}$/.test(periode)) return '';
    const [mois, annee] = periode.split('/');
    const date = new Date(parseInt(annee), parseInt(mois) - 1, 1);
    return format(date, "MMMM yyyy", { locale: fr });
  };

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
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleEnvoyerRappel(alerte.id, `${alerte.membre?.prenom} ${alerte.membre?.nom}`)}
                    disabled={sendingRappel === alerte.id}
                  >
                    {sendingRappel === alerte.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                    {sendingRappel === alerte.id ? 'Envoi...' : 'Rappel'}
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
                <TableHeader>Période</TableHeader>
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
                    <span className="font-medium text-blue-600">
                      {cotisation.periode || "-"}
                    </span>
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
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(cotisation)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(cotisation.id)}
                        className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                        title="Télécharger reçu PDF"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                    </div>
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
            error={fieldErrors.membreId}
          />

          <Input
            label="Période concernée (MM/AAAA) - Optionnel"
            type="text"
            placeholder="Ex: 01/2024"
            value={formData.periode}
            onChange={(e) => {
              // Format automatique: ajouter le / après 2 chiffres
              let value = e.target.value.replace(/[^0-9/]/g, '');
              if (value.length === 2 && !value.includes('/')) {
                value = value + '/';
              }
              if (value.length <= 7) {
                setFormData({ ...formData, periode: value });
              }
            }}
          />
          {fieldErrors.periode && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.periode}</p>
          )}
          <p className="text-xs text-gray-500 -mt-3 mb-4">
            Mois et année de la cotisation mensuelle (ex: 01/2024 pour janvier 2024)
          </p>

          <Input
            label="Date de paiement"
            type="date"
            value={formData.datePaiement}
            onChange={(e) => setFormData({ ...formData, datePaiement: e.target.value })}
            required
            error={fieldErrors.datePaiement}
          />

          <Input
            label="Date d'expiration"
            type="date"
            value={formData.dateExpiration}
            onChange={(e) => setFormData({ ...formData, dateExpiration: e.target.value })}
            required
            error={fieldErrors.dateExpiration}
          />

          <Input
            label="Montant (FCFA)"
            type="number"
            step="0.01"
            min="0"
            value={formData.montant}
            onChange={(e) => setFormData({ ...formData, montant: e.target.value })}
            required
            error={fieldErrors.montant}
          />

          <Select
            label="Mode de paiement"
            options={MODES_PAIEMENT}
            value={formData.modePaiement}
            onChange={(e) => setFormData({ ...formData, modePaiement: e.target.value })}
            error={fieldErrors.modePaiement}
          />

          {formData.dateExpiration && (
            <div className="p-3 bg-green-50 rounded-lg text-sm text-green-700 mb-4">
              <p>Date d'expiration : <strong>{format(new Date(formData.dateExpiration), "dd MMMM yyyy", { locale: fr })}</strong></p>
              {formData.periode && /^(0[1-9]|1[0-2])\/\d{4}$/.test(formData.periode) && (
                <p className="text-xs mt-1">Période : {getMonthName(formData.periode)}</p>
              )}
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
            <Button type="submit" loading={submitting} disabled={submitting}>
              Créer la cotisation
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCotisation(null);
          resetForm();
        }}
        title="Modifier la cotisation"
        size="md"
      >
        <form onSubmit={handleEditSubmit}>
          {selectedCotisation && (
            <div className="p-3 bg-blue-50 rounded-lg text-sm text-blue-700 mb-4">
              <p className="font-medium">
                {selectedCotisation.membre?.prenom} {selectedCotisation.membre?.nom}
              </p>
              <p className="text-xs">{selectedCotisation.membre?.email}</p>
            </div>
          )}

          <Input
            label="Période concernée (MM/AAAA)"
            type="text"
            placeholder="Ex: 01/2024"
            value={formData.periode || ""}
            onChange={(e) => {
              let value = e.target.value.replace(/[^0-9/]/g, '');
              if (value.length === 2 && !value.includes('/')) {
                value = value + '/';
              }
              if (value.length <= 7) {
                setFormData({ ...formData, periode: value });
              }
            }}
          />

          <Input
            label="Date de paiement"
            type="date"
            value={formData.datePaiement}
            onChange={(e) => setFormData({ ...formData, datePaiement: e.target.value })}
            required
          />

          <Input
            label="Date d'expiration"
            type="date"
            value={formData.dateExpiration}
            onChange={(e) => setFormData({ ...formData, dateExpiration: e.target.value })}
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

          <Select
            label="Statut"
            options={[
              { value: "A_JOUR", label: "À jour" },
              { value: "EXPIRE", label: "Expiré" },
              { value: "EN_ATTENTE", label: "En attente" },
            ]}
            value={formData.statut}
            onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
          />

          <ModalFooter>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setSelectedCotisation(null);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button type="submit" loading={submitting} disabled={submitting}>
              Enregistrer
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  );
}
