const variants = {
  default: 'bg-gray-100 text-gray-800',
  primary: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  warning: 'bg-yellow-100 text-yellow-800',
  danger: 'bg-red-100 text-red-800',
  info: 'bg-cyan-100 text-cyan-800',
};

const statusColors = {
  // Statut membre
  ACTIF: 'success',
  INACTIF: 'danger',
  BUREAU: 'primary',
  // Statut cotisation
  A_JOUR: 'success',
  EXPIRE: 'danger',
  EN_ATTENTE: 'warning',
  // Statut inscription
  CONFIRMEE: 'success',
  ANNULEE: 'danger',
  // Roles
  ADMIN: 'primary',
  MEMBRE: 'default',
};

export function Badge({
  children,
  variant = 'default',
  status,
  className = '',
}) {
  const colorVariant = status ? statusColors[status] || 'default' : variant;

  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5
        rounded-full text-xs font-medium
        ${variants[colorVariant]}
        ${className}
      `}
    >
      {children}
    </span>
  );
}

export default Badge;
