import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CreditCard, Calendar, TrendingUp, Clock, MapPin, CheckCircle, AlertTriangle, CalendarCheck } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useAuth } from "../contexts/AuthContext";
import { dashboardService, evenementService, cotisationService, adminService } from "../services/authService";
import toast from "react-hot-toast";
import { StatCard, EventCard, AlertList } from "../components/dashboard";
import { Loading, Card, CardHeader, CardTitle, CardContent, Badge, Button } from "../components/ui";

const COLORS = ["#22c55e", "#ef4444", "#f59e0b"];

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [mesCotisations, setMesCotisations] = useState([]);
  const [mesInscriptions, setMesInscriptions] = useState([]);
  const [seeding, setSeeding] = useState(false);
  const [showSeedConfirm, setShowSeedConfirm] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, [isAdmin]);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    try {
      const response = await adminService.seedDatabase();
      toast.success(
        <div>
          <p className="font-semibold">Base de données réinitialisée !</p>
          <p className="text-sm">{response.data.data.membres} membres créés</p>
        </div>,
        { duration: 5000 }
      );
      setShowSeedConfirm(false);
      // Recharger les données
      loadDashboardData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors du seed");
    } finally {
      setSeeding(false);
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (isAdmin) {
        // Charger les statistiques admin
        const [statsData, eventsData, alertsData] = await Promise.all([
          dashboardService.getStats(),
          evenementService.getAllEvenements(1, 5, true),
          cotisationService.getAlertes(10).catch(() => ({ data: { data: [] } })),
        ]);

        setStats(statsData);
        setEvents(eventsData.data?.data || []);
        setAlerts(alertsData.data?.data || []);
      } else {
        // Charger les données membre
        const [eventsData, cotisationsData] = await Promise.all([
          evenementService.getAllEvenements(1, 10, true),
          cotisationService.getMesCotisations().catch(() => ({ data: { data: [] } })),
        ]);
        
        const allEvents = eventsData.data?.data || [];
        setEvents(allEvents);
        setMesCotisations(cotisationsData.data?.data || []);
        
        // Filtrer les événements où l'utilisateur est inscrit
        const inscriptions = allEvents.filter(event => 
          event.inscriptions?.some(i => i.membreId === user?.id && i.statut === "CONFIRMEE")
        );
        setMesInscriptions(inscriptions);
      }
    } catch (error) {
      console.error("Erreur chargement dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Données pour les graphiques
  const monthNames = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const membershipData = stats?.membres?.evolution?.length > 0
    ? stats.membres.evolution.map((item) => ({
        month: monthNames[parseInt(item.mois?.split("-")[1]) - 1] || item.mois,
        membres: item.total || 0,
      }))
    : [
        { month: "Jan", membres: 0 },
        { month: "Fév", membres: 0 },
        { month: "Mar", membres: 0 },
        { month: "Avr", membres: 0 },
        { month: "Mai", membres: 0 },
        { month: "Juin", membres: 0 },
      ];

  const statusData = [
    { name: "Actifs", value: stats?.membres?.membresActifs || 0, color: "#22c55e" },
    { name: "Inactifs", value: stats?.membres?.membresInactifs || 0, color: "#ef4444" },
    { name: "Bureau", value: stats?.membres?.membresBureau || 0, color: "#f59e0b" },
  ];

  if (loading) {
    return <Loading text="Chargement du tableau de bord..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bonjour, {user?.prenom} !
        </h1>
        <p className="text-gray-600 mt-1">
          {isAdmin
            ? "Voici un aperçu de votre association"
            : "Bienvenue sur votre espace membre"}
        </p>
      </div>

      {isAdmin ? (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Membres"
              value={stats?.membres?.totalMembres || 0}
              icon={Users}
              color="blue"
              onClick={() => navigate("/membres")}
            />
            <StatCard
              title="Membres Actifs"
              value={stats?.membres?.membresActifs || 0}
              icon={TrendingUp}
              color="green"
            />
            <StatCard
              title="Cotisations ce mois"
              value={stats?.cotisations?.cotisationsMoisCourant || 0}
              icon={CreditCard}
              color="purple"
              onClick={() => navigate("/cotisations")}
            />
            <StatCard
              title="Événements à venir"
              value={stats?.evenements?.aVenir || 0}
              icon={Calendar}
              color="yellow"
              onClick={() => navigate("/evenements")}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Bar Chart - Evolution des adhésions */}
            <Card>
              <CardHeader>
                <CardTitle>Évolution des adhésions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={membershipData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="membres" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pie Chart - Répartition des statuts */}
            <Card>
              <CardHeader>
                <CardTitle>Répartition des statuts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Events and Alerts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Events */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Prochains événements</CardTitle>
                <button
                  onClick={() => navigate("/evenements")}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Voir tous
                </button>
              </CardHeader>
              <CardContent className="space-y-2">
                {events.length > 0 ? (
                  events.slice(0, 5).map((event) => (
                    <EventCard key={event.id} event={event} compact />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Aucun événement à venir
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Alerts */}
            <AlertList
              alerts={alerts.slice(0, 5)}
              title="Cotisations expirant bientôt"
            />
          </div>

          {/* Admin Tools - Seed Database */}
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">Outils d'administration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Réinitialiser la base de données</p>
                  <p className="text-sm text-gray-600">
                    Supprime toutes les données et charge les données de test
                  </p>
                </div>
                {!showSeedConfirm ? (
                  <Button 
                    variant="outline" 
                    className="border-orange-300 text-orange-700 hover:bg-orange-100"
                    onClick={() => setShowSeedConfirm(true)}
                  >
                    Réinitialiser
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      onClick={() => setShowSeedConfirm(false)}
                    >
                      Annuler
                    </Button>
                    <Button 
                      variant="danger"
                      size="sm"
                      onClick={handleSeedDatabase}
                      loading={seeding}
                    >
                      Confirmer la suppression
                    </Button>
                  </div>
                )}
              </div>
              {showSeedConfirm && (
                <div className="mt-4 p-3 bg-red-100 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ Attention : Cette action supprimera TOUTES les données existantes !
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Comptes de test créés : admin@association.fr / Password123!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : (
        /* Member Dashboard */
        <div className="space-y-6">
          {/* Stats Cards for Member */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Mes inscriptions</p>
                    <p className="text-2xl font-bold">{mesInscriptions.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className={`bg-gradient-to-br ${
              mesCotisations[0]?.statut === 'A_JOUR' 
                ? 'from-green-500 to-green-600' 
                : mesCotisations[0]?.statut === 'EXPIRE' 
                  ? 'from-red-500 to-red-600'
                  : 'from-gray-500 to-gray-600'
            } text-white`}>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    {mesCotisations[0]?.statut === 'A_JOUR' ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : (
                      <AlertTriangle className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <p className="text-white/80 text-sm">Ma cotisation</p>
                    <p className="text-lg font-bold">
                      {mesCotisations[0]?.statut === 'A_JOUR' ? 'À jour' : 
                       mesCotisations[0]?.statut === 'EXPIRE' ? 'Expirée' : 
                       mesCotisations[0] ? 'En attente' : 'Aucune'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-purple-100 text-sm">Événements à venir</p>
                    <p className="text-2xl font-bold">{events.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>Mon Profil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-600">
                      {user?.prenom?.[0]}{user?.nom?.[0]}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900">
                    {user?.prenom} {user?.nom}
                  </h3>
                  <p className="text-gray-500">{user?.email}</p>
                </div>

                <div className="space-y-3 pt-4 border-t">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Statut</span>
                    <Badge status={user?.statut}>{user?.statut}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Téléphone</span>
                    <span className="font-medium">{user?.telephone || "—"}</span>
                  </div>
                </div>

                {/* Cotisation Info */}
                {mesCotisations[0] && (
                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-700 mb-2">Cotisation</h4>
                    <div className={`p-3 rounded-lg ${
                      mesCotisations[0].statut === 'A_JOUR' ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        {mesCotisations[0].statut === 'A_JOUR' ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                        )}
                        <span className={`font-medium ${
                          mesCotisations[0].statut === 'A_JOUR' ? 'text-green-700' : 'text-red-700'
                        }`}>
                          {mesCotisations[0].statut === 'A_JOUR' ? 'À jour' : 'Expirée'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {mesCotisations[0].statut === 'A_JOUR' ? 'Expire le ' : 'Expirée le '}
                        {format(new Date(mesCotisations[0].dateExpiration), 'd MMMM yyyy', { locale: fr })}
                      </p>
                      {mesCotisations[0].statut === 'A_JOUR' && (
                        <p className="text-xs text-gray-500 mt-1">
                          {differenceInDays(new Date(mesCotisations[0].dateExpiration), new Date())} jours restants
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Mes inscriptions */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Mes inscriptions</CardTitle>
                <Button variant="outline" size="sm" onClick={() => navigate('/evenements')}>
                  Voir tous les événements
                </Button>
              </CardHeader>
              <CardContent>
                {mesInscriptions.length > 0 ? (
                  <div className="space-y-3">
                    {mesInscriptions.slice(0, 3).map((event) => (
                      <div key={event.id} className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                        <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 flex flex-col items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {format(new Date(event.dateDebut), 'MMM', { locale: fr }).toUpperCase()}
                          </span>
                          <span className="text-xl font-bold text-blue-700">
                            {format(new Date(event.dateDebut), 'd')}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">{event.titre}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(event.dateDebut), 'HH:mm')}
                            </span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3" />
                              {event.lieu}
                            </span>
                          </div>
                        </div>
                        <Badge variant="success">Inscrit</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CalendarCheck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                    <p className="text-gray-500 mb-4">Vous n'êtes inscrit à aucun événement</p>
                    <Button onClick={() => navigate('/evenements')}>
                      Découvrir les événements
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Available Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Événements disponibles</CardTitle>
              <Button variant="outline" size="sm" onClick={() => navigate('/evenements')}>
                Voir tout
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {events.filter(e => !mesInscriptions.some(i => i.id === e.id)).slice(0, 6).map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
                {events.filter(e => !mesInscriptions.some(i => i.id === e.id)).length === 0 && (
                  <p className="text-gray-500 text-center py-8 col-span-full">
                    Aucun événement disponible pour le moment
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
