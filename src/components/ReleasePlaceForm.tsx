"use client";

import { useState, type FormEvent } from "react";

export function ReleasePlaceForm({ token }: { token: string }) {
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/rsvp/release", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(data.error || "La place n’a pas pu être libérée.");
        return;
      }
      setDone(true);
    } catch {
      setError("La place n’a pas pu être libérée.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <p className="mt-8 text-base leading-relaxed text-mist">
        Votre place est libérée. Merci de nous avoir prévenus.
      </p>
    );
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} className="mt-8">
      <button type="submit" className="btn-primary w-full" disabled={busy}>
        {busy ? "Libération…" : "Je libère ma place"}
      </button>
      {error ? <p className="mt-4 text-sm text-red-800">{error}</p> : null}
    </form>
  );
}
