import { Reveal } from "@/components/Reveal";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { t } from "@/lib/localized";
import type { DessertsContent, DrinksContent, MenuContent } from "@/lib/types";

function UniversalList({
  eyebrow,
  title,
  subtitle,
  empty,
  items,
  locale,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  empty: string;
  items: { id: string; name: { fr: string; en: string }; description: { fr: string; en: string } }[];
  locale: Locale;
}) {
  return (
    <Reveal delay={0.12} className="mt-16 border-t border-line pt-12 md:mt-20">
      <p className="eyebrow">{eyebrow}</p>
      <h3 className="section-title mt-3 text-3xl text-mist md:text-4xl">{title}</h3>
      <p className="mt-3 max-w-xl text-sm font-normal text-soft">{subtitle}</p>

      {items.length === 0 ? (
        <p className="mt-8 text-base font-normal text-soft">{empty}</p>
      ) : (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li key={item.id} className="border-t border-line pt-5">
              <p className="text-lg font-medium text-champagne">{t(item.name, locale)}</p>
              <p className="mt-1.5 text-sm font-normal leading-6 text-soft">
                {t(item.description, locale)}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Reveal>
  );
}

export function MenuSection({
  dict,
  locale,
  menu,
  drinks,
  desserts,
}: {
  dict: Dictionary;
  locale: Locale;
  menu: MenuContent;
  drinks: DrinksContent;
  desserts: DessertsContent;
}) {
  const subtitle = t(menu.subtitle, locale);
  const note = t(menu.note, locale);
  const hasFood = menu.cuisines.some((cuisine) => cuisine.dishes.length > 0);

  return (
    <section id="menu" className="py-24 md:py-32">
      <div className="section-shell">
        <Reveal className="max-w-2xl">
          <p className="eyebrow">{dict.menu.eyebrow}</p>
          <h2 className="section-title mt-4 text-4xl text-mist md:text-5xl">{dict.menu.title}</h2>
          {subtitle ? (
            <p className="mt-5 text-base font-normal leading-7 text-soft">{subtitle}</p>
          ) : null}
        </Reveal>

        {!hasFood ? (
          <Reveal delay={0.08}>
            <p className="mt-12 text-base font-normal text-soft">{dict.menu.empty}</p>
          </Reveal>
        ) : (
          <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-14">
            {menu.cuisines.map((cuisine, index) => (
              <Reveal key={cuisine.id} delay={index * 0.1}>
                <div className="border-t border-line pt-8">
                  <p className="meta-date text-xs tracking-[0.22em] text-gold uppercase">
                    {t(cuisine.origin, locale)}
                  </p>
                  <h3 className="section-title mt-3 text-2xl text-mist md:text-3xl">
                    {t(cuisine.region, locale)}
                  </h3>
                  <ul className="mt-8 space-y-6">
                    {cuisine.dishes.map((dish) => (
                      <li
                        key={dish.id}
                        className="border-b border-line/70 pb-5 last:border-b-0 last:pb-0"
                      >
                        <p className="text-lg font-medium text-champagne">{t(dish.name, locale)}</p>
                        <p className="mt-1.5 text-sm font-normal leading-6 text-soft">
                          {t(dish.description, locale)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        )}

        <UniversalList
          eyebrow={dict.desserts.eyebrow}
          title={dict.desserts.title}
          subtitle={dict.desserts.subtitle}
          empty={dict.desserts.empty}
          items={desserts.items}
          locale={locale}
        />

        <UniversalList
          eyebrow={dict.drinks.eyebrow}
          title={dict.drinks.title}
          subtitle={dict.drinks.subtitle}
          empty={dict.drinks.empty}
          items={drinks.items}
          locale={locale}
        />

        {note ? (
          <Reveal delay={0.15}>
            <p className="mt-12 max-w-xl text-sm font-normal italic text-soft/80">{note}</p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
