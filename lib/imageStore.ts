// lib/imageStore.ts
// Manages all customizable images for SublimeArt Premium
// Data is saved in localStorage — only visible on the admin's device/browser

export interface GalleryItemConfig {
    id: number;
    title: string;
    badge: string;
    imageUrl?: string; // base64 JPEG
    gradient: string;
    icon: string;
    colSpan: string;
    large: boolean;
}

export interface ProductConfig {
    name: string;
    imageUrl?: string; // base64 JPEG
}

export interface HeroConfig {
    backgroundImageUrl?: string;
    tagline?: string;
}

export interface SiteConfig {
    gallery: GalleryItemConfig[];
    products: ProductConfig[];
    hero: HeroConfig;
}

// ─── Defaults (original hardcoded data) ────────────────────────────────────

export const DEFAULT_GALLERY: GalleryItemConfig[] = [
    {
        id: 1,
        title: "Agencia Digital Nexus",
        badge: "Kit Corporativo",
        gradient: "from-blue-100 via-indigo-50 to-blue-50",
        icon: "business_center",
        colSpan: "md:col-span-2 md:row-span-2",
        large: true,
    },
    {
        id: 2,
        title: "Colección Geométrica",
        badge: "Playeras",
        gradient: "from-purple-50 to-indigo-100",
        icon: "checkroom",
        colSpan: "md:col-span-1 md:row-span-1",
        large: false,
    },
    {
        id: 3,
        title: "Pop Art Collection",
        badge: "Llaveros",
        gradient: "from-sky-50 to-cyan-100",
        icon: "key",
        colSpan: "md:col-span-1 md:row-span-1",
        large: false,
    },
    {
        id: 4,
        title: "Taza Floral",
        badge: "Tazas",
        gradient: "from-violet-50 to-purple-100",
        icon: "coffee",
        colSpan: "md:col-span-2 md:row-span-1 lg:col-span-1 lg:row-span-1",
        large: false,
    },
    {
        id: 5,
        title: "Mármol & Geometría",
        badge: "Fundas",
        gradient: "from-slate-50 to-blue-100",
        icon: "smartphone",
        colSpan: "md:col-span-1 md:row-span-1",
        large: false,
    },
];

export const DEFAULT_PRODUCTS: ProductConfig[] = [
    { name: "Tazas Premium" },
    { name: "Termos" },
    { name: "Playeras" },
    { name: "Mousepads" },
];

const STORAGE_KEY = "sublimeart_siteconfig_v1";

// ─── Read / Write ────────────────────────────────────────────────────────────

export function getSiteConfig(): SiteConfig {
    if (typeof window === "undefined") {
        return { gallery: DEFAULT_GALLERY, products: DEFAULT_PRODUCTS, hero: {} };
    }
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { gallery: DEFAULT_GALLERY, products: DEFAULT_PRODUCTS, hero: {} };
        const parsed: Partial<SiteConfig> = JSON.parse(raw);
        return {
            gallery: parsed.gallery ?? DEFAULT_GALLERY,
            products: parsed.products ?? DEFAULT_PRODUCTS,
            hero: parsed.hero ?? {},
        };
    } catch {
        return { gallery: DEFAULT_GALLERY, products: DEFAULT_PRODUCTS, hero: {} };
    }
}

export function setSiteConfig(config: SiteConfig): void {
    if (typeof window === "undefined") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    // Broadcast to all components on the same page
    window.dispatchEvent(new Event("sublimeart:config-updated"));
}

export function resetSiteConfig(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("sublimeart:config-updated"));
}

// ─── Image helpers ────────────────────────────────────────────────────────────

/**
 * Resize & compress an image file to base64 JPEG.
 * Keeps file size reasonable for localStorage (~5–10 MB limit).
 */
export async function processImage(
    file: File,
    maxDimension = 1400,
    quality = 0.82
): Promise<string> {
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
                reject(new Error("Canvas context unavailable"));
                return;
            }
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(objectUrl);
            resolve(canvas.toDataURL("image/jpeg", quality));
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error("Failed to load image"));
        };

        img.src = objectUrl;
    });
}