import type { Dictionary } from "../types";

const en: Dictionary = {
  meta: {
    titleSuffix: "Wedding Invitation",
    description: "We are getting married. Saturday, October 31, 2026.",
  },
  nav: {
    story: "Story",
    schedule: "Schedule",
    menu: "Menu",
    gallery: "Gallery",
    rsvp: "RSVP",
    confirm: "RSVP",
    openMenu: "Open menu",
    closeMenu: "Close menu",
  },
  story: {
    placeholders: ["Couple photo", "Memory", "Together"],
    uploadHint: "upload soon",
    photoAlt: "Memory",
  },
  countdown: {
    days: "Days",
    hours: "Hours",
    minutes: "Minutes",
    seconds: "Seconds",
  },
  menu: {
    eyebrow: "At the table",
    title: "Reception menu",
    empty: "The reception menu will be revealed soon.",
  },
  desserts: {
    eyebrow: "To finish",
    title: "Desserts",
    subtitle: "Sweets for the whole table — yogurt, fruit, cake…",
    empty: "The desserts list will be revealed soon.",
  },
  drinks: {
    eyebrow: "To drink",
    title: "Drinks",
    subtitle: "A selection for everyone — wine, beer, softs, and local flavors.",
    empty: "The drinks list will be revealed soon.",
  },
  gallery: {
    eyebrow: "Memories",
    title: "Gallery",
    subtitle: "Upload your photos from the admin space to bring this gallery to life.",
    placeholder: "Photo placeholder",
    photoAlt: "Couple photo",
    openPhoto: "Enlarge photo",
    lightboxLabel: "Gallery lightbox",
    close: "Close",
    prev: "Previous photo",
    next: "Next photo",
  },
  rsvp: {
    eyebrow: "Kindly reply",
    title: "RSVP",
    deadlinePrefix: "Please confirm your attendance by",
    opensPrefix: "Attendance confirmations open on",
    contact: "Contact",
    name: "Full name",
    namePlaceholder: "Your name",
    phone: "WhatsApp number",
    phonePlaceholder: "+2250708345891",
    status: "Attendance",
    statusYes: "Joyfully — yes",
    statusMaybe: "Maybe",
    statusNo: "Regretfully no",
    guestOf: "Guest of",
    guestOfFrancybel: "Francybel",
    guestOfGautier: "Gautier",
    guestOfBoth: "Gautier & Francybel",
    message: "Message",
    messagePlaceholder: "A note for the couple…",
    submit: "Send my reply",
    submitting: "Sending…",
    success: "Thank you — your reply has been saved.",
    successTicketHint:
      "Keep your invitation card link. Show the QR code at the entrance on the day.",
    viewTicket: "View my card",
    whatsappCta: "Get it on WhatsApp",
    closedTitle: "RSVP closed",
    closedMessage:
      "Attendance confirmation is no longer accepted because the deadline has passed.",
    notYetOpenTitle: "RSVP not open yet",
    notYetOpenMessage:
      "Attendance confirmation is not open yet. Please come back on the date shown.",
    error: "Something went wrong.",
    errorPhoneTaken: "This phone number has already been used for a reply.",
    errorPhoneInvalid:
      "Please enter a valid Ivorian WhatsApp number (e.g. +2250708345891).",
    errorDeadlinePassed:
      "Attendance confirmation is no longer accepted because the deadline has passed.",
    errorNotYetOpen: "Attendance confirmation is not open yet.",
    errorCapacityFull:
      "Attendance confirmation is no longer accepted: the guest capacity has been reached.",
    capacityFullTitle: "Fully booked",
    capacityFullMessage:
      "The planned number of seats for the event has been reached. “Yes” confirmations are no longer accepted.",
  },
  footer: {
    coupleSpace: "Couple space",
    installApp: "Install app",
    installPrompt: {
      title: "Keep the invitation handy",
      body: "Add it to your home screen so you can open it quickly on the day.",
      install: "Install",
      later: "Later",
      never: "Don’t ask again",
      iosHint: "On iPhone: tap Share in Safari, then “Add to Home Screen”.",
      close: "Close",
    },
  },
};

export default en;
