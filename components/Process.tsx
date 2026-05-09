"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    icon: "upload_file",
    title: "Envías tu diseño",
    description:
      "Sube tus imágenes en alta resolución o comparte tu idea con nuestros diseñadores.",
  },
  {
    number: "02",
    icon: "design_services",
    title: "Personalizamos",
    description:
      "Ajustamos, preparamos mockups y te enviamos una vista previa para tu aprobación final.",
  },
  {
    number: "03",
    icon: "precision_manufacturing",
    title: "Fabricamos",
    description:
      "Utilizamos tecnología de sublimación de última generación para un acabado impecable.",
  },
  {
    number: "04",
    icon: "local_shipping",
    title: "Entregamos",
    description:
      "Recibe tu producto cuidadosamente empacado en la puerta de tu casa u oficina.",
  },
];

export default function Process() {
  return (
    <section
      id="proceso"
      className="py-20 bg-surface-container-lowest relative overflow-hidden"
    >
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-0 left-0 w-64 h-64 bg-primary-container/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="font-headline-lg text-[32px] font-bold text-on-surface mb-4">
            El Proceso Creativo
          </h2>
          <p className="text-[16px] text-on-surface-variant leading-relaxed">
            Simple, rápido y con atención obsesiva al detalle. Así es como damos
            vida a tus ideas.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 relative">
          {/* Connecting line — desktop */}
          <div className="hidden lg:block absolute top-12 left-[12.5%] right-[12.5%] h-[2px] bg-surface-container-high z-0" />

          {steps.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: idx * 0.12, duration: 0.5, ease: "easeOut" }}
              className="relative z-10 flex flex-col items-center text-center group"
            >
              {/* Icon circle */}
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 border border-surface-container-highest group-hover:scale-110 group-hover:border-primary-container transition-all duration-300 relative"
                style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}
              >
                <span className="material-symbols-outlined text-[36px] text-primary-container">
                  {step.icon}
                </span>
                {/* Step number badge */}
                <div className="absolute -top-2 -right-2 w-7 h-7 bg-primary-container text-on-primary-container rounded-full text-[10px] font-bold flex items-center justify-center">
                  {step.number}
                </div>
              </div>

              <h4 className="text-[18px] font-bold text-on-surface mb-3 font-headline-md">
                {step.title}
              </h4>
              <p className="text-[13px] text-on-surface-variant leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* CTA below process */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-center mt-16"
        >
          <button
            onClick={() =>
              document
                .querySelector("#contacto")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary px-8 py-4 rounded-full text-[12px] font-semibold uppercase tracking-widest transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            Comenzar mi pedido
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}
