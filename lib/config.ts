/**
 * Sublimax Navojoa — Configuración Central
 * ─────────────────────────────────────────
 * Edita este archivo para personalizar el sitio sin tocar los componentes.
 */

export const SITE_CONFIG = {
  name: "Sublimax Navojoa",
  tagline: "Personalización de Alta Calidad",
  description:
    "Especialistas en transformar objetos cotidianos en piezas únicas de alta calidad mediante tecnología de sublimación avanzada.",

  // ── Contacto ────────────────────────────────────────────────────────────
  // El número de WhatsApp se lee desde la variable de entorno NEXT_PUBLIC_WHATSAPP_NUMBER.
  // Si no está definida, usa este valor por defecto.
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "526421000279",
  whatsappMessage: "Hola, quiero cotizar un producto personalizado 🎨",

  email: "sublimaxnavojoa23@gmail.com",
  emailPersonal: "Kendra_Gissel05@hotmail.com",
  phone: "64 21 000 279",

  address: "Col. Brisas del Valle, Navojoa, Sonora, México 85864",

  // ── Redes Sociales ───────────────────────────────────────────────────────
  social: {
    instagram: "https://www.instagram.com/sublimax_navojoa/",
    facebook: "https://www.facebook.com/sublimaxnavojoa",
    tiktok: "",
  },

  // ── Horario ──────────────────────────────────────────────────────────────
  businessHours: "Lunes a Viernes: 9am – 6pm",

  // ── SEO ──────────────────────────────────────────────────────────────────
  siteUrl: "https://www.sublimaxnavojoa.com",
};

/** Construye el enlace wa.me con el mensaje pre-llenado */
export function getWhatsAppUrl(message?: string): string {
  const number = SITE_CONFIG.whatsappNumber.replace(/\D/g, "");
  const text = encodeURIComponent(message ?? SITE_CONFIG.whatsappMessage);
  return `https://wa.me/${number}?text=${text}`;
}
