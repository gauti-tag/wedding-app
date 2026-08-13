import type { ReactNode } from "react";

/**
 * En-tête de section admin collant sous la nav horizontale,
 * pour garder le titre et le bouton d’enregistrement visibles au scroll.
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
    <div className="sticky top-14 z-20 -mx-4 border-b border-line bg-ivory/95 px-4 py-3 backdrop-blur-md md:mx-0 md:px-0">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="section-title text-2xl text-mist md:text-3xl">{title}</h2>
          {description ? (
            <p className="mt-1.5 max-w-2xl text-sm font-normal text-soft line-clamp-2 md:line-clamp-none">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
            {actions}
          </div>
        ) : null}
      </div>
    </div>
  );
}
