/** Confidentialité admin (réglages réservés au profil Propriétaire). */

export type AdminPrivacySettings = {
  /**
   * Si true, masque nom et téléphone des invités (RSVP, synthèse, tables)
   * pour tous les profils sauf Propriétaire.
   * Défaut : false (infos visibles).
   */
  maskGuestPiiForTeam: boolean;
};

export const defaultAdminPrivacy = (): AdminPrivacySettings => ({
  maskGuestPiiForTeam: false,
});

export function normalizeAdminPrivacy(raw: unknown): AdminPrivacySettings {
  const obj = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    maskGuestPiiForTeam: Boolean(obj.maskGuestPiiForTeam),
  };
}
