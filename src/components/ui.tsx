import { useEffect, useRef, type FormEvent, type ReactNode } from "react";

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: (props: { id: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const describedBy = [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ");
  return (
    <div className={error ? "field has-error" : "field"}>
      <label htmlFor={id}>{label}</label>
      {children({
        id,
        "aria-invalid": error ? true : undefined,
        "aria-describedby": describedBy || undefined,
      })}
      {hint ? (
        <p id={`${id}-hint`} className="hint">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} className="error">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ProgressBar({ ratio, tone, label }: { ratio: number; tone: "ok" | "over" | "met" | "paused"; label: string }) {
  const width = Math.min(100, Math.max(0, ratio * 100));
  return (
    <div
      className={`bar ${tone}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(width)}
      aria-label={label}
    >
      <span style={{ width: `${width}%` }} />
    </div>
  );
}

export function EmptyState({ title, body, children }: { title: string; body: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <h3>{title}</h3>
      <p>{body}</p>
      {children}
    </div>
  );
}

function useModalDialog(onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (!dialog.open) {
      if (typeof dialog.showModal === "function") dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    const onCancel = (event: Event) => {
      event.preventDefault();
      onCloseRef.current();
    };
    const onClick = (event: MouseEvent) => {
      if (event.target === dialog) onCloseRef.current();
    };
    dialog.addEventListener("cancel", onCancel);
    dialog.addEventListener("click", onClick);
    return () => {
      dialog.removeEventListener("cancel", onCancel);
      dialog.removeEventListener("click", onClick);
      if (dialog.open) dialog.close();
    };
  }, []);
  return ref;
}

export function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  const ref = useModalDialog(onClose);
  return (
    <dialog ref={ref} className="sheet" aria-labelledby="sheet-title">
      <div className="sheet-bar">
        <h2 id="sheet-title">{title}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">
          ×
        </button>
      </div>
      <div className="sheet-body">{children}</div>
    </dialog>
  );
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  body: string;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const ref = useModalDialog(onCancel);
  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    onConfirm();
  };
  return (
    <dialog ref={ref} className="sheet confirm" aria-labelledby="confirm-title">
      <form onSubmit={onSubmit}>
        <div className="sheet-bar">
          <h2 id="confirm-title">{title}</h2>
        </div>
        <div className="sheet-body">
          <p>{body}</p>
          <div className="form-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>
              Cancelar
            </button>
            <button type="submit" className={danger ? "btn btn-danger" : "btn btn-primary"}>
              {confirmLabel}
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}

export function LiveStatus({ message }: { message: string | null }) {
  return (
    <div className="toast-wrap" aria-live="polite">
      {message ? <p className="toast">{message}</p> : null}
    </div>
  );
}

export function ExampleNote({ children }: { children: ReactNode }) {
  return (
    <p className="banner-note" role="note">
      {children}
    </p>
  );
}
