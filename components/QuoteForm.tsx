"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { quoteFormSchema, type QuoteFormData, PRODUCTS } from "@/lib/validations";

// ── Sub-components ───────────────────────────────────────────────────────────

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant">
        {label}
        {required && <span className="text-error ml-1">*</span>}
      </label>
      {children}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2 }}
            className="text-[11px] text-error flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[14px]">
              error
            </span>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all duration-200 text-[15px] disabled:opacity-50";

// ── Main Component ───────────────────────────────────────────────────────────

export default function QuoteForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      product: "",
      quantity: "",
      designDescription: "",
      additionalMessage: "",
    },
  });

  const designDescription = watch("designDescription");
  useEffect(() => {
    setCharCount(designDescription?.length ?? 0);
  }, [designDescription]);

  // Listen for prefill events from product cards
  useEffect(() => {
    const handler = (e: Event) => {
      const productName = (e as CustomEvent<string>).detail;
      setValue("product", productName, { shouldValidate: false });
    };
    window.addEventListener("prefill-product", handler);
    return () => window.removeEventListener("prefill-product", handler);
  }, [setValue]);

  const onSubmit = async (data: QuoteFormData) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.message ?? "Error desconocido. Por favor intenta de nuevo."
        );
      }

      setIsSubmitted(true);
      toast.success("¡Solicitud enviada!", {
        description:
          "Te contactaremos en menos de 24 horas con tu cotización personalizada.",
        duration: 6000,
      });
      reset();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos enviar tu solicitud. Por favor intenta de nuevo.";

      toast.error("Error al enviar", {
        description: message,
        duration: 7000,
      });
    }
  };

  return (
    <section id="contacto" className="py-20 bg-surface relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left column — info */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="flex flex-col gap-8 lg:sticky lg:top-28"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-container/10 text-primary-container rounded-full text-[11px] font-semibold uppercase tracking-widest mb-6">
                <span className="material-symbols-outlined text-[16px]">
                  request_quote
                </span>
                Solicitar Cotización
              </div>
              <h2 className="font-headline-lg text-[32px] font-bold text-on-surface mb-4">
                ¿Listo para crear algo increíble?
              </h2>
              <p className="text-[16px] text-on-surface-variant leading-relaxed">
                Cuéntanos tu idea y te enviamos una cotización sin compromiso en
                menos de 24 horas. Sin costos ocultos.
              </p>
            </div>

            {/* Benefits */}
            <div className="flex flex-col gap-4">
              {[
                {
                  icon: "timer",
                  title: "Respuesta en 24 horas",
                  desc: "Te contactamos con tu cotización al día siguiente hábil.",
                },
                {
                  icon: "palette",
                  title: "Diseño incluido",
                  desc: "Nuestros diseñadores ajustan tu arte sin costo adicional.",
                },
                {
                  icon: "verified",
                  title: "Satisfacción garantizada",
                  desc: "Si no quedas feliz con el resultado, lo rehacemos.",
                },
                {
                  icon: "lock",
                  title: "Datos 100% seguros",
                  desc: "Tu información es confidencial y nunca la compartimos.",
                },
              ].map((b) => (
                <div key={b.title} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-xl bg-primary-container/10 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-[20px] text-primary-container">
                      {b.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-[14px] font-bold text-on-surface">
                      {b.title}
                    </p>
                    <p className="text-[13px] text-on-surface-variant leading-relaxed">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right column — form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
          >
            <AnimatePresence mode="wait">
              {isSubmitted ? (
                // Success state
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="bg-white rounded-[32px] p-10 text-center flex flex-col items-center gap-6"
                  style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}
                >
                  <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-[48px] text-green-600"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      check_circle
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[22px] font-bold text-on-surface mb-2">
                      ¡Solicitud enviada!
                    </h3>
                    <p className="text-[15px] text-on-surface-variant leading-relaxed">
                      Recibimos tu cotización. Te contactaremos en menos de{" "}
                      <strong>24 horas</strong> con todos los detalles.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="inline-flex items-center gap-2 text-primary-container text-[13px] font-semibold hover:underline"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      add
                    </span>
                    Hacer otra solicitud
                  </button>
                </motion.div>
              ) : (
                // Form
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="bg-white rounded-[32px] p-8 md:p-10 flex flex-col gap-6"
                  style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.06)" }}
                >
                  {/* Row 1: Name + Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      label="Nombre completo"
                      error={errors.name?.message}
                      required
                    >
                      <input
                        {...register("name")}
                        type="text"
                        placeholder="Ej. Ana García"
                        autoComplete="name"
                        disabled={isSubmitting}
                        className={`${inputClass} ${errors.name ? "border-error focus:ring-error" : ""}`}
                      />
                    </FormField>

                    <FormField
                      label="Correo electrónico"
                      error={errors.email?.message}
                      required
                    >
                      <input
                        {...register("email")}
                        type="email"
                        placeholder="ana@empresa.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                        className={`${inputClass} ${errors.email ? "border-error focus:ring-error" : ""}`}
                      />
                    </FormField>
                  </div>

                  {/* Row 2: Phone + Product */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <FormField
                      label="Teléfono / WhatsApp"
                      error={errors.phone?.message}
                      required
                    >
                      <input
                        {...register("phone")}
                        type="tel"
                        placeholder="+52 55 1234 5678"
                        autoComplete="tel"
                        disabled={isSubmitting}
                        className={`${inputClass} ${errors.phone ? "border-error focus:ring-error" : ""}`}
                      />
                    </FormField>

                    <FormField
                      label="Producto a personalizar"
                      error={errors.product?.message}
                      required
                    >
                      <select
                        {...register("product")}
                        disabled={isSubmitting}
                        className={`${inputClass} cursor-pointer ${errors.product ? "border-error focus:ring-error" : ""}`}
                      >
                        <option value="">Selecciona un producto…</option>
                        {PRODUCTS.map((p) => (
                          <option key={p} value={p}>
                            {p}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </div>

                  {/* Row 3: Quantity */}
                  <FormField
                    label="Cantidad de piezas"
                    error={errors.quantity?.message}
                    required
                  >
                    <input
                      {...register("quantity")}
                      type="number"
                      min="1"
                      max="10000"
                      placeholder="Ej. 50"
                      disabled={isSubmitting}
                      className={`${inputClass} ${errors.quantity ? "border-error focus:ring-error" : ""}`}
                    />
                  </FormField>

                  {/* Row 4: Design description */}
                  <FormField
                    label="Descripción del diseño"
                    error={errors.designDescription?.message}
                    required
                  >
                    <div className="relative">
                      <textarea
                        {...register("designDescription")}
                        rows={4}
                        placeholder="Cuéntanos tu idea: colores, logotipo, texto, estilo… Puedes enviar archivos después."
                        disabled={isSubmitting}
                        className={`${inputClass} resize-none ${errors.designDescription ? "border-error focus:ring-error" : ""}`}
                      />
                      <span className="absolute bottom-3 right-3 text-[10px] text-outline tabular-nums">
                        {charCount}/1000
                      </span>
                    </div>
                  </FormField>

                  {/* Row 5: Additional message */}
                  <FormField
                    label="Mensaje adicional"
                    error={errors.additionalMessage?.message}
                  >
                    <textarea
                      {...register("additionalMessage")}
                      rows={3}
                      placeholder="Fecha de entrega deseada, preguntas, comentarios…"
                      disabled={isSubmitting}
                      className={`${inputClass} resize-none ${errors.additionalMessage ? "border-error focus:ring-error" : ""}`}
                    />
                  </FormField>

                  {/* Privacy note */}
                  <p className="text-[11px] text-outline leading-relaxed">
                    <span className="material-symbols-outlined text-[12px] align-text-bottom mr-1">
                      lock
                    </span>
                    Tu información es privada y solo se usará para enviarte tu
                    cotización. No compartimos tus datos con terceros.
                  </p>

                  {/* Submit button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-primary-container text-on-primary-container hover:bg-primary hover:text-on-primary disabled:opacity-60 disabled:cursor-not-allowed rounded-full text-[13px] font-semibold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow-md active:scale-[0.99]"
                  >
                    {isSubmitting ? (
                      <>
                        <svg
                          className="animate-spin w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <circle
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeOpacity="0.3"
                          />
                          <path
                            d="M12 2a10 10 0 0 1 10 10"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                        </svg>
                        Enviando solicitud…
                      </>
                    ) : (
                      <>
                        Enviar solicitud
                        <span className="material-symbols-outlined text-[20px]">
                          send
                        </span>
                      </>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
