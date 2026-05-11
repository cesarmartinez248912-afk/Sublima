/**
 * Email Service — Sublimax Navojoa
 * ────────────────────────────────────
 * Compatible con Vercel serverless functions.
 * Soporta dos proveedores: Resend (recomendado) y Nodemailer/SMTP.
 * El proveedor se elige con la variable EMAIL_PROVIDER=resend|nodemailer
 */

import type { QuoteFormData } from "@/lib/validations";

type EmailAttachment = {
  filename: string;
  content: string | Buffer;
  contentType?: string;
};

// ── Attachment helpers ───────────────────────────────────────────────────────

function parseDataUri(dataUri: string): { mimeType: string; base64: string } | null {
  const match = dataUri.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
  if (!match) return null;
  return { mimeType: match[1], base64: match[2] };
}

function mimeToExt(mime: string): string {
  const normalized = mime.split(";")[0].trim();
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/gif": "gif",
  };
  return map[normalized] ?? "jpg";
}

function safeFilename(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50) || "imagen";
}

async function fetchRemoteImageAttachment(url: string, filenamePrefix: string): Promise<EmailAttachment | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;

    const contentType = (res.headers.get("content-type") ?? "image/jpeg").split(";")[0].trim();
    if (!contentType.startsWith("image/")) return null;

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength > 10 * 1024 * 1024) return null;

    return {
      filename: `${filenamePrefix}.${mimeToExt(contentType)}`,
      content: Buffer.from(arrayBuffer).toString("base64"),
      contentType,
    };
  } catch {
    return null;
  }
}

function productLabel(data: QuoteFormData): string {
  return data.selectedProductName?.trim() || data.product || "Producto seleccionado";
}

function productCategoryLabel(data: QuoteFormData): string | null {
  return data.selectedProductCategory?.trim() || (data.selectedProductName?.trim() ? data.product : null);
}

// ── HTML Email Template ─────────────────────────────────────────────────────

