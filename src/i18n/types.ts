export type Dictionary = {
  meta: {
    titleSuffix: string;
    description: string;
  };
  nav: {
    story: string;
    schedule: string;
    menu: string;
    gallery: string;
    rsvp: string;
    confirm: string;
    openMenu: string;
    closeMenu: string;
  };
  story: {
    placeholders: [string, string, string];
    uploadHint: string;
    photoAlt: string;
  };
  countdown: {
    days: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  menu: {
    eyebrow: string;
    title: string;
    empty: string;
  };
  desserts: {
    eyebrow: string;
    title: string;
    subtitle: string;
    empty: string;
  };
  drinks: {
    eyebrow: string;
    title: string;
    subtitle: string;
    empty: string;
  };
  gallery: {
    eyebrow: string;
    title: string;
    subtitle: string;
    placeholder: string;
    photoAlt: string;
    openPhoto: string;
    lightboxLabel: string;
    close: string;
    prev: string;
    next: string;
  };
  rsvp: {
    eyebrow: string;
    title: string;
    deadlinePrefix: string;
    contact: string;
    name: string;
    namePlaceholder: string;
    phone: string;
    phonePlaceholder: string;
    status: string;
    statusYes: string;
    statusMaybe: string;
    statusNo: string;
    guestOf: string;
    guestOfFrancybel: string;
    guestOfGautier: string;
    guestOfBoth: string;
    message: string;
    messagePlaceholder: string;
    submit: string;
    submitting: string;
    success: string;
    successTicketHint: string;
    viewTicket: string;
    whatsappCta: string;
    closedTitle: string;
    closedMessage: string;
    error: string;
    errorPhoneTaken: string;
    errorPhoneInvalid: string;
    errorDeadlinePassed: string;
    errorCapacityFull: string;
    capacityFullTitle: string;
    capacityFullMessage: string;
  };
  footer: {
    coupleSpace: string;
    installApp: string;
  };
};
