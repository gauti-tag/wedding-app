import type { ReactNode } from "react";
import { AdminViewportLock } from "@/components/admin/AdminViewportLock";

/** Layout admin : viewport verrouillé + largeur bornée (dès le premier paint). */
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="admin-root w-full min-w-0 max-w-full">
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var h=document.documentElement,b=document.body;h.classList.add("is-admin");h.style.overflowX="clip";if(b){b.style.overflowX="clip";b.style.maxWidth="100%";b.style.width="100%";}})();`,
        }}
      />
      <AdminViewportLock />
      {children}
    </div>
  );
}
