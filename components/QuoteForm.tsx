"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  quoteFormSchema,
  type QuoteFormData,
  COUNTRY_CODES,
} from "@/lib/validations";
import {
  getSiteConfig,
  formatPrice,
} from "@/lib/imageStore";
import type { ProductEventDetail } from "@/components/FeaturedProducts";

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Compress an image file to JPEG, max ~900px wide, quality 0.75 */
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("No se pudo leer la imagen"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("No se pudo procesar la imagen"));
      img.onload = () => {
        const MAX = 900;
        let { width, height } = img;
        if (width > MAX) {
          height = Math.round((height * MAX) / width);
          width = MAX;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas no disponible"));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", 0.75));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ── Sub-components ───────────────────────────────────────────────────────────

function FormField({
  label,
  error,
  required,
  hint,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-widest text-on-surface-variant flex items-center gap-1">
        {label}
        {required && <span className="text-error">*</span>}
        {hint && (
          <span className="text-[10px] normal-case tracking-normal text-outline font-normal ml-1">
            {hint}
          </span>
        )}
      </label>
      {children}
      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            key={error}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="text-[11px] text-error flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">error</span>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-xl border border-outline-variant bg-surface text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary-container focus:border-primary-container transition-all duration-200 text-[15px] disabled:opacity-50";

// ── Phone Input ──────────────────────────────────────────────────────────────

function PhoneInput({
  value,
  onChange,
  onBlur,
  disabled,
  error,
}: {
  value: string;
  onChange: (val: string) => void;
  onBlur: () => void;
  disabled: boolean;
  error?: string;
}) {
  // Parse stored value "+52 664 123 4567" → code="+52", local="664 123 4567"
  const parsePhone = (val: string) => {
    const match = val.match(/^(\+\d+)\s?(.*)$/);
    if (match) return { code: match[1], local: match[2].trim() };
    return { code: "+52", local: val };
  };

  const parsed = parsePhone(value || "+52 ");
  const [selectedCode, setSelectedCode] = useState(parsed.code || "+52");
  const [localNumber, setLocalNumber] = useState(parsed.local || "");

  const sync = (code: string, local: string) => {
    onChange(`${code} ${local}`.trim());
  };

  const handleCodeChange = (code: string) => {
    setSelectedCode(code);
    sync(code, localNumber);
  };

  const handleLocalChange = (val: string) => {
    // Allow only digits, spaces, hyphens, parentheses
    const clean = val.replace(/[^\d\s\-\(\)]/g, "");
    setLocalNumber(clean);
    sync(selectedCode, clean);
  };

  const selected = COUNTRY_CODES.find((c) => c.code === selectedCode) ?? COUNTRY_CODES[0];

  return (
    <div
      className={`flex rounded-xl border overflow-hidden transition-all duration-200 bg-surface ${error
        ? "border-error focus-within:ring-2 focus-within:ring-error"
        : "border-outline-variant focus-within:ring-2 focus-within:ring-primary-container focus-within:border-primary-container"
        } ${disabled ? "opacity-50" : ""}`}
    >
      {/* Country code dropdown */}
      <div className="relative flex-shrink-0">
        <select
          value={selectedCode}
          onChange={(e) => handleCodeChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className="appearance-none h-full pl-3 pr-8 bg-surface-container-low text-on-surface text-[14px] font-semibold border-r border-outline-variant cursor-pointer focus:outline-none"
          style={{ minWidth: "90px" }}
          aria-label="Código de país"
        >
          {COUNTRY_CODES.map((c) => (
            <option key={`${c.code}-${c.name}`} value={c.code}>
              {c.flag} {c.code}
            </option>
          ))}
        </select>
        {/* Dropdown arrow */}
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 material-symbols-outlined text-[14px] text-outline">
          expand_more
        </span>
      </div>

      {/* Local number */}
      <input
        type="tel"
        inputMode="tel"
        value={localNumber}
        onChange={(e) => handleLocalChange(e.target.value)}
        onBlur={onBlur}
        disabled={disabled}
        placeholder={selectedCode === "+52" ? "664 123 4567" : "000 000 0000"}
        autoComplete="tel-national"
        className="flex-1 px-4 py-3 bg-transparent text-on-surface placeholder:text-outline text-[15px] focus:outline-none"
      />

      {/* Flag badge */}
      <div className="flex items-center pr-3 text-[18px] select-none pointer-events-none">
        {selected.flag}
      </div>
    </div>
  );
}

// ── Image Upload ─────────────────────────────────────────────────────────────

function ImageUpload({
  value,
  onChange,
  disabled,
}: {
  value?: string;
  onChange: (base64: string | undefined) => void;
  disabled: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Solo se aceptan imágenes (JPG, PNG, WEBP, GIF)");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("La imagen no puede pesar más de 10 MB");
        return;
      }
      setIsProcessing(true);
      try {
        const compressed = await compressImage(file);
        onChange(compressed);
      } catch {
        toast.error("No pudimos procesar la imagen. Intenta con otra.");
      } finally {
        setIsProcessing(false);
      }
    },
    [onChange]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Drop zone */}
      <div
        onClick={() => !disabled && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden ${isDragging
          ? "border-primary-container bg-primary-container/5 scale-[1.01]"
          : value
            ? "border-primary-container/40 bg-primary-container/3"
            : "border-outline-variant hover:border-primary-container/50 hover:bg-surface-container-low"
          } ${disabled ? "pointer-events-none opacity-50" : ""}`}
        style={{ minHeight: "140px" }}
      >
        <AnimatePresence mode="wait">
          {isProcessing ? (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-3 p-8 text-center"
            >
              <svg className="animate-spin w-8 h-8 text-primary-container" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
              <p className="text-[13px] text-on-surface-variant">Procesando imagen…</p>
            </motion.div>
          ) : value ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4 p-4"
            >
              {/* Thumbnail */}
              <div className="relative flex-shrink-0">
                <img
                  src={value}
                  alt="Imagen de referencia"
                  className="w-24 h-24 object-cover rounded-xl border border-outline-variant shadow-sm"
                />
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                  <span className="material-symbols-outlined text-white text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-on-surface">Imagen de referencia lista</p>
                <p className="text-[12px] text-on-surface-variant mt-0.5">Se enviará junto con tu solicitud</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onChange(undefined); }}
                  className="mt-2 text-[11px] text-error hover:text-red-700 font-semibold flex items-center gap-1 transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">delete</span>
                  Quitar imagen
                </button>
              </div>

              {/* Change hint */}
              <p className="text-[11px] text-outline text-right flex-shrink-0 hidden sm:block">
                Clic para<br />cambiar
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center gap-3 p-8 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-primary-container/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[24px] text-primary-container">
                  add_photo_alternate
                </span>
              </div>
              <div>
                <p className="text-[14px] font-semibold text-on-surface">
                  Adjunta tu imagen de referencia
                </p>
                <p className="text-[12px] text-on-surface-variant mt-0.5">
                  Arrastra y suelta aquí · o haz clic para elegir
                </p>
                <p className="text-[11px] text-outline mt-1">
                  JPG, PNG, WEBP o GIF · máx. 10 MB
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleInputChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}

// ── Delivery Selector ────────────────────────────────────────────────────────

function DeliverySelector({
  value,
  onChange,
  error,
  disabled,
}: {
  value?: "recoger" | "envio";
  onChange: (val: "recoger" | "envio") => void;
  error?: string;
  disabled: boolean;
}) {
  const options: { key: "recoger" | "envio"; icon: string; title: string; desc: string; color: string }[] = [
    {
      key: "recoger",
      icon: "storefront",
      title: "Recoger en tienda",
      desc: "Pasa a recoger cuando esté listo",
      color: "from-primary-container/10 to-primary/5",
    },
    {
      key: "envio",
      icon: "local_shipping",
      title: "Envío a domicilio",
      desc: "Lo entregamos en tu dirección",
      color: "from-secondary/10 to-secondary-container/5",
    },
  ];

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const active = value === opt.key;
          return (
            <button
              key={opt.key}
              type="button"
              onClick={() => !disabled && onChange(opt.key)}
              disabled={disabled}
              className={`relative flex flex-col items-center gap-2 px-4 py-4 rounded-2xl border-2 text-center transition-all duration-200 cursor-pointer ${active
                ? opt.key === "recoger"
                  ? "border-primary-container bg-primary-container/8 shadow-sm"
                  : "border-secondary bg-secondary/8 shadow-sm"
                : "border-outline-variant hover:border-outline bg-surface"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              style={{
                background: active
                  ? opt.key === "recoger"
                    ? "linear-gradient(135deg, rgba(0,71,171,0.06) 0%, rgba(0,50,125,0.03) 100%)"
                    : "linear-gradient(135deg, rgba(113,42,226,0.06) 0%, rgba(138,76,252,0.03) 100%)"
                  : undefined,
              }}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${active
                  ? opt.key === "recoger"
                    ? "bg-primary-container text-on-primary-container"
                    : "bg-secondary text-on-secondary"
                  : "bg-surface-container text-on-surface-variant"
                  }`}
              >
                <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}>
                  {opt.icon}
                </span>
              </div>
              <div>
                <p className={`text-[13px] font-bold transition-colors ${active ? "text-on-surface" : "text-on-surface-variant"}`}>
                  {opt.title}
                </p>
                <p className="text-[11px] text-outline leading-tight mt-0.5">{opt.desc}</p>
              </div>
              {active && (
                <div className={`absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center ${opt.key === "recoger" ? "bg-primary-container" : "bg-secondary"}`}>
                  <span className="material-symbols-outlined text-white text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                    check
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-[11px] text-error flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-[13px]">error</span>
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function QuoteForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [referenceImage, setReferenceImage] = useState<string | undefined>();
  const [products, setProducts] = useState<string[]>([]);
  const [prefilledDetail, setPrefilledDetail] = useState<ProductEventDetail | null>(null);
  const isPrefillingRef = useRef(false);

  // Load gallery categories from Supabase
  useEffect(() => {
    getSiteConfig().then((cfg) =>
      setProducts(cfg.gallery.map((cat) => cat.title))
    );
  }, []);

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
      phone: "+52 ",
      product: "",
      selectedProductName: "",
      selectedProductCategory: "",
      selectedProductImageUrl: "",
      quantity: "",
      designDescription: "",
      deliveryType: undefined,
      deliveryStreet: "",
      deliveryColonia: "",
      deliveryCity: "",
      deliveryState: "",
      deliveryZip: "",
      referenceImageBase64: undefined,
      additionalMessage: "",
    },
  });

  const designDescription = watch("designDescription");
  const deliveryType = watch("deliveryType");
  const phoneValue = watch("phone");

  useEffect(() => {
    setCharCount(designDescription?.length ?? 0);
  }, [designDescription]);

  // Prefill from product cards — sets category + stores full gallery detail for preview
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<ProductEventDetail>).detail;
      if (!detail) return;

      // Mark as programmatic change so select's onChange doesn't clear the preview
      isPrefillingRef.current = true;
      setPrefilledDetail(detail);

      // Set the select to the gallery category of this item
      const category = detail.category ?? "";
      setValue("product", category, { shouldValidate: false });
      setValue("selectedProductName", detail.name, { shouldValidate: false });
      setValue("selectedProductCategory", category, { shouldValidate: false });
      setValue("selectedProductImageUrl", detail.imageUrl ?? "", { shouldValidate: false });

      // Reset flag after the onChange triggered by setValue has fired
      setTimeout(() => { isPrefillingRef.current = false; }, 0);
    };

    window.addEventListener("prefill-product", handler);
    return () => window.removeEventListener("prefill-product", handler);
  }, [setValue]);

  // Sync reference image to form
  useEffect(() => {
    setValue("referenceImageBase64", referenceImage, { shouldValidate: false });
  }, [referenceImage, setValue]);

  const onSubmit = async (data: QuoteFormData) => {
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.message ?? "Error desconocido. Por favor intenta de nuevo.");
      }

      setIsSubmitted(true);
      toast.success("¡Solicitud enviada!", {
        description: "Te contactaremos en menos de 24 horas con tu cotización personalizada.",
        duration: 6000,
      });
      reset();
      setPrefilledDetail(null);
      setReferenceImage(undefined);
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos enviar tu solicitud. Por favor intenta de nuevo.";
      toast.error("Error al enviar", { description: message, duration: 7000 });
    }
  };

  return (
    <section
      id="contacto"
      className="py-24 relative overflow-hidden"
      style={{
        background: "linear-gradient(160deg, #f0f3ff 0%, #faf8ff 40%, #f5f0ff 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, rgba(0,71,171,0.12) 0%, transparent 70%)" }} />
        <div className="absolute -top-10 -right-10 w-[400px] h-[400px] rounded-full opacity-25"
          style={{ background: "radial-gradient(circle, rgba(113,42,226,0.10) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, rgba(0,120,200,0.08) 0%, transparent 70%)" }} />
      </div>

      <div className="max-w-[1280px] mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

          {/* ── Left column ─────────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55 }}
            className="flex flex-col gap-8 lg:sticky lg:top-28"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-widest mb-6 text-white"
                style={{ background: "linear-gradient(135deg, #0047ab 0%, #712ae2 100%)" }}>
                <span className="material-symbols-outlined text-[15px]">request_quote</span>
                Solicitar Cotización
              </div>
              <h2 className="text-[32px] font-bold text-on-surface mb-4 font-headline-lg leading-tight">
                ¿Listo para crear algo{" "}
                <span style={{ background: "linear-gradient(90deg,#0047ab,#712ae2)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  increíble?
                </span>
              </h2>
              <p className="text-[16px] text-on-surface-variant leading-relaxed">
                Cuéntanos tu idea y te enviamos una cotización sin compromiso en
                menos de 24 horas. Sin costos ocultos.
              </p>
            </div>

            {/* Benefits */}
            <div className="flex flex-col gap-3">
              {[
                { icon: "timer", title: "Respuesta en 24 horas", desc: "Te contactamos con tu cotización al día siguiente hábil.", grad: "from-blue-500 to-blue-700" },
                { icon: "palette", title: "Diseño incluido", desc: "Nuestros diseñadores ajustan tu arte sin costo adicional.", grad: "from-violet-500 to-purple-700" },
                { icon: "verified", title: "Satisfacción garantizada", desc: "Si no quedas feliz con el resultado, lo rehacemos.", grad: "from-emerald-500 to-teal-700" },
                { icon: "lock", title: "Datos 100% seguros", desc: "Tu información es confidencial y nunca la compartimos.", grad: "from-slate-500 to-slate-700" },
              ].map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.1 * i }}
                  className="flex gap-4 items-center p-4 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/80 shadow-sm"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${b.grad} flex items-center justify-center flex-shrink-0 shadow-sm`}>
                    <span className="material-symbols-outlined text-[19px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {b.icon}
                    </span>
                  </div>
                  <div>
                    <p className="text-[13px] font-bold text-on-surface">{b.title}</p>
                    <p className="text-[12px] text-on-surface-variant leading-relaxed">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* ── Right column — form ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.55, delay: 0.1 }}
          >
            <AnimatePresence mode="wait">

              {/* ─── Success state ─── */}
              {isSubmitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="bg-white rounded-[32px] p-10 flex flex-col items-center text-center gap-6"
                  style={{ boxShadow: "0 16px 60px rgba(0,0,0,0.08)" }}
                >
                  <div className="w-20 h-20 rounded-full flex items-center justify-center shadow-lg"
                    style={{ background: "linear-gradient(135deg, #0047ab 0%, #712ae2 100%)" }}>
                    <span className="material-symbols-outlined text-[40px] text-white" style={{ fontVariationSettings: "'FILL' 1" }}>
                      check_circle
                    </span>
                  </div>
                  <div>
                    <h3 className="text-[22px] font-bold text-on-surface font-headline-lg mb-2">
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
                    <span className="material-symbols-outlined text-[16px]">add</span>
                    Hacer otra solicitud
                  </button>
                </motion.div>

              ) : (

                /* ─── The Form ─── */
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubmit(onSubmit)}
                  noValidate
                  className="bg-white rounded-[32px] p-8 md:p-10 flex flex-col gap-6"
                  style={{ boxShadow: "0 16px 60px rgba(0,0,0,0.08)" }}
                >
                  {/* ── Section: Datos personales ── */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary-container mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: "linear-gradient(135deg,#0047ab,#712ae2)" }}>1</span>
                      Datos de contacto
                    </p>

                    {/* Name + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                      <FormField label="Nombre completo" error={errors.name?.message} required>
                        <input
                          {...register("name")}
                          type="text"
                          placeholder="Ej. Ana García"
                          autoComplete="name"
                          disabled={isSubmitting}
                          className={`${inputClass} ${errors.name ? "border-error focus:ring-error" : ""}`}
                        />
                      </FormField>

                      <FormField label="Correo electrónico" error={errors.email?.message} required>
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

                    {/* Phone */}
                    <FormField label="Teléfono / WhatsApp" error={errors.phone?.message} required>
                      <PhoneInput
                        value={phoneValue ?? "+52 "}
                        onChange={(val) => setValue("phone", val, { shouldValidate: true })}
                        onBlur={() => { }}
                        disabled={isSubmitting}
                        error={errors.phone?.message}
                      />
                    </FormField>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent" />

                  {/* ── Section: Pedido ── */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary-container mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: "linear-gradient(135deg,#0047ab,#712ae2)" }}>2</span>
                      Tu pedido
                    </p>

                    {/* Product + Quantity */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                      <FormField label="Producto a personalizar" error={errors.product?.message} required>
                        <select
                          {...register("product", {
                            onChange: () => {
                              // Solo limpia el preview si el cambio lo hizo el usuario, no el prefill
                              if (!isPrefillingRef.current) {
                                setPrefilledDetail(null);
                                setValue("selectedProductName", "", { shouldValidate: false });
                                setValue("selectedProductCategory", "", { shouldValidate: false });
                                setValue("selectedProductImageUrl", "", { shouldValidate: false });
                              }
                            },
                          })}
                          disabled={isSubmitting}
                          className={`${inputClass} cursor-pointer ${errors.product ? "border-error focus:ring-error" : ""}`}
                        >
                          <option value="">Selecciona un producto…</option>
                          {products.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                          <option value="Otro">Otro (especificar en descripción)</option>
                        </select>
                      </FormField>

                      {/* Vista previa — solo aparece cuando el cliente vino desde una tarjeta de galería */}
                      {prefilledDetail && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="rounded-2xl border border-primary-container/30 bg-primary-fixed overflow-hidden flex gap-0"
                        >
                          {/* Imagen */}
                          <div className="w-20 flex-shrink-0 flex items-center justify-center bg-surface-container overflow-hidden">
                            {prefilledDetail.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={prefilledDetail.imageUrl}
                                alt={prefilledDetail.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="material-symbols-outlined text-[32px] text-primary/40">
                                inventory_2
                              </span>
                            )}
                          </div>
                          {/* Info */}
                          <div className="p-3 flex-1 min-w-0">
                            {prefilledDetail.category && (
                              <p className="text-[10px] font-bold uppercase tracking-widest text-primary-container mb-0.5">
                                {prefilledDetail.category}
                              </p>
                            )}
                            <p className="text-[14px] font-bold text-on-surface truncate">
                              {prefilledDetail.name}
                            </p>
                            {prefilledDetail.description && (
                              <p className="text-[12px] text-on-surface-variant line-clamp-1 mt-0.5">
                                {prefilledDetail.description}
                              </p>
                            )}
                            <div className="mt-2 flex items-center gap-2">
                              {prefilledDetail.price !== undefined && prefilledDetail.priceMode !== "quote" ? (
                                <span className="inline-flex items-center gap-1 bg-primary text-on-primary px-2.5 py-1 rounded-full text-[12px] font-bold">
                                  <span className="material-symbols-outlined text-[13px]">sell</span>
                                  {formatPrice(prefilledDetail.price)} c/u
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-outline text-[12px]">
                                  <span className="material-symbols-outlined text-[13px]">help_outline</span>
                                  Precio a cotizar
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}

                      <FormField label="Cantidad de piezas" error={errors.quantity?.message} required>
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
                    </div>

                    {/* Design description */}
                    <FormField label="Descripción del diseño" error={errors.designDescription?.message} required>
                      <div className="relative">
                        <textarea
                          {...register("designDescription")}
                          rows={4}
                          placeholder="Cuéntanos tu idea: colores, logotipo, texto, estilo… Mientras más detalle, mejor cotización."
                          disabled={isSubmitting}
                          className={`${inputClass} resize-none ${errors.designDescription ? "border-error focus:ring-error" : ""}`}
                        />
                        <span className={`absolute bottom-3 right-3 text-[10px] tabular-nums transition-colors ${charCount > 900 ? "text-error" : "text-outline"}`}>
                          {charCount}/1000
                        </span>
                      </div>
                    </FormField>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent" />

                  {/* ── Section: Imagen de referencia ── */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary-container mb-1 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: "linear-gradient(135deg,#0047ab,#712ae2)" }}>3</span>
                      Imagen de referencia
                      <span className="text-[10px] text-outline font-normal normal-case tracking-normal">(opcional)</span>
                    </p>
                    <p className="text-[12px] text-on-surface-variant mb-3">
                      ¿Tienes un diseño, logo o foto de lo que quieres? Súbela y nos ayudará a darte una cotización más precisa.
                    </p>
                    <ImageUpload
                      value={referenceImage}
                      onChange={setReferenceImage}
                      disabled={isSubmitting}
                    />
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent" />

                  {/* ── Section: Entrega ── */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-primary-container mb-4 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                        style={{ background: "linear-gradient(135deg,#0047ab,#712ae2)" }}>4</span>
                      ¿Cómo recibirás tu pedido?
                    </p>

                    <DeliverySelector
                      value={deliveryType}
                      onChange={(val) => setValue("deliveryType", val, { shouldValidate: true })}
                      error={errors.deliveryType?.message}
                      disabled={isSubmitting}
                    />

                    {/* Address fields — only when envio */}
                    <AnimatePresence>
                      {deliveryType === "envio" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-5 p-5 rounded-2xl bg-secondary/5 border border-secondary/20 flex flex-col gap-4">
                            <p className="text-[11px] font-semibold text-secondary uppercase tracking-wider flex items-center gap-1.5">
                              <span className="material-symbols-outlined text-[14px]">location_on</span>
                              Dirección de entrega
                            </p>

                            {/* Street */}
                            <FormField label="Calle y número exterior" error={errors.deliveryStreet?.message} required>
                              <input
                                {...register("deliveryStreet")}
                                type="text"
                                placeholder="Ej. Av. Álvaro Obregón 1234 Ext. 5"
                                disabled={isSubmitting}
                                autoComplete="address-line1"
                                className={`${inputClass} ${errors.deliveryStreet ? "border-error focus:ring-error" : ""}`}
                              />
                            </FormField>

                            {/* Colonia */}
                            <FormField label="Colonia / Fraccionamiento" error={errors.deliveryColonia?.message} hint="(opcional)">
                              <input
                                {...register("deliveryColonia")}
                                type="text"
                                placeholder="Ej. Colonia Centro"
                                disabled={isSubmitting}
                                autoComplete="address-line2"
                                className={`${inputClass} ${errors.deliveryColonia ? "border-error focus:ring-error" : ""}`}
                              />
                            </FormField>

                            {/* City + State */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <FormField label="Ciudad / Municipio" error={errors.deliveryCity?.message} required>
                                <input
                                  {...register("deliveryCity")}
                                  type="text"
                                  placeholder="Ej. Navojoa"
                                  disabled={isSubmitting}
                                  autoComplete="address-level2"
                                  className={`${inputClass} ${errors.deliveryCity ? "border-error focus:ring-error" : ""}`}
                                />
                              </FormField>

                              <FormField label="Estado" error={errors.deliveryState?.message} required>
                                <input
                                  {...register("deliveryState")}
                                  type="text"
                                  placeholder="Ej. Sonora"
                                  disabled={isSubmitting}
                                  autoComplete="address-level1"
                                  className={`${inputClass} ${errors.deliveryState ? "border-error focus:ring-error" : ""}`}
                                />
                              </FormField>
                            </div>

                            {/* ZIP */}
                            <FormField label="Código Postal" error={errors.deliveryZip?.message} required>
                              <input
                                {...register("deliveryZip")}
                                type="text"
                                inputMode="numeric"
                                placeholder="Ej. 85000"
                                maxLength={6}
                                disabled={isSubmitting}
                                autoComplete="postal-code"
                                className={`${inputClass} max-w-[200px] ${errors.deliveryZip ? "border-error focus:ring-error" : ""}`}
                              />
                            </FormField>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-outline-variant to-transparent" />

                  {/* ── Additional message ── */}
                  <FormField label="Mensaje adicional" error={errors.additionalMessage?.message} hint="(opcional)">
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
                    <span className="material-symbols-outlined text-[12px] align-text-bottom mr-1">lock</span>
                    Tu información es privada y solo se usará para enviarte tu cotización. No compartimos tus datos con terceros.
                  </p>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 rounded-full text-[13px] font-bold uppercase tracking-widest transition-all duration-200 flex items-center justify-center gap-3 shadow-md hover:shadow-lg active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed text-white"
                    style={{
                      background: isSubmitting
                        ? "#6b7280"
                        : "linear-gradient(135deg, #0047ab 0%, #712ae2 100%)",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeOpacity="0.3" />
                          <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                        </svg>
                        Enviando solicitud…
                      </>
                    ) : (
                      <>
                        Enviar solicitud
                        <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>send</span>
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