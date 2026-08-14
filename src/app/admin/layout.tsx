import type { ReactNode } from "react";

/**
 * Layout admin : largeur bornée au viewport.
 * Pas d’overflow-x ici (casse sticky) — le confinement est sur .admin-panel (contain:inline-size).
 */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <div className="admin-root w-full min-w-0 max-w-full">{children}</div>;
}
