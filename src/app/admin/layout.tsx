import type { ReactNode } from "react";

/** Layout admin : largeur bornée au viewport (sans overflow qui casse sticky). */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root w-full min-w-0 max-w-full">
      {children}
    </div>
  );
}
