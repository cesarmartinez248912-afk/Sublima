"use client";

import { motion } from "framer-motion";

const galleryItems = [
  {
    id: 1,
    title: "Agencia Digital Nexus",
    badge: "Kit Corporativo",
    gradient: "from-blue-100 via-indigo-50 to-blue-50",
    icon: "business_center",
    colSpan: "md:col-span-2 md:row-span-2",
    large: true,
  },
  {
    id: 2,
    title: "Colección Geométrica",
    badge: "Playeras",
    gradient: "from-purple-50 to-indigo-100",
    icon: "checkroom",
    colSpan: "md:col-span-1 md:row-span-1",
    large: false,
  },
  {
    id: 3,
    title: "Pop Art Collection",
    badge: "Llaveros",
    gradient: "from-sky-50 to-cyan-100",
    icon: "key",
    colSpan: "md:col-span-1 md:row-span-1",
    large: false,
  },
  {
    id: 4,
    title: "Taza Floral",
    badge: "Tazas",
    gradient: "from-violet-50 to-purple-100",
    icon: "coffee",
    colSpan: "md:col-span-2 md:row-span-1 lg:col-span-1 lg:row-span-1",
    large: false,
  },
  {
    id: 5,
    title: "Mármol & Geometría",
    badge: "Fundas",
    gradient: "from-slate-50 to-blue-100",
    icon: "smartphone",
    colSpan: "md:col-span-1 md:row-span-1",
    large: false,
  },
];

export default function Gallery() {
  return (
    <section id="galeria" className="py-20 bg-surface">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between items-end mb-12"
        >
          <div className="max-w-2xl">
            <h2 className="font-headline-lg text-[32px] font-bold text-on-surface mb-4">
              Galería de Trabajos
            </h2>
            <p className="text-[16px] text-on-surface-variant leading-relaxed">
              Explora algunos de nuestros proyectos recientes y encuentra
              inspiración para tu próxima creación.
            </p>
          </div>
          <button
            onClick={() =>
              document
                .querySelector("#contacto")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-6 md:mt-0 inline-flex items-center gap-1 text-primary-container text-[13px] font-semibold hover:underline transition-all"
          >
            Quiero uno así{" "}
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </button>
        </motion.div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[240px]">
          {galleryItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: idx * 0.08, duration: 0.45 }}
              className={`${item.colSpan} rounded-[24px] overflow-hidden relative group cursor-pointer bg-gradient-to-br ${item.gradient}`}
              style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}
              onClick={() =>
                document
                  .querySelector("#contacto")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              {/* Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`material-symbols-outlined text-primary-container/20 group-hover:text-primary-container/30 transition-all duration-500 group-hover:scale-110 ${
                    item.large ? "text-[100px]" : "text-[60px]"
                  }`}
                >
                  {item.icon}
                </span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

              {/* Labels */}
              <div className="absolute bottom-5 left-5 z-20 translate-y-3 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-primary-container text-[10px] font-semibold uppercase tracking-wide mb-2 inline-block">
                  {item.badge}
                </span>
                {item.large && (
                  <h3 className="text-white text-[20px] font-bold mt-1">
                    {item.title}
                  </h3>
                )}
              </div>

              {/* Top badge — always visible */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                <div className="bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[16px] text-primary-container">
                    open_in_new
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
