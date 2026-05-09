"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    name: "Andrea Castillo",
    role: "Directora de Marketing",
    company: "Agencia Nexus",
    rating: 5,
    text: "El kit corporativo que pedimos superó todas nuestras expectativas. Los colores son exactamente los del manual de marca y la calidad es increíble. Definitivamente volveremos a pedir.",
    avatar: "A",
    color: "bg-blue-100 text-blue-700",
  },
  {
    name: "Roberto Mendez",
    role: "Emprendedor",
    company: "MR Clothing Co.",
    rating: 5,
    text: "Pedí 100 playeras para mi línea de ropa y quedé impresionado. El proceso fue súper sencillo, rápido y el resultado final fue de lujo. Mis clientes están encantados.",
    avatar: "R",
    color: "bg-purple-100 text-purple-700",
  },
  {
    name: "Sofía Herrera",
    role: "Organizadora de eventos",
    company: "Eventos Únicos",
    rating: 5,
    text: "Compré termos personalizados como recuerdos para una boda y fueron el hit de la fiesta. Calidad premium, entrega puntual y comunicación excelente durante todo el proceso.",
    avatar: "S",
    color: "bg-indigo-100 text-indigo-700",
  },
];

export default function Testimonials() {
  return (
    <section id="testimonios" className="py-20 bg-surface-container-lowest">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-headline-lg text-[32px] font-bold text-on-surface mb-4">
            Lo que dicen nuestros clientes
          </h2>
          <p className="text-[16px] text-on-surface-variant leading-relaxed">
            Más de 500 clientes satisfechos avalan nuestra calidad y servicio.
          </p>

          {/* Stars aggregate */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[...Array(5)].map((_, i) => (
              <span
                key={i}
                className="material-symbols-outlined text-[24px] text-yellow-400"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
            ))}
            <span className="text-[14px] font-semibold text-on-surface ml-2">
              5.0 / 5.0 · 500+ reseñas
            </span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: idx * 0.1, duration: 0.5 }}
              className="bg-white rounded-[24px] p-8 flex flex-col gap-5 hover:scale-[1.01] transition-all duration-300"
              style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}
            >
              {/* Stars */}
              <div className="flex gap-1">
                {[...Array(t.rating)].map((_, i) => (
                  <span
                    key={i}
                    className="material-symbols-outlined text-[18px] text-yellow-400"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    star
                  </span>
                ))}
              </div>

              {/* Quote */}
              <p className="text-[15px] text-on-surface-variant leading-relaxed italic">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-auto pt-4 border-t border-outline-variant">
                <div
                  className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-[14px] font-bold flex-shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-[13px] font-bold text-on-surface">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    {t.role} · {t.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
