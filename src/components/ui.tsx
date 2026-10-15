import {
  useEffect,
  useId,
  useRef,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react';
import { ArrowUpRight, LoaderCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Brand() {
  return (
    <span className="brand">
      <svg viewBox="0 0 24 26" aria-hidden="true">
        <path
          d="M0 26V0h12c14 0 15 18 3 20l9 6H13L5 17v9zm5-16h7c5 0 5-5 0-5H5z"
          fill="currentColor"
        />
      </svg>
      rafqen<span className="brand-period">✳</span>
    </span>
  );
}
export function Button({
  children,
  variant = 'solid',
  loading,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'solid' | 'outline' | 'text';
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      className={`button button-${variant} ${className}`}
      disabled={props.disabled || loading}
    >
      {children}
      {loading ? <LoaderCircle className="spin" size={17} aria-hidden="true" /> : null}
    </button>
  );
}
export function ButtonLink({
  to,
  children,
  variant = 'solid',
  className = '',
}: {
  to: string;
  children: ReactNode;
  variant?: 'solid' | 'outline' | 'text';
  className?: string;
}) {
  return (
    <Link to={to} className={`button button-${variant} ${className}`}>
      {children}
      <ArrowUpRight size={17} aria-hidden="true" />
    </Link>
  );
}
export function Notice({
  children,
  kind = 'error',
}: {
  children: ReactNode;
  kind?: 'error' | 'success';
}) {
  return (
    <p className={`notice notice-${kind}`} role={kind === 'error' ? 'alert' : 'status'}>
      {children}
    </p>
  );
}
export function Input({
  label,
  error,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string | undefined }) {
  const generated = useId(),
    id = props.id ?? generated;
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <input
        {...props}
        id={id}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error ? (
        <span id={`${id}-error`} className="field-error" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}
export function Modal({
  title,
  children,
  onClose,
  drawer = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  drawer?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    titleId = useId();
  useEffect(() => {
    const dialog = ref.current,
      previous = document.activeElement;
    const overflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close();
      document.body.style.overflow = overflow;
      if (previous instanceof HTMLElement) previous.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={`modal ${drawer ? 'drawer' : ''}`}
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const r = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            onClose();
        }
      }}
    >
      <div className="modal-heading">
        <h2 id={titleId}>{title}</h2>
        <button className="icon-button" aria-label="Close dialog" onClick={onClose} autoFocus>
          <X size={21} />
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function Empty({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="empty-state">
      <span className="empty-mark" aria-hidden="true">
        ↗
      </span>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
