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
  };
  rsvp: {
    eyebrow: string;
    title: string;
    deadlinePrefix: string;
    deadline: string;
    contact: string;
    name: string;
    namePlaceholder: string;
    email: string;
    emailPlaceholder: string;
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
    error: string;
    errorEmailTaken: string;
    errorPhoneTaken: string;
    errorEmailInvalid: string;
    errorPhoneInvalid: string;
  };
  footer: {
    coupleSpace: string;
    installApp: string;
  };
};
