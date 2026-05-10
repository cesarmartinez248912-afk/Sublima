import { z } from "zod";

// ── Country codes ────────────────────────────────────────────────────────────
export const COUNTRY_CODES = [
  { code: "+52", flag: "🇲🇽", name: "México (MX)" },
  { code: "+1",  flag: "🇺🇸", name: "EE.UU. / Canadá (+1)" },
  { code: "+34", flag: "🇪🇸", name: "España (ES)" },
  { code: "+54", flag: "🇦🇷", name: "Argentina (AR)" },
  { code: "+57", flag: "🇨🇴", name: "Colombia (CO)" },
  { code: "+56", flag: "🇨🇱", name: "Chile (CL)" },
  { code: "+51", flag: "🇵🇪", name: "Perú (PE)" },
  { code: "+502",flag: "🇬🇹", name: "Guatemala (GT)" },
] as const;

// ── Main schema ──────────────────────────────────────────────────────────────
export const quoteFormSchema = z
  .object({
    name: z
      .string()
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(80, "El nombre no puede superar los 80 caracteres")
      .regex(
        /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/,
        "El nombre contiene caracteres no válidos"
      ),

    email: z
      .string()
      .email("Ingresa un correo electrónico válido")
      .max(120, "El correo es demasiado largo"),

    // Phone stored as full formatted string: "+52 664 123 4567"
    phone: z
      .string()
      .min(8, "El teléfono debe tener al menos 8 dígitos")
      .max(25, "El teléfono no puede superar los 25 caracteres")
      .regex(/^\+[\d][\d\s\-\(\)]+$/, "Formato de teléfono inválido"),

    product: z.string().min(1, "Selecciona un producto"),

    quantity: z
      .string()
      .min(1, "Ingresa la cantidad")
      .refine(
        (val) => {
          const num = parseInt(val, 10);
          return !isNaN(num) && num >= 1 && num <= 10000;
        },
        { message: "La cantidad debe estar entre 1 y 10,000" }
      ),

    designDescription: z
      .string()
      .min(10, "Describe tu diseño con al menos 10 caracteres")
      .max(1000, "La descripción no puede superar los 1,000 caracteres"),

    // ── Delivery ─────────────────────────────────────────────────────────────
    deliveryType: z.enum(["recoger", "envio"], {
      required_error: "Selecciona cómo recibirás tu pedido",
      invalid_type_error: "Opción de entrega inválida",
    }),

    deliveryStreet:   z.string().max(200).optional(),
    deliveryColonia:  z.string().max(100).optional(),
    deliveryCity:     z.string().max(100).optional(),
    deliveryState:    z.string().max(100).optional(),
    deliveryZip:      z.string().max(10).optional(),

    // ── Reference image (base64, compressed client-side) ─────────────────────
    referenceImageBase64: z
      .string()
      .max(1_500_000, "La imagen es demasiado grande. Usa una imagen más pequeña.")
      .optional(),

    additionalMessage: z
      .string()
      .max(500, "El mensaje no puede superar los 500 caracteres")
      .optional(),
  })
  .superRefine((data, ctx) => {
    if (data.deliveryType === "envio") {
      if (!data.deliveryStreet || data.deliveryStreet.trim().length < 5) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["deliveryStreet"], message: "Ingresa la calle y número exterior" });
      }
      if (!data.deliveryCity || data.deliveryCity.trim().length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["deliveryCity"], message: "Ingresa la ciudad" });
      }
      if (!data.deliveryState || data.deliveryState.trim().length < 2) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["deliveryState"], message: "Ingresa el estado" });
      }
      if (!data.deliveryZip || !/^\d{4,6}$/.test(data.deliveryZip.trim())) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["deliveryZip"], message: "Código postal de 4 a 6 dígitos" });
      }
    }
  });

export type QuoteFormData = z.infer<typeof quoteFormSchema>;

// ── Products list ────────────────────────────────────────────────────────────
export const PRODUCTS = [
  "Tazas Premium",
  "Termos / Botellas",
  "Playeras",
  "Mousepads",
  "Fundas para celular",
  "Cojines",
  "Llaveros",
  "Cuadros / Lienzos",
  "Rompecabezas",
  "Platos decorativos",
  "Almohadas",
  "Agendas / Libretas",
  "Otro (especificar en descripción)",
] as const;

// ── Basic server-side sanitizer ──────────────────────────────────────────────
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, "").slice(0, 2000);
}
