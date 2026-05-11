"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import {
  getSiteConfig,
  formatPrice,
  type GalleryImage,
} from "@/lib/imageStore";

export interface ProductEventDetail {
  name: string;
  price?: number;
  priceMode?: "fixed" | "quote" | "promo";
  category?: string;
  imageUrl?: string;
  description?: string;
}

// ─── Tipo local ────────────────────────────────────────────────────────────────

type FeaturedItem = GalleryImage & {
  categoryTitle: string;
  catGradient: string;
  catIcon: string;
};

// ─── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest rounded-[24px] overflow-hidden animate-pulse">
      <div className="h-64 bg-surface-container" />
      <div className="p-5 space-y-3">
        <div className="h-3 bg-surface-container rounded-full w-1/3" />
        <div className="h-5 bg-surface-container rounded-full w-2/3" />
        <div className="h-3 bg-surface-container rounded-full w-full" />
        <div className="h-10 bg-surface-container rounded-full mt-4" />
      </div>
    </div>
  );
}

// ─── Featured Card ─────────────────────────────────────────────────────────────

function FeaturedCard({
  item,
  index,
  onCotizar,
}: {
  item: FeaturedItem;
  index: number;
  onCotizar: (item: FeaturedItem) => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const displayName = item.name || item.caption || item.categoryTitle;
  const priceMode = item.priceMode ?? (item.price !== undefined ? "fixed" : "quote");

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ delay: index * 0.1, duration: 0.55, ease: "easeOut" }}
      className="group relative bg-surface-container-lowest rounded-[24px] overflow-hidden flex flex-col cursor-pointer"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.05)" }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      {/* Image area */}
      <div
        className={`relative h-64 overflow-hidden flex items-center justify-center flex-shrink-0
          ${item.imageUrl ? "bg-surface-container" : `bg-gradient-to-br ${item.catGradient}`}`}
      >
        {item.imageUrl ? (
          <>
            {!imgLoaded && (
              <div className="absolute inset-0 bg-surface-container animate-pulse" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt={displayName}
              onLoad={() => setImgLoaded(true)}
              loading="lazy"
              className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${imgLoaded ? "opacity-100" : "opacity-0"
                }`}
            />
          </>
        ) : (
          <span className="material-symbols-outlined text-[80px] text-primary/15 group-hover:text-primary/25 group-hover:scale-105 transition-all duration-500">
            {item.catIcon}
          </span>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Destacado badge */}
        <div className="absolute top-3 left-3 z-10">
          <div className="badge-gradient text-[9px] tracking-widest flex items-center gap-1 px-2.5 py-1 rounded-full">
            <span className="material-symbols-outlined text-[11px]">star</span>
            Destacado
          </div>
        </div>

        {/* Precio badge */}
        <div className="absolute top-3 right-3 z-10">
          {priceMode === "quote" || item.price === undefined ? (
            <div className="bg-white/90 backdrop-blur-sm text-on-surface-variant px-3 py-1.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[11px]">chat_bubble</span>
              Cotizar
            </div>
          ) : priceMode === "promo" ? (
            <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-[12px] font-bold shadow-md flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">local_offer</span>
              {formatPrice(item.price)}
            </div>
          ) : (
            <div className="bg-primary text-on-primary px-3 py-1.5 rounded-full text-[12px] font-bold shadow-md">
              {formatPrice(item.price)}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-container mb-1">
            {item.categoryTitle}
          </p>
          <h3 className="text-[17px] font-bold text-on-surface font-headline-md mb-1.5 leading-tight">
            {displayName}
          </h3>
          {item.description && (
            <p className="text-[13px] text-on-surface-variant leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        <div className="space-y-3">
          {/* Price display */}
          {priceMode === "quote" || item.price === undefined ? (
            <div className="flex items-center gap-2 bg-surface-container py-2 px-3 rounded-xl">
              <span className="material-symbols-outlined text-[15px] text-primary-container">chat_bubble</span>
              <span className="text-[12px] font-semibold text-on-surface-variant">Precio a cotizar</span>
            </div>
          ) : priceMode === "promo" ? (
            <div className="flex items-baseline gap-2">
              <span className="text-[22px] font-bold text-red-500">{formatPrice(item.price)}</span>
              <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">PROMO</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-bold text-on-surface">{formatPrice(item.price)}</span>
              <span className="text-[12px] text-outline">c/u</span>
            </div>
          )}

          <button
            onClick={() => onCotizar(item)}
            className="w-full py-3 bg-primary-container text-on-primary-container rounded-full text-[11px] font-bold uppercase tracking-widest hover:opacity-90 hover:shadow-md transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[15px]">edit_note</span>
            Cotizar ahora
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function FeaturedProducts() {
  const [featured, setFeatured] = useState<FeaturedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSiteConfig().then((cfg) => {
      // Recopila todas las imágenes marcadas como destacadas en TODAS las categorías
      const items: FeaturedItem[] = cfg.gallery.flatMap((cat) =>
        cat.images
          .filter((img) => img.featured && img.imageUrl)
          .map((img) => ({
            ...img,
            categoryTitle: cat.title,
            catGradient: cat.gradient,
            catIcon: cat.icon,
          }))
      ).sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));

      setFeatured(items);
      setLoading(false);
    });
  }, []);

  // Si no hay destacados y terminó de cargar, ocultar la sección
  if (!loading && featured.length === 0) return null;

  const scrollToContact = (item?: FeaturedItem) => {
    const el = document.querySelector("#contacto");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    if (item) {
      const displayName = item.name || item.caption || item.categoryTitle;
      const detail: ProductEventDetail = {
        name: displayName,
        price: item.price,
        category: item.categoryTitle,
        imageUrl: item.imageUrl,
      };
      window.dispatchEvent(new CustomEvent("prefill-product", { detail }));
    }
  };

  return (
    <section id="destacados" className="py-24 bg-surface">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="flex flex-col md:flex-row justify-between items-end mb-14"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-container/10 text-primary-container text-[11px] font-bold uppercase tracking-widest mb-4">
              <span className="material-symbols-outlined text-[14px]">star</span>
              Lo más popular
            </div>
            <h2 className="font-headline-lg text-[34px] font-bold text-on-surface mb-3 leading-tight">
              Productos Destacados
            </h2>
            <p className="text-[16px] text-on-surface-variant leading-relaxed">
              Nuestra selección de productos más solicitados, listos para ser personalizados con tu diseño.
            </p>
          </div>
          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            onClick={() =>
              document.querySelector("#galeria-productos")?.scrollIntoView({ behavior: "smooth" })
            }
            className="mt-6 md:mt-0 inline-flex items-center gap-1.5 text-primary-container text-[13px] font-semibold hover:underline transition-all flex-shrink-0"
          >
            Ver catálogo completo
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </motion.button>
        </motion.div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((item, idx) => (
                <FeaturedCard
                  key={`${item.categoryTitle}-${item.id}`}
                  item={item}
                  index={idx}
                  onCotizar={scrollToContact}
                />
              ))}
            </div>
          </AnimatePresence>
        )}

        {/* Bottom CTA */}
        {!loading && featured.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <p className="text-[14px] text-on-surface-variant mb-4">
              ¿Buscas algo más específico?
            </p>
            <button
              onClick={() => scrollToContact()}
              className="inline-flex items-center gap-2 text-primary-container text-[13px] font-semibold hover:underline transition-all"
            >
              Solicita cualquier producto personalizado
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}