import type { Dictionary } from "../types";

const fr: Dictionary = {
  meta: {
    titleSuffix: "Invitation de mariage",
    description: "Nous nous marions. Samedi 31 octobre 2026.",
  },
  nav: {
    story: "Histoire",
    schedule: "Programme",
    menu: "Menu",
    gallery: "Galerie",
    rsvp: "RSVP",
    confirm: "Confirmer",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
  },
  story: {
    placeholders: ["Photo duo", "Souvenir", "Ensemble"],
    uploadHint: "à uploader",
    photoAlt: "Souvenir",
  },
  countdown: {
    days: "Jours",
    hours: "Heures",
    minutes: "Minutes",
    seconds: "Secondes",
  },
  menu: {
    eyebrow: "À table",
    title: "Menu de réception",
    empty: "Le menu de réception sera bientôt dévoilé.",
  },
  desserts: {
    eyebrow: "Pour finir",
    title: "Desserts",
    subtitle: "Douceurs pour toute la table — yaourt, fruits, gâteau…",
    empty: "La carte des desserts sera bientôt dévoilée.",
  },
  drinks: {
    eyebrow: "À boire",
    title: "Boissons",
    subtitle: "Une sélection pour toute la salle — vin, bière, softs et saveurs d’ici.",
    empty: "La carte des boissons sera bientôt dévoilée.",
  },
  gallery: {
    eyebrow: "Souvenirs",
    title: "Galerie",
    subtitle: "Uploadez vos photos depuis l’espace admin pour animer cette galerie.",
    placeholder: "Emplacement photo",
    photoAlt: "Photo du couple",
  },
  rsvp: {
    eyebrow: "Réponse souhaitée",
    title: "RSVP",
    deadlinePrefix: "Merci de confirmer votre présence avant le",
    contact: "Contact",
    name: "Nom complet",
    namePlaceholder: "Votre nom",
    phone: "Numéro WhatsApp",
    phonePlaceholder: "+2250708345891",
    status: "Présence",
    statusYes: "Avec joie — oui",
    statusMaybe: "Peut-être",
    statusNo: "Malheureusement non",
    guestOf: "Invité(e) de",
    guestOfFrancybel: "Francybel",
    guestOfGautier: "Gautier",
    guestOfBoth: "Gautier & Francybel",
    message: "Message",
    messagePlaceholder: "Un mot pour les mariés…",
    submit: "Envoyer ma réponse",
    submitting: "Envoi…",
    success: "Merci — votre réponse a bien été enregistrée.",
    successTicketHint:
      "Conservez le lien de votre carte d’invitation. Présentez le QR à l’entrée le jour J.",
    viewTicket: "Voir ma carte",
    whatsappCta: "Recevoir sur WhatsApp",
    closedTitle: "Confirmations closes",
    closedMessage:
      "La confirmation de présence n’est plus acceptée car le délai est dépassé.",
    error: "Une erreur est survenue.",
    errorPhoneTaken: "Ce numéro de téléphone a déjà été utilisé pour une réponse.",
    errorPhoneInvalid:
      "Veuillez saisir un numéro WhatsApp ivoirien valide (ex. +2250708345891).",
    errorDeadlinePassed:
      "La confirmation de présence n’est plus acceptée car le délai est dépassé.",
    errorCapacityFull:
      "La confirmation de présence n’est plus acceptée : le nombre de places est atteint.",
    capacityFullTitle: "Complet",
    capacityFullMessage:
      "Le nombre de places prévu pour l’événement est atteint. Les confirmations « oui » ne sont plus acceptées.",
  },
  footer: {
    coupleSpace: "Espace couple",
    installApp: "Installer l’app",
  },
};

export default fr;
