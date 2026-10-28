import QRCode from "qrcode";

export type InvitationCardInput = {
  guestName: string;
  coupleNames: string;
  dateLabel: string;
  qrDataUrl: string;
  ticketCode: string;
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("image"));
    img.src = src;
  });
}

/** Même image PNG que la carte proposée à l’invité sur sa page billet. */
export async function invitationCardBlob(input: InvitationCardInput) {
  const width = 900;
  const height = 1400;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");

  ctx.fillStyle = "#f7f4f0";
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(48, 48, width - 96, height - 96);
  ctx.strokeStyle = "rgba(59,36,22,0.18)";
  ctx.lineWidth = 2;
  ctx.strokeRect(48, 48, width - 96, height - 96);

  ctx.fillStyle = "#6b3e2a";
  ctx.font = "500 22px Georgia, serif";
  ctx.textAlign = "center";
  ctx.fillText("INVITATION DE MARIAGE", width / 2, 140);

  ctx.fillStyle = "#3b2416";
  ctx.font = "400 64px Georgia, serif";
  ctx.fillText(input.coupleNames, width / 2, 230);

  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 24px Georgia, serif";
  ctx.fillText(input.dateLabel.toUpperCase(), width / 2, 290);

  ctx.beginPath();
  ctx.moveTo(width / 2 - 80, 340);
  ctx.lineTo(width / 2 + 80, 340);
  ctx.strokeStyle = "rgba(59,36,22,0.2)";
  ctx.stroke();

  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 20px Georgia, serif";
  ctx.fillText("CHER(E) INVITÉ(E)", width / 2, 400);

  ctx.fillStyle = "#3b2416";
  ctx.font = "600 40px Georgia, serif";
  ctx.fillText(input.guestName, width / 2, 460);

  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 22px Georgia, serif";
  const lines = [
    "Nous sommes honorés de vous compter",
    "parmi nos invités pour célébrer",
    "l'un des plus beaux jours de notre vie.",
  ];
  lines.forEach((line, i) => ctx.fillText(line, width / 2, 520 + i * 32));

  const qr = await loadImage(input.qrDataUrl);
  const qrSize = 360;
  const qrX = (width - qrSize) / 2;
  const qrY = 640;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
  ctx.strokeStyle = "rgba(59,36,22,0.18)";
  ctx.strokeRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32);
  ctx.drawImage(qr, qrX, qrY, qrSize, qrSize);

  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 20px Georgia, serif";
  ctx.fillText("Présentez ce QR code à l'entrée", width / 2, 1060);

  ctx.fillStyle = "#6b3e2a";
  ctx.font = "500 18px monospace";
  ctx.fillText(input.ticketCode.slice(0, 10) + "…", width / 2, 1110);

  ctx.fillStyle = "#6b3e2a";
  ctx.font = "400 36px Georgia, serif";
  ctx.fillText(input.coupleNames, width / 2, 1200);

  ctx.fillStyle = "#7a5c4a";
  ctx.font = "400 16px Georgia, serif";
  ctx.fillText("TOGETHER FOREVER", width / 2, 1245);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("blob");
  return blob;
}

export function invitationCardFilename(guestName: string, taken: Set<string>) {
  const base =
    guestName
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9_-]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "carte";
  let name = `invitation-${base}.png`;
  let n = 2;
  while (taken.has(name)) {
    name = `invitation-${base}-${n}.png`;
    n += 1;
  }
  taken.add(name);
  return name;
}

/** QR identique à celui scanné le jour J. */
export function guestTicketQrDataUrl(token: string) {
  return QRCode.toDataURL(
    JSON.stringify({ v: 1, type: "wedding-checkin", token }),
    {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
      color: { dark: "#3b2416", light: "#ffffff" },
    },
  );
}
