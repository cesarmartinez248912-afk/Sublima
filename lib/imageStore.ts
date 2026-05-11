// lib/imageStore.ts
// Gestiona la configuración visual del sitio usando Supabase Storage + Database.

import { supabase } from "./supabase";

export const STORAGE_BUCKET = "productos-imagenes";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GalleryImage {
  id: number;
  imageUrl?: string;
  caption?: string;
  // ── Campos de producto (todos opcionales) ──────────────────────────────────
  name?: string;
  price?: number;
  priceMode?: "fixed" | "quote" | "promo";
  description?: string;
  featured?: boolean;
  featuredOrder?: number;
}

export interface GalleryCategory {
  id: number;
  title: string;
  badge: string;
  icon: string;
  gradient: string;
  colSpan: string;
  large: boolean;
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
  price?: number;
  priceMode?: "fixed" | "quote" | "promo";
  category?: string;
  featured?: boolean;
  featuredOrder?: number;
}

export interface HeroConfig {
  backgroundImageUrl?: string;
}

export interface SiteConfig {
  gallery: GalleryCategory[];
  products: ProductConfig[];
  hero: HeroConfig;
}

export type GalleryItemConfig = GalleryCategory;

type UnknownRecord = Record<string, unknown>;

// ─── Price helpers ─────────────────────────────────────────────────────────────

/** Formatea un número como precio en MXN: 1234.5 → "$1,234.50 MXN" */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(price);
}

/** Valida que el precio sea un número positivo */
export function isValidPrice(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

// ─── Defaults ────────────────────────────────────────────────────────────────

export const DEFAULT_GALLERY: GalleryCategory[] = [
  {
    id: 1,
    title: "Tazas",
    badge: "Cerámica",
    gradient: "from-amber-50 to-yellow-50",
    icon: "coffee",
    colSpan: "md:col-span-2 md:row-span-2",
    large: true,
    images: [],
  },
  {
    id: 2,
    title: "Playeras",
    badge: "Textil",
    gradient: "from-purple-50 to-indigo-100",
    icon: "checkroom",
    colSpan: "md:col-span-1 md:row-span-1",
    large: false,
    images: [],
  },
  {
    id: 3,
    title: "Llaveros",
    badge: "Promocional",
    gradient: "from-sky-50 to-cyan-100",
    icon: "key",
    colSpan: "md:col-span-1 md:row-span-1",
    large: false,
    images: [],
  },
  {
    id: 4,
    title: "Accesorios",
    badge: "Regalos",
    gradient: "from-violet-50 to-purple-100",
    icon: "card_giftcard",
    colSpan: "md:col-span-2 md:row-span-1 lg:col-span-1 lg:row-span-1",
    large: false,
    images: [],
  },
  {
    id: 5,
    title: "Corporativo",
    badge: "Marca",
    gradient: "from-slate-50 to-blue-100",
    icon: "business_center",
    colSpan: "md:col-span-1 md:row-span-1",
    large: false,
    images: [],
  },
];

export const PRODUCT_CATEGORIES = [
  "Tazas personalizadas",
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
  "Gorras",
  "Otro",
] as const;

export const DEFAULT_PRODUCTS: ProductConfig[] = [
  {
    id: 1,
    name: "Tazas Premium",
    badge: "Cerámica AAA",
    description: "Ideal para regalos corporativos o uso personal. Resistente a microondas y lavavajillas.",
    icon: "coffee",
    gradient: "from-amber-50 to-yellow-50",
    category: "Tazas personalizadas",
    price: 120,
  },
  {
    id: 2,
    name: "Termos",
    badge: "Acero Inoxidable",
    description: "Doble pared al vacío. Mantiene la temperatura por horas con estilo único.",
    icon: "water_bottle",
    gradient: "from-gray-50 to-slate-100",
    category: "Termos / Botellas",
    price: 250,
  },
  {
    id: 3,
    name: "Playeras",
    badge: "Tacto Algodón",
    description: "Comodidad inigualable con impresión que no se siente al tacto ni se decolora.",
    icon: "checkroom",
    gradient: "from-indigo-50 to-sky-50",
    category: "Playeras",
    price: 180,
  },
  {
    id: 4,
    name: "Mousepads",
    badge: "Neopreno Alta Densidad",
    description: "Superficie optimizada para precisión. Diseño de borde a borde sin desgaste.",
    icon: "mouse",
    gradient: "from-sky-50 to-cyan-50",
    category: "Mousepads",
    price: 150,
  },
];

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  gallery: DEFAULT_GALLERY,
  products: DEFAULT_PRODUCTS,
  hero: {},
};

// ─── Type guards / normalizers ───────────────────────────────────────────────

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeGalleryImage(value: unknown, fallbackId: number): GalleryImage {
  const item = isRecord(value) ? value : {};
  const rawPrice = item.price;
  const price =
    typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice >= 0
      ? rawPrice
      : undefined;

  return {
    id: toNumber(item.id, fallbackId),
    imageUrl: toString(item.imageUrl, "") || undefined,
    caption: toString(item.caption, "") || undefined,
    // Product fields
    name: toString(item.name, "") || undefined,
    price,
    priceMode: (["fixed", "quote", "promo"].includes(toString(item.priceMode, ""))
      ? item.priceMode
      : undefined) as "fixed" | "quote" | "promo" | undefined,
    description: toString(item.description, "") || undefined,
    featured: typeof item.featured === "boolean" ? item.featured : false,
    featuredOrder: typeof item.featuredOrder === "number" ? item.featuredOrder : fallbackId,
  };
}

