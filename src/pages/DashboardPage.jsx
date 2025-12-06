import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, CreditCard, Calendar, TrendingUp } from "lucide-react";
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
import { dashboardService, evenementService, cotisationService } from "../services/authService";
import { StatCard, EventCard, AlertList } from "../components/dashboard";
import { Loading, Card, CardHeader, CardTitle, CardContent, Badge } from "../components/ui";

const COLORS = ["#22c55e", "#ef4444", "#f59e0b"];

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, [isAdmin]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      if (isAdmin) {
        // Charger les statistiques admin
        const [statsData, eventsData, alertsData] = await Promise.all([
          dashboardService.getStats(),
          evenementService.getAllEvenements(1, 5, true),
          cotisationService.getAlertes().catch(() => ({ data: { data: [] } })),
        ]);

        setStats(statsData);
        setEvents(eventsData.data?.data || []);
        setAlerts(alertsData.data?.data || []);
      } else {
        // Charger les données membre
        const eventsData = await evenementService.getAllEvenements(1, 5, true);
        setEvents(eventsData.data?.data || []);
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
        </>
      ) : (
        /* Member Dashboard */
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
            </CardContent>
          </Card>

          {/* Events for members */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Événements disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {events.length > 0 ? (
                  events.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Aucun événement à venir
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
