import { Reveal } from "@/components/Reveal";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/types";
import { t } from "@/lib/localized";
import { headingOr } from "@/lib/menu-headings";
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
      {subtitle ? (
        <p className="mt-3 max-w-xl text-sm font-normal text-soft">{subtitle}</p>
      ) : null}

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
  showMenu = true,
  showDrinks = true,
  showDesserts = true,
}: {
  dict: Dictionary;
  locale: Locale;
  menu: MenuContent;
  drinks: DrinksContent;
  desserts: DessertsContent;
  showMenu?: boolean;
  showDrinks?: boolean;
  showDesserts?: boolean;
}) {
  const menuEyebrow = headingOr(menu.eyebrow, locale, dict.menu.eyebrow);
  const menuTitle = headingOr(menu.title, locale, dict.menu.title);
  const subtitle = t(menu.subtitle, locale);
  const note = t(menu.note, locale);
  const menuEmpty = headingOr(menu.emptyMessage, locale, dict.menu.empty);
  const hasFood = menu.cuisines.some((cuisine) => cuisine.dishes.length > 0);
  if (!showMenu && !showDrinks && !showDesserts) return null;

  const dessertsEyebrow = headingOr(desserts.eyebrow, locale, dict.desserts.eyebrow);
  const dessertsTitle = headingOr(desserts.title, locale, dict.desserts.title);
  const dessertsSubtitle = headingOr(desserts.subtitle, locale, dict.desserts.subtitle);
  const dessertsEmpty = headingOr(desserts.emptyMessage, locale, dict.desserts.empty);

  const drinksEyebrow = headingOr(drinks.eyebrow, locale, dict.drinks.eyebrow);
  const drinksTitle = headingOr(drinks.title, locale, dict.drinks.title);
  const drinksSubtitle = headingOr(drinks.subtitle, locale, dict.drinks.subtitle);
  const drinksEmpty = headingOr(drinks.emptyMessage, locale, dict.drinks.empty);

  const sectionFallbackTitle =
    showDesserts && !showDrinks
      ? dessertsTitle
      : showDrinks && !showDesserts
        ? drinksTitle
        : menuTitle;

  return (
    <section id="menu" className="py-24 md:py-32">
      <div className="section-shell">
        {showMenu ? (
          <>
            <Reveal className="max-w-2xl">
              <p className="eyebrow">{menuEyebrow}</p>
              <h2 className="section-title mt-4 text-4xl text-mist md:text-5xl">{menuTitle}</h2>
              {subtitle ? (
                <p className="mt-5 text-base font-normal leading-7 text-soft">{subtitle}</p>
              ) : null}
            </Reveal>

            {!hasFood ? (
              <Reveal delay={0.08}>
                <p className="mt-12 text-base font-normal text-soft">{menuEmpty}</p>
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
                            <p className="text-lg font-medium text-champagne">
                              {t(dish.name, locale)}
                            </p>
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
          </>
        ) : (
          <Reveal className="max-w-2xl">
            <p className="eyebrow">
              {showDesserts && !showDrinks
                ? dessertsEyebrow
                : showDrinks && !showDesserts
                  ? drinksEyebrow
                  : menuEyebrow}
            </p>
            <h2 className="section-title mt-4 text-4xl text-mist md:text-5xl">
              {sectionFallbackTitle}
            </h2>
          </Reveal>
        )}

        {showDesserts ? (
          <UniversalList
            eyebrow={dessertsEyebrow}
            title={dessertsTitle}
            subtitle={dessertsSubtitle}
            empty={dessertsEmpty}
            items={desserts.items}
            locale={locale}
          />
        ) : null}

        {showDrinks ? (
          <UniversalList
            eyebrow={drinksEyebrow}
            title={drinksTitle}
            subtitle={drinksSubtitle}
            empty={drinksEmpty}
            items={drinks.items}
            locale={locale}
          />
        ) : null}

        {showMenu && note ? (
          <Reveal delay={0.15}>
            <p className="mt-12 max-w-xl text-sm font-normal italic text-soft/80">{note}</p>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}
