/** Email classique (RFC 5322 simplifié). */
export const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/** Pattern HTML (sans ancres) pour l’attribut pattern — ex. +2250708345891 */
export const EMAIL_PATTERN = "[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}";
export const CI_PHONE_PATTERN =
  "(?:\\+?225|00?225)?[\\s.\\-]*0[1-9](?:[\\s.\\-]*\\d){8}";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

/**
 * Retourne le numéro national CI sur 10 chiffres (ex. 0708345891), ou null si invalide.
 * Accepte +2250708345891, +225 07 08 34 58 91, 0708345891, etc.
 */
export function normalizeCiPhone(phone: string): string | null {
  let digits = phone.replace(/[\s.\-()]/g, "");

  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00225")) digits = digits.slice(5);
  else if (digits.startsWith("225")) {
    digits = digits.slice(3);
    // +225708345891 (sans le 0 national) → 0708345891
    if (digits.length === 9 && /^[1-9]\d{8}$/.test(digits)) {
      digits = `0${digits}`;
    }
  }

  if (!/^0[1-9]\d{8}$/.test(digits)) return null;
  return digits;
}

export function isValidEmail(email: string) {
  return EMAIL_REGEX.test(email.trim());
}

export function isValidCiPhone(phone: string) {
  return normalizeCiPhone(phone) !== null;
}
