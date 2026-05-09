// lib/imageStore.ts
// Gestiona imágenes del sitio usando Supabase Storage + Database

import { supabase } from "./supabase";

export interface GalleryItemConfig {
  id: number;
  title: string;
  badge: string;
  imageUrl?: string;
  gradient: string;
  icon: string;
  colSpan: string;
  large: boolean;
}

export interface ProductConfig {
  name: string;
  imageUrl?: string;
}

export interface HeroConfig {
  backgroundImageUrl?: string;
}

export interface SiteConfig {
  gallery: GalleryItemConfig[];
  products: ProductConfig[];
  hero: HeroConfig;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_GALLERY: GalleryItemConfig[] = [
  { id: 1, title: "Agencia Digital Nexus", badge: "Kit Corporativo", gradient: "from-blue-100 via-indigo-50 to-blue-50", icon: "business_center", colSpan: "md:col-span-2 md:row-span-2", large: true },
  { id: 2, title: "Colección Geométrica", badge: "Playeras", gradient: "from-purple-50 to-indigo-100", icon: "checkroom", colSpan: "md:col-span-1 md:row-span-1", large: false },
  { id: 3, title: "Pop Art Collection", badge: "Llaveros", gradient: "from-sky-50 to-cyan-100", icon: "key", colSpan: "md:col-span-1 md:row-span-1", large: false },
  { id: 4, title: "Taza Floral", badge: "Tazas", gradient: "from-violet-50 to-purple-100", icon: "coffee", colSpan: "md:col-span-2 md:row-span-1 lg:col-span-1 lg:row-span-1", large: false },
  { id: 5, title: "Mármol & Geometría", badge: "Fundas", gradient: "from-slate-50 to-blue-100", icon: "smartphone", colSpan: "md:col-span-1 md:row-span-1", large: false },
];

export const DEFAULT_PRODUCTS: ProductConfig[] = [
  { name: "Tazas Premium" },
  { name: "Termos" },
  { name: "Playeras" },
  { name: "Mousepads" },
];

// ─── Read config from Supabase ───────────────────────────────────────────────

export async function getSiteConfig(): Promise<SiteConfig> {
  const { data, error } = await supabase
    .from("site_config")
    .select("config")
    .eq("id", 1)
    .maybeSingle();

  if (error || !data) {
    return { gallery: DEFAULT_GALLERY, products: DEFAULT_PRODUCTS, hero: {} };
  }

  const cfg = data.config as Partial<SiteConfig>;
  return {
    gallery: cfg.gallery ?? DEFAULT_GALLERY,
    products: cfg.products ?? DEFAULT_PRODUCTS,
    hero: cfg.hero ?? {},
  };
}

// ─── Save config to Supabase ─────────────────────────────────────────────────

export async function setSiteConfig(config: SiteConfig): Promise<void> {
  await supabase
    .from("site_config")
    .upsert({ id: 1, config, updated_at: new Date().toISOString() });
}

// ─── Upload image to Supabase Storage ────────────────────────────────────────

export async function uploadImage(
  file: File,
  path: string // e.g. "gallery/item-1.jpg"
): Promise<string> {
  // Resize before uploading to save storage space
  const resizedBlob = await resizeToBlob(file);

  const { error } = await supabase.storage
    .from("sublimeart")
    .upload(path, resizedBlob, {
      contentType: "image/jpeg",
      upsert: true, // overwrite if already exists
    });

  if (error) throw new Error(`Error subiendo imagen: ${error.message}`);

  // Get public URL
  const { data } = supabase.storage
    .from("sublimeart")
    .getPublicUrl(path);

  // Add cache-busting so la imagen nueva se ve de inmediato
  return `${data.publicUrl}?t=${Date.now()}`;
}

// ─── Delete image from Storage ───────────────────────────────────────────────

export async function deleteImage(path: string): Promise<void> {
  await supabase.storage.from("sublimeart").remove([path]);
}

// ─── Image resize helper ──────────────────────────────────────────────────────

function resizeToBlob(
  file: File,
  maxDimension = 1400,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      const scale = Math.min(1, maxDimension / Math.max(width, height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas no disponible")); return; }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error("Error al convertir")),
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("No se pudo cargar la imagen")); };
    img.src = url;
  });
}
