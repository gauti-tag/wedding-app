"use client";

import {
  emptyGuestCriteria,
  guestCriteriaActive,
  GUEST_HOST_SUFFIXES,
  GUEST_RELATIONS,
  type GuestCriteria,
} from "@/lib/guest-criteria";
import {
  guestHostOptions,
  guestRelationShortLabel,
  type GuestHostSuffix,
  type GuestRelation,
} from "@/lib/guest-of";

function chipClass(active: boolean) {
  return `shrink-0 border px-3 py-1.5 text-xs tracking-[0.12em] uppercase ${
    active ? "border-champagne bg-champagne text-forest" : "border-line bg-white text-soft"
  }`;
}

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function GuestCriteriaBar({
  value,
  onChange,
  partnerOne,
  partnerTwo,
}: {
  value: GuestCriteria;
  onChange: (next: GuestCriteria) => void;
  partnerOne: string;
  partnerTwo: string;
}) {
  const sides = guestHostOptions(partnerOne, partnerTwo, "fr");
  const sideLabel = new Map(sides.map((side) => [side.id, side.label]));
  const active = guestCriteriaActive(value);

  function setRelation(relation: GuestRelation) {
    onChange({ ...value, relations: toggleValue(value.relations, relation) });
  }

  function setSide(side: GuestHostSuffix) {
    onChange({ ...value, sides: toggleValue(value.sides, side) });
  }

  function setTable(table: GuestCriteria["table"]) {
    onChange({ ...value, table: value.table === table ? "all" : table });
  }

  function setPresence(presence: GuestCriteria["presence"]) {
    onChange({ ...value, presence: value.presence === presence ? "all" : presence });
  }

  return (
    <div className="mt-2 space-y-2">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {GUEST_RELATIONS.map((relation) => (
          <button
            key={relation}
            type="button"
            className={chipClass(value.relations.includes(relation))}
            onClick={() => setRelation(relation)}
          >
            {guestRelationShortLabel(relation)}
          </button>
        ))}
        <span className="mx-1 w-px shrink-0 bg-line" />
        {GUEST_HOST_SUFFIXES.map((side) => (
          <button
            key={side}
            type="button"
            className={chipClass(value.sides.includes(side))}
            onClick={() => setSide(side)}
          >
            {sideLabel.get(side) || side}
          </button>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1">
        <button type="button" className={chipClass(value.table === "with")} onClick={() => setTable("with")}>
          Avec table
        </button>
        <button
          type="button"
          className={chipClass(value.table === "without")}
          onClick={() => setTable("without")}
        >
          Sans table
        </button>
        <button
          type="button"
          className={chipClass(value.presence === "occupied")}
          onClick={() => setPresence("occupied")}
        >
          Occupé
        </button>
        <button
          type="button"
          className={chipClass(value.presence === "allocated")}
          onClick={() => setPresence("allocated")}
        >
          Alloué
        </button>
        {active ? (
          <button
            type="button"
            className="shrink-0 px-2 text-xs tracking-[0.12em] text-soft uppercase"
            onClick={() => onChange(emptyGuestCriteria())}
          >
            Effacer
          </button>
        ) : null}
      </div>
    </div>
  );
}
