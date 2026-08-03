"use client";

import { useState } from "react";
import {
  ROLES,
  roleDescriptions,
  roleLabels,
  type Role,
} from "@/lib/roles";
import type { AdminUserPublic } from "@/lib/types";

export function AdminUsersEditor({
  initialUsers,
  currentUserId,
}: {
  initialUsers: AdminUserPublic[];
  currentUserId: string;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "editor" as Role,
    password: "",
  });

  async function onCreate() {
    setBusy(true);
    setStatus("");
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setStatus(data.error || "Création impossible.");
      return;
    }
    setUsers((prev) => [...prev, data.user]);
    setForm({ name: "", email: "", role: "editor", password: "" });
    setStatus("Utilisateur créé.");
  }

  async function onToggleActive(user: AdminUserPublic) {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, active: !user.active }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "Mise à jour impossible.");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? data.user : u)));
  }

  async function onChangeRole(user: AdminUserPublic, role: Role) {
    const res = await fetch("/api/admin/users", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "Mise à jour impossible.");
      return;
    }
    setUsers((prev) => prev.map((u) => (u.id === user.id ? data.user : u)));
  }

  async function onDelete(user: AdminUserPublic) {
    if (!confirm(`Supprimer ${user.name} ?`)) return;
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: user.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus(data.error || "Suppression impossible.");
      return;
    }
    setUsers((prev) => prev.filter((u) => u.id !== user.id));
    setStatus("Utilisateur supprimé.");
  }

  return (
    <section id="admin-users" className="mt-14 scroll-mt-28 space-y-6">
      <div>
        <h2 className="section-title text-3xl text-mist">Utilisateurs & profils</h2>
        <p className="mt-2 max-w-2xl text-sm font-normal text-soft">
          Gérez les accès selon le rôle : admin, éditeur, coordinateur ou scanneur.
        </p>
      </div>

      {status ? <p className="text-sm text-champagne">{status}</p> : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {ROLES.map((role) => (
          <article key={role} className="border border-line bg-white p-4">
            <p className="text-xs tracking-[0.16em] text-champagne uppercase">
              {roleLabels[role]}
            </p>
            <p className="mt-2 text-sm text-soft">{roleDescriptions[role]}</p>
          </article>
        ))}
      </div>

      <div className="space-y-3 border border-line bg-white p-5">
        <p className="text-xs tracking-[0.16em] text-champagne uppercase">Nouvel utilisateur</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="user-name">
              Nom
            </label>
            <input
              id="user-name"
              className="field"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="user-email">
              Email
            </label>
            <input
              id="user-email"
              type="email"
              className="field"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            />
          </div>
          <div>
            <label className="label" htmlFor="user-role">
              Profil
            </label>
            <select
              id="user-role"
              className="field"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {roleLabels[role]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="user-password">
              Mot de passe (min. 8)
            </label>
            <input
              id="user-password"
              type="password"
              className="field"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
            />
          </div>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={() => void onCreate()}
          className="btn-primary disabled:opacity-60"
        >
          {busy ? "Création…" : "Créer l’utilisateur"}
        </button>
      </div>

      <div className="overflow-x-auto border border-line">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-forest text-xs tracking-[0.14em] text-soft uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Utilisateur</th>
              <th className="px-4 py-3 font-medium">Profil</th>
              <th className="px-4 py-3 font-medium">Statut</th>
              <th className="px-4 py-3 font-medium">Dernière connexion</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <div className="text-mist">{user.name}</div>
                  <div className="text-xs text-soft">{user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <select
                    className="field !py-2"
                    value={user.role}
                    disabled={user.id === currentUserId}
                    onChange={(e) => void onChangeRole(user, e.target.value as Role)}
                  >
                    {ROLES.map((role) => (
                      <option key={role} value={role}>
                        {roleLabels[role]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-soft">{user.active ? "Actif" : "Inactif"}</td>
                <td className="px-4 py-3 text-soft">
                  {user.lastLoginAt
                    ? new Date(user.lastLoginAt).toLocaleString("fr-FR")
                    : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      disabled={user.id === currentUserId}
                      onClick={() => void onToggleActive(user)}
                      className="text-left text-xs tracking-[0.12em] text-champagne uppercase disabled:opacity-40"
                    >
                      {user.active ? "Désactiver" : "Activer"}
                    </button>
                    <button
                      type="button"
                      disabled={user.id === currentUserId}
                      onClick={() => void onDelete(user)}
                      className="text-left text-xs tracking-[0.12em] text-red-700 uppercase disabled:opacity-40"
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
