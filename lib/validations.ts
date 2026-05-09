import { z } from "zod";

export const quoteFormSchema = z.object({
  name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(80, "El nombre no puede superar los 80 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]+$/, "El nombre contiene caracteres no válidos"),

  email: z
    .string()
    .email("Ingresa un correo electrónico válido")
    .max(120, "El correo es demasiado largo"),

  phone: z
    .string()
    .min(8, "El teléfono debe tener al menos 8 dígitos")
    .max(20, "El teléfono no puede superar los 20 caracteres")
    .regex(/^[\d\s\+\-\(\)]+$/, "El teléfono solo puede contener números y símbolos"),

  product: z
    .string()
    .min(1, "Selecciona un producto"),

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

  additionalMessage: z
    .string()
    .max(500, "El mensaje no puede superar los 500 caracteres")
    .optional(),
});

export type QuoteFormData = z.infer<typeof quoteFormSchema>;

// ── Products list shared across components ──────────────────────────────────
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

// ── Basic server-side sanitizer ─────────────────────────────────────────────
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // strip basic HTML tags
    .slice(0, 2000);        // hard cap
}
