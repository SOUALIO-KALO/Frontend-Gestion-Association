import { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Layout } from "./components/layout";
import ErrorBoundary from "./components/ErrorBoundary";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import MembresPage from "./pages/MembresPage";
import CotisationsPage from "./pages/CotisationsPage";
import EvenementsPage from "./pages/EvenementsPage";
import NotFoundPage from "./pages/NotFoundPage";
import { setupGlobalErrorHandler } from "./utils/errorHandler";

function App() {
  // Configurer le gestionnaire d'erreurs global au montage
  useEffect(() => {
    setupGlobalErrorHandler();
  }, []);

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Routes protégées avec Layout */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary>
                      <DashboardPage />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/membres"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout>
                    <ErrorBoundary>
                      <MembresPage />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/cotisations"
              element={
                <ProtectedRoute requireAdmin={true}>
                  <Layout>
                    <ErrorBoundary>
                      <CotisationsPage />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/evenements"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary>
                      <EvenementsPage />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Redirection par défaut */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            
            {/* Page 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;