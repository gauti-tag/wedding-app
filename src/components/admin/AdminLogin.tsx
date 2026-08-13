"use client";

import { useState, type FormEvent } from "react";

export function AdminLogin() {
  const [email, setEmail] = useState("admin@couple.local");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Connexion impossible.");
      return;
    }
    window.location.reload();
  }

  return (
    <div className="section-shell flex min-h-[100svh] items-center justify-center py-16">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md space-y-5 border border-line bg-white p-8 shadow-[0_16px_48px_rgba(59,36,22,0.08)]"
      >
        <p className="eyebrow">Privé</p>
        <h1 className="section-title text-4xl text-mist">Administration</h1>
        {/*<p className="text-sm font-normal text-soft">
          Compte admin initial : <code className="text-champagne">admin@couple.local</code> /{" "}
          <code className="text-champagne">wedding2026</code>
        </p>*/}
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            className="field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
          {loading ? "Connexion…" : "Entrer"}
        </button>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        <a href="/" className="inline-block text-xs tracking-[0.16em] text-soft uppercase no-underline">
          ← Retour à l’invitation
        </a>
      </form>
    </div>
  );
}
