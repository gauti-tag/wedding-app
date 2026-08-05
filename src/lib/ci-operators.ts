/** Opérateurs mobiles Côte d’Ivoire (préfixes nationaux 01–09). */
export type CiOperatorId = "orange" | "mtn" | "moov";

export type CiOperator = {
  id: CiOperatorId;
  name: string;
  prefixes: readonly string[];
};

export const CI_OPERATORS: readonly CiOperator[] = [
  { id: "moov", name: "Moov Africa", prefixes: ["01", "02", "03"] },
  { id: "mtn", name: "MTN", prefixes: ["04", "05", "06"] },
  { id: "orange", name: "Orange", prefixes: ["07", "08", "09"] },
] as const;

/** Déduit l’opérateur à partir d’un numéro national (ex. 0708345891) ou brut. */
export function detectCiOperator(phone: string): CiOperator | null {
  let digits = phone.replace(/[\s.\-()]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("00225")) digits = digits.slice(5);
  else if (digits.startsWith("225")) {
    digits = digits.slice(3);
    if (digits.length === 9 && /^[1-9]/.test(digits)) digits = `0${digits}`;
  }

  if (digits.length < 2) return null;
  const prefix = digits.slice(0, 2);
  return CI_OPERATORS.find((op) => op.prefixes.includes(prefix)) || null;
}