function buildEmailHTML(data: QuoteFormData): string {
  const additionalMessage = data.additionalMessage || "—";
  const selectedProduct = productLabel(data);
  const selectedCategory = productCategoryLabel(data);

  const deliveryBlock =
    data.deliveryType === "recoger"
      ? field("🏪 Entrega", "Recoger en tienda")
      : field(
        "🚚 Entrega a domicilio",
        [
          data.deliveryStreet,
          data.deliveryColonia,
          `${data.deliveryCity ?? ""}, ${data.deliveryState ?? ""}`,
          `C.P. ${data.deliveryZip ?? ""}`,
        ]
          .filter(Boolean)
          .join("<br/>")
      );

  const productBlock = data.selectedProductImageUrl
    ? `
    <div style="margin-bottom:20px;padding:16px;background:#f9f6ff;border-radius:12px;
                border-left:4px solid #0047ab;">
      <p style="margin:0 0 6px;color:#737784;font-size:11px;font-weight:600;
                letter-spacing:0.05em;text-transform:uppercase;">🧾 Producto seleccionado</p>
      <p style="margin:0 0 10px;color:#131b2e;font-size:14px;line-height:1.5;">
        ${selectedCategory ? `${selectedCategory}<br/>` : ""}
        <strong>${selectedProduct}</strong>
      </p>
      <img src="${data.selectedProductImageUrl}" alt="${selectedProduct}" style="max-width:100%;border-radius:10px;display:block;" />
      <p style="margin:8px 0 0;color:#737784;font-size:12px;">
        Si tu correo bloquea imágenes externas, la imagen también se adjunta cuando el proveedor lo permite.
      </p>
    </div>`
    : field("🧾 Producto seleccionado", selectedCategory ? `${selectedCategory}<br/><strong>${selectedProduct}</strong>` : selectedProduct, true);

  const referenceBlock = data.referenceImageBase64
    ? `
    <div style="margin-bottom:20px;padding:16px;background:#f0f4ff;border-radius:12px;
                border-left:4px solid #712ae2;">
      <p style="margin:0 0 6px;color:#737784;font-size:11px;font-weight:600;
                letter-spacing:0.05em;text-transform:uppercase;">🖼️ Imagen de referencia</p>
      <p style="margin:0;color:#131b2e;font-size:14px;line-height:1.5;">
        El cliente adjuntó una imagen de referencia.<br/>
        <span style="color:#737784;font-size:12px;">
          📎 Revisa el archivo adjunto <strong>imagen-referencia.*</strong> en este correo.
        </span>
      </p>
    </div>`
    : field("🖼️ Imagen de referencia", "No se adjuntó imagen");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nueva Solicitud de Cotización</title>
</head>
<body style="margin:0;padding:0;background:#f2f3ff;font-family:Inter,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f3ff;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:24px;overflow:hidden;
                      box-shadow:0 10px 40px rgba(0,0,0,0.06);">
          <tr>
            <td style="background:linear-gradient(135deg,#00327d 0%,#0047ab 50%,#712ae2 100%);
                       padding:40px 48px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-family:Montserrat,sans-serif;
                         font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                Sublimax Navojoa
              </h1>
              <p style="margin:8px 0 0;color:#b1c5ff;font-size:14px;">
                Nueva solicitud de cotización recibida
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding:48px;">
              <h2 style="margin:0 0 24px;color:#131b2e;font-family:Montserrat,sans-serif;
                         font-size:20px;font-weight:600;">
                📋 Datos del cliente
              </h2>
              ${field("👤 Nombre", data.name)}
              ${field("📧 Correo electrónico", `<a href="mailto:${data.email}" style="color:#0047ab;">${data.email}</a>`)}
              ${field("📱 Teléfono / WhatsApp", `<a href="https://wa.me/${data.phone.replace(/\D/g, "")}" style="color:#0047ab;">${data.phone}</a>`)}

              <h2 style="margin:32px 0 16px;color:#131b2e;font-family:Montserrat,sans-serif;
                         font-size:20px;font-weight:600;">
                🎁 Detalles del pedido
              </h2>
              ${productBlock}
              ${field("🔢 Cantidad", data.quantity.toString())}
              ${field("🎨 Descripción del diseño", data.designDescription, true)}

              <h2 style="margin:32px 0 16px;color:#131b2e;font-family:Montserrat,sans-serif;
                         font-size:20px;font-weight:600;">
                🚚 Entrega
              </h2>
              ${deliveryBlock}

              <h2 style="margin:32px 0 16px;color:#131b2e;font-family:Montserrat,sans-serif;
                         font-size:20px;font-weight:600;">
                🖼️ Referencia visual
              </h2>
              ${referenceBlock}

              ${data.additionalMessage ? `
              <h2 style="margin:32px 0 16px;color:#131b2e;font-family:Montserrat,sans-serif;
                         font-size:20px;font-weight:600;">
                💬 Mensaje adicional
              </h2>
              ${field("Comentario", additionalMessage, true)}` : ""}

              <table width="100%" style="margin-top:40px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${data.email}?subject=Re:%20Cotización%20${encodeURIComponent(selectedProduct)}"
                       style="display:inline-block;background:linear-gradient(135deg,#0047ab,#712ae2);
                              color:#ffffff;text-decoration:none;padding:14px 32px;
                              border-radius:100px;font-size:14px;font-weight:600;
                              letter-spacing:0.05em;font-family:Inter,sans-serif;">
                      ✉️ Responder al cliente
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="background:#f2f3ff;padding:24px 48px;text-align:center;
                       border-top:1px solid #e2e7ff;">
              <p style="margin:0;color:#737784;font-size:12px;">
                Este correo fue generado automáticamente por el formulario de cotización de
                <strong>Sublimax Navojoa</strong>.
              </p>
              <p style="margin:8px 0 0;color:#c3c6d5;font-size:11px;">
                ${new Date().toLocaleString("es-MX", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "America/Mexico_City",
  })}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function field(label: string, value: string, multiline = false): string {
  return `
    <div style="margin-bottom:20px;padding:16px;background:#f2f3ff;border-radius:12px;
                border-left:4px solid #0047ab;">
      <p style="margin:0 0 4px;color:#737784;font-size:11px;font-weight:600;
                letter-spacing:0.05em;text-transform:uppercase;">${label}</p>
      <p style="margin:0;color:#131b2e;font-size:15px;line-height:1.5;
                ${multiline ? "white-space:pre-wrap;" : ""}">${value}</p>
    </div>`;
}

// ── Plain text fallback ─────────────────────────────────────────────────────

