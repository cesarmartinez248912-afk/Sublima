/**
 * Email Service — SublimArt Premium
 * ────────────────────────────────────
 * Compatible con Vercel serverless functions.
 * Soporta dos proveedores: Resend (recomendado) y Nodemailer/SMTP.
 * El proveedor se elige con la variable EMAIL_PROVIDER=resend|nodemailer
 */

import type { QuoteFormData } from "@/lib/validations";

// ── HTML Email Template ─────────────────────────────────────────────────────
function buildEmailHTML(data: QuoteFormData): string {
  const quantity = data.quantity;
  const additionalMessage = data.additionalMessage || "—";

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

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#00327d 0%,#0047ab 100%);
                       padding:40px 48px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-family:Montserrat,sans-serif;
                         font-size:26px;font-weight:700;letter-spacing:-0.5px;">
                SublimArt Premium
              </h1>
              <p style="margin:8px 0 0;color:#b1c5ff;font-size:14px;">
                Nueva solicitud de cotización recibida
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px;">
              <h2 style="margin:0 0 24px;color:#131b2e;font-family:Montserrat,sans-serif;
                         font-size:20px;font-weight:600;">
                📋 Datos del cliente
              </h2>

              ${field("👤 Nombre", data.name)}
              ${field("📧 Correo electrónico", `<a href="mailto:${data.email}" style="color:#0047ab;">${data.email}</a>`)}
              ${field("📱 Teléfono", `<a href="tel:${data.phone}" style="color:#0047ab;">${data.phone}</a>`)}
              ${field("🎁 Producto", data.product)}
              ${field("📦 Cantidad", quantity.toString())}
              ${field("🎨 Descripción del diseño", data.designDescription, true)}
              ${field("💬 Mensaje adicional", additionalMessage, true)}

              <!-- CTA -->
              <table width="100%" style="margin-top:40px;">
                <tr>
                  <td align="center">
                    <a href="mailto:${data.email}?subject=Re: Cotización ${data.product}"
                       style="display:inline-block;background:#0047ab;color:#ffffff;
                              text-decoration:none;padding:14px 32px;border-radius:100px;
                              font-size:14px;font-weight:600;letter-spacing:0.05em;
                              font-family:Inter,sans-serif;">
                      ✉️ Responder al cliente
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f2f3ff;padding:24px 48px;text-align:center;
                       border-top:1px solid #e2e7ff;">
              <p style="margin:0;color:#737784;font-size:12px;">
                Este correo fue generado automáticamente por el formulario de cotización de
                <strong>SublimArt Premium</strong>.
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
  return `
NUEVA SOLICITUD DE COTIZACIÓN — SublimArt Premium
===================================================

NOMBRE:              ${data.name}
CORREO:              ${data.email}
TELÉFONO:            ${data.phone}
PRODUCTO:            ${data.product}
CANTIDAD:            ${data.quantity}

DESCRIPCIÓN DEL DISEÑO:
${data.designDescription}

MENSAJE ADICIONAL:
${data.additionalMessage || "—"}

---
Recibido: ${new Date().toLocaleString("es-MX", { timeZone: "America/Mexico_City" })}
`.trim();
}

// ── Subject ─────────────────────────────────────────────────────────────────
function buildSubject(data: QuoteFormData): string {
  return `🎨 Nueva cotización: ${data.product} (${data.quantity} uds.) — ${data.name}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC SEND FUNCTION
// ─────────────────────────────────────────────────────────────────────────────
export async function sendQuoteEmail(data: QuoteFormData): Promise<void> {
  const provider = process.env.EMAIL_PROVIDER ?? "resend";
  const toEmail = process.env.CONTACT_EMAIL;

  if (!toEmail) {
    throw new Error(
      "CONTACT_EMAIL no está configurado en las variables de entorno"
    );
  }

  const subject = buildSubject(data);
  const html = buildEmailHTML(data);
  const text = buildEmailText(data);

  if (provider === "resend") {
    await sendViaResend({ toEmail, subject, html, text, replyTo: data.email });
  } else {
    await sendViaNodemailer({
      toEmail,
      subject,
      html,
      text,
      replyTo: data.email,
    });
  }
}

// ── Resend ──────────────────────────────────────────────────────────────────
async function sendViaResend(opts: {
  toEmail: string;
  subject: string;
  html: string;
  text: string;
  replyTo: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY no configurado");

  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? "cotizaciones@sublimartpremium.com";

  // Dynamic import keeps the bundle lean when using Nodemailer instead
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: `SublimArt Premium <${fromEmail}>`,
    to: opts.toEmail,
    reply_to: opts.replyTo,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
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
}): Promise<void> {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass) {
    throw new Error("EMAIL_USER / EMAIL_PASS no configurados");
  }

  const nodemailer = await import("nodemailer");

  const transporter = nodemailer.default.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });

  await transporter.sendMail({
    from: `"SublimArt Premium" <${emailUser}>`,
    to: opts.toEmail,
    replyTo: opts.replyTo,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
}
