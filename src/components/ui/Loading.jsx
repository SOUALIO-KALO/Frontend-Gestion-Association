import { Loader2 } from 'lucide-react';

export function Loading({ size = 'md', text = 'Chargement...' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className={`${sizes[size]} text-blue-600 animate-spin`} />
      {text && <p className="mt-3 text-gray-600">{text}</p>}
    </div>
  );
}

export function LoadingOverlay({ text = 'Chargement...' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80">
      <Loading size="lg" text={text} />
    </div>
  );
}

export function LoadingSpinner({ className = '' }) {
  return (
    <Loader2 className={`w-5 h-5 animate-spin ${className}`} />
  );
}

export default Loading;
