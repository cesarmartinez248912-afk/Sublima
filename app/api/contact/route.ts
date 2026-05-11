/**
 * POST /api/contact
 * ─────────────────
 * Recibe la solicitud del formulario, valida los datos con Zod,
 * sanitiza los inputs y despacha el correo electrónico.
 *
 * Compatible con Vercel Edge/Serverless — sin estado persistente.
 */

import { NextRequest, NextResponse } from "next/server";
import { quoteFormSchema, sanitizeString } from "@/lib/validations";
import { sendQuoteEmail } from "@/lib/email";

// ── Rate-limit básico en memoria (por proceso) ────────────────────────────
const ipTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 3;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (ipTimestamps.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );
  if (timestamps.length >= RATE_LIMIT_MAX) return true;
  timestamps.push(now);
  ipTimestamps.set(ip, timestamps);
  return false;
}

// ── Handler ─────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        success: false,
        message: "Demasiados intentos. Por favor espera un momento antes de volver a enviar.",
      },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "El cuerpo de la solicitud no es válido." },
      { status: 400 }
    );
  }

  const parsed = quoteFormSchema.safeParse(body);
  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    return NextResponse.json(
      {
        success: false,
        message: "Por favor corrige los errores del formulario.",
        errors,
      },
      { status: 422 }
    );
  }

  // Sanitize strings
  const data = {
    ...parsed.data,
    name: sanitizeString(parsed.data.name),
    designDescription: sanitizeString(parsed.data.designDescription),
    selectedProductName: parsed.data.selectedProductName
      ? sanitizeString(parsed.data.selectedProductName)
      : undefined,
    selectedProductCategory: parsed.data.selectedProductCategory
      ? sanitizeString(parsed.data.selectedProductCategory)
      : undefined,
    selectedProductImageUrl: parsed.data.selectedProductImageUrl
      ? sanitizeString(parsed.data.selectedProductImageUrl)
      : undefined,
    additionalMessage: parsed.data.additionalMessage
      ? sanitizeString(parsed.data.additionalMessage)
      : undefined,
    deliveryStreet: parsed.data.deliveryStreet
      ? sanitizeString(parsed.data.deliveryStreet)
      : undefined,
    deliveryColonia: parsed.data.deliveryColonia
      ? sanitizeString(parsed.data.deliveryColonia)
      : undefined,
    deliveryCity: parsed.data.deliveryCity
      ? sanitizeString(parsed.data.deliveryCity)
      : undefined,
    deliveryState: parsed.data.deliveryState
      ? sanitizeString(parsed.data.deliveryState)
      : undefined,
    // referenceImageBase64 passes through as-is (already validated by Zod max length)
  };

  try {
    await sendQuoteEmail(data);
  } catch (err) {
    console.error("[/api/contact] Error al enviar correo:", err);
    return NextResponse.json(
      {
        success: false,
        message:
          "Ocurrió un error al enviar tu solicitud. Por favor intenta de nuevo o contáctanos por WhatsApp.",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "¡Tu solicitud fue enviada con éxito! Te contactaremos en menos de 24 horas.",
  });
}

export function GET() {
  return NextResponse.json({ message: "Método no permitido" }, { status: 405 });
}
