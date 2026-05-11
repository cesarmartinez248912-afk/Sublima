"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useMemo } from "react";
import {
  getSiteConfig,
  formatPrice,
  type GalleryImage,
} from "@/lib/imageStore";
import type { ProductEventDetail } from "./FeaturedProducts";

// ─── Tipo local ────────────────────────────────────────────────────────────────

type GalleryItem = GalleryImage & {
  categoryTitle: string;
  catGradient: string;
  catIcon: string;
};

// ─── Skeleton Card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest rounded-[20px] overflow-hidden animate-pulse">
      <div className="h-48 bg-surface-container" />
      <div className="p-4 space-y-2.5">
        <div className="h-3 bg-surface-container rounded-full w-1/3" />
        <div className="h-4 bg-surface-container rounded-full w-2/3" />
        <div className="h-8 bg-surface-container rounded-full mt-3" />
      </div>
    </div>
  );
}

// ─── Gallery Card ──────────────────────────────────────────────────────────────

function GalleryCard({
  item,
  index,
  onCotizar,
}: {
  item: GalleryItem;
  index: number;
  onCotizar: (item: GalleryItem) => void;
}) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const displayName = item.name || item.caption || item.categoryTitle;
  const priceMode = item.priceMode ?? (item.price !== undefined ? "fixed" : "quote");

  const priceDisplay = () => {
    if (priceMode === "quote" || item.price === undefined) {
      return (
        <span className="text-[12px] font-semibold text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[13px]">chat_bubble</span>
          Precio personalizado
        </span>
      );
    }
    if (priceMode === "promo") {
      return (
        <div className="flex items-baseline gap-1.5">
          <span className="text-[16px] font-bold text-red-500">{formatPrice(item.price)}</span>
          <span className="text-[9px] bg-red-100 text-red-600 font-bold px-1.5 py-0.5 rounded-full">PROMO</span>
        </div>
      );
    }
    return (
      <div className="flex items-baseline gap-1">
        <span className="text-[16px] font-bold text-on-surface">{formatPrice(item.price)}</span>
        <span className="text-[11px] text-outline">c/u</span>
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05, duration: 0.35, ease: "easeOut" }}
      className="group bg-surface-container-lowest rounded-[20px] overflow-hidden flex flex-col"
      style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.04)" }}
      whileHover={{
        y: -3,
        boxShadow: "0 12px 32px rgba(240,165,0,0.12)",
        transition: { duration: 0.2 },
      }}
    >
      {/* Image */}
      <div
        className={`relative h-48 overflow-hidden flex items-center justify-center flex-shrink-0
          ${item.imageUrl ? "bg-surface-container" : `bg-gradient-to-br ${item.catGradient}`}`}
      >
        {item.imageUrl ? (
          <>
            {!imgLoaded && <div className="absolute inset-0 bg-surface-container animate-pulse" />}
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
          <span className="material-symbols-outlined text-[60px] text-primary/15 group-hover:text-primary/25 group-hover:scale-105 transition-all duration-500">
            {item.catIcon}
          </span>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Featured badge */}
        {item.featured && (
          <div className="absolute top-2.5 left-2.5 z-10">
            <div className="badge-gradient text-[8px] tracking-widest py-1 px-2.5 rounded-full flex items-center gap-1">
              <span className="material-symbols-outlined text-[10px]">star</span>
              Destacado
            </div>
          </div>
        )}

        {/* Category badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <div className="bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[9px] font-semibold text-primary-container uppercase tracking-wide">
            {item.categoryTitle}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex-grow flex flex-col justify-between gap-3">
        <div>
          <h3 className="text-[15px] font-bold text-on-surface font-headline-md leading-tight mb-1">
            {displayName}
          </h3>
          {priceDisplay()}
          {item.description && (
            <p className="text-[12px] text-on-surface-variant mt-1.5 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <button
          onClick={() => onCotizar(item)}
          className="w-full py-2.5 border-2 border-primary-container/30 rounded-full text-[10px] font-bold uppercase tracking-widest text-primary-container hover:bg-primary-container hover:text-on-primary-container transition-all duration-200 active:scale-[0.97] flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[13px]">edit_note</span>
          Cotizar
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function ProductGallery() {
  const [allItems, setAllItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("Todos");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getSiteConfig().then((cfg) => {
      // Aplana TODAS las imágenes de TODAS las categorías
      const items: GalleryItem[] = cfg.gallery.flatMap((cat) =>
        cat.images
          .filter((img) => img.imageUrl) // solo las que tienen imagen subida
          .map((img) => ({
            ...img,
            categoryTitle: cat.title,
            catGradient: cat.gradient,
            catIcon: cat.icon,
          }))
      );
      setAllItems(items);
      setLoading(false);
    });
  }, []);

  const DESTACADOS_TAB = "⭐ Destacados";

  // Tabs dinámicos por categoría
  const categories = useMemo(() => {
    const cats = new Set(allItems.map((i) => i.categoryTitle));
    const hasFeatured = allItems.some((i) => i.featured);
    const base = ["Todos", ...Array.from(cats).sort()];
    return hasFeatured ? [DESTACADOS_TAB, ...base] : base;
  }, [allItems]);

  // Filtrado
  const filtered = useMemo(() => {
    let result = allItems;
    if (activeTab === DESTACADOS_TAB) {
      result = result.filter((i) => i.featured);
    } else if (activeTab !== "Todos") {
      result = result.filter((i) => i.categoryTitle === activeTab);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (i) =>
          (i.name?.toLowerCase().includes(q)) ||
          (i.caption?.toLowerCase().includes(q)) ||
          (i.description?.toLowerCase().includes(q)) ||
          i.categoryTitle.toLowerCase().includes(q)
      );
    }
    return result;
  }, [allItems, activeTab, searchQuery]);

  const scrollToContact = (item: GalleryItem) => {
    const el = document.querySelector("#contacto");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    const displayName = item.name || item.caption || item.categoryTitle;
    const detail: ProductEventDetail = {
      name: displayName,
      price: item.price,
      priceMode: item.priceMode,
      category: item.categoryTitle,
      imageUrl: item.imageUrl,
      description: item.description,
    };
    window.dispatchEvent(new CustomEvent("prefill-product", { detail }));
  };

  return (
    <section id="galeria-productos" className="py-24 bg-surface-container-lowest">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55 }}
          className="flex flex-col md:flex-row justify-between items-end mb-10"
        >
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface-container text-on-surface-variant text-[11px] font-bold uppercase tracking-widest mb-4">
              <span className="material-symbols-outlined text-[14px]">grid_view</span>
              Catálogo completo
            </div>
            <h2 className="font-headline-lg text-[34px] font-bold text-on-surface mb-3 leading-tight">
              Todos los Productos
            </h2>
            <p className="text-[16px] text-on-surface-variant leading-relaxed">
              Explora nuestro catálogo completo. Filtra por categoría o busca el producto que necesitas.
            </p>
          </div>

          {/* Search */}
          <div className="mt-6 md:mt-0 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-[18px] text-outline">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar producto…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-3 rounded-full border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all duration-200 text-[14px] w-full md:w-64"
            />
          </div>
        </motion.div>

        {/* Category Tabs */}
        {!loading && allItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 flex-wrap mb-8"
          >
            {categories.map((cat) => {
              const isDestacados = cat === DESTACADOS_TAB;
              const count = isDestacados
                ? allItems.filter((i) => i.featured).length
                : cat === "Todos"
                ? allItems.length
                : allItems.filter((i) => i.categoryTitle === cat).length;
              const isActive = activeTab === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-[12px] font-semibold transition-all duration-200 border ${
                    isActive
                      ? isDestacados
                        ? "bg-amber-400 text-white border-amber-400 shadow-sm"
                        : "bg-primary-container text-on-primary-container border-primary-container shadow-sm"
                      : isDestacados
                      ? "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                      : "bg-surface text-on-surface-variant border-outline-variant hover:border-primary-container/50 hover:text-on-surface"
                  }`}
                >
                  {cat}
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      isActive
                        ? "bg-white/20 text-inherit"
                        : isDestacados
                        ? "bg-amber-200 text-amber-700"
                        : "bg-surface-container text-outline"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </motion.div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 gap-5"
          >
            <div className="w-20 h-20 rounded-3xl bg-surface-container flex items-center justify-center">
              <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30">
                {searchQuery ? "search_off" : "inventory_2"}
              </span>
            </div>
            <div className="text-center">
              <p className="text-on-surface font-semibold text-[16px] mb-1">
                {searchQuery ? "Sin resultados" : "Sin productos aún"}
              </p>
              <p className="text-on-surface-variant text-[14px]">
                {searchQuery
                  ? `No encontramos productos para "${searchQuery}"`
                  : "Agrega imágenes desde el panel admin para verlas aquí."}
              </p>
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-primary-container text-[13px] font-semibold hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <motion.div
              key={activeTab + searchQuery}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
            >
              {filtered.map((item, idx) => (
                <GalleryCard
                  key={`${item.categoryTitle}-${item.id}`}
                  item={item}
                  index={idx}
                  onCotizar={scrollToContact}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Bottom CTA */}
        {!loading && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center mt-14"
          >
            <p className="text-[14px] text-on-surface-variant mb-4">
              ¿No encuentras lo que buscas?
            </p>
            <button
              onClick={() =>
                document.querySelector("#contacto")?.scrollIntoView({ behavior: "smooth" })
              }
              className="inline-flex items-center gap-2 bg-primary-container text-on-primary-container px-8 py-4 rounded-full text-[11px] font-semibold uppercase tracking-widest hover:opacity-90 transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              <span className="material-symbols-outlined text-[18px]">chat</span>
              Solicitar producto personalizado
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}