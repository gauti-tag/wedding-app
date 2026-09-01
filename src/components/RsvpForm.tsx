"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import {
  childCountOptions,
  normalizeChildCount,
  seatsForRsvp,
  type GuestRelationQuotas,
} from "@/lib/guest-capacity";
import {
  composeGuestOfId,
  guestHostOptions,
  guestRelationLabel,
  GUEST_RELATIONS,
  isStructuredGuestOfConfig,
  type GuestHostSuffix,
  type GuestRelation,
} from "@/lib/guest-of";
import {
  formatRsvpDeadlineLabel,
  formatRsvpOpensAtLabel,
  isRsvpDeadlinePassed,
  isRsvpNotYetOpen,
} from "@/lib/rsvp-deadline";
import { t } from "@/lib/localized";
import { suggestPwaInstall } from "@/lib/pwa-install";
import type { ChildCount, SiteContent } from "@/lib/types";
import { CI_PHONE_PATTERN, formatFullName, isValidCiPhone } from "@/lib/validation";
import { phoneToWhatsAppDigits } from "@/lib/whatsapp";

type Status = "idle" | "loading" | "success" | "error";

type WhatsAppPayload = {
  ticketUrl: string;
  url: string;
};

const CHILD_COUNT_LABEL_KEYS = [
  "childCount0",
  "childCount1",
  "childCount2",
  "childCount3",
  "childCount4",
] as const;

function relationDictKey(relation: GuestRelation) {
  switch (relation) {
    case "parent":
      return "guestRelationParent" as const;
    case "friend":
      return "guestRelationFriend" as const;
    case "colleague":
      return "guestRelationColleague" as const;
    case "religious":
      return "guestRelationReligious" as const;
  }
}

