import type { ReactNode } from "react";

/**
 * En-tête de section admin collant sous la nav horizontale.
 * Pas de marges négatives — largeur bornée pour mobile.
 */
export function AdminStickyHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="sticky top-14 z-20 w-full max-w-full min-w-0 border-b border-line bg-ivory/95 py-3 backdrop-blur-md supports-[backdrop-filter]:bg-ivory/90">
      <div className="flex w-full min-w-0 max-w-full flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div className="min-w-0 w-full max-w-full sm:flex-1">
          <h2 className="section-title break-words text-xl text-mist sm:text-2xl md:text-3xl">
            {title}
          </h2>
          {description ? (
            <p className="mt-1.5 max-w-full text-sm font-normal leading-relaxed text-soft line-clamp-2 sm:line-clamp-3 md:line-clamp-none md:max-w-2xl">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div
            className={[
              "flex w-full min-w-0 max-w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end",
              "[&_.btn-primary]:max-w-full [&_.btn-ghost]:max-w-full",
              "[&_.btn-primary]:!px-3 [&_.btn-primary]:!py-2.5 [&_.btn-primary]:text-[0.65rem]",
              "[&_.btn-ghost]:!px-3 [&_.btn-ghost]:!py-2.5 [&_.btn-ghost]:text-[0.65rem]",
              "sm:[&_.btn-primary]:!px-4 sm:[&_.btn-primary]:text-[0.72rem]",
              "sm:[&_.btn-ghost]:!px-4 sm:[&_.btn-ghost]:text-[0.72rem]",
            ].join(" ")}
          >
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
