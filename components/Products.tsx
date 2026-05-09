"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { getSiteConfig, DEFAULT_PRODUCTS, type ProductConfig } from "@/lib/imageStore";

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function Products() {
  const [products, setProducts] = useState<ProductConfig[]>(DEFAULT_PRODUCTS);

  useEffect(() => {
    getSiteConfig().then((cfg) => {
      setProducts(cfg.products.length > 0 ? cfg.products : DEFAULT_PRODUCTS);
    });
  }, []);

  const scrollToContact = (productName: string) => {
    const el = document.querySelector("#contacto");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    window.dispatchEvent(
      new CustomEvent("prefill-product", { detail: productName })
    );
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
            Catálogo Premium
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
                className={`h-64 relative overflow-hidden flex items-center justify-center
                  ${product.imageUrl ? "bg-[#f2f3ff]" : `bg-gradient-to-br ${product.gradient}`}`}
              >
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <span className="material-symbols-outlined text-[72px] text-primary-container/40 group-hover:text-primary-container/60 group-hover:scale-110 transition-all duration-500">
                    {product.icon}
                  </span>
                )}
                <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-primary-container text-[11px] font-semibold uppercase tracking-wide z-10">
                  {product.badge}
                </div>
              </div>

              {/* Card body */}
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-[20px] font-bold text-on-surface mb-2 font-headline-md">
                    {product.name}
                  </h3>
                  <p className="text-[15px] text-on-surface-variant mb-6 leading-relaxed line-clamp-2">
                    {product.description}
                  </p>
                </div>

                <button
                  onClick={() => scrollToContact(product.name)}
                  className="w-full py-3 border border-outline-variant rounded-full text-[12px] font-semibold uppercase tracking-widest text-primary-container hover:bg-primary-container hover:text-on-primary-container transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    edit
                  </span>
                  Personalizar
                </button>
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
