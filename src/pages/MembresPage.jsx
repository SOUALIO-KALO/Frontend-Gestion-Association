import { useEffect, useState, useCallback } from "react";
import { Search, Plus, Download, Filter, Trash2, Edit, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { membreService } from "../services/authService";
import { extractFormErrors } from "../utils/errorHandler";
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
  Alert,
} from "../components/ui";

const STATUTS = [
  { value: "", label: "Tous les statuts" },
  { value: "ACTIF", label: "Actif" },
  { value: "INACTIF", label: "Inactif" },
  { value: "BUREAU", label: "Bureau" },
];

const ROLES = [
  { value: "", label: "Tous les rôles" },
  { value: "ADMIN", label: "Admin" },
  { value: "MEMBRE", label: "Membre" },
];

const validateMembreForm = (data, { requirePassword = false } = {}) => {
  const errors = {};
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!data.prenom || data.prenom.trim().length < 2) {
    errors.prenom = "Prénom trop court";
  }
  if (!data.nom || data.nom.trim().length < 2) {
    errors.nom = "Nom trop court";
  }
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = "Email invalide";
  }
  if (requirePassword && (!data.motDePasse || data.motDePasse.length < 8)) {
    errors.motDePasse = "Mot de passe requis (8 caractères min)";
  }
  if (!requirePassword && data.motDePasse && data.motDePasse.length < 8) {
    errors.motDePasse = "8 caractères minimum";
  }
  if (!data.statut) {
    errors.statut = "Statut requis";
  }
  if (!data.role) {
    errors.role = "Rôle requis";
  }

  return errors;
};

