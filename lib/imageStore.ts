// lib/imageStore.ts
// Gestión robusta de configuración, galerías y productos con Supabase.

import { supabase } from "./supabase";

export interface GalleryImage {
  id: number;
  imageUrl?: string;
  caption?: string;
}

export interface GalleryCategory {
  id: number;
  title: string;
  badge: string;
  icon: string;
  gradient: string;
  colSpan: string;
  large: boolean;
  imageUrl?: string;
  images: GalleryImage[];
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

// Compatibilidad con el admin
export type GalleryItemConfig = GalleryCategory;

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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeImages(value: unknown): GalleryImage[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter(isRecord)
    .map((img, idx) => ({
      id: toNumber(img.id, idx + 1),
      imageUrl: toString(img.imageUrl, ""),
      caption: toString(img.caption, ""),
    }));
}

function normalizeGallery(value: unknown): GalleryCategory[] {
  if (!Array.isArray(value)) return DEFAULT_GALLERY;

  return value
    .filter(isRecord)
    .map((g, idx) => ({
      id: toNumber(g.id, idx + 1),
      title: toString(g.title, `Categoría ${idx + 1}`),
      badge: toString(g.badge, ""),
      icon: toString(g.icon, "image"),
      gradient: toString(g.gradient, "from-gray-100 to-gray-200"),
      colSpan: toString(g.colSpan, ""),
      large: toBoolean(g.large, false),
      imageUrl: toString(g.imageUrl, ""),
      images: normalizeImages(g.images),
    }));
}

function normalizeProducts(value: unknown): ProductConfig[] {
  if (!Array.isArray(value)) return DEFAULT_PRODUCTS;

  return value
    .filter(isRecord)
    .map((p, idx) => {
      const fallback = DEFAULT_PRODUCTS[idx] ?? DEFAULT_PRODUCTS[0];
      return {
        id: toNumber(p.id, idx + 1),
        name: toString(p.name, fallback.name),
        badge: toString(p.badge, fallback.badge),
        description: toString(p.description, fallback.description),
        icon: toString(p.icon, fallback.icon),
        gradient: toString(p.gradient, fallback.gradient),
        imageUrl: toString(p.imageUrl, ""),
      };
    });
}

function normalizeHero(value: unknown): HeroConfig {
  if (!isRecord(value)) return {};
  return {
    backgroundImageUrl: toString(value.backgroundImageUrl, ""),
  };
}

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const { data, error } = await supabase
      .from("site_config")
      .select("config")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data?.config) {
      return {
        gallery: DEFAULT_GALLERY,
        products: DEFAULT_PRODUCTS,
        hero: {},
      };
    }

    const cfg = isRecord(data.config) ? data.config : {};

    return {
      gallery: normalizeGallery(cfg.gallery),
      products: normalizeProducts(cfg.products),
      hero: normalizeHero(cfg.hero),
    };
  } catch (err) {
    console.error("Error getSiteConfig:", err);
    return {
      gallery: DEFAULT_GALLERY,
      products: DEFAULT_PRODUCTS,
      hero: {},
    };
  }
}

export async function setSiteConfig(config: SiteConfig): Promise<void> {
  const { error } = await supabase.from("site_config").upsert({
    id: 1,
    config,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`No se pudo guardar la configuración: ${error.message}`);
  }
}

export async function uploadImage(file: File, path: string): Promise<string> {
  if (typeof window === "undefined") {
    throw new Error("uploadImage solo puede ejecutarse en el navegador.");
  }

  const blob = await resizeToBlob(file);

  const { error } = await supabase.storage.from("sublimeart").upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) {
    throw new Error(`Error subiendo imagen: ${error.message}`);
  }

  const { data } = supabase.storage.from("sublimeart").getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from("sublimeart").remove([path]);
  if (error) {
    throw new Error(`Error eliminando imagen: ${error.message}`);
  }
}

function resizeToBlob(
  file: File,
  maxDimension = 1400,
  quality = 0.85
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      const { width, height } = img;
      const scale = Math.min(1, maxDimension / Math.max(width, height));

      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("No se pudo crear el canvas."));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(objectUrl);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("No se pudo convertir la imagen."));
            return;
          }
          resolve(blob);
        },
        "image/jpeg",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("No se pudo cargar la imagen."));
    };

    img.src = objectUrl;
  });
}
