/**
 * ds/EmptyState — T4 stato vuoto con motivo e via d'uscita (FW-09).
 *
 * Nessuna schermata finisce in un vuoto: titolo, motivo e almeno un'azione.
 * Context-free e senza testi propri: i testi arrivano dal chiamante (CMS o
 * catalogo UI). Consuma solo i token T3 `--empty-state-*` (theme.css); il tono
 * passa da `data-tone`, mai da stili inline.
 */
import type { ElementType, ReactNode } from "react";
import { CtaButton } from "./CtaButton";

export interface EmptyStateAction {
  label: ReactNode;
  onClick?: () => void;
  /** Destinazione: con `linkAs` (es. il Link del router) diventa `to`. */
  href?: string;
}

export interface EmptyStateProps {
  tone?: "neutral" | "warning";
  title: ReactNode;
  reason?: ReactNode;
  /** Almeno una: la prima è l'azione principale, le altre secondarie. */
  actions: EmptyStateAction[];
  /** Livello del titolo nella pagina (default 2). */
  headingLevel?: 2 | 3 | 4;
  icon?: ReactNode;
  /** Componente per i link interni (Link del router); senza, `<a href>`. */
  linkAs?: ElementType;
  /** Annuncia lo stato ai lettori di schermo (role="status"). */
  live?: boolean;
  id?: string;
  className?: string;
}

export function EmptyState({
  tone = "neutral",
  title,
  reason,
  actions,
  headingLevel = 2,
  icon,
  linkAs,
  live = false,
  id,
  className,
}: EmptyStateProps) {
  const Title = `h${headingLevel}` as ElementType;
  const titleId = id ? `${id}-title` : undefined;
  return (
    <section
      id={id}
      data-tone={tone}
      role={live ? "status" : undefined}
      aria-labelledby={titleId}
      className={className ? `ds-empty ${className}` : "ds-empty"}
    >
      <Title id={titleId} className="type-heading-xs ds-empty__title">
        {icon}
        {title}
      </Title>
      {reason && <p className="type-body ds-empty__reason">{reason}</p>}
      {actions.length > 0 && (
        <p className="ds-empty__actions">
          {actions.map((action, index) => {
            const variant = index === 0 ? "primary" : "secondary";
            const key = typeof action.label === "string" ? action.label : index;
            if (action.href && linkAs) {
              return (
                <CtaButton key={key} as={linkAs} to={action.href} onClick={action.onClick} variant={variant} radius="lg" elevated={false} className="ds-empty__action">
                  {action.label}
                </CtaButton>
              );
            }
            if (action.href) {
              return (
                <CtaButton key={key} as="a" href={action.href} onClick={action.onClick} variant={variant} radius="lg" elevated={false} className="ds-empty__action">
                  {action.label}
                </CtaButton>
              );
            }
            return (
              <CtaButton key={key} type="button" onClick={action.onClick} variant={variant} radius="lg" elevated={false} className="ds-empty__action">
                {action.label}
              </CtaButton>
            );
          })}
        </p>
      )}
    </section>
  );
}
