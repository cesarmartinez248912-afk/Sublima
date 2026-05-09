"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getSiteConfig } from "@/lib/imageStore";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: "easeOut" },
  }),
};

export default function Hero() {
  const [heroImage, setHeroImage] = useState<string | null>(null);

  useEffect(() => {
    getSiteConfig().then((cfg) => {
      if (cfg.hero.backgroundImageUrl) {
        setHeroImage(cfg.hero.backgroundImageUrl);
      }
    });
  }, []);

  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="relative w-full min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden bg-surface-container-lowest">
      {/* Background image (from Supabase) */}
      {heroImage && (
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt="Fondo Hero"
            className="w-full h-full object-cover"
          />
          {/* Overlay para legibilidad del texto */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />
        </div>
      )}

      {/* Ambient background blobs (solo si no hay imagen) */}
      {!heroImage && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary rounded-full mix-blend-multiply filter blur-[120px] animate-pulse-slow" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary rounded-full mix-blend-multiply filter blur-[150px] animate-pulse-slow" />
        </div>
      )}

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20">
        {/* Text content */}
        <div className="space-y-6 flex flex-col justify-center">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-semibold uppercase tracking-widest w-fit
              ${heroImage
                ? "bg-white/20 backdrop-blur-sm text-white border border-white/30"
                : "bg-primary-container/10 text-primary-container"}`}
          >
            <span className="material-symbols-outlined text-[16px]">stars</span>
            Calidad Premium Garantizada
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className={`font-display-lg text-[clamp(36px,5vw,56px)] leading-[1.1] tracking-tight font-bold
              ${heroImage ? "text-white drop-shadow-lg" : "text-on-surface"}`}
          >
            Convertimos tus ideas en{" "}
            <span className={heroImage ? "text-blue-300" : "text-primary-container"}>
              productos únicos
            </span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className={`text-[18px] leading-relaxed max-w-xl
              ${heroImage ? "text-white/85 drop-shadow" : "text-on-surface-variant"}`}
          >
            Servicio de sublimación de alta gama para empresas, eventos y regalos
            personales. Detalle excepcional, colores vibrantes y acabados duraderos
            que elevan la percepción de tu marca o recuerdo.
          </motion.p>

          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-4 pt-2"
          >
            <button
              onClick={() => scrollTo("#contacto")}
              className="bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary px-8 py-4 rounded-full text-[12px] font-semibold uppercase tracking-widest transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              Hacer pedido
              <span className="material-symbols-outlined text-[20px]">
                shopping_cart
              </span>
            </button>

            <button
              onClick={() => scrollTo("#productos")}
              className={`px-8 py-4 rounded-full text-[12px] font-semibold uppercase tracking-widest transition-all duration-200 active:scale-[0.98]
                ${heroImage
                  ? "bg-white/20 backdrop-blur-sm text-white border border-white/50 hover:bg-white/30"
                  : "bg-transparent text-primary-container border border-outline-variant hover:border-primary-container hover:bg-surface-container-low"}`}
            >
              Ver catálogo
            </button>
          </motion.div>

          {/* Social proof chips */}
          <motion.div
            custom={4}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap gap-4 pt-4"
          >
            {[
              { icon: "verified", text: "Calidad garantizada" },
              { icon: "bolt", text: "Entrega express" },
              { icon: "groups", text: "+500 clientes felices" },
            ].map((chip) => (
              <div
                key={chip.text}
                className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full
                  ${heroImage
                    ? "bg-white/15 backdrop-blur-sm text-white border border-white/20"
                    : "bg-surface-container-low text-on-surface-variant"}`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {chip.icon}
                </span>
                {chip.text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right column: decorative card (sin imagen de fondo) */}
        {!heroImage && (
          <motion.div
            custom={5}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="hidden lg:block"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-[40px] blur-2xl" />
              <div
                className="relative bg-surface-container-low rounded-[32px] p-8 space-y-6"
                style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.06)" }}
              >
                {[
                  {
                    icon: "coffee",
                    label: "Tazas",
                    color: "bg-blue-50",
                    text: "text-blue-600",
                  },
                  {
                    icon: "checkroom",
                    label: "Playeras",
                    color: "bg-purple-50",
                    text: "text-purple-600",
                  },
                  {
                    icon: "water_bottle",
                    label: "Termos",
                    color: "bg-indigo-50",
                    text: "text-indigo-600",
                  },
                  {
                    icon: "mouse",
                    label: "Mousepads",
                    color: "bg-sky-50",
                    text: "text-sky-600",
                  },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0`}
                    >
                      <span
                        className={`material-symbols-outlined ${item.text} text-[24px]`}
                      >
                        {item.icon}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-on-surface text-[14px]">
                        {item.label}
                      </p>
                      <p className="text-[12px] text-on-surface-variant">
                        Sublimación premium
                      </p>
                    </div>
                    <span className="ml-auto material-symbols-outlined text-primary-container/40 text-[18px]">
                      chevron_right
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}
