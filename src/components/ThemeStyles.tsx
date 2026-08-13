import {
  normalizeSiteTheme,
  themeGoogleFontsHref,
  themeToCssVariables,
} from "@/lib/site-theme";
import type { SiteTheme } from "@/lib/types";

/** Injecte polices Google + variables CSS du thème couple sur le site public. */
export function ThemeStyles({ theme }: { theme: SiteTheme }) {
  const normalized = normalizeSiteTheme(theme);
  const cssVars = themeToCssVariables(normalized);
  const fontsHref = themeGoogleFontsHref(normalized);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="stylesheet" href={fontsHref} />
      <style
        dangerouslySetInnerHTML={{
          __html: `:root { ${cssVars} }`,
        }}
      />
    </>
  );
}