function buildEmailText(data: QuoteFormData): string {
  const deliveryInfo =
    data.deliveryType === "recoger"
      ? "Recoger en tienda"
      : [
        `Calle: ${data.deliveryStreet ?? "—"}`,
        `Colonia: ${data.deliveryColonia ?? "—"}`,
        `Ciudad: ${data.deliveryCity ?? "—"}`,
        `Estado: ${data.deliveryState ?? "—"}`,
        `C.P.: ${data.deliveryZip ?? "—"}`,
      ].join("\n");

  const selectedProduct = productLabel(data);
  const selectedCategory = productCategoryLabel(data);

  const lines = [
    "NUEVA SOLICITUD DE COTIZACIÓN — Sublimax Navojoa",
    "===================================================",
    "",
    `NOMBRE:              ${data.name}`,
    `CORREO:              ${data.email}`,
    `TELÉFONO:            ${data.phone}`,
    `PRODUCTO:            ${data.product}`,
    `PRODUCTO ELEGIDO:     ${selectedProduct}`,
  ];

  if (selectedCategory) {
    lines.push(`CATEGORÍA:           ${selectedCategory}`);
  }

  lines.push(
    `IMAGEN DEL PRODUCTO:  ${data.selectedProductImageUrl ? "Sí — ver adjunto si el proveedor lo permite" : "No"}`,
    `CANTIDAD:            ${data.quantity}`,
    "",
    "DESCRIPCIÓN DEL DISEÑO:",
    data.designDescription,
    "",
    "ENTREGA:",
    deliveryInfo,
    "",
    `IMAGEN DE REFERENCIA: ${data.referenceImageBase64 ? "Sí — ver archivo adjunto" : "No adjuntó imagen"}`,
    "",
    "MENSAJE ADICIONAL:",
    data.additionalMessage || "—",
    "",
    "---",
    `Recibido: ${new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}`
  );

  return lines.join("\n");
}

function buildSubject(data: QuoteFormData): string {
  const delivery = data.deliveryType === "envio" ? "🚚 Envío" : "🏪 Recoger";
  const hasImage = data.referenceImageBase64 || data.selectedProductImageUrl ? " 📎" : "";
  const product = productLabel(data);
  return `🎨 Nueva cotización: ${product} (${data.quantity} uds.) — ${data.name} · ${delivery}${hasImage}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC SEND FUNCTION
// ─────────────────────────────────────────────────────────────────────────────

export async function sendQuoteEmail(data: QuoteFormData): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER ?? "nodemailer";
  const toEmail = process.env.CONTACT_EMAIL;

  if (!toEmail) {
    throw new Error("CONTACT_EMAIL no está configurado en las variables de entorno");
  }

  const subject = buildSubject(data);
  const html = buildEmailHTML(data);
  const text = buildEmailText(data);
  const attachments: EmailAttachment[] = [];

  if (data.referenceImageBase64) {
    const parsed = parseDataUri(data.referenceImageBase64);
    if (parsed) {
      attachments.push({
        filename: `imagen-referencia.${mimeToExt(parsed.mimeType)}`,
        content: parsed.base64,
        contentType: parsed.mimeType,
      });
    }
  }

  if (data.selectedProductImageUrl) {
    const remote = await fetchRemoteImageAttachment(
      data.selectedProductImageUrl,
      `producto-seleccionado-${safeFilename(data.selectedProductName ?? data.product)}`
    );
    if (remote) attachments.push(remote);
  }

  if (provider === "resend") {
    await sendViaResend({ toEmail, subject, html, text, replyTo: data.email, attachments });
  } else {
    await sendViaNodemailer({ toEmail, subject, html, text, replyTo: data.email, attachments });
  }
}

// ── Resend ──────────────────────────────────────────────────────────────────

async function sendViaResend(opts: {
  toEmail: string;
  subject: string;
  html: string;
  text: string;
  replyTo: string;
  attachments: EmailAttachment[];
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY no configurado");

  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "noreply@sublimaxnavojoa.com";

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const attachments = opts.attachments.map((att) => ({
    filename: att.filename,
    content: typeof att.content === "string" ? att.content : att.content.toString("base64"),
    contentType: att.contentType,
  }));

  const { error } = await resend.emails.send({
    from: `Sublimax Navojoa <${fromEmail}>`,
    to: opts.toEmail,
    reply_to: opts.replyTo,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    attachments,
  });

  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}

// ── Nodemailer / SMTP ───────────────────────────────────────────────────────

async function sendViaNodemailer(opts: {
  toEmail: string;
  subject: string;
  html: string;
  text: string;
  replyTo: string;
  attachments: EmailAttachment[];
}): Promise<void> {
  const emailUser = process.env.SMTP_USER;
  const emailPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST ?? "smtp.office365.com";
  const smtpPort = Number(process.env.SMTP_PORT ?? "587");

  if (!emailUser || !emailPass) {
    throw new Error("SMTP_USER / SMTP_PASS no configurados");
  }

  const nodemailer = await import("nodemailer");

  const transporter = nodemailer.default.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    requireTLS: smtpPort === 587,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  const attachments = opts.attachments.map((att) => ({
    filename: att.filename,
    content: typeof att.content === "string" ? Buffer.from(att.content, "base64") : att.content,
    contentType: att.contentType,
  }));

  await transporter.sendMail({
    from: `"Sublimax Navojoa" <${emailUser}>`,
    to: opts.toEmail,
    replyTo: opts.replyTo,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    attachments,
  });
}