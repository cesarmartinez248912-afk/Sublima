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

// ── Rate-limit muy básico en memoria (por proceso) ────────────────────────
// Para producción de alto tráfico, usa Upstash Redis + @upstash/ratelimit.
const ipTimestamps = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const RATE_LIMIT_MAX = 3; // máx 3 envíos por minuto por IP

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
  // 1. Obtener IP del cliente
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";

  // 2. Rate limit
  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Demasiados intentos. Por favor espera un momento antes de volver a enviar.",
      },
      { status: 429 }
    );
  }

  // 3. Parsear body
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "El cuerpo de la solicitud no es válido." },
      { status: 400 }
    );
  }

  // 4. Validar con Zod
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

  // 5. Sanitizar strings (doble capa de seguridad)
  const data = {
    ...parsed.data,
    name: sanitizeString(parsed.data.name),
    designDescription: sanitizeString(parsed.data.designDescription),
    additionalMessage: parsed.data.additionalMessage
      ? sanitizeString(parsed.data.additionalMessage)
      : undefined,
  };

  // 6. Enviar correo
  try {
    await sendQuoteEmail(data);
  } catch (err) {
    console.error("[/api/contact] Error al enviar correo:", err);

    // No exponemos el detalle del error al cliente por seguridad
    return NextResponse.json(
      {
        success: false,
        message:
          "Ocurrió un error al enviar tu solicitud. Por favor intenta de nuevo o contáctanos por WhatsApp.",
      },
      { status: 500 }
    );
  }

  // 7. Respuesta exitosa
  return NextResponse.json({
    success: true,
    message:
      "¡Tu solicitud fue enviada con éxito! Te contactaremos en menos de 24 horas.",
  });
}

// Rechazar cualquier método que no sea POST
export function GET() {
  return NextResponse.json({ message: "Método no permitido" }, { status: 405 });
}
