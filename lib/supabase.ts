import { createClient } from "@supabase/supabase-js";

// Estas variables las agregas en Vercel → Settings → Environment Variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[Supabase] NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY no están configuradas."
  );
}

// Usamos un placeholder para que el build no falle si las vars no están definidas.
// En producción siempre deben estar configuradas en Vercel → Settings → Environment Variables.
export const supabase = createClient(
  supabaseUrl || "https://placeholder.supabase.co",
  supabaseAnonKey || "placeholder-key"
);
