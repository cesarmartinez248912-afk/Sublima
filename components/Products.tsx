"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  getSiteConfig,
  DEFAULT_PRODUCTS,
  formatPrice,
  type ProductConfig,
} from "@/lib/imageStore";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export interface ProductEventDetail {
  name: string;
  price?: number;
  category?: string;
  imageUrl?: string;
}

export default function Products() {
  const [products, setProducts] = useState<ProductConfig[]>(DEFAULT_PRODUCTS);

  useEffect(() => {
    getSiteConfig().then((cfg) => {
      setProducts(cfg.products.length > 0 ? cfg.products : DEFAULT_PRODUCTS);
    });
  }, []);

  const scrollToContact = (product: ProductConfig) => {
    const el = document.querySelector("#contacto");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    const detail: ProductEventDetail = {
      name: product.name,
      price: product.price,
      category: product.category,
      imageUrl: product.imageUrl,
    };
    window.dispatchEvent(new CustomEvent("prefill-product", { detail }));
  };

  return (
    <section id="productos" className="py-20 bg-surface">
      <div className="max-w-[1280px] mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="font-headline-lg text-[32px] font-bold text-on-surface mb-4">
            Catálogo de Productos
          </h2>
          <p className="text-[16px] text-on-surface-variant leading-relaxed">
            Selecciona el lienzo perfecto para tu próximo proyecto. Solo
            utilizamos materiales de primera calidad.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={cardVariants}
              className="bg-surface-container-lowest rounded-[24px] overflow-hidden hover:scale-[1.02] transition-all duration-300 flex flex-col group cursor-pointer"
              style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.04)" }}
            >
              {/* Product visual */}
              <div
                className={`h-56 relative overflow-hidden flex items-center justify-center
                  ${product.imageUrl ? "bg-surface-container" : `bg-gradient-to-br ${product.gradient}`}`}
              >
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="material-symbols-outlined text-[72px] text-primary/20 group-hover:text-primary/40 group-hover:scale-110 transition-all duration-500">
                    {product.icon}
                  </span>
                )}

                {/* Badge superior */}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide text-primary z-10">
                  {product.badge}
                </div>

                {/* Precio — esquina superior derecha */}
                <div className="absolute top-3 right-3 z-10">
                  {product.priceMode === "quote" ? (
                    <div className="bg-surface-container-high/90 backdrop-blur-sm text-on-surface-variant px-3 py-1.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[11px]">chat_bubble</span>
                      A cotizar
                    </div>
                  ) : product.priceMode === "promo" && product.price !== undefined ? (
                    <div className="bg-red-500 text-white px-3 py-1.5 rounded-full text-[12px] font-bold shadow-md flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">local_offer</span>
                      {formatPrice(product.price)}
                    </div>
                  ) : product.price !== undefined ? (
                    <div className="bg-primary text-on-primary px-3 py-1.5 rounded-full text-[12px] font-bold shadow-md">
                      {formatPrice(product.price)}
                    </div>
                  ) : (
                    <div className="bg-surface-container-high/90 backdrop-blur-sm text-outline px-3 py-1.5 rounded-full text-[10px] font-semibold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[11px]">help_outline</span>
                      Cotizar
                    </div>
                  )}
                </div>
              </div>

              {/* Card body */}
              <div className="p-5 flex-grow flex flex-col justify-between">
                <div>
                  {/* Categoría */}
                  {product.category && (
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-container mb-1">
                      {product.category}
                    </p>
                  )}
                  <h3 className="text-[18px] font-bold text-on-surface mb-2 font-headline-md">
                    {product.name}
                  </h3>
                  <p className="text-[14px] text-on-surface-variant mb-4 leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                </div>

                {/* Precio grande + botón */}
                <div className="space-y-3">
                  {product.priceMode === "quote" ? (
                    <div className="flex items-center gap-2 bg-surface-container py-2 px-3 rounded-xl">
                      <span className="material-symbols-outlined text-[16px] text-primary-container">chat_bubble</span>
                      <span className="text-[13px] font-semibold text-on-surface-variant">Precio a cotizar</span>
                    </div>
                  ) : product.priceMode === "promo" && product.price !== undefined ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-[22px] font-bold text-red-500">{formatPrice(product.price)}</span>
                      <span className="text-[11px] bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">PROMO</span>
                    </div>
                  ) : product.price !== undefined ? (
                    <div className="flex items-baseline gap-1">
                      <span className="text-[22px] font-bold text-on-surface">{formatPrice(product.price)}</span>
                      <span className="text-[12px] text-outline">c/u</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-outline">
                      <span className="material-symbols-outlined text-[16px]">info</span>
                      <span className="text-[13px]">Precio a cotizar</span>
                    </div>
                  )}

                  <button
                    onClick={() => scrollToContact(product)}
                    className="w-full py-3 border-2 border-primary rounded-full text-[12px] font-bold uppercase tracking-widest text-primary hover:bg-primary hover:text-on-primary transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    Personalizar
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <p className="text-[14px] text-on-surface-variant mb-4">
            ¿No ves el producto que buscas?
          </p>
          <button
            onClick={() =>
              document
                .querySelector("#contacto")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="inline-flex items-center gap-2 text-primary-container text-[13px] font-semibold hover:underline transition-all"
          >
            Solicita cualquier producto personalizado
            <span className="material-symbols-outlined text-[16px]">
              arrow_forward
            </span>
          </button>
        </motion.div>
      </div>
    </section>
  );
}