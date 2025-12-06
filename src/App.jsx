import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MembresPage from "./pages/MembresPage";
import CotisationsPage from "./pages/CotisationsPage";
import EvenementsPage from "./pages/EvenementsPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes publiques */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Routes protégées */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/membres"
          element={
            <ProtectedRoute requireAdmin={true}>
              <MembresPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cotisations"
          element={
            <ProtectedRoute requireAdmin={true}>
              <CotisationsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/evenements"
          element={
            <ProtectedRoute requireAdmin={true}>
              <EvenementsPage />
            </ProtectedRoute>
          }
        />

        {/* Redirection par défaut */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
