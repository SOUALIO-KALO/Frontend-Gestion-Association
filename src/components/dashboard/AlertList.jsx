import { useState } from 'react';
import { AlertTriangle, Clock, Mail, Loader2 } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { cotisationService } from '../../services/authService';

export function AlertList({ alerts = [], title = "Alertes", onRappelSent }) {
  const [sendingRappel, setSendingRappel] = useState(null);

  const handleEnvoyerRappel = async (cotisationId, membreNom) => {
    setSendingRappel(cotisationId);
    try {
      await cotisationService.envoyerRappel(cotisationId);
      toast.success(`Rappel envoyé à ${membreNom}`);
      if (onRappelSent) onRappelSent();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'envoi du rappel");
    } finally {
      setSendingRappel(null);
    }
  };
  if (alerts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">{title}</h3>
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
          <p>Aucune alerte pour le moment</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
          {alerts.length}
        </span>
      </div>
      
      <div className="space-y-3">
        {alerts.map((alert, index) => {
          const daysLeft = differenceInDays(new Date(alert.dateExpiration), new Date());
          const isUrgent = daysLeft <= 7;
          
          return (
            <div 
              key={index}
              className={`
                flex items-center gap-3 p-3 rounded-lg
                ${isUrgent ? 'bg-red-50' : 'bg-yellow-50'}
              `}
            >
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${isUrgent ? 'bg-red-100' : 'bg-yellow-100'}
              `}>
                <Clock className={`w-5 h-5 ${isUrgent ? 'text-red-600' : 'text-yellow-600'}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {alert.membre?.prenom} {alert.membre?.nom}
                </p>
                <p className="text-sm text-gray-500">
                  Expire le {format(new Date(alert.dateExpiration), 'd MMMM yyyy', { locale: fr })}
                  {daysLeft > 0 && ` (dans ${daysLeft} jours)`}
                  {daysLeft === 0 && ' (Aujourd\'hui)'}
                  {daysLeft < 0 && ' (Expirée)'}
                </p>
              </div>
              
              <button
                onClick={() => handleEnvoyerRappel(alert.id, `${alert.membre?.prenom} ${alert.membre?.nom}`)}
                disabled={sendingRappel === alert.id}
                className={`
                  flex-shrink-0 p-2 rounded-lg transition-colors
                  ${isUrgent 
                    ? 'bg-red-100 hover:bg-red-200 text-red-700' 
                    : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700'}
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                title="Envoyer un rappel par email"
              >
                {sendingRappel === alert.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default AlertList;
