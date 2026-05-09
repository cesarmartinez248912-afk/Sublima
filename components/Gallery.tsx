"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getSiteConfig, DEFAULT_GALLERY, type GalleryItemConfig } from "@/lib/imageStore";

export default function Gallery() {
  const [galleryItems, setGalleryItems] = useState<GalleryItemConfig[]>(DEFAULT_GALLERY);

  useEffect(() => {
    const load = () => {
      const cfg = getSiteConfig();
      setGalleryItems(cfg.gallery);
    };
    load();
    window.addEventListener("sublimeart:config-updated", load);
    return () => window.removeEventListener("sublimeart:config-updated", load);
  }, []);

  return (
    <section id="galeria" className="py-20 bg-surface">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
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

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[240px]">
          {galleryItems.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: idx * 0.08, duration: 0.45 }}
              className={`${item.colSpan} rounded-[24px] overflow-hidden relative group cursor-pointer
                ${item.imageUrl ? "" : `bg-gradient-to-br ${item.gradient}`}`}
              style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}
              onClick={() =>
                document
                  .querySelector("#contacto")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            >
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}

              {!item.imageUrl && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className={`material-symbols-outlined text-primary-container/20 group-hover:text-primary-container/30 transition-all duration-500 group-hover:scale-110 ${item.large ? "text-[100px]" : "text-[60px]"
                      }`}
                  >
                    {item.icon}
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />

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