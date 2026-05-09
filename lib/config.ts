/**
 * SublimArt Premium — Configuración Central
 * ─────────────────────────────────────────
 * Edita este archivo para personalizar el sitio sin tocar los componentes.
 */

export const SITE_CONFIG = {
  name: "SublimArt Premium",
  tagline: "Personalización de Alta Calidad",
  description:
    "Especialistas en transformar objetos cotidianos en piezas únicas de alta calidad mediante tecnología de sublimación avanzada.",

  // ── Contacto ────────────────────────────────────────────────────────────
  // El número de WhatsApp se lee desde la variable de entorno NEXT_PUBLIC_WHATSAPP_NUMBER.
  // Si no está definida, usa este valor por defecto.
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5215512345678",
  whatsappMessage: "Hola, quiero cotizar un producto personalizado 🎨",

  email: "ventas@sublimartpremium.com",
  phone: "+52 55 1234 5678",

  // ── Redes Sociales ───────────────────────────────────────────────────────
  social: {
    instagram: "https://instagram.com/sublimartpremium",
    facebook: "https://facebook.com/sublimartpremium",
    tiktok: "https://tiktok.com/@sublimartpremium",
  },

  // ── Horario ──────────────────────────────────────────────────────────────
  businessHours: "Lunes a Viernes: 9am – 6pm",

  // ── SEO ──────────────────────────────────────────────────────────────────
  siteUrl: "https://www.sublimartpremium.com",
};

/** Construye el enlace wa.me con el mensaje pre-llenado */
export function getWhatsAppUrl(message?: string): string {
  const number = SITE_CONFIG.whatsappNumber.replace(/\D/g, "");
  const text = encodeURIComponent(message ?? SITE_CONFIG.whatsappMessage);
  return `https://wa.me/${number}?text=${text}`;
}
