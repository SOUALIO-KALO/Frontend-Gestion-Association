import { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  hint,
  type = 'text',
  className = '',
  required = false,
  ...props
}, ref) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          w-full px-4 py-2.5 
          border rounded-lg
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${error 
            ? 'border-red-500 bg-red-50 focus:ring-red-500' 
            : 'border-gray-300'
          }
          ${className}
        `}
        aria-invalid={!!error}
        aria-describedby={error ? `${props.name}-error` : hint ? `${props.name}-hint` : undefined}
        {...props}
      />
      {error && (
        <p 
          id={`${props.name}-error`}
          className="mt-1 text-sm text-red-600 font-medium"
          role="alert"
        >
          {error}
        </p>
      )}
      {hint && !error && (
        <p 
          id={`${props.name}-hint`}
          className="mt-1 text-xs text-gray-500"
        >
          {hint}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
