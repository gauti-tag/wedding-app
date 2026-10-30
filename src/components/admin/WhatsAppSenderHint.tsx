export function WhatsAppSenderHint({ phone }: { phone: string }) {
  if (!phone) {
    return (
      <p className="text-xs leading-relaxed text-soft">
        Ajoutez votre numéro WhatsApp en haut de l’espace couple. Le message part du compte ouvert sur ce téléphone.
      </p>
    );
  }
  return (
    <p className="text-xs leading-relaxed text-soft">
      Envoyez depuis {phone} : ouvrez WhatsApp avec ce compte sur ce téléphone.
    </p>
  );
}
