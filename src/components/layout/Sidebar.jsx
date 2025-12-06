import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Calendar,
  X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const menuItems = [
  { 
    path: '/dashboard', 
    label: 'Tableau de bord', 
    icon: LayoutDashboard,
    roles: ['ADMIN', 'MEMBRE']
  },
  { 
    path: '/membres', 
    label: 'Membres', 
    icon: Users,
    roles: ['ADMIN']
  },
  { 
    path: '/cotisations', 
    label: 'Cotisations', 
    icon: CreditCard,
    roles: ['ADMIN']
  },
  { 
    path: '/evenements', 
    label: 'Événements', 
    icon: Calendar,
    roles: ['ADMIN', 'MEMBRE']
  },
];

export function Sidebar({ isOpen, onClose }) {
  const { isAdmin } = useAuth();

  const filteredItems = menuItems.filter(item => 
    item.roles.includes(isAdmin ? 'ADMIN' : 'MEMBRE')
  );

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-gray-200
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-0
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-blue-600">GestAssoc</h1>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {filteredItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-lg
                transition-colors duration-200
                ${isActive 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

export default Sidebar;
