"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import {
  getSiteConfig,
  DEFAULT_GALLERY,
  type GalleryCategory,
} from "@/lib/imageStore";

// ─── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  image,
  onClose,
}: {
  image: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
      onClick={onClose}
    >
      <motion.img
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.25 }}
        src={image}
        alt="Imagen ampliada"
        className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl cursor-default"
        onClick={(e) => e.stopPropagation()}
      />
      <button
        onClick={onClose}
        className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
      >
        <span className="material-symbols-outlined text-white text-[22px]">
          close
        </span>
      </button>
    </motion.div>
  );
}

// ─── Category Detail View ─────────────────────────────────────────────────────

function CategoryDetail({
  category,
  onBack,
}: {
  category: GalleryCategory;
  onBack: () => void;
}) {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // All displayable images: cover + extra images
  const allImages: { id: number; url: string; caption?: string }[] = [];
  if (category.imageUrl) {
    allImages.push({ id: 0, url: category.imageUrl, caption: category.title });
  }
  category.images.forEach((img) => {
    if (img.imageUrl) {
      allImages.push({ id: img.id, url: img.imageUrl, caption: img.caption });
    }
  });

  return (
    <>
      <AnimatePresence>
        {lightboxUrl && (
          <Lightbox image={lightboxUrl} onClose={() => setLightboxUrl(null)} />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.35 }}
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-primary-container text-[13px] font-semibold hover:underline transition-all group"
          >
            <span className="material-symbols-outlined text-[18px] group-hover:-translate-x-0.5 transition-transform">
              arrow_back
            </span>
            Volver a la galería
          </button>

          <div className="h-5 w-px bg-outline-variant" />

          <div className="flex items-center gap-2">
            <span className="bg-primary-container/10 px-3 py-1 rounded-full text-primary-container text-[11px] font-semibold uppercase tracking-wide">
              {category.badge}
            </span>
            <h2 className="text-[24px] font-bold text-on-surface">
              {category.title}
            </h2>
          </div>
        </div>

        {/* Image grid */}
        {allImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div
              className={`w-24 h-24 rounded-3xl bg-gradient-to-br ${category.gradient} flex items-center justify-center`}
            >
              <span className="material-symbols-outlined text-[44px] text-primary-container/50">
                {category.icon}
              </span>
            </div>
            <p className="text-on-surface-variant text-[15px]">
              Aún no hay fotos en esta categoría.
            </p>
            <button
              onClick={() =>
                document
                  .querySelector("#contacto")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center gap-2 text-primary-container text-[13px] font-semibold hover:underline"
            >
              Solicitar un trabajo de este tipo
              <span className="material-symbols-outlined text-[16px]">
                arrow_forward
              </span>
            </button>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
            {allImages.map((img, idx) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.06, duration: 0.4 }}
                className="break-inside-avoid rounded-[20px] overflow-hidden relative group cursor-zoom-in"
                onClick={() => setLightboxUrl(img.url)}
                style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt={img.caption ?? category.title}
                  className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                {img.caption && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                    <p className="text-white text-[13px] font-semibold">
                      {img.caption}
                    </p>
                  </div>
                )}
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[15px] text-primary-container">
                      zoom_in
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA at the bottom */}
        <div className="mt-14 text-center">
          <button
            onClick={() =>
              document
                .querySelector("#contacto")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-full text-[12px] font-semibold uppercase tracking-widest hover:opacity-90 transition-all duration-200 shadow-sm"
          >
            Quiero uno así
            <span className="material-symbols-outlined text-[18px]">
              shopping_cart
            </span>
          </button>
        </div>
      </motion.div>
    </>
  );
}

// ─── Category Card (grid view) ────────────────────────────────────────────────

function CategoryCard({
  category,
  index,
  onViewMore,
}: {
  category: GalleryCategory;
  index: number;
  onViewMore: () => void;
}) {
  const imageCount = category.images.filter((i) => i.imageUrl).length;
  const hasImages = !!category.imageUrl || imageCount > 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.08, duration: 0.45 }}
      className={`${category.colSpan} rounded-[24px] overflow-hidden relative group
        ${hasImages ? "" : `bg-gradient-to-br ${category.gradient}`}`}
      style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}
    >
      {/* Cover image */}
      {category.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={category.imageUrl}
          alt={category.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}

      {/* Icon fallback */}
      {!category.imageUrl && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={`material-symbols-outlined text-primary-container/20 group-hover:text-primary-container/30 transition-all duration-500 group-hover:scale-110 ${
              category.large ? "text-[100px]" : "text-[60px]"
            }`}
          >
            {category.icon}
          </span>
        </div>
      )}

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300 z-10" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5 z-20">
        <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-primary-container text-[10px] font-semibold uppercase tracking-wide mb-2 inline-block">
          {category.badge}
        </span>

        {category.large && (
          <h3 className="text-white text-[20px] font-bold mt-1 mb-3 drop-shadow-sm">
            {category.title}
          </h3>
        )}

        {/* Ver más button */}
        <button
          onClick={onViewMore}
          className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm text-primary-container text-[11px] font-semibold px-4 py-2 rounded-full hover:bg-white transition-all duration-200 hover:shadow-md active:scale-[0.97] mt-2"
        >
          <span className="material-symbols-outlined text-[14px]">
            photo_library
          </span>
          Ver más
          {imageCount > 0 && (
            <span className="bg-primary-container text-on-primary-container text-[9px] font-bold px-1.5 py-0.5 rounded-full ml-0.5">
              {imageCount + (category.imageUrl ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* Top-right expand icon */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
        <div className="bg-white/90 backdrop-blur-sm w-8 h-8 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined text-[16px] text-primary-container">
            open_in_full
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Gallery ─────────────────────────────────────────────────────────────

export default function Gallery() {
  const [categories, setCategories] = useState<GalleryCategory[]>(DEFAULT_GALLERY);
  const [selectedCategory, setSelectedCategory] = useState<GalleryCategory | null>(null);

  useEffect(() => {
    getSiteConfig().then((cfg) => setCategories(cfg.gallery));
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleViewMore = useCallback((category: GalleryCategory) => {
    setSelectedCategory(category);
    document.body.style.overflow = "hidden";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleBack = useCallback(() => {
    setSelectedCategory(null);
    document.body.style.overflow = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <section id="galeria" className="py-20 bg-surface">
      <AnimatePresence mode="wait">
        {selectedCategory ? (
          <motion.div
            key={`detail-${selectedCategory.id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-surface overflow-y-auto"
          >
            <div className="max-w-[1280px] mx-auto px-4 md:px-6 py-8 md:py-10">
              <CategoryDetail
                category={selectedCategory}
                onBack={handleBack}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="max-w-[1280px] mx-auto px-4 md:px-6"
          >
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
                    Explora nuestras categorías y encuentra inspiración para tu
                    próxima creación. Haz clic en{" "}
                    <span className="font-semibold text-primary-container">
                      Ver más
                    </span>{" "}
                    para ver todos los trabajos de esa categoría.
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

              {/* Category grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[240px]">
                {categories.map((category, idx) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    index={idx}
                    onViewMore={() => handleViewMore(category)}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
