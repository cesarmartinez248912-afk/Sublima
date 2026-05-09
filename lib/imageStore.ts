// lib/imageStore.ts
// Gestiona imágenes del sitio usando Supabase Storage + Database

import { supabase } from "./supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GalleryImage {
  id: number;
  imageUrl?: string;
  caption?: string;
}

export interface GalleryCategory {
  id: number;
  title: string;        // Nombre de la categoría (ej. "Tazas")
  badge: string;        // Etiqueta corta (ej. "Cerámica")
  icon: string;         // Material Symbol (fallback cuando no hay imagen)
  gradient: string;     // Gradient CSS classes (fallback)
  colSpan: string;      // Clases de grid para el layout de la portada
  large: boolean;       // Tarjeta grande (2×2) o pequeña
  imageUrl?: string;    // Imagen de portada de la categoría
  images: GalleryImage[]; // Fotos dentro de la categoría (para "Ver más")
}

export interface ProductConfig {
  id: number;
  name: string;
  badge: string;
  description: string;
  icon: string;
  gradient: string;
  imageUrl?: string;
}

export interface HeroConfig {
  backgroundImageUrl?: string;
}

export interface SiteConfig {
  gallery: GalleryCategory[];
  products: ProductConfig[];
  hero: HeroConfig;
}

// ─── Alias de compatibilidad (admin lo usa como GalleryItemConfig) ────────────
export type GalleryItemConfig = GalleryCategory;

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_GALLERY: GalleryCategory[] = [
  {
    id: 1,
    title: "Agencia Digital Nexus",
    badge: "Kit Corporativo",
    gradient: "from-blue-100 via-indigo-50 to-blue-50",
    icon: "business_center",
    colSpan: "md:col-span-2 md:row-span-2",
    large: true,
    images: [],
  },
  {
    id: 2,
    title: "Colección Geométrica",
    badge: "Playeras",
    gradient: "from-purple-50 to-indigo-100",
    icon: "checkroom",
    colSpan: "md:col-span-1 md:row-span-1",
    large: false,
    images: [],
  },
  {
    id: 3,
    title: "Pop Art Collection",
    badge: "Llaveros",
    gradient: "from-sky-50 to-cyan-100",
    icon: "key",
    colSpan: "md:col-span-1 md:row-span-1",
    large: false,
    images: [],
  },
  {
    id: 4,
    title: "Taza Floral",
    badge: "Tazas",
    gradient: "from-violet-50 to-purple-100",
    icon: "coffee",
    colSpan: "md:col-span-2 md:row-span-1 lg:col-span-1 lg:row-span-1",
    large: false,
    images: [],
  },
  {
    id: 5,
    title: "Mármol & Geometría",
    badge: "Fundas",
    gradient: "from-slate-50 to-blue-100",
    icon: "smartphone",
    colSpan: "md:col-span-1 md:row-span-1",
    large: false,
    images: [],
  },
];

export const DEFAULT_PRODUCTS: ProductConfig[] = [
  {
    id: 1,
    name: "Tazas Premium",
    badge: "Cerámica AAA",
    description:
      "Ideal para regalos corporativos o uso personal. Resistente a microondas y lavavajillas.",
    icon: "coffee",
    gradient: "from-blue-50 to-indigo-50",
  },
  {
    id: 2,
    name: "Termos",
    badge: "Acero Inoxidable",
    description:
      "Doble pared al vacío. Mantiene la temperatura por horas con estilo único.",
    icon: "water_bottle",
    gradient: "from-purple-50 to-blue-50",
  },
  {
    id: 3,
    name: "Playeras",
    badge: "Tacto Algodón",
    description:
      "Comodidad inigualable con impresión que no se siente al tacto ni se decolora.",
    icon: "checkroom",
    gradient: "from-indigo-50 to-sky-50",
  },
  {
    id: 4,
    name: "Mousepads",
    badge: "Neopreno Alta Densidad",
    description:
      "Superficie optimizada para precisión. Diseño de borde a borde sin desgaste.",
    icon: "mouse",
    gradient: "from-sky-50 to-cyan-50",
  },
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

  // Migrar galerías antiguas (sin campo images) al nuevo formato
  const rawGallery = cfg.gallery ?? DEFAULT_GALLERY;
  const gallery: GalleryCategory[] = rawGallery.map((g) => ({
    images: [],
    ...g,
  }));

  // Migrar productos antiguos (sin id/badge/description) al nuevo formato
  const rawProducts = cfg.products ?? DEFAULT_PRODUCTS;
  const products: ProductConfig[] = rawProducts.map((p, i) => {
    const def = DEFAULT_PRODUCTS[i] ?? DEFAULT_PRODUCTS[0];
    return {
      id: (p as ProductConfig).id ?? i + 1,
      badge: (p as ProductConfig).badge ?? def.badge,
      description: (p as ProductConfig).description ?? def.description,
      icon: (p as ProductConfig).icon ?? def.icon,
      gradient: (p as ProductConfig).gradient ?? def.gradient,
      ...p,
    } as ProductConfig;
  });

  return {
    gallery,
    products,
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
  path: string // e.g. "gallery/cat-1.jpg"
): Promise<string> {
  const resizedBlob = await resizeToBlob(file);

  const { error } = await supabase.storage
    .from("sublimeart")
    .upload(path, resizedBlob, {
      contentType: "image/jpeg",
      upsert: true,
    });

  if (error) throw new Error(`Error subiendo imagen: ${error.message}`);

  const { data } = supabase.storage.from("sublimeart").getPublicUrl(path);
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
      if (!ctx) {
        reject(new Error("Canvas no disponible"));
        return;
      }
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob(
        (blob) =>
          blob
            ? resolve(blob)
            : reject(new Error("Error al convertir")),
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("No se pudo cargar la imagen"));
    };
    img.src = url;
  });
}
