import { useEffect, useState, useCallback } from "react";
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  MapPin,
  Users,
  Clock,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import toast from "react-hot-toast";
import { evenementService } from "../services/authService";
import { useAuth } from "../contexts/AuthContext";
import {
  Button,
  Input,
  Select,
  Modal,
  ModalFooter,
  Badge,
  Loading,
  EmptyState,
  Pagination,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui";

export default function EvenementsPage() {
  const { isAdmin, user } = useAuth();
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'calendar'
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState([]);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    dateDebut: "",
    dateFin: "",
    lieu: "",
    placesTotal: "20",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadEvenements = useCallback(async () => {
    try {
      setLoading(true);
      const response = await evenementService.getAllEvenements(page, 10);
      setEvenements(response.data.data || []);
      setPagination(response.data.pagination || { total: 0, pages: 1 });
    } catch (err) {
      toast.error("Erreur lors du chargement");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  const loadCalendarEvents = useCallback(async () => {
    try {
      const mois = currentMonth.getMonth() + 1;
      const annee = currentMonth.getFullYear();
      const response = await evenementService.getCalendrier(mois, annee);
      setCalendarEvents(response.data.data || []);
    } catch (err) {
      console.error(err);
    }
  }, [currentMonth]);

  useEffect(() => {
    if (viewMode === "list") {
      loadEvenements();
    } else {
      loadCalendarEvents();
    }
  }, [viewMode, loadEvenements, loadCalendarEvents]);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await evenementService.createEvenement(formData);
      toast.success("Événement créé avec succès");
      setShowCreateModal(false);
      resetForm();
      loadEvenements();
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const handleInscrire = async (eventId) => {
    setInscribing(eventId);
    try {
      await evenementService.inscrire(eventId);
      toast.success(
        <div className="flex items-center gap-2">
          <Check className="w-5 h-5 text-green-500" />
          <div>
            <p className="font-semibold">Inscription réussie !</p>
            <p className="text-sm">Vous êtes inscrit à cet événement</p>
          </div>
        </div>,
        { duration: 4000 }
      );
      loadEvenements();
      if (selectedEvent) {
        const response = await evenementService.getEvenementById(eventId);
        setSelectedEvent(response.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setInscribing(null);
    }
  };

  const handleDesinscrire = async (eventId) => {
    setDesinscribing(eventId);
    try {
      await evenementService.desinscrire(eventId);
      toast.success(
        <div className="flex items-center gap-2">
          <X className="w-5 h-5 text-orange-500" />
          <div>
            <p className="font-semibold">Désinscription effectuée</p>
            <p className="text-sm">Vous n'êtes plus inscrit à cet événement</p>
          </div>
        </div>,
        { duration: 4000 }
      );
      loadEvenements();
      if (selectedEvent) {
        const response = await evenementService.getEvenementById(eventId);
        setSelectedEvent(response.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Erreur lors de la désinscription");
    } finally {
      setDesinscribing(null);
    }
  };

  const openDetailModal = async (event) => {
    try {
      const response = await evenementService.getEvenementById(event.id);
      setSelectedEvent(response.data.data);
      setShowDetailModal(true);
    } catch (err) {
      toast.error("Erreur lors du chargement");
    }
  };

  const resetForm = () => {
    setFormData({
      titre: "",
      description: "",
      dateDebut: "",
      dateFin: "",
      lieu: "",
      placesTotal: "20",
    });
  };

  // Validation du formulaire
  const isFormValid = () => {
    return (
      formData.titre.trim().length >= 3 &&
      formData.dateDebut &&
      formData.lieu.trim().length >= 2 &&
      formData.placesTotal &&
      parseInt(formData.placesTotal) > 0
    );
  };

  const isUserInscrit = (event) => {
    return event.inscriptions?.some(
      (i) => i.membreId === user?.id && i.statut === "CONFIRMEE"
    );
  };

  const [inscribing, setInscribing] = useState(null);
  const [desinscribing, setDesinscribing] = useState(null);

  // Calendar rendering
  const renderCalendar = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get first day of week offset
    const startDay = monthStart.getDay();
    const blanks = Array(startDay === 0 ? 6 : startDay - 1).fill(null);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-semibold">
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 rounded-lg hover:bg-gray-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="h-24" />
          ))}
          {days.map((day) => {
            const dayEvents = calendarEvents.filter((e) =>
              isSameDay(new Date(e.dateDebut), day)
            );

            return (
              <div
                key={day.toISOString()}
                className={`h-24 p-1 border rounded-lg ${
                  isSameDay(day, new Date()) ? "bg-blue-50 border-blue-200" : "border-gray-100"
                }`}
              >
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {format(day, "d")}
                </div>
                <div className="space-y-1">
                  {dayEvents.slice(0, 2).map((event) => (
                    <div
                      key={event.id}
                      onClick={() => openDetailModal(event)}
                      className="text-xs p-1 bg-blue-100 text-blue-700 rounded truncate cursor-pointer hover:bg-blue-200"
                    >
                      {event.titre}
                    </div>
                  ))}
                  {dayEvents.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayEvents.length - 2} autres
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Event card component
  const EventCard = ({ event }) => {
    const isComplete = event.placesRestantes === 0;
    const inscrit = isUserInscrit(event);

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-5">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold text-lg text-gray-900">{event.titre}</h3>
            <div className="flex gap-1">
              {inscrit && (
                <Badge variant="success">Inscrit</Badge>
              )}
              {isComplete && !inscrit && (
                <Badge variant="danger">Complet</Badge>
              )}
            </div>
          </div>

          {event.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
          )}

          <div className="space-y-2 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>
                {format(new Date(event.dateDebut), "EEEE d MMMM à HH:mm", { locale: fr })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{event.lieu}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>
                {event.placesRestantes}/{event.placesTotal} places disponibles
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openDetailModal(event)}
              className="flex-1"
            >
              Détails
            </Button>
            {!isAdmin && !isComplete && !inscrit && (
              <Button
                size="sm"
                onClick={() => handleInscrire(event.id)}
                className="flex-1"
                loading={inscribing === event.id}
                disabled={inscribing === event.id}
              >
                S'inscrire
              </Button>
            )}
            {!isAdmin && inscrit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDesinscrire(event.id)}
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                loading={desinscribing === event.id}
                disabled={desinscribing === event.id}
              >
                Se désinscrire
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Événements</h1>
          <p className="text-gray-600">{pagination.total} événements</p>
        </div>
        <div className="flex gap-2">
          {/* View toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded ${viewMode === "list" ? "bg-white shadow-sm" : ""}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("calendar")}
              className={`p-2 rounded ${viewMode === "calendar" ? "bg-white shadow-sm" : ""}`}
            >
              <CalendarIcon className="w-4 h-4" />
            </button>
          </div>
          
          {isAdmin && (
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loading text="Chargement des événements..." />
      ) : viewMode === "calendar" ? (
        renderCalendar()
      ) : evenements.length === 0 ? (
        <EmptyState
          title="Aucun événement"
          description="Aucun événement n'est prévu pour le moment"
          action={
            isAdmin && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4" />
                Créer un événement
              </Button>
            )
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evenements.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>

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
      {isAdmin && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            resetForm();
          }}
          title="Nouvel événement"
          size="lg"
        >
          <form onSubmit={handleCreateSubmit}>
            <Input
              label="Titre"
              value={formData.titre}
              onChange={(e) => setFormData({ ...formData, titre: e.target.value })}
              required
            />

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Date et heure de début"
                type="datetime-local"
                value={formData.dateDebut}
                onChange={(e) => setFormData({ ...formData, dateDebut: e.target.value })}
                required
              />
              <Input
                label="Date et heure de fin"
                type="datetime-local"
                value={formData.dateFin}
                onChange={(e) => setFormData({ ...formData, dateFin: e.target.value })}
              />
            </div>

            <Input
              label="Lieu"
              value={formData.lieu}
              onChange={(e) => setFormData({ ...formData, lieu: e.target.value })}
              required
            />

            <Input
              label="Nombre de places"
              type="number"
              min="1"
              value={formData.placesTotal}
              onChange={(e) => setFormData({ ...formData, placesTotal: e.target.value })}
              required
            />

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
              <Button type="submit" loading={submitting} disabled={!isFormValid() || submitting}>
                Créer l'événement
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEvent(null);
        }}
        title={selectedEvent?.titre}
        size="lg"
      >
        {selectedEvent && (
          <div className="space-y-4">
            {selectedEvent.description && (
              <p className="text-gray-600">{selectedEvent.description}</p>
            )}

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Date et heure</p>
                  <p className="text-gray-600">
                    {format(new Date(selectedEvent.dateDebut), "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Lieu</p>
                  <p className="text-gray-600">{selectedEvent.lieu}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Users className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium">Places</p>
                  <p className="text-gray-600">
                    {selectedEvent.placesRestantes}/{selectedEvent.placesTotal} disponibles
                  </p>
                </div>
              </div>
            </div>

            {/* Participants list (admin only) */}
            {isAdmin && selectedEvent.inscriptions?.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">
                  Participants ({selectedEvent.inscriptions.filter(i => i.statut === "CONFIRMEE").length})
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedEvent.inscriptions
                    .filter((i) => i.statut === "CONFIRMEE")
                    .map((inscription) => (
                      <div
                        key={inscription.id}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <span>
                          {inscription.membre?.prenom} {inscription.membre?.nom}
                        </span>
                        <Badge variant="success">Confirmé</Badge>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <ModalFooter>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedEvent(null);
                }}
              >
                Fermer
              </Button>
              {!isAdmin && !isUserInscrit(selectedEvent) && selectedEvent.placesRestantes > 0 && (
                <Button 
                  onClick={() => handleInscrire(selectedEvent.id)}
                  loading={inscribing === selectedEvent.id}
                  disabled={inscribing === selectedEvent.id}
                >
                  S'inscrire à cet événement
                </Button>
              )}
              {!isAdmin && isUserInscrit(selectedEvent) && (
                <Button 
                  variant="danger" 
                  onClick={() => handleDesinscrire(selectedEvent.id)}
                  loading={desinscribing === selectedEvent.id}
                  disabled={desinscribing === selectedEvent.id}
                >
                  Se désinscrire
                </Button>
              )}
            </ModalFooter>
          </div>
        )}
      </Modal>
    </div>
  );
}
