"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.55, ease: "easeOut" },
  }),
};

export default function Hero() {
  const scrollTo = (id: string) => {
    document.querySelector(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <header className="relative w-full min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden bg-surface-container-lowest">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary rounded-full mix-blend-multiply filter blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-secondary rounded-full mix-blend-multiply filter blur-[150px] animate-pulse-slow" />
      </div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-20">
        {/* Text content */}
        <div className="space-y-6 flex flex-col justify-center">
          <motion.div
            custom={0}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/10 text-primary-container rounded-full text-[12px] font-semibold uppercase tracking-widest w-fit"
          >
            <span className="material-symbols-outlined text-[16px]">stars</span>
            Calidad Premium Garantizada
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="font-display-lg text-[clamp(36px,5vw,56px)] leading-[1.1] tracking-tight text-on-surface font-bold"
          >
            Convertimos tus ideas en{" "}
            <span className="text-primary-container">productos únicos</span>
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="text-[18px] leading-relaxed text-on-surface-variant max-w-xl"
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
              className="bg-transparent text-primary-container border border-outline-variant hover:border-primary-container hover:bg-surface-container-low px-8 py-4 rounded-full text-[12px] font-semibold uppercase tracking-widest transition-all duration-200 active:scale-[0.98]"
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
            ].map(({ icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-2 text-[12px] text-on-surface-variant font-medium"
              >
                <span className="material-symbols-outlined text-[16px] text-primary-container">
                  {icon}
                </span>
                {text}
              </div>
            ))}
          </motion.div>
        </div>

        {/* Visual showcase card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
          className="relative h-[400px] lg:h-[600px] w-full rounded-[32px] overflow-hidden bg-gradient-to-br from-surface-container-high to-surface-container-lowest"
          style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}
        >
          {/* Decorative gradient overlays */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-br from-primary/10 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-tl from-secondary/10 to-transparent" />

          {/* Center illustration */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 gap-6">
            <div className="grid grid-cols-2 gap-4 w-full max-w-xs">
              {[
                { icon: "coffee", label: "Tazas", color: "bg-blue-50" },
                { icon: "water_bottle", label: "Termos", color: "bg-purple-50" },
                { icon: "checkroom", label: "Playeras", color: "bg-indigo-50" },
                { icon: "devices", label: "Más", color: "bg-sky-50" },
              ].map(({ icon, label, color }) => (
                <div
                  key={label}
                  className={`${color} rounded-2xl p-6 flex flex-col items-center gap-2 border border-white/60`}
                >
                  <span className="material-symbols-outlined text-[32px] text-primary-container">
                    {icon}
                  </span>
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-outline">
              Más de 30 productos disponibles
            </p>
          </div>

          {/* Floating badge */}
          <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full text-[11px] font-semibold text-primary-container border border-outline-variant shadow-sm">
            ✨ Diseño 100% personalizado
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 cursor-pointer"
        onClick={() => scrollTo("#productos")}
      >
        <span className="text-[10px] font-semibold uppercase tracking-widest text-outline">
          Explorar
        </span>
        <motion.span
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          className="material-symbols-outlined text-[20px] text-outline"
        >
          keyboard_arrow_down
        </motion.span>
      </motion.div>
    </header>
  );
}
