import { Link } from "react-router-dom";
import { Home, ArrowLeft, Search } from "lucide-react";

/**
 * Page 404 - Route non trouvée
 */
export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center">
        {/* Illustration 404 */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-blue-600 opacity-20">404</h1>
          <div className="relative -mt-16">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Search className="w-12 h-12 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Page non trouvée
        </h2>
        <p className="text-gray-600 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          Vérifiez l'URL ou retournez à l'accueil.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 rounded-lg shadow-sm hover:bg-gray-50 transition-colors border border-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Retour
          </button>
          
          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Home className="w-5 h-5" />
            Accueil
          </Link>
        </div>

        {/* Liens utiles */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">Pages populaires :</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link to="/dashboard" className="text-blue-600 hover:underline">
              Tableau de bord
            </Link>
            <Link to="/membres" className="text-blue-600 hover:underline">
              Membres
            </Link>
            <Link to="/cotisations" className="text-blue-600 hover:underline">
              Cotisations
            </Link>
            <Link to="/evenements" className="text-blue-600 hover:underline">
              Événements
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
