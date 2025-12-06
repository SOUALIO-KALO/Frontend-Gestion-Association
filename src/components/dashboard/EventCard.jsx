import { Calendar, MapPin, Users } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function EventCard({ event, compact = false }) {
  const date = new Date(event.dateDebut);
  const isComplete = event.placesRestantes === 0;

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-blue-100 flex flex-col items-center justify-center">
          <span className="text-xs font-medium text-blue-600">
            {format(date, 'MMM', { locale: fr }).toUpperCase()}
          </span>
          <span className="text-lg font-bold text-blue-700">
            {format(date, 'd')}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{event.titre}</p>
          <p className="text-sm text-gray-500 truncate">{event.lieu}</p>
        </div>
        <div className="flex-shrink-0">
          {isComplete ? (
            <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
              Complet
            </span>
          ) : (
            <span className="text-sm text-gray-500">
              {event.placesRestantes}/{event.placesTotal}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-blue-100 flex flex-col items-center justify-center">
          <span className="text-xs font-medium text-blue-600">
            {format(date, 'MMM', { locale: fr }).toUpperCase()}
          </span>
          <span className="text-xl font-bold text-blue-700">
            {format(date, 'd')}
          </span>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{event.titre}</h3>
          
          <div className="mt-2 space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{format(date, 'EEEE d MMMM à HH:mm', { locale: fr })}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" />
              <span>{event.lieu}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>
                {isComplete ? (
                  <span className="text-red-600 font-medium">Complet</span>
                ) : (
                  `${event.placesRestantes} places disponibles`
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventCard;