function normalizeGalleryCategory(value: unknown, fallback: GalleryCategory, index: number): GalleryCategory {
  const item = isRecord(value) ? value : {};
  const images = Array.isArray(item.images)
    ? item.images.map((img, imgIdx) => normalizeGalleryImage(img, imgIdx + 1))
    : [];

  return {
    id: toNumber(item.id, fallback.id ?? index + 1),
    title: toString(item.title, fallback.title),
    badge: toString(item.badge, fallback.badge),
    icon: toString(item.icon, fallback.icon),
    gradient: toString(item.gradient, fallback.gradient),
    colSpan: toString(item.colSpan, fallback.colSpan),
    large: typeof item.large === "boolean" ? item.large : fallback.large,
    images,
  };
}

function normalizeProduct(value: unknown, fallback: ProductConfig, index: number): ProductConfig {
  const item = isRecord(value) ? value : {};
  const rawPrice = item.price;
  const price =
    typeof rawPrice === "number" && Number.isFinite(rawPrice) && rawPrice >= 0
      ? rawPrice
      : undefined;

  return {
    id: toNumber(item.id, fallback.id ?? index + 1),
    name: toString(item.name, fallback.name),
    badge: toString(item.badge, fallback.badge),
    description: toString(item.description, fallback.description),
    icon: toString(item.icon, fallback.icon),
    gradient: toString(item.gradient, fallback.gradient),
    imageUrl: toString(item.imageUrl, "") || undefined,
    price,
    priceMode: (["fixed", "quote", "promo"].includes(toString(item.priceMode, "")) ? item.priceMode : "fixed") as "fixed" | "quote" | "promo",
    category: toString(item.category, fallback.category ?? ""),
    featured: typeof item.featured === "boolean" ? item.featured : false,
    featuredOrder: typeof item.featuredOrder === "number" ? item.featuredOrder : index,
  };
}

export function normalizeSiteConfig(input: unknown): SiteConfig {
  const cfg = isRecord(input) ? input : {};

  const rawGallery = Array.isArray(cfg.gallery) ? cfg.gallery : DEFAULT_GALLERY;
  const gallery = rawGallery.map((g, index) =>
    normalizeGalleryCategory(g, DEFAULT_GALLERY[index] ?? DEFAULT_GALLERY[0], index)
  );

  const rawProducts = Array.isArray(cfg.products) ? cfg.products : DEFAULT_PRODUCTS;
  const products = rawProducts.map((p, index) =>
    normalizeProduct(p, DEFAULT_PRODUCTS[index] ?? DEFAULT_PRODUCTS[0], index)
  );

  const rawHero = cfg.hero;
  const hero = isRecord(rawHero)
    ? {
      backgroundImageUrl:
        toString(rawHero.backgroundImageUrl, "") || undefined,
    }
    : {};

  return {
    gallery: gallery.length > 0 ? gallery : DEFAULT_GALLERY,
    products: products.length > 0 ? products : DEFAULT_PRODUCTS,
    hero,
  };
}

// ─── Read config from Supabase ───────────────────────────────────────────────

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const { data, error } = await supabase
      .from("site_config")
      .select("config")
      .eq("id", 1)
      .maybeSingle();

    if (error || !data?.config) {
      return DEFAULT_SITE_CONFIG;
    }

    return normalizeSiteConfig(data.config);
  } catch (error) {
    console.error("Error getSiteConfig:", error);
    return DEFAULT_SITE_CONFIG;
  }
}

// ─── Save config to Supabase ─────────────────────────────────────────────────

export async function setSiteConfig(config: SiteConfig): Promise<void> {
  await supabase.from("site_config").upsert({
    id: 1,
    config: normalizeSiteConfig(config),
    updated_at: new Date().toISOString(),
  });
}

// ─── Upload image to Supabase Storage ────────────────────────────────────────

export async function uploadImage(file: File, path: string): Promise<string> {
  const resizedBlob = await resizeToBlob(file);

  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, resizedBlob, {
    contentType: "image/jpeg",
    upsert: true,
  });

  if (error) throw new Error(`Error subiendo imagen: ${error.message}`);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

// ─── Delete image from Storage ───────────────────────────────────────────────

export async function deleteImage(path: string): Promise<void> {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  if (error) throw new Error(`Error eliminando imagen: ${error.message}`);
}

// ─── Image resize helper ─────────────────────────────────────────────────────

function resizeToBlob(file: File, maxDimension = 1600, quality = 0.88): Promise<Blob> {
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
        URL.revokeObjectURL(url);
        reject(new Error("Canvas no disponible"));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Error al convertir la imagen"))),
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