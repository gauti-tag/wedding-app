"use client";

import { useMemo, useRef, useState, type FormEvent } from "react";
import {
  childCountOptions,
  relationFromGuestOf,
  seatsRemaining,
  seatsRemainingForRelation,
} from "@/lib/guest-capacity";
import {
  composeGuestOfId,
  guestHostOptions,
  GUEST_RELATIONS,
  isStructuredGuestOfConfig,
  type GuestHostSuffix,
  type GuestRelation,
} from "@/lib/guest-of";
import type { ChildCount, Rsvp, RsvpStatus, SiteContent } from "@/lib/types";
import { CI_PHONE_PATTERN, formatFullName } from "@/lib/validation";

const RELATION_LABELS: Record<GuestRelation, string> = {
  parent: "Parent",
  friend: "Ami(e)",
  colleague: "Collègue",
  religious: "Communauté religieuse",
};

const STATUS_LABELS: Record<RsvpStatus, string> = {
  yes: "Présent",
  maybe: "Peut-être",
  no: "Absent",
};

type Created = {
  name: string;
  whatsappUrl: string | null;
  capacityNote: string | null;
};

export function AdminRsvpComposer({
  site,
  rsvps,
  onCreated,
}: {
  site: Pick<
    SiteContent,
    "partnerOne" | "partnerTwo" | "rsvpConfig" | "guestCapacity" | "guestRelationQuotas"
  >;
  rsvps: Pick<Rsvp, "status" | "childCount" | "guestOf">[];
  onCreated: (rsvp: Rsvp) => void;
}) {
  const config = site.rsvpConfig;
  const structured = isStructuredGuestOfConfig(config.guestOfOptions);
  const hostOptions = useMemo(
    () => guestHostOptions(site.partnerOne, site.partnerTwo, "fr"),
    [site.partnerOne, site.partnerTwo],
  );
  const quotas = site.guestRelationQuotas ?? {
    enabled: false,
    capacities: { parent: 0, friend: 0, colleague: 0, religious: 0 },
  };

  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [created, setCreated] = useState<Created | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<RsvpStatus>("yes");
  const [relation, setRelation] = useState<GuestRelation>("parent");
  const [host, setHost] = useState<GuestHostSuffix>("host_one");
  const [guestOfId, setGuestOfId] = useState(config.guestOfOptions[0]?.id || "both");
  const [childCount, setChildCount] = useState<ChildCount>(0);
  const [message, setMessage] = useState("");
  const nameRef = useRef<HTMLInputElement>(null);

  const guestOf = !config.showGuestOf
    ? config.guestOfOptions[0]?.id || "both"
    : structured
      ? composeGuestOfId(relation, host)
      : guestOfId;
  const showChildren =
    config.showChildCount && status === "yes" && relationFromGuestOf(guestOf) === "parent";

  const remaining = seatsRemaining(site.guestCapacity, rsvps);
  const relationRemaining =
    structured && quotas.enabled ? seatsRemainingForRelation(quotas, rsvps, relation) : null;

  function openForm() {
    setOpen(true);
    setError("");
    window.setTimeout(() => nameRef.current?.focus(), 40);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/rsvp/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formatFullName(name),
          phone,
          status,
          guestOf,
          childCount: showChildren ? childCount : 0,
          message: config.showMessage ? message : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Inscription impossible.");
        return;
      }
      const rsvp = data.rsvp as Rsvp;
      onCreated(rsvp);
      setCreated({
        name: rsvp.name,
        whatsappUrl: data.whatsapp?.url || null,
        capacityNote: typeof data.capacityNote === "string" ? data.capacityNote : null,
      });
      setName("");
      setPhone("");
      setMessage("");
      setChildCount(0);
      nameRef.current?.focus();
    } catch {
      setError("Inscription impossible.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <div className="mb-4">
        <button type="button" className="btn-primary" onClick={openForm}>
          Inscrire un invité
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => void onSubmit(event)}
      className="mb-4 border border-line bg-white p-4 md:p-5"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs tracking-[0.16em] text-champagne uppercase">Inscription</p>
          <p className="mt-1 text-sm text-soft">
            {remaining} place{remaining === 1 ? "" : "s"} restante{remaining === 1 ? "" : "s"}
            {relationRemaining !== null
              ? ` · ${relationRemaining} pour ${RELATION_LABELS[relation].toLowerCase()}`
              : ""}
            . L’invité est ajouté tout de suite, même si le formulaire public est fermé.
          </p>
        </div>
        <button
          type="button"
          className="btn-ghost !px-4 !py-2 text-xs"
          onClick={() => setOpen(false)}
        >
          Fermer
        </button>
      </div>

      {created ? (
        <div className="mt-4 border border-line bg-ivory px-3 py-3 text-sm text-mist">
          <p>{created.name} est inscrit.</p>
          {created.capacityNote ? (
            <p className="mt-1 text-xs text-soft">{created.capacityNote}</p>
          ) : null}
          {created.whatsappUrl ? (
            <a
              href={created.whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-block text-xs tracking-[0.12em] text-champagne uppercase no-underline hover:text-mist"
            >
              Envoyer la carte WhatsApp
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label className="label" htmlFor="admin-rsvp-name">
            Nom
          </label>
          <input
            ref={nameRef}
            id="admin-rsvp-name"
            className="field"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onBlur={(event) => setName(formatFullName(event.target.value))}
            required
            minLength={2}
            autoComplete="name"
            placeholder="Nom et prénoms"
          />
        </div>
        <div>
          <label className="label" htmlFor="admin-rsvp-phone">
            Téléphone
          </label>
          <input
            id="admin-rsvp-phone"
            className="field"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            required
            type="tel"
            inputMode="tel"
            pattern={CI_PHONE_PATTERN}
            title="Numéro ivoirien, par exemple 07 00 00 00 00"
            autoComplete="tel"
            placeholder="07 00 00 00 00"
          />
        </div>
        <div>
          <label className="label" htmlFor="admin-rsvp-status">
            Présence
          </label>
          <select
            id="admin-rsvp-status"
            className="field"
            value={status}
            onChange={(event) => setStatus(event.target.value as RsvpStatus)}
          >
            <option value="yes">{STATUS_LABELS.yes}</option>
            {config.showMaybe ? <option value="maybe">{STATUS_LABELS.maybe}</option> : null}
            <option value="no">{STATUS_LABELS.no}</option>
          </select>
        </div>

        {config.showGuestOf && structured ? (
          <>
            <div>
              <label className="label" htmlFor="admin-rsvp-relation">
                Lien
              </label>
              <select
                id="admin-rsvp-relation"
                className="field"
                value={relation}
                onChange={(event) => setRelation(event.target.value as GuestRelation)}
              >
                {GUEST_RELATIONS.map((key) => (
                  <option key={key} value={key}>
                    {RELATION_LABELS[key]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label" htmlFor="admin-rsvp-host">
                Côté
              </label>
              <select
                id="admin-rsvp-host"
                className="field"
                value={host}
                onChange={(event) => setHost(event.target.value as GuestHostSuffix)}
              >
                {hostOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : null}

        {config.showGuestOf && !structured ? (
          <div>
            <label className="label" htmlFor="admin-rsvp-guest-of">
              Lien
            </label>
            <select
              id="admin-rsvp-guest-of"
              className="field"
              value={guestOfId}
              onChange={(event) => setGuestOfId(event.target.value)}
            >
              {config.guestOfOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label.fr || option.label.en || option.id}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {showChildren ? (
          <div>
            <label className="label" htmlFor="admin-rsvp-children">
              Enfants accompagnants
            </label>
            <select
              id="admin-rsvp-children"
              className="field"
              value={childCount}
              onChange={(event) => setChildCount(Number(event.target.value) as ChildCount)}
            >
              {childCountOptions().map((count) => (
                <option key={count} value={count}>
                  {count === 0 ? "Aucun" : count === 1 ? "1 enfant" : `${count} enfants`}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      {config.showMessage ? (
        <div className="mt-3">
          <label className="label" htmlFor="admin-rsvp-message">
            Message
          </label>
          <input
            id="admin-rsvp-message"
            className="field"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            maxLength={1000}
            placeholder="Facultatif"
          />
        </div>
      ) : null}

      {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}

      <div className="mt-4">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? "Enregistrement…" : "Enregistrer"}
        </button>
      </div>
    </form>
  );
}
