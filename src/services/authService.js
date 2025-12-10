import api from "./api";

// ==================== AUTH ====================

export const authService = {
  register: (data) => api.post("/auth/register", data),
  login: (email, motDePasse) => api.post("/auth/login", { email, motDePasse }),
  logout: () => api.post("/auth/logout"),
  getProfile: () => api.get("/auth/me"),
  refreshToken: (refreshToken) =>
    api.post("/auth/refresh-token", { refreshToken }),
  changePassword: (currentPassword, newPassword) =>
    api.put("/auth/change-password", { currentPassword, newPassword }),
  forgotPassword: (email) => api.post("/auth/forgot-password", { email }),
  resetPassword: (token, motDePasse, confirmMotDePasse) =>
    api.post("/auth/reset-password", { token, motDePasse, confirmMotDePasse }),
};

// ==================== MEMBRES ====================

export const membreService = {
  // Liste avec pagination et filtres
  getAllMembres: (page = 1, limit = 10, statut = null, role = null) => {
    const params = new URLSearchParams({ page, limit });
    if (statut) params.append("statut", statut);
    if (role) params.append("role", role);
    return api.get(`/membres?${params}`);
  },

  // Récupérer un membre
  getMembreById: (id) => api.get(`/membres/${id}`),

  // Créer un membre
  createMembre: (data) => api.post("/membres", data),

  // Mettre à jour un membre
  updateMembre: (id, data) => api.put(`/membres/${id}`, data),

  // Supprimer un membre
  deleteMembre: (id) => api.delete(`/membres/${id}`),

  // Export CSV
  exportMembresCSV: () => api.get("/membres/export", { responseType: "blob" }),

  // Import CSV
  importMembresCSV: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/membres/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  // Statistiques
  getStatistiques: () => api.get("/membres/statistiques"),

  // Changer le statut
  changeStatut: (id, statut) => api.put(`/membres/${id}/statut`, { statut }),

  // Changer le rôle
  changeRole: (id, role) => api.put(`/membres/${id}/role`, { role }),
};

// ==================== COTISATIONS ====================

export const cotisationService = {
  // Liste avec pagination et filtres
  getAllCotisations: (page = 1, limit = 10, statut = null, membreId = null) => {
    const params = new URLSearchParams({ page, limit });
    if (statut) params.append("statut", statut);
    if (membreId) params.append("membreId", membreId);
    return api.get(`/cotisations?${params}`);
  },

  // Récupérer une cotisation
  getCotisationById: (id) => api.get(`/cotisations/${id}`),

  // Créer une cotisation
  createCotisation: (data) => api.post("/cotisations", data),

  // Mettre à jour une cotisation
  updateCotisation: (id, data) => api.put(`/cotisations/${id}`, data),

  // Supprimer une cotisation
  deleteCotisation: (id) => api.delete(`/cotisations/${id}`),

  // Cotisations d'un membre
  getCotisationsByMembre: (membreId, page = 1, limit = 10) =>
    api.get(`/cotisations/membre/${membreId}?page=${page}&limit=${limit}`),

  // Statistiques
  getStatistiques: () => api.get("/cotisations/statistiques"),

  // Générer PDF du reçu
  generatePDF: (id) =>
    api.get(`/cotisations/${id}/recu`, { responseType: "blob" }),

  // Alertes d'expiration (10 jours)
  getAlertes: (jours = 10) => api.get(`/cotisations/alertes?jours=${jours}`),
  
  // Envoyer un rappel de cotisation par email
  envoyerRappel: (cotisationId) => api.post(`/cotisations/${cotisationId}/rappel`),
};

// ==================== ÉVÉNEMENTS ====================

export const evenementService = {
  // Liste avec pagination
  getAllEvenements: (page = 1, limit = 10, aVenir = false) => {
    const params = new URLSearchParams({ page, limit });
    if (aVenir) params.append("aVenir", "true");
    return api.get(`/evenements?${params}`);
  },

  // Récupérer un événement
  getEvenementById: (id) => api.get(`/evenements/${id}`),

  // Créer un événement
  createEvenement: (data) => api.post("/evenements", data),

  // Mettre à jour un événement
  updateEvenement: (id, data) => api.put(`/evenements/${id}`, data),

  // Supprimer un événement
  deleteEvenement: (id) => api.delete(`/evenements/${id}`),

  // Calendrier
  getCalendrier: (mois, annee) =>
    api.get(`/evenements/calendrier?mois=${mois}&annee=${annee}`),

  // Participants
  getParticipants: (id) => api.get(`/evenements/${id}/participants`),

  // Inscription
  inscrire: (id) => api.post(`/evenements/${id}/inscription`),

  // Désinscription
  desinscrire: (id) => api.delete(`/evenements/${id}/inscription`),

  // Statistiques
  getStatistiques: () => api.get("/evenements/statistiques"),
};

// ==================== ADMIN ====================

export const adminService = {
  // Réinitialiser la base de données avec des données de test
  seedDatabase: () => api.post("/admin/seed", { confirmReset: "CONFIRMER_RESET_DATABASE" }),
};

// ==================== DASHBOARD ====================

export const dashboardService = {
  // Statistiques globales pour le dashboard
  getStats: async () => {
    const [membresStats, cotisationsStats, evenementsStats] = await Promise.all([
      api.get("/membres/statistiques").catch(() => ({ data: { data: {} } })),
      api.get("/cotisations/statistiques").catch(() => ({ data: { data: {} } })),
      api.get("/evenements/statistiques").catch(() => ({ data: { data: {} } })),
    ]);

    return {
      membres: membresStats.data.data,
      cotisations: cotisationsStats.data.data,
      evenements: evenementsStats.data.data,
    };
  },
};