export function RsvpForm({
  dict,
  locale,
  siteContent,
  capacityFull = false,
  seatsRemaining,
  seatsTakenByRelation,
}: {
  dict: Dictionary;
  locale: Locale;
  siteContent: Pick<
    SiteContent,
    | "partnerOne"
    | "partnerTwo"
    | "eventTitle"
    | "rsvpOpensAt"
    | "rsvpDeadline"
    | "contactPhone"
    | "guestCapacity"
    | "guestRelationQuotas"
    | "rsvpConfig"
  >;
  capacityFull?: boolean;
  seatsRemaining?: number;
  seatsTakenByRelation?: Record<GuestRelation, number>;
}) {
  const rsvpConfig = siteContent.rsvpConfig;
  const structuredGuestOf = isStructuredGuestOfConfig(rsvpConfig.guestOfOptions);
  const relationQuotas: GuestRelationQuotas =
    siteContent.guestRelationQuotas ?? {
      enabled: false,
      capacities: { parent: 100, friend: 100, colleague: 100, religious: 100 },
    };
  const childCountLabel =
    t(rsvpConfig.childCountLabel, locale).trim() || dict.rsvp.childCount;
  const hostOptions = useMemo(
    () => guestHostOptions(siteContent.partnerOne, siteContent.partnerTwo, locale),
    [siteContent.partnerOne, siteContent.partnerTwo, locale],
  );
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [whatsapp, setWhatsapp] = useState<WhatsAppPayload | null>(null);
  const [attendance, setAttendance] = useState(
    capacityFull ? (rsvpConfig.showMaybe ? "maybe" : "no") : "yes",
  );
  const [guestRelation, setGuestRelation] = useState<GuestRelation>("parent");
  const [guestHost, setGuestHost] = useState<GuestHostSuffix>("host_one");

  const relationRemaining = useMemo(() => {
    if (!relationQuotas.enabled || !seatsTakenByRelation) return null;
    const taken = seatsTakenByRelation[guestRelation] ?? 0;
    const cap = relationQuotas.capacities[guestRelation] ?? 0;
    return Math.max(0, cap - taken);
  }, [relationQuotas, seatsTakenByRelation, guestRelation]);

  const relationFull =
    relationQuotas.enabled &&
    relationRemaining !== null &&
    relationRemaining <= 0 &&
    attendance === "yes";

  const notYetOpen = useMemo(
    () => isRsvpNotYetOpen(siteContent.rsvpOpensAt),
    [siteContent.rsvpOpensAt],
  );
  const deadlinePassed = useMemo(
    () => isRsvpDeadlinePassed(siteContent.rsvpDeadline),
    [siteContent.rsvpDeadline],
  );
  const opensLabel = useMemo(
    () =>
      siteContent.rsvpOpensAt
        ? formatRsvpOpensAtLabel(siteContent.rsvpOpensAt, locale)
        : "",
    [siteContent.rsvpOpensAt, locale],
  );
  const deadlineLabel = useMemo(
    () => formatRsvpDeadlineLabel(siteContent.rsvpDeadline, locale),
    [siteContent.rsvpDeadline, locale],
  );
  const contactWaDigits = useMemo(
    () => phoneToWhatsAppDigits(siteContent.contactPhone),
    [siteContent.contactPhone],
  );
  const contactHref = contactWaDigits
    ? `https://api.whatsapp.com/send?phone=${contactWaDigits}`
    : siteContent.contactPhone
      ? `tel:${siteContent.contactPhone.replace(/\s/g, "")}`
      : "";
  const formClosed = notYetOpen || deadlinePassed;
  const showChildCountField =
    rsvpConfig.showChildCount && attendance === "yes" && !capacityFull;

  function resolveGuestOf(form: FormData): string {
    if (!rsvpConfig.showGuestOf) {
      return rsvpConfig.guestOfOptions[0]?.id || "parent_host_one";
    }
    if (structuredGuestOf) {
      const relation = String(form.get("guestRelation") || guestRelation) as GuestRelation;
      const host = String(form.get("guestHost") || guestHost) as GuestHostSuffix;
      return composeGuestOfId(relation, host);
    }
    return String(
      form.get("guestOf") || rsvpConfig.guestOfOptions[0]?.id || "parent_host_one",
    );
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (notYetOpen || isRsvpNotYetOpen(siteContent.rsvpOpensAt)) {
      setStatus("error");
      setError(dict.rsvp.errorNotYetOpen);
      return;
    }
    if (deadlinePassed || isRsvpDeadlinePassed(siteContent.rsvpDeadline)) {
      setStatus("error");
      setError(dict.rsvp.errorDeadlinePassed);
      return;
    }

    setStatus("loading");
    setError("");
    setWhatsapp(null);

    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const nextStatus = String(form.get("status") || (capacityFull ? "maybe" : "yes"));
    const childCount = normalizeChildCount(form.get("childCount") ?? 0);
    const payload = {
      name: formatFullName(String(form.get("name") || "")),
      phone: String(form.get("phone") || ""),
      status: nextStatus,
      guestOf: resolveGuestOf(form),
      childCount: nextStatus === "yes" && rsvpConfig.showChildCount ? childCount : 0,
      message: "",
      locale,
    };

    if (capacityFull && payload.status === "yes") {
      setStatus("error");
      setError(dict.rsvp.errorCapacityFull);
      return;
    }

    if (
      payload.status === "yes" &&
      typeof seatsRemaining === "number" &&
      seatsForRsvp({ status: "yes", childCount: payload.childCount }) > seatsRemaining
    ) {
      setStatus("error");
      setError(dict.rsvp.errorCapacityFull);
      return;
    }

    if (
      payload.status === "yes" &&
      relationQuotas.enabled &&
      relationRemaining !== null &&
      seatsForRsvp({ status: "yes", childCount: payload.childCount }) > relationRemaining
    ) {
      setStatus("error");
      setError(dict.rsvp.errorRelationCapacityFull);
      return;
    }

    if (!isValidCiPhone(payload.phone)) {
      setStatus("error");
      setError(dict.rsvp.errorPhoneInvalid);
      return;
    }

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const message =
          data.code === "not_yet_open"
            ? dict.rsvp.errorNotYetOpen
            : data.code === "deadline_passed"
              ? dict.rsvp.errorDeadlinePassed
              : data.code === "capacity_full"
                ? dict.rsvp.errorCapacityFull
                : data.code === "relation_capacity_full"
                  ? dict.rsvp.errorRelationCapacityFull
                : data.code === "phone_taken"
                  ? dict.rsvp.errorPhoneTaken
                  : data.code === "phone_invalid"
                    ? dict.rsvp.errorPhoneInvalid
                    : data.error || dict.rsvp.error;
        throw new Error(message);
      }
      if (data.whatsapp?.ticketUrl && data.whatsapp?.url) {
        setWhatsapp({
          ticketUrl: data.whatsapp.ticketUrl,
          url: data.whatsapp.url,
        });
      }
      setStatus("success");
      setAttendance(capacityFull ? (rsvpConfig.showMaybe ? "maybe" : "no") : "yes");
      setGuestRelation("parent");
      setGuestHost("host_one");
      formEl.reset();
      window.setTimeout(() => suggestPwaInstall(), 900);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : dict.rsvp.error);
    }
  }

  return (
    <section id="rsvp" className="site-section site-section--border-t">
      <div className="section-shell site-section-grid lg:grid-cols-[0.9fr_1.1fr]">
        <div className="site-section-head">
          <p className="eyebrow">{dict.rsvp.eyebrow}</p>
          <h2 className="section-title text-4xl font-semibold text-mist md:text-5xl">
            {dict.rsvp.title}
          </h2>
          {notYetOpen && opensLabel ? (
            <p className="site-section-lead max-w-md">
              {dict.rsvp.opensPrefix}{" "}
              <span className="meta-date text-champagne">{opensLabel}</span>.
            </p>
          ) : (
            <p className="site-section-lead max-w-md">
              {dict.rsvp.deadlinePrefix}{" "}
              <span className="meta-date text-champagne">{deadlineLabel}</span>.
            </p>
          )}
          {siteContent.contactPhone ? (
            <p className="mt-4 text-sm text-soft">
              {dict.rsvp.contact} :{" "}
              {contactHref ? (
                <a href={contactHref} className="text-champagne no-underline">
                  {siteContent.contactPhone}
                </a>
              ) : (
                <span className="text-champagne">{siteContent.contactPhone}</span>
              )}
            </p>
          ) : null}
        </div>

        {formClosed ? (
          <div
            role="status"
            className="site-section-panel--lg site-section-stack"
          >
            <p className="section-title text-2xl text-mist">
              {notYetOpen ? dict.rsvp.notYetOpenTitle : dict.rsvp.closedTitle}
            </p>
            <p className="text-sm leading-relaxed text-soft">
              {notYetOpen ? dict.rsvp.notYetOpenMessage : dict.rsvp.closedMessage}
            </p>
            {notYetOpen && opensLabel ? (
              <p className="text-sm text-soft">
                {dict.rsvp.opensPrefix}{" "}
                <span className="meta-date text-champagne">{opensLabel}</span>.
              </p>
            ) : null}
            {siteContent.contactPhone && contactHref ? (
              <p className="text-sm text-soft">
                {dict.rsvp.contact} :{" "}
                <a href={contactHref} className="text-champagne no-underline">
                  {siteContent.contactPhone}
                </a>
              </p>
            ) : null}
          </div>
        ) : (
          <form onSubmit={onSubmit} className="site-section-panel--lg site-section-stack--form">
            {capacityFull ? (
              <div
                role="status"
                className="border border-line bg-forest px-4 py-3 text-sm text-champagne"
              >
                <p className="font-medium">{dict.rsvp.capacityFullTitle}</p>
                <p className="mt-1 text-soft">{dict.rsvp.capacityFullMessage}</p>
              </div>
            ) : null}
            {!capacityFull && relationFull ? (
              <div
                role="status"
                className="border border-line bg-forest px-4 py-3 text-sm text-champagne"
              >
                <p className="font-medium">{dict.rsvp.relationCapacityFullTitle}</p>
                <p className="mt-1 text-soft">{dict.rsvp.relationCapacityFullMessage}</p>
              </div>
            ) : null}
            <div className="site-section-cards sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="name">
                  {dict.rsvp.name}
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  className="field"
                  placeholder={dict.rsvp.namePlaceholder}
                  autoComplete="name"
                  onBlur={(e) => {
                    e.target.value = formatFullName(e.target.value);
                  }}
                />
              </div>
              <div>
                <label className="label" htmlFor="phone">
                  {dict.rsvp.phone}
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  pattern={CI_PHONE_PATTERN}
                  title={dict.rsvp.errorPhoneInvalid}
                  inputMode="tel"
                  className="field"
                  placeholder={dict.rsvp.phonePlaceholder}
                  autoComplete="tel"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="status">
                {dict.rsvp.status}
              </label>
              <select
                id="status"
                name="status"
                className="field"
                value={attendance}
                onChange={(e) => setAttendance(e.target.value)}
                required
              >
                {!capacityFull ? <option value="yes">{dict.rsvp.statusYes}</option> : null}
                {rsvpConfig.showMaybe ? (
                  <option value="maybe">{dict.rsvp.statusMaybe}</option>
                ) : null}
                <option value="no">{dict.rsvp.statusNo}</option>
              </select>
            </div>

            {rsvpConfig.showGuestOf ? (
              structuredGuestOf ? (
                <div className="site-section-cards sm:grid-cols-2">
                  <div>
                    <label className="label" htmlFor="guestRelation">
                      {dict.rsvp.guestRelation}
                    </label>
                    <select
                      id="guestRelation"
                      name="guestRelation"
                      className="field"
                      value={guestRelation}
                      onChange={(e) => setGuestRelation(e.target.value as GuestRelation)}
                      required
                    >
                      {GUEST_RELATIONS.map((relation) => (
                        <option key={relation} value={relation}>
                          {dict.rsvp[relationDictKey(relation)] ||
                            guestRelationLabel(relation, locale)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label" htmlFor="guestHost">
                      {dict.rsvp.guestHost}
                    </label>
                    <select
                      id="guestHost"
                      name="guestHost"
                      className="field"
                      value={guestHost}
                      onChange={(e) => setGuestHost(e.target.value as GuestHostSuffix)}
                      required
                    >
                      {hostOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="label" htmlFor="guestOf">
                    {dict.rsvp.guestOf}
                  </label>
                  <select
                    id="guestOf"
                    name="guestOf"
                    className="field"
                    defaultValue={rsvpConfig.guestOfOptions[0]?.id || "parent_host_one"}
                    required
                  >
                    {rsvpConfig.guestOfOptions.map((option) => (
                      <option key={option.id} value={option.id}>
                        {t(option.label, locale) || option.id}
                      </option>
                    ))}
                  </select>
                </div>
              )
            ) : (
              <input
                type="hidden"
                name="guestOf"
                value={rsvpConfig.guestOfOptions[0]?.id || "parent_host_one"}
              />
            )}

            {showChildCountField ? (
              <div>
                <label className="label" htmlFor="childCount">
                  {childCountLabel}
                </label>
                <select
                  id="childCount"
                  name="childCount"
                  className="field"
                  defaultValue="0"
                >
                  {childCountOptions().map((count) => (
                    <option key={count} value={count}>
                      {dict.rsvp[CHILD_COUNT_LABEL_KEYS[count as ChildCount]]}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={status === "loading"}
              className="btn-primary w-full disabled:opacity-60"
            >
              {status === "loading" ? dict.rsvp.submitting : dict.rsvp.submit}
            </button>

            {status === "success" || status === "error" ? (
              <div
                role={status === "error" ? "alert" : "status"}
                className={`space-y-4 px-4 py-4 text-sm leading-relaxed ${
                  status === "success"
                    ? "border border-line bg-forest text-champagne"
                    : "border border-red-200 bg-red-50 text-red-800"
                }`}
              >
                <p className="meta-date text-center">
                  {status === "success" ? dict.rsvp.success : error}
                </p>
                {status === "success" && whatsapp ? (
                  <>
                    <p className="text-center text-soft">{dict.rsvp.successTicketHint}</p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                      <a
                        href={whatsapp.ticketUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-ghost inline-flex justify-center no-underline"
                      >
                        {dict.rsvp.viewTicket}
                      </a>
                      <a
                        href={whatsapp.url}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-primary inline-flex justify-center no-underline"
                      >
                        {dict.rsvp.whatsappCta}
                      </a>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </form>
        )}
      </div>
    </section>
  );
}
