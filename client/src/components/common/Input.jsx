import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  helperText,
  icon: Icon,
  disabled = false,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className="w-full space-y-1.5 text-left">
      {label && (
        <label htmlFor={id} className="block text-xs font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide ml-1">
          {label} {required && <span className="text-neutral-400">*</span>}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
            <Icon className="w-4.5 h-4.5" />
          </div>
        )}
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full rounded-2xl bg-neutral-100 dark:bg-neutral-900 border transition-all text-sm text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-900 dark:focus:ring-white ${
            Icon ? 'pl-11' : 'pl-4'
          } pr-4 py-3 ${
            error
              ? 'border-rose-500/80 focus:ring-rose-500/30'
              : 'border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-xs text-rose-500 mt-1 ml-1">{error}</p>
      ) : helperText ? (
        <p className="text-xs text-neutral-400 mt-1 ml-1">{helperText}</p>
      ) : null}
    </div>
  );
}
