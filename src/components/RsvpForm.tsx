"use client";

import { useState, type FormEvent } from "react";
import type { Dictionary } from "@/i18n/types";
import { coupleLabel, site } from "@/lib/site";
import type { SiteContent } from "@/lib/types";
import {
  CI_PHONE_PATTERN,
  EMAIL_PATTERN,
  isValidCiPhone,
  isValidEmail,
} from "@/lib/validation";

type Status = "idle" | "loading" | "success" | "error";

export function RsvpForm({
  dict,
  siteContent,
}: {
  dict: Dictionary;
  siteContent: Pick<SiteContent, "partnerOne" | "partnerTwo">;
}) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const formEl = event.currentTarget;
    const form = new FormData(formEl);
    const payload = {
      name: String(form.get("name") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      status: String(form.get("status") || "yes"),
      guestOf: String(form.get("guestOf") || "both"),
      message: String(form.get("message") || ""),
    };

    if (!isValidEmail(payload.email)) {
      setStatus("error");
      setError(dict.rsvp.errorEmailInvalid);
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
          data.code === "email_taken"
            ? dict.rsvp.errorEmailTaken
            : data.code === "phone_taken"
              ? dict.rsvp.errorPhoneTaken
              : data.code === "email_invalid"
                ? dict.rsvp.errorEmailInvalid
                : data.code === "phone_invalid"
                  ? dict.rsvp.errorPhoneInvalid
                  : data.error || dict.rsvp.error;
        throw new Error(message);
      }
      setStatus("success");
      formEl.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : dict.rsvp.error);
    }
  }

  return (
    <section id="rsvp" className="border-t border-line py-24 md:py-32">
      <div className="section-shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="eyebrow">{dict.rsvp.eyebrow}</p>
          <h2 className="section-title mt-4 text-4xl font-semibold text-mist md:text-5xl">
            {dict.rsvp.title}
          </h2>
          <p className="mt-5 max-w-md text-base font-normal leading-7 text-soft">
            {dict.rsvp.deadlinePrefix}{" "}
            <span className="meta-date text-champagne">{dict.rsvp.deadline}</span>.
          </p>
          <p className="mt-4 text-sm text-soft">
            {dict.rsvp.contact} :{" "}
            <a href={`mailto:${site.contactEmail}`} className="text-champagne no-underline">
              {site.contactEmail}
            </a>
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-5 border border-line bg-white/90 p-6 md:p-8">
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
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="email">
                {dict.rsvp.email}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                pattern={EMAIL_PATTERN}
                title={dict.rsvp.errorEmailInvalid}
                className="field"
                placeholder={dict.rsvp.emailPlaceholder}
                autoComplete="email"
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

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="status">
                {dict.rsvp.status}
              </label>
              <select id="status" name="status" className="field" defaultValue="yes" required>
                <option value="yes">{dict.rsvp.statusYes}</option>
                <option value="maybe">{dict.rsvp.statusMaybe}</option>
                <option value="no">{dict.rsvp.statusNo}</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="guestOf">
                {dict.rsvp.guestOf}
              </label>
              <select id="guestOf" name="guestOf" className="field" defaultValue="both" required>
                <option value="gautier">{siteContent.partnerOne}</option>
                <option value="francybel">{siteContent.partnerTwo}</option>
                <option value="both">{coupleLabel(siteContent)}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label" htmlFor="message">
              {dict.rsvp.message}
            </label>
            <textarea
              id="message"
              name="message"
              rows={4}
              className="field resize-y"
              placeholder={dict.rsvp.messagePlaceholder}
            />
          </div>

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
              className={`meta-date px-4 py-3 text-center text-sm leading-relaxed ${
                status === "success"
                  ? "border border-line bg-forest text-champagne"
                  : "border border-red-200 bg-red-50 text-red-800"
              }`}
            >
              {status === "success" ? dict.rsvp.success : error}
            </div>
          ) : null}
        </form>
      </div>
    </section>
  );
}
