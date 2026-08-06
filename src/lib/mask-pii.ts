/** Masquage partiel des données personnelles (affichage admin). */

export function maskName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "—";
  return trimmed
    .split(/\s+/)
    .map((part) => {
      if (part.length <= 1) return "•";
      return `${part[0]}${"•".repeat(Math.min(Math.max(part.length - 1, 2), 8))}`;
    })
    .join(" ");
}

export function maskEmail(email: string) {
  const trimmed = email.trim();
  if (!trimmed.includes("@")) return "***";
  const [local, domain] = trimmed.split("@");
  const maskedLocal =
    local.length <= 1 ? "*" : `${local[0]}${"*".repeat(Math.min(local.length - 1, 4))}`;
  const parts = domain.split(".");
  const tld = parts.pop() || "com";
  const host = parts.join(".") || "x";
  const maskedHost = host.length <= 1 ? "*" : `${host[0]}${"*".repeat(Math.min(host.length - 1, 4))}`;
  return `${maskedLocal}@${maskedHost}.${tld}`;
}

/** Ex. +2250708345891 → +22507****891 */
export function maskPhone(phone: string) {
  const trimmed = phone.trim();
  if (!trimmed) return "—";
  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 8) return "****";

  let national = digits;
  if (national.startsWith("225") && national.length >= 12) {
    national = national.slice(3);
  }
  if (national.length === 9 && /^[1-9]/.test(national)) {
    national = `0${national}`;
  }
  if (national.length < 8) return "****";

  const prefix = national.slice(0, 2);
  const suffix = national.slice(-3);
  return `+225${prefix}****${suffix}`;
}
