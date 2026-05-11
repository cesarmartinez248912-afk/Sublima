"use client";

import { SITE_CONFIG, getWhatsAppUrl } from "@/lib/config";

const navLinks = [
  { href: "#destacados", label: "Destacados" },
  { href: "#galeria-productos", label: "Productos" },
  { href: "#galeria", label: "Galería" },
];

const infoLinks = [
  { href: "#contacto", label: "Cotizar" },
];

const scrollTo = (id: string) =>
  document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });

export default function Footer() {
  const socialLinks = [
    {
      href: SITE_CONFIG.social.instagram,
      label: "Instagram",
      icon: "photo_camera",
      show: !!SITE_CONFIG.social.instagram,
    },
    {
      href: SITE_CONFIG.social.facebook,
      label: "Facebook",
      icon: "thumb_up",
      show: !!SITE_CONFIG.social.facebook,
    },
    {
      href: getWhatsAppUrl(),
      label: "WhatsApp",
      icon: "chat",
      show: true,
    },
  ].filter((s) => s.show);

  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant py-20 mt-0">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          {/* Brand */}
          <div className="md:col-span-1 flex flex-col gap-4">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-xl font-bold text-primary font-headline-md hover:opacity-80 transition-opacity text-left"
            >
              {SITE_CONFIG.name}
            </button>
            <p className="text-[14px] text-on-surface-variant leading-relaxed">
              {SITE_CONFIG.description}
            </p>
            {/* Social icons */}
            <div className="flex gap-3 mt-2">
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center text-primary-container hover:bg-primary-container hover:text-on-primary-container transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    {s.icon}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Explorar */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[15px] font-bold text-on-surface mb-1">
              Explorar
            </h4>
            {navLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-[14px] text-on-surface-variant hover:text-primary transition-colors text-left"
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Información */}
          <div className="flex flex-col gap-3">
            <h4 className="text-[15px] font-bold text-on-surface mb-1">
              Información
            </h4>
            {infoLinks.map((l) => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-[14px] text-on-surface-variant hover:text-primary transition-colors text-left"
              >
                {l.label}
              </button>
            ))}
            <a
              href="#"
              className="text-[14px] text-on-surface-variant hover:text-primary transition-colors"
            >
              Aviso de privacidad
            </a>
          </div>

          {/* Contacto */}
          <div className="flex flex-col gap-4">
            <h4 className="text-[15px] font-bold text-on-surface mb-1">
              Atención al Cliente
            </h4>
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:${SITE_CONFIG.email}`}
                className="flex items-center gap-2 text-[14px] text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-primary-container">
                  mail
                </span>
                {SITE_CONFIG.email}
              </a>
              <a
                href={`tel:${SITE_CONFIG.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-[14px] text-on-surface-variant hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-primary-container">
                  call
                </span>
                {SITE_CONFIG.phone}
              </a>
              <div className="flex items-start gap-2 text-[14px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-primary-container flex-shrink-0 mt-0.5">
                  location_on
                </span>
                {SITE_CONFIG.address}
              </div>
              <div className="flex items-center gap-2 text-[14px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[18px] text-primary-container">
                  schedule
                </span>
                {SITE_CONFIG.businessHours}
              </div>
            </div>

            {/* CTA WhatsApp */}
            <a
              href={getWhatsAppUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-3 rounded-full text-[12px] font-semibold uppercase tracking-widest hover:bg-[#20c05b] transition-all duration-200 hover:scale-[1.02] active:scale-95 shadow-sm w-fit"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Escríbenos
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-surface-container-high text-center">
          <p className="text-[12px] text-on-surface-variant">
            © {new Date().getFullYear()} {SITE_CONFIG.name} · Todos los derechos
            reservados · Hecho con{" "}
            <span className="text-error" aria-label="amor">
              ♥
            </span>{" "}
            en México
          </p>
        </div>
      </div>
    </footer>
  );
}