export default function MembresPage() {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ statut: "", role: "" });
  const [showFilters, setShowFilters] = useState(false);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedMembre, setSelectedMembre] = useState(null);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    motDePasse: "",
    statut: "ACTIF",
    role: "MEMBRE",
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const handlePageChange = (newPage) => {
    const total = pagination.pages || 1;
    const nextPage = Math.min(Math.max(1, newPage), total);
    if (nextPage !== page) setPage(nextPage);
  };

  const loadMembres = useCallback(async () => {
    try {
      setLoading(true);
      const response = await membreService.getAllMembres(
        page,
        10,
        filters.statut || null,
        filters.role || null
      );
      setMembres(response.data.data || []);
      const paginationData = response.data.pagination || {};
      const totalItems =
        paginationData.total ?? response.data.total ?? (response.data.data?.length || 0);
      const pages =
        paginationData.pages ??
        (paginationData.limit
          ? Math.max(1, Math.ceil(totalItems / paginationData.limit))
          : Math.max(1, Math.ceil(totalItems / 10)));
      setPagination({ total: totalItems, pages });
    } catch (err) {
      toast.error("Erreur lors du chargement des membres");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadMembres();
  }, [loadMembres]);

  // Empêcher de rester sur une page au-delà de la dernière
  useEffect(() => {
    const total = pagination.pages || 1;
    if (page > total) {
      setPage(total);
    }
  }, [pagination.pages, page]);

  // Filter members by search
  const filteredMembres = membres.filter((membre) => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    return (
      membre.nom?.toLowerCase().includes(searchLower) ||
      membre.prenom?.toLowerCase().includes(searchLower) ||
      membre.email?.toLowerCase().includes(searchLower)
    );
  });

  const handleExportCSV = async () => {
    try {
      const response = await membreService.exportMembresCSV();
      const blob = new Blob([response.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `membres_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export CSV téléchargé");
    } catch (err) {
      toast.error("Erreur lors de l'export");
      console.error(err);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormErrors({});

    const errors = validateMembreForm(formData, { requirePassword: true });
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    setSubmitting(true);

    try {
      await membreService.createMembre(formData);
      toast.success("Membre créé avec succès");
      setShowCreateModal(false);
      resetForm();
      loadMembres();
    } catch (err) {
      const { message, fieldErrors } = extractFormErrors(
        err,
        "Erreur lors de la création"
      );
      toast.error(message);
      setFormErrors(fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMembre) return;

    try {
      setSubmitting(true);
      await membreService.deleteMembre(selectedMembre.id);
      toast.success("Membre supprimé");
      setShowDeleteModal(false);
      setSelectedMembre(null);
      loadMembres();
    } catch (err) {
      toast.error("Erreur lors de la suppression");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
      motDePasse: "",
      statut: "ACTIF",
      role: "MEMBRE",
    });
    setFormErrors({});
  };

  const openDeleteModal = (membre) => {
    setSelectedMembre(membre);
    setShowDeleteModal(true);
  };

  const openEditModal = (membre) => {
    setSelectedMembre(membre);
    setFormData({
      nom: membre.nom || "",
      prenom: membre.prenom || "",
      email: membre.email || "",
      telephone: membre.telephone || "",
      motDePasse: "",
      statut: membre.statut || "ACTIF",
      role: membre.role || "MEMBRE",
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMembre) return;
    setFormErrors({});

    const errors = validateMembreForm(formData, { requirePassword: false });
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      toast.error("Veuillez corriger les erreurs du formulaire");
      return;
    }

    setSubmitting(true);

    try {
      const payload = { ...formData };
      if (!payload.motDePasse) {
        delete payload.motDePasse; // ne pas écraser le mot de passe si champ laissé vide
      }
      await membreService.updateMembre(selectedMembre.id, payload);
      toast.success("Membre mis à jour avec succès");
      setShowEditModal(false);
      setSelectedMembre(null);
      resetForm();
      loadMembres();
    } catch (err) {
      const { message, fieldErrors } = extractFormErrors(
        err,
        "Erreur lors de la mise à jour"
      );
      toast.error(message);
      setFormErrors(fieldErrors);
    } finally {
      setSubmitting(false);
    }
  };

  // Validation du formulaire
  const isFormValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return (
      formData.nom.trim().length >= 2 &&
      formData.prenom.trim().length >= 2 &&
      emailRegex.test(formData.email) &&
      formData.motDePasse.length >= 8 &&
      formData.statut
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Membres</h1>
          <p className="text-gray-600">{pagination.total} membres au total</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter CSV</span>
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Ajouter</span>
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, prénom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Filter toggle */}
          <Button
            variant={showFilters ? "primary" : "outline"}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4" />
            Filtres
          </Button>
        </div>

        {/* Filter options */}
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
            <Select
              label="Rôle"
              options={ROLES}
              value={filters.role}
              onChange={(e) => {
                setFilters({ ...filters, role: e.target.value });
                setPage(1);
              }}
            />
          </div>
        )}
      </div>

      {/* Table */}
      {loading ? (
        <Loading text="Chargement des membres..." />
      ) : filteredMembres.length === 0 ? (
        <EmptyState
          title="Aucun membre trouvé"
          description="Ajoutez votre premier membre ou modifiez vos filtres"
          action={
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              Ajouter un membre
            </Button>
          }
        />
      ) : (
        <>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Nom</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader className="hidden md:table-cell">Téléphone</TableHeader>
                <TableHeader>Statut</TableHeader>
                <TableHeader className="hidden sm:table-cell">Rôle</TableHeader>
                <TableHeader>Actions</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredMembres.map((membre) => (
                <TableRow key={membre.id}>
                  <TableCell>
                    <div className="font-medium text-gray-900">
                      {membre.prenom} {membre.nom}
                    </div>
                  </TableCell>
                  <TableCell>{membre.email}</TableCell>
                  <TableCell className="hidden md:table-cell">
                    {membre.telephone || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge status={membre.statut}>{membre.statut}</Badge>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <Badge status={membre.role}>{membre.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <button
                        className="p-1.5 rounded hover:bg-blue-50 text-blue-600"
                        onClick={() => openEditModal(membre)}
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-1.5 rounded hover:bg-red-50 text-red-600"
                        onClick={() => openDeleteModal(membre)}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
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
            onPageChange={handlePageChange}
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
        title="Nouveau membre"
        size="lg"
      >
        <form onSubmit={handleCreateSubmit}>
          {/* Ligne Nom / Prénom côte à côte sur écran ≥ sm */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              error={formErrors.prenom}
              required
            />
            <Input
              label="Nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              error={formErrors.nom}
              required
            />
          </div>

          {/* Autres champs en-dessous, pleine largeur sur mobile, grille dès sm */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
              required
            />
            <Input
              label="Téléphone"
              name="telephone"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              error={formErrors.telephone}
            />
            <Input
              label="Mot de passe"
              type="password"
              value={formData.motDePasse}
              onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
              error={formErrors.motDePasse}
              required
            />
            <Select
              label="Statut"
              options={STATUTS.slice(1)}
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
            />
          </div>

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
              Créer le membre
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMembre(null);
          resetForm();
        }}
        title="Modifier le membre"
        size="lg"
      >
        <form onSubmit={handleEditSubmit}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Prénom"
              value={formData.prenom}
              onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
              error={formErrors.prenom}
              required
            />
            <Input
              label="Nom"
              value={formData.nom}
              onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
              error={formErrors.nom}
              required
            />
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              error={formErrors.email}
              required
            />
            <Input
              label="Téléphone"
              name="telephone"
              value={formData.telephone}
              onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
              error={formErrors.telephone}
            />
            <Input
              label="Mot de passe (laisser vide pour conserver)"
              type="password"
              value={formData.motDePasse}
              onChange={(e) => setFormData({ ...formData, motDePasse: e.target.value })}
              error={formErrors.motDePasse}
            />
            <Select
              label="Statut"
              options={STATUTS.slice(1)}
              value={formData.statut}
              onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
            />
            <Select
              label="Rôle"
              options={ROLES.slice(1)}
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            />
          </div>

          <ModalFooter>
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setSelectedMembre(null);
                resetForm();
              }}
            >
              Annuler
            </Button>
            <Button type="submit" loading={submitting} disabled={submitting}>
              Mettre à jour
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedMembre(null);
        }}
        title="Confirmer la suppression"
        size="sm"
      >
        <Alert variant="warning">
          Êtes-vous sûr de vouloir supprimer le membre{" "}
          <strong>
            {selectedMembre?.prenom} {selectedMembre?.nom}
          </strong>{" "}
          ? Cette action est irréversible.
        </Alert>

        <ModalFooter>
          <Button
            variant="secondary"
            onClick={() => {
              setShowDeleteModal(false);
              setSelectedMembre(null);
            }}
          >
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete} loading={submitting}>
            Supprimer
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
