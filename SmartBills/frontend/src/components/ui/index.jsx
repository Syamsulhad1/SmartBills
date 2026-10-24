import { useEffect, useRef, useState } from "react";

export function Button({
    children,
    className = "",
    variant = "primary",
    type = "button",
    loading = false,
    disabled = false,
    ...props
}) {
    return (
        <button
            className={`ui-button ui-button-${variant} ${className}`.trim()}
            type={type}
            disabled={disabled || loading}
            aria-busy={loading || undefined}
            {...props}
        >
            {loading && <span className="ui-button-spinner" aria-hidden="true" />}
            {children}
        </button>
    );
}

export function Card({ as: Element = "article", className = "", children, ...props }) {
    return <Element className={`ui-card ${className}`.trim()} {...props}>{children}</Element>;
}

export function Input({ label, id, error, hint, className = "", ...props }) {
    const helpId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
    return (
        <label className={`ui-field ${className}`.trim()} htmlFor={id}>
            {label && <span className="ui-field-label">{label}</span>}
            <input id={id} aria-invalid={Boolean(error)} aria-describedby={helpId} {...props} />
            {error && <span className="ui-field-error" id={helpId}>{error}</span>}
            {!error && hint && <span className="ui-field-hint" id={helpId}>{hint}</span>}
        </label>
    );
}

export function Select({ label, id, error, hint, className = "", children, ...props }) {
    const helpId = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
    return (
        <label className={`ui-field ${className}`.trim()} htmlFor={id}>
            {label && <span className="ui-field-label">{label}</span>}
            <select id={id} aria-invalid={Boolean(error)} aria-describedby={helpId} {...props}>
                {children}
            </select>
            {error && <span className="ui-field-error" id={helpId}>{error}</span>}
            {!error && hint && <span className="ui-field-hint" id={helpId}>{hint}</span>}
        </label>
    );
}

export function Modal({ open, onClose, titleId, className = "", children, ...props }) {
    const dialogRef = useRef(null);

    useEffect(() => {
        if (!open) return undefined;

        const previousFocus = document.activeElement;
        const bodyOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialogRef.current?.querySelector("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")?.focus();

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                onClose();
                return;
            }
            if (event.key !== "Tab" || !dialogRef.current) return;

            const focusable = dialogRef.current.querySelectorAll(
                "button:not(:disabled), [href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex='-1'])"
            );
            if (!focusable.length) {
                event.preventDefault();
                dialogRef.current.focus();
                return;
            }
            const first = focusable[0];
            const last = focusable[focusable.length - 1];
            if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
            }
        };
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.body.style.overflow = bodyOverflow;
            document.removeEventListener("keydown", handleKeyDown);
            if (previousFocus instanceof HTMLElement) previousFocus.focus();
        };
    }, [open, onClose]);

    if (!open) return null;
    return (
        <div
            className="ui-modal-backdrop"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <section
                {...props}
                ref={dialogRef}
                className={`ui-modal ${className}`.trim()}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
            >
                {children}
            </section>
        </div>
    );
}

export function Toast({ message, type = "success", onDismiss, actionLabel, onAction, duration = 5000 }) {
    useEffect(() => {
        if (!duration || !onDismiss) return undefined;
        const timeout = window.setTimeout(onDismiss, duration);
        return () => window.clearTimeout(timeout);
    }, [message, duration, onDismiss]);

    return (
        <div className={`toast-notification toast-${type}`} role={type === "error" ? "alert" : "status"}>
            <i className={`bi ${type === "error" ? "bi-exclamation-circle-fill" : "bi-check-circle-fill"}`} />
            <span>{message}</span>
            {actionLabel && onAction && (
                <button type="button" className="ui-toast-action" onClick={onAction}>{actionLabel}</button>
            )}
            {onDismiss && (
                <button type="button" className="toast-close" aria-label="Tutup notifikasi" onClick={onDismiss}>
                    <i className="bi bi-x-lg" />
                </button>
            )}
            {duration > 0 && <span className="toast-progress" style={{ animationDuration: `${duration}ms` }} />}
        </div>
    );
}

export function Skeleton({ className = "", ...props }) {
    return <span className={`ui-skeleton ${className}`.trim()} aria-hidden="true" {...props} />;
}

export function EmptyState({ icon = "bi-inbox", title, description, children, className = "" }) {
    return (
        <div className={`ui-empty-state empty-state ${className}`.trim()}>
            <i className={`bi ${icon}`} aria-hidden="true" />
            {title && <strong>{title}</strong>}
            {description && <p>{description}</p>}
            {children}
        </div>
    );
}

function useCountUp(target, duration = 900) {
    const ref = useRef(null);
    const frameRef = useRef(0);
    const [entered, setEntered] = useState(false);
    const [count, setCount] = useState(0);

    useEffect(() => {
        const element = ref.current;
        if (!element) return undefined;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion || !("IntersectionObserver" in window)) {
            setEntered(true);
            return undefined;
        }
        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                setEntered(true);
                observer.disconnect();
            }
        }, { threshold: 0.35 });
        observer.observe(element);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!entered) return undefined;
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (reducedMotion) {
            setCount(target);
            return undefined;
        }
        const startTime = performance.now();
        const step = (timestamp) => {
            const progress = Math.min((timestamp - startTime) / duration, 1);
            setCount(target * (1 - Math.pow(1 - progress, 3)));
            if (progress < 1) frameRef.current = window.requestAnimationFrame(step);
        };
        frameRef.current = window.requestAnimationFrame(step);
        return () => window.cancelAnimationFrame(frameRef.current);
    }, [entered, target, duration]);

    return { ref, count };
}

export function StatCard({ icon, label, value, tone = "", loading = false, countValue, formatCount }) {
    const count = useCountUp(Number(countValue ?? 0));
    return (
        <article className="stat-card" ref={count.ref}>
            <span className={`stat-icon ${tone}`}><i className={`bi ${icon}`} /></span>
            <div>
                <p>{label}</p>
                <strong className={loading ? "stat-value-loading" : ""}>
                    {loading
                        ? <Skeleton />
                        : countValue === undefined
                            ? value
                            : formatCount(count.count)}
                </strong>
            </div>
        </article>
    );
}

export function PageTransition({ children, className = "", ...props }) {
    return <div className={`page-transition ${className}`.trim()} {...props}>{children}</div>;
}
