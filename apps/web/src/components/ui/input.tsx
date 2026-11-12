import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string };

export function Input({ id, label, hint, error, className = '', ...props }: InputProps) {
  const inputId = id ?? props.name;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  return (
    <div className="pf-field">
      <label className="pf-label" htmlFor={inputId}>{label}</label>
      <input id={inputId} className={`pf-input ${error ? 'pf-input--error' : ''} ${className}`.trim()} aria-invalid={Boolean(error)} aria-describedby={[hintId, errorId].filter(Boolean).join(' ') || undefined} {...props} />
      {hint && <p className="pf-hint" id={hintId}>{hint}</p>}
      {error && <p className="pf-error" id={errorId}>{error}</p>}
    </div>
  );
}
