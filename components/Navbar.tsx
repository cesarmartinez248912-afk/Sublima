"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "#productos", label: "Productos" },
  { href: "#proceso", label: "Proceso" },
  { href: "#galeria", label: "Galería" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#contacto", label: "Cotizar" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/90 backdrop-blur-md shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="flex justify-between items-center w-full px-4 md:px-6 max-w-[1280px] mx-auto h-20">
          {/* Brand */}
          <a
            href="#"
            className="text-xl font-bold text-primary font-headline-md hover:opacity-80 transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            Sublimax Navojoa
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.slice(0, -1).map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="text-on-surface-variant hover:text-primary text-[12px] font-semibold uppercase tracking-widest transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTA + Mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick("#contacto")}
              className="hidden md:inline-flex items-center gap-2 bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary px-6 py-3 rounded-full text-[12px] font-semibold uppercase tracking-widest transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              Cotizar
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden text-primary p-2 rounded-lg hover:bg-surface-container transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            >
              <span className="material-symbols-outlined">
                {mobileOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-0 right-0 z-40 bg-white/95 backdrop-blur-md shadow-lg border-b border-outline-variant"
          >
            <div className="flex flex-col py-4 px-6 gap-1">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-left py-3 px-4 rounded-xl text-[13px] font-semibold uppercase tracking-widest transition-all duration-200 ${
                    link.label === "Cotizar"
                      ? "bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary mt-2"
                      : "text-on-surface-variant hover:text-primary hover:bg-surface-container"
                  }`}
                >
                  {link.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer so content doesn't hide behind fixed nav */}
      <div className="h-20" />
    </>
  );
}
