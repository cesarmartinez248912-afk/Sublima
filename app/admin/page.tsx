"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  getSiteConfig,
  setSiteConfig,
  uploadImage,
  deleteImage,
  DEFAULT_GALLERY,
  DEFAULT_PRODUCTS,
  PRODUCT_CATEGORIES,
  formatPrice,
  isValidPrice,
  type SiteConfig,
  type GalleryCategory,
  type GalleryImage,
  type ProductConfig,
} from "@/lib/imageStore";

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD ?? "admin";

type Tab = "gallery" | "products" | "hero";

// ─── Icon / Gradient options ──────────────────────────────────────────────────

const ICON_OPTIONS = [
  { value: "coffee", label: "Taza" },
  { value: "water_bottle", label: "Termo" },
  { value: "checkroom", label: "Playera" },
  { value: "mouse", label: "Mousepad" },
  { value: "smartphone", label: "Funda/Celular" },
  { value: "key", label: "Llavero" },
  { value: "business_center", label: "Corporativo" },
  { value: "photo_frame", label: "Cuadro" },
  { value: "luggage", label: "Bolsa" },
  { value: "cake", label: "Pastel/Evento" },
  { value: "school", label: "Escolar" },
  { value: "sports_soccer", label: "Deportivo" },
  { value: "card_giftcard", label: "Regalo" },
  { value: "brush", label: "Arte" },
  { value: "stars", label: "Especial" },
];

const GRADIENT_OPTIONS = [
  { value: "from-amber-50 to-yellow-50", label: "Dorado" },
  { value: "from-purple-50 to-blue-50", label: "Púrpura Azul" },
  { value: "from-indigo-50 to-sky-50", label: "Índigo Cielo" },
  { value: "from-sky-50 to-cyan-50", label: "Cielo Cian" },
  { value: "from-violet-50 to-purple-100", label: "Violeta" },
  { value: "from-pink-50 to-rose-100", label: "Rosa" },
  { value: "from-amber-50 to-orange-100", label: "Ámbar" },
  { value: "from-emerald-50 to-teal-100", label: "Esmeralda" },
  { value: "from-slate-50 to-blue-100", label: "Pizarra" },
  { value: "from-gray-50 to-slate-100", label: "Carbón Suave" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const nextId = (items: { id: number }[]) =>
  items.length === 0 ? 1 : Math.max(...items.map((i) => i.id)) + 1;

// ─── ImageDropZone ────────────────────────────────────────────────────────────

function ImageDropZone({
  imageUrl,
  onUpload,
  onRemove,
  label,
  aspectClass = "aspect-video",
  uploading,
}: {
  imageUrl?: string;
  onUpload: (file: File) => void;
  onRemove: () => void;
  label: string;
  aspectClass?: string;
  uploading?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    onUpload(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-[11px] font-semibold text-[#434653] uppercase tracking-wider">{label}</p>
      )}

      {imageUrl ? (
        <div className={`relative ${aspectClass} rounded-2xl overflow-hidden group`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={label} className="w-full h-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!uploading && (
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                onClick={() => inputRef.current?.click()}
                className="bg-white text-[#1E1E1E] text-[12px] font-semibold px-4 py-2 rounded-full hover:bg-amber-50 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
                Cambiar
              </button>
              <button
                onClick={onRemove}
                className="bg-white/20 text-white text-[12px] font-semibold px-4 py-2 rounded-full hover:bg-red-500 transition-colors flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[14px]">delete</span>
                Quitar
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`${aspectClass} rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-all
            ${dragging ? "border-[#F0A500] bg-amber-50" : "border-[#c3c6d5] hover:border-[#F0A500] hover:bg-[#FFF9F0]"}`}
        >
          {uploading ? (
            <>
              <div className="w-7 h-7 border-2 border-[#1E1E1E] border-t-transparent rounded-full animate-spin" />
              <p className="text-[12px] text-[#434653]">Subiendo…</p>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined text-[32px] text-[#737784]">cloud_upload</span>
              <p className="text-[12px] text-[#434653] text-center px-4">
                Arrastra aquí, o <span className="text-[#1E1E1E] font-semibold">selecciona</span>
              </p>
              <p className="text-[10px] text-[#737784]">JPG, PNG, WebP — máx. 20 MB</p>
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Quick Edit Modal ─────────────────────────────────────────────────────────

function QuickEditModal({
  img,
  catTitle,
  onSave,
  onClose,
}: {
  img: GalleryImage;
  catTitle: string;
  onSave: (updated: Partial<GalleryImage>) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(img.name ?? "");
  const [price, setPrice] = useState<string>(img.price !== undefined ? String(img.price) : "");
  const [priceMode, setPriceMode] = useState<"fixed" | "quote" | "promo">(img.priceMode ?? "fixed");
  const [description, setDescription] = useState(img.description ?? "");
  const [featured, setFeatured] = useState(img.featured ?? false);

  const handleSave = () => {
    const parsedPrice = price === "" ? undefined : parseFloat(price);
    onSave({
      name: name.trim() || undefined,
      price: parsedPrice !== undefined && isValidPrice(parsedPrice) ? parsedPrice : undefined,
      priceMode: priceMode,
      description: description.trim() || undefined,
      featured,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div
        className="relative bg-white rounded-[28px] w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#F0E8C8]">
          <div>
            <h3 className="text-[16px] font-bold text-[#131b2e]">Editar producto</h3>
            <p className="text-[12px] text-[#737784] mt-0.5">{catTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#f5f5f5] hover:bg-[#ececec] flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-[18px] text-[#434653]">close</span>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Featured toggle — BIG and prominent */}
          <button
            onClick={() => setFeatured(!featured)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all ${featured
              ? "border-[#F0A500] bg-[#FFF9F0]"
              : "border-[#c3c6d5] bg-white hover:border-[#F0A500]"
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${featured ? "bg-[#F0A500]" : "bg-[#f5f5f5]"}`}>
                <span className={`material-symbols-outlined text-[18px] ${featured ? "text-white" : "text-[#737784]"}`}>
                  star
                </span>
              </div>
              <div className="text-left">
                <p className="text-[13px] font-bold text-[#131b2e]">
                  {featured ? "⭐ Producto destacado" : "Marcar como destacado"}
                </p>
                <p className="text-[11px] text-[#737784]">
                  {featured ? "Aparece en Productos Destacados del Home" : "No aparece en destacados"}
                </p>
              </div>
            </div>
            <div className={`w-11 h-6 rounded-full transition-colors flex items-center ${featured ? "bg-[#F0A500]" : "bg-[#c3c6d5]"}`}>
              <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${featured ? "translate-x-5" : "translate-x-0"}`} />
            </div>
          </button>

          {/* Name */}
          <div>
            <label className="block text-[11px] font-semibold text-[#434653] uppercase tracking-wider mb-1.5">
              Nombre del producto
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Taza con foto personalizada"
              className="w-full text-[13px] px-3 py-2.5 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-[#faf8ff]"
            />
          </div>

          {/* Price mode */}
          <div>
            <label className="block text-[11px] font-semibold text-[#434653] uppercase tracking-wider mb-1.5">
              Tipo de precio
            </label>
            <div className="flex gap-2">
              {(["fixed", "quote", "promo"] as const).map((mode) => {
                const labels = { fixed: "Precio fijo", quote: "A cotizar", promo: "En promo" };
                const icons = { fixed: "sell", quote: "chat_bubble", promo: "local_offer" };
                return (
                  <button
                    key={mode}
                    onClick={() => setPriceMode(mode)}
                    className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[10px] font-semibold border transition-all ${priceMode === mode
                      ? "bg-[#1E1E1E] text-white border-[#1E1E1E]"
                      : "bg-white text-[#737784] border-[#c3c6d5] hover:border-[#F0A500]"
                      }`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{icons[mode]}</span>
                    {labels[mode]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price */}
          {priceMode !== "quote" && (
            <div>
              <label className="block text-[11px] font-semibold text-[#434653] uppercase tracking-wider mb-1.5">
                Precio (MXN)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#737784] font-semibold">$</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  className="w-full text-[13px] pl-7 pr-3 py-2.5 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-[#faf8ff]"
                />
              </div>
              {price && !isNaN(parseFloat(price)) && (
                <p className="text-[11px] text-[#1E1E1E] font-bold mt-1">{formatPrice(parseFloat(price))}</p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-[11px] font-semibold text-[#434653] uppercase tracking-wider mb-1.5">
              Descripción corta <span className="text-[#737784] font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descripción del producto…"
              rows={2}
              className="w-full text-[13px] px-3 py-2.5 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-[#faf8ff] resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-[#c3c6d5] text-[13px] font-semibold text-[#434653] hover:bg-[#f5f5f5] transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-[#1E1E1E] text-white text-[13px] font-semibold hover:bg-[#111111] transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[16px]">check</span>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Image Card with Hover Overlay ────────────────────────────────────────────

function GalleryImageCard({
  img,
  catId,
  onToggleFeatured,
  onEdit,
  onRemoveSlot,
  onUpload,
  uploading,
}: {
  img: GalleryImage;
  catId: number;
  onToggleFeatured: () => void;
  onEdit: () => void;
  onRemoveSlot: () => void;
  onUpload: (file: File) => void;
  uploading: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {img.imageUrl ? (
        <div className="relative aspect-square rounded-[16px] overflow-hidden bg-[#f5f5f5]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img.imageUrl} alt="" className="w-full h-full object-cover" />

          {/* Uploading spinner */}
          {uploading && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="w-7 h-7 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Hover overlay */}
          {!uploading && hovered && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 rounded-[16px]">
              {/* Edit button */}
              <button
                onClick={onEdit}
                className="flex items-center gap-1.5 bg-white text-[#1E1E1E] text-[11px] font-bold px-4 py-2 rounded-full hover:bg-[#FFF9F0] transition-colors"
              >
                <span className="material-symbols-outlined text-[14px]">edit</span>
                Editar info
              </button>
              {/* Star button */}
              <button
                onClick={onToggleFeatured}
                className={`flex items-center gap-1.5 text-[11px] font-bold px-4 py-2 rounded-full transition-colors ${img.featured
                  ? "bg-[#F0A500] text-white hover:bg-[#d99200]"
                  : "bg-white/20 text-white hover:bg-[#F0A500] hover:text-white"
                  }`}
              >
                <span className="material-symbols-outlined text-[14px]">
                  {img.featured ? "star" : "star_outline"}
                </span>
                {img.featured ? "Destacado ✓" : "Destacar"}
              </button>
            </div>
          )}

          {/* Always-visible star indicator */}
          {img.featured && !hovered && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-[#F0A500] rounded-full flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-white text-[13px]">star</span>
            </div>
          )}

          {/* Remove button (top-left on hover) */}
          {hovered && !uploading && (
            <button
              onClick={onRemoveSlot}
              className="absolute top-2 left-2 w-7 h-7 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-white text-[14px]">close</span>
            </button>
          )}
        </div>
      ) : (
        <ImageDropZone
          imageUrl={undefined}
          label=""
          aspectClass="aspect-square"
          uploading={uploading}
          onUpload={onUpload}
          onRemove={onRemoveSlot}
        />
      )}

      {/* Product info strip below image */}
      <div className="mt-1.5 px-1">
        {img.name ? (
          <p className="text-[11px] font-bold text-[#131b2e] truncate">{img.name}</p>
        ) : img.caption ? (
          <p className="text-[11px] text-[#737784] truncate">{img.caption}</p>
        ) : null}
        {img.price !== undefined && (
          <p className="text-[10px] text-[#F0A500] font-bold">{formatPrice(img.price)}</p>
        )}
        {(img.priceMode === "quote" || (!img.price && !img.priceMode)) && img.name && (
          <p className="text-[10px] text-[#737784]">A cotizar</p>
        )}
      </div>
    </div>
  );
}

// ─── Gallery Tab ──────────────────────────────────────────────────────────────

function GalleryTab({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
  const [uploading, setUploading] = useState<string | null>(null);
  const [bulkUploading, setBulkUploading] = useState<{ catId: number; done: number; total: number } | null>(null);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [quickEdit, setQuickEdit] = useState<{ catId: number; img: GalleryImage } | null>(null);
  const bulkInputRef = useRef<{ [catId: number]: HTMLInputElement | null }>({});

  const categories = config.gallery;
  const update = (updated: GalleryCategory[]) => onChange({ ...config, gallery: updated });

  // Cover image upload
  const uploadCover = async (catId: number, file: File) => {
    setUploading(`cover-${catId}`);
    setError("");
    try {
      const url = await uploadImage(file, `gallery/item-${catId}.jpg`);
      update(categories.map((c) => c.id === catId ? { ...c, imageUrl: url } : c));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al subir imagen");
    } finally {
      setUploading(null);
    }
  };

  const removeCover = async (catId: number) => {
    await deleteImage(`gallery/item-${catId}.jpg`);
    update(categories.map((c) => c.id === catId ? { ...c, imageUrl: undefined } : c));
  };

  // Extra image upload
  const uploadExtra = async (catId: number, imgId: number, file: File) => {
    const key = `extra-${catId}-${imgId}`;
    setUploading(key);
    setError("");
    try {
      const url = await uploadImage(file, `gallery/item-${catId}-extra-${imgId}.jpg`);
      update(categories.map((c) =>
        c.id !== catId ? c : {
          ...c,
          images: c.images.map((img) => img.id === imgId ? { ...img, imageUrl: url } : img),
        }
      ));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al subir imagen");
    } finally {
      setUploading(null);
    }
  };

  const removeExtra = async (catId: number, imgId: number) => {
    await deleteImage(`gallery/item-${catId}-extra-${imgId}.jpg`);
    update(categories.map((c) =>
      c.id !== catId ? c : {
        ...c,
        images: c.images.map((img) => img.id === imgId ? { ...img, imageUrl: undefined } : img),
      }
    ));
  };

  const addImageSlot = (catId: number) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    const newImgId = nextId(cat.images);
    update(categories.map((c) =>
      c.id === catId ? { ...c, images: [...c.images, { id: newImgId }] } : c
    ));
  };

  const removeImageSlot = async (catId: number, imgId: number, hasImage: boolean) => {
    if (hasImage) await deleteImage(`gallery/item-${catId}-extra-${imgId}.jpg`);
    update(categories.map((c) =>
      c.id !== catId ? c : { ...c, images: c.images.filter((img) => img.id !== imgId) }
    ));
  };

  // Update a single image's metadata
  const updateImageMeta = (catId: number, imgId: number, patch: Partial<GalleryImage>) => {
    update(categories.map((c) =>
      c.id !== catId ? c : {
        ...c,
        images: c.images.map((img) => img.id === imgId ? { ...img, ...patch } : img),
      }
    ));
  };

  // Toggle featured on an image
  const toggleFeatured = (catId: number, imgId: number) => {
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    const img = cat.images.find((i) => i.id === imgId);
    if (!img) return;
    updateImageMeta(catId, imgId, { featured: !img.featured });
  };

  const updateMeta = (catId: number, patch: Partial<GalleryCategory>) =>
    update(categories.map((c) => c.id === catId ? { ...c, ...patch } : c));

  // Bulk upload
  const bulkUpload = async (catId: number, files: FileList) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (validFiles.length === 0) return;
    const cat = categories.find((c) => c.id === catId);
    if (!cat) return;
    const remaining = 20 - cat.images.length;
    const toUpload = validFiles.slice(0, remaining);
    if (toUpload.length === 0) { setError("Límite de 20 fotos alcanzado."); return; }
    setError("");
    setBulkUploading({ catId, done: 0, total: toUpload.length });
    const startId = nextId(cat.images);
    const newSlots: GalleryImage[] = toUpload.map((_, i) => ({ id: startId + i }));
    let latestCategories = categories.map((c) =>
      c.id !== catId ? c : { ...c, images: [...c.images, ...newSlots] }
    );
    onChange({ ...config, gallery: latestCategories });
    for (let i = 0; i < toUpload.length; i++) {
      const file = toUpload[i];
      const imgId = startId + i;
      try {
        const url = await uploadImage(file, `gallery/item-${catId}-extra-${imgId}.jpg`);
        latestCategories = latestCategories.map((c) =>
          c.id !== catId ? c : {
            ...c,
            images: c.images.map((img) => img.id === imgId ? { ...img, imageUrl: url } : img),
          }
        );
        onChange({ ...config, gallery: latestCategories });
        setBulkUploading({ catId, done: i + 1, total: toUpload.length });
      } catch (e: unknown) {
        setError(`Error imagen ${i + 1}: ${e instanceof Error ? e.message : "Error desconocido"}`);
      }
    }
    setBulkUploading(null);
  };

  const addCategory = () => {
    const newId = nextId(categories);
    const newCat: GalleryCategory = {
      id: newId,
      title: "Nueva categoría",
      badge: "Nuevo",
      icon: "stars",
      gradient: "from-blue-50 to-indigo-50",
      colSpan: "md:col-span-1 md:row-span-1",
      large: false,
      images: [],
    };
    update([...categories, newCat]);
    setExpandedId(newId);
  };

  const deleteCategory = (catId: number) => {
    update(categories.filter((c) => c.id !== catId));
    setDeleteConfirm(null);
    if (expandedId === catId) setExpandedId(null);
  };

  return (
    <div className="space-y-6">
      {/* Quick Edit Modal */}
      {quickEdit && (
        <QuickEditModal
          img={quickEdit.img}
          catTitle={categories.find((c) => c.id === quickEdit.catId)?.title ?? ""}
          onSave={(patch) => updateImageMeta(quickEdit.catId, quickEdit.img.id, patch)}
          onClose={() => setQuickEdit(null)}
        />
      )}

      {/* Top bar */}
      <div className="flex items-start justify-between gap-4">
        <div className="bg-[#FFF5D6] rounded-2xl p-4 text-[13px] text-[#1E1E1E] flex gap-3 flex-1">
          <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">info</span>
          <p>
            Cada categoría tiene portada + fotos de producto. <strong>Pasa el cursor sobre una imagen</strong> para editar su precio, nombre o destacarla con ⭐.
          </p>
        </div>
        <button
          onClick={addCategory}
          className="flex items-center gap-2 bg-[#1E1E1E] text-white text-[13px] font-semibold px-5 py-3 rounded-xl hover:bg-[#111111] transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Nueva categoría
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[12px] text-red-600 flex gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>
          {error}
        </div>
      )}

      {/* Category list */}
      <div className="space-y-4">
        {categories.map((cat) => {
          const isExpanded = expandedId === cat.id;
          const isDeleting = deleteConfirm === cat.id;

          return (
            <div
              key={cat.id}
              className="bg-white rounded-2xl border border-[#F0E8C8] overflow-hidden"
              style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
            >
              {/* Header row */}
              <div className="flex items-center gap-3 px-5 py-4 cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : cat.id)}>
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center flex-shrink-0`}>
                  {cat.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cat.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                  ) : (
                    <span className="material-symbols-outlined text-[20px] text-[#1E1E1E]/60">{cat.icon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-[#131b2e] text-[14px] truncate">{cat.title}</span>
                    <span className="text-[10px] bg-[#FFF5D6] text-[#1E1E1E] px-2 py-0.5 rounded-full font-medium">{cat.badge}</span>
                    {cat.imageUrl && (
                      <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">check_circle</span>Portada ✓
                      </span>
                    )}
                    {cat.images.filter((i) => i.imageUrl).length > 0 && (
                      <span className="text-[10px] text-[#434653]">
                        + {cat.images.filter((i) => i.imageUrl).length} foto{cat.images.filter((i) => i.imageUrl).length !== 1 ? "s" : ""}
                      </span>
                    )}
                    {cat.images.filter((i) => i.featured).length > 0 && (
                      <span className="text-[10px] text-[#F0A500] font-semibold flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[12px]">star</span>
                        {cat.images.filter((i) => i.featured).length} destacado{cat.images.filter((i) => i.featured).length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {isDeleting ? (
                    <>
                      <button onClick={(e) => { e.stopPropagation(); deleteCategory(cat.id); }} className="text-[12px] bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-red-600">¿Confirmar?</button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }} className="text-[12px] text-[#434653] px-3 py-1.5 rounded-lg border border-[#c3c6d5]">Cancelar</button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(cat.id); setTimeout(() => setDeleteConfirm(null), 3000); }}
                      className="text-[#737784] hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                  <span className="material-symbols-outlined text-[20px] text-[#737784] transition-transform duration-200" style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}>
                    expand_more
                  </span>
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t border-[#F0E8C8] p-5 space-y-6">
                  {/* Metadata */}
                  <div>
                    <p className="text-[11px] font-semibold text-[#434653] uppercase tracking-wider mb-3">Información de la categoría</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-[11px] text-[#737784] mb-1">Nombre</label>
                        <input value={cat.title} onChange={(e) => updateMeta(cat.id, { title: e.target.value })} className="w-full text-[13px] px-3 py-2 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-[#faf8ff]" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#737784] mb-1">Etiqueta</label>
                        <input value={cat.badge} onChange={(e) => updateMeta(cat.id, { badge: e.target.value })} className="w-full text-[13px] px-3 py-2 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-[#faf8ff]" />
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#737784] mb-1">Ícono</label>
                        <select value={cat.icon} onChange={(e) => updateMeta(cat.id, { icon: e.target.value })} className="w-full text-[13px] px-3 py-2 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-[#faf8ff]">
                          {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] text-[#737784] mb-1">Color de fondo</label>
                        <select value={cat.gradient} onChange={(e) => updateMeta(cat.id, { gradient: e.target.value })} className="w-full text-[13px] px-3 py-2 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-[#faf8ff]">
                          {GRADIENT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="mt-3">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div
                          onClick={() => updateMeta(cat.id, { large: !cat.large, colSpan: !cat.large ? "md:col-span-2 md:row-span-2" : "md:col-span-1 md:row-span-1" })}
                          className={`w-10 h-6 rounded-full transition-colors flex items-center cursor-pointer ${cat.large ? "bg-[#1E1E1E]" : "bg-[#c3c6d5]"}`}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform mx-1 ${cat.large ? "translate-x-4" : "translate-x-0"}`} />
                        </div>
                        <span className="text-[12px] text-[#434653]">Tarjeta grande (2×2, destacada en portada)</span>
                      </label>
                    </div>
                  </div>

                  {/* Cover image */}
                  <div>
                    <p className="text-[11px] font-semibold text-[#434653] uppercase tracking-wider mb-3">
                      Imagen de portada <span className="text-[#737784] font-normal normal-case">(visible en la cuadrícula principal)</span>
                    </p>
                    <div className="max-w-sm">
                      <ImageDropZone
                        imageUrl={cat.imageUrl}
                        label=""
                        aspectClass={cat.large ? "aspect-[4/3]" : "aspect-video"}
                        uploading={uploading === `cover-${cat.id}`}
                        onUpload={(file) => uploadCover(cat.id, file)}
                        onRemove={() => removeCover(cat.id)}
                      />
                    </div>
                  </div>

                  {/* Products / extra images */}
                  <div>
                    <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                      <div>
                        <p className="text-[11px] font-semibold text-[#434653] uppercase tracking-wider">
                          Imágenes / Productos <span className="text-[#737784] font-normal normal-case">(aparecen al abrir la categoría)</span>
                        </p>
                        <p className="text-[11px] text-[#737784] mt-0.5">
                          Pasa el cursor sobre cada imagen para editar precio, nombre y destacar ⭐
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => bulkInputRef.current[cat.id]?.click()}
                          disabled={cat.images.length >= 20 || !!bulkUploading}
                          className="flex items-center gap-1.5 text-[12px] bg-[#1E1E1E] text-white font-semibold px-3 py-1.5 rounded-lg hover:bg-[#111111] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <span className="material-symbols-outlined text-[15px]">photo_library</span>
                          Subir varias
                        </button>
                        <input
                          ref={(el) => { bulkInputRef.current[cat.id] = el; }}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => {
                            if (e.target.files && e.target.files.length > 0) bulkUpload(cat.id, e.target.files);
                            e.target.value = "";
                          }}
                        />
                        <button
                          onClick={() => addImageSlot(cat.id)}
                          disabled={cat.images.length >= 20 || !!bulkUploading}
                          className="flex items-center gap-1 text-[12px] text-[#1E1E1E] font-semibold hover:underline disabled:opacity-40"
                        >
                          <span className="material-symbols-outlined text-[16px]">add_photo_alternate</span>
                          Una foto
                        </button>
                      </div>
                    </div>

                    {/* Bulk progress */}
                    {bulkUploading && bulkUploading.catId === cat.id && (
                      <div className="mb-3 bg-[#FFF5D6] rounded-xl p-3 flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-[#1E1E1E] border-t-transparent rounded-full animate-spin flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-[12px] font-semibold text-[#1E1E1E]">Subiendo… {bulkUploading.done} de {bulkUploading.total}</p>
                          <div className="mt-1.5 h-1.5 bg-[#c3c6d5] rounded-full overflow-hidden">
                            <div className="h-full bg-[#1E1E1E] rounded-full transition-all duration-300" style={{ width: `${(bulkUploading.done / bulkUploading.total) * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    )}

                    {cat.images.length === 0 ? (
                      <button
                        onClick={() => bulkInputRef.current[cat.id]?.click()}
                        className="w-full border-2 border-dashed border-[#c3c6d5] rounded-2xl py-10 flex flex-col items-center gap-2 hover:border-[#F0A500] hover:bg-[#FFF9F0] transition-all"
                      >
                        <span className="material-symbols-outlined text-[40px] text-[#737784]">photo_library</span>
                        <p className="text-[14px] font-semibold text-[#434653]">Seleccionar fotos</p>
                        <p className="text-[11px] text-[#737784]">Puedes elegir varias a la vez</p>
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                        {cat.images.map((img) => (
                          <GalleryImageCard
                            key={img.id}
                            img={img}
                            catId={cat.id}
                            uploading={uploading === `extra-${cat.id}-${img.id}`}
                            onToggleFeatured={() => toggleFeatured(cat.id, img.id)}
                            onEdit={() => setQuickEdit({ catId: cat.id, img })}
                            onRemoveSlot={() => removeImageSlot(cat.id, img.id, !!img.imageUrl)}
                            onUpload={(file) => uploadExtra(cat.id, img.id, file)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={addCategory}
        className="w-full border-2 border-dashed border-[#c3c6d5] rounded-2xl py-5 flex items-center justify-center gap-2 text-[13px] text-[#434653] font-medium hover:border-[#F0A500] hover:text-[#F0A500] hover:bg-[#FFF9F0] transition-all"
      >
        <span className="material-symbols-outlined text-[20px]">add</span>
        Agregar nueva categoría
      </button>
    </div>
  );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
  const [uploading, setUploading] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<Omit<ProductConfig, "id" | "imageUrl">>({
    name: "",
    badge: "",
    description: "",
    icon: "stars",
    gradient: "from-amber-50 to-yellow-50",
    price: undefined,
    category: "",
  });

  const products = config.products;
  const update = (updated: ProductConfig[]) => onChange({ ...config, products: updated });

  const handleUpload = async (id: number, file: File) => {
    setUploading(id);
    setError("");
    try {
      const url = await uploadImage(file, `products/prod-${id}.jpg`);
      update(products.map((p) => p.id === id ? { ...p, imageUrl: url } : p));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al subir imagen");
    } finally {
      setUploading(null);
    }
  };

  const handleRemove = async (id: number) => {
    await deleteImage(`products/prod-${id}.jpg`);
    update(products.map((p) => p.id === id ? { ...p, imageUrl: undefined } : p));
  };

  const updateMeta = (id: number, patch: Partial<ProductConfig>) =>
    update(products.map((p) => p.id === id ? { ...p, ...patch } : p));

  const deleteProduct = (id: number) => { update(products.filter((p) => p.id !== id)); setDeleteConfirm(null); };

  const addProduct = () => {
    if (!newProduct.name.trim()) return;
    const id = nextId(products);
    update([...products, { id, ...newProduct }]);
    setNewProduct({ name: "", badge: "", description: "", icon: "stars", gradient: "from-amber-50 to-yellow-50", price: undefined, category: "" });
    setShowAddForm(false);
  };

  const toggleFeaturedProduct = (id: number) => {
    const product = products.find((p) => p.id === id);
    if (!product) return;
    updateMeta(id, { featured: !product.featured });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="bg-[#FFF5D6] rounded-2xl p-4 text-[13px] text-[#1E1E1E] flex gap-3 flex-1">
          <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">info</span>
          <p>Estos productos aparecen en <strong>Productos Destacados</strong> del Home cuando activas la estrella ⭐.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-2 bg-[#1E1E1E] text-white text-[13px] font-semibold px-5 py-3 rounded-xl hover:bg-[#111111] transition-colors flex-shrink-0"
        >
          <span className="material-symbols-outlined text-[16px]">{showAddForm ? "close" : "add"}</span>
          {showAddForm ? "Cancelar" : "Nuevo producto"}
        </button>
      </div>

      {/* Add form */}
      {showAddForm && (
        <div className="bg-[#faf8ff] border border-[#F0E8C8] rounded-2xl p-5 space-y-4">
          <p className="text-[13px] font-semibold text-[#131b2e]">Nuevo producto destacado</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#737784] mb-1">Nombre *</label>
              <input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Ej: Gorras bordadas" className="w-full text-[13px] px-3 py-2 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-white" />
            </div>
            <div>
              <label className="block text-[11px] text-[#737784] mb-1">Badge</label>
              <input value={newProduct.badge} onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })} placeholder="Ej: Algodón Premium" className="w-full text-[13px] px-3 py-2 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-white" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#737784] mb-1">Precio (MXN)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] text-[#737784] font-semibold">$</span>
                <input type="number" min="0" step="0.01" value={newProduct.price ?? ""} onChange={(e) => { const val = e.target.value === "" ? undefined : Math.max(0, parseFloat(e.target.value)); setNewProduct({ ...newProduct, price: isNaN(val as number) ? undefined : val }); }} placeholder="0.00" className="w-full text-[13px] pl-7 pr-3 py-2 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-white" />
              </div>
              <p className="text-[10px] text-[#737784] mt-1">Vacío = precio a cotizar</p>
            </div>
            <div>
              <label className="block text-[11px] text-[#737784] mb-1">Categoría</label>
              <select value={newProduct.category ?? ""} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full text-[13px] px-3 py-2 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-white">
                <option value="">Sin categoría</option>
                {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] text-[#737784] mb-1">Descripción</label>
            <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} rows={2} className="w-full text-[13px] px-3 py-2 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-white resize-none" />
          </div>
          <div className="flex justify-end gap-3">
            <button onClick={() => setShowAddForm(false)} className="text-[13px] text-[#434653] px-4 py-2 rounded-xl border border-[#c3c6d5]">Cancelar</button>
            <button onClick={addProduct} disabled={!newProduct.name.trim()} className="text-[13px] font-semibold bg-[#1E1E1E] text-white px-5 py-2 rounded-xl hover:bg-[#111111] transition-colors disabled:opacity-40 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">add</span>Agregar
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[12px] text-red-600 flex gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>{error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {products.map((product) => {
          const isDeleting = deleteConfirm === product.id;
          return (
            <div key={product.id} className="bg-white rounded-2xl border border-[#F0E8C8] p-5 space-y-4" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
              {/* Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <input value={product.name} onChange={(e) => updateMeta(product.id, { name: e.target.value })} className="font-semibold text-[#131b2e] text-[15px] w-full focus:outline-none focus:ring-2 focus:ring-[#F0A500] rounded-lg px-2 py-1 -mx-2 bg-transparent hover:bg-[#faf8ff] transition-colors" />
                </div>
                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                  {/* Featured star toggle */}
                  <button
                    onClick={() => toggleFeaturedProduct(product.id)}
                    title={product.featured ? "Quitar de destacados" : "Marcar como destacado"}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${product.featured ? "bg-[#F0A500] text-white shadow-md" : "bg-[#f5f5f5] text-[#737784] hover:bg-[#FFF5D6] hover:text-[#F0A500]"}`}
                  >
                    <span className="material-symbols-outlined text-[17px]">{product.featured ? "star" : "star_outline"}</span>
                  </button>
                  {isDeleting ? (
                    <div className="flex gap-2">
                      <button onClick={() => deleteProduct(product.id)} className="text-[11px] bg-red-500 text-white px-2.5 py-1 rounded-lg font-semibold">¿Eliminar?</button>
                      <button onClick={() => setDeleteConfirm(null)} className="text-[11px] text-[#434653] px-2.5 py-1 rounded-lg border border-[#c3c6d5]">No</button>
                    </div>
                  ) : (
                    <button onClick={() => { setDeleteConfirm(product.id); setTimeout(() => setDeleteConfirm(null), 3000); }} className="text-[#737784] hover:text-red-500 transition-colors p-1 rounded-lg hover:bg-red-50">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  )}
                </div>
              </div>

              {product.featured && (
                <div className="flex items-center gap-1.5 bg-[#FFF9F0] border border-[#F0E8C8] rounded-xl px-3 py-2">
                  <span className="material-symbols-outlined text-[14px] text-[#F0A500]">star</span>
                  <span className="text-[11px] font-semibold text-[#F0A500]">Aparece en Productos Destacados del Home</span>
                </div>
              )}

              {/* Fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] text-[#737784] mb-1">Badge</label>
                  <input value={product.badge} onChange={(e) => updateMeta(product.id, { badge: e.target.value })} className="w-full text-[12px] px-2.5 py-1.5 rounded-lg border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-[#faf8ff]" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#737784] mb-1">Ícono</label>
                  <select value={product.icon} onChange={(e) => updateMeta(product.id, { icon: e.target.value })} className="w-full text-[12px] px-2.5 py-1.5 rounded-lg border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-[#faf8ff]">
                    {ICON_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-[#737784] mb-1">Descripción</label>
                <textarea value={product.description} onChange={(e) => updateMeta(product.id, { description: e.target.value })} rows={2} className="w-full text-[12px] px-2.5 py-1.5 rounded-lg border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-[#faf8ff] resize-none" />
              </div>

              {/* Price & Category */}
              <div className="bg-[#FFF9F0] border border-[#F0E8C8] rounded-xl p-3 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#F0A500]">💲 Precio & Categoría</p>
                <div>
                  <label className="block text-[10px] text-[#737784] mb-1.5">Tipo de precio</label>
                  <div className="flex gap-2">
                    {(["fixed", "quote", "promo"] as const).map((mode) => {
                      const labels = { fixed: "Precio fijo", quote: "A cotizar", promo: "En promoción" };
                      const icons = { fixed: "sell", quote: "chat_bubble", promo: "local_offer" };
                      const current = (product as ProductConfig & { priceMode?: string }).priceMode ?? "fixed";
                      const active = current === mode;
                      return (
                        <button key={mode} onClick={() => updateMeta(product.id, { priceMode: mode } as Partial<ProductConfig>)} className={`flex-1 flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-[10px] font-semibold border transition-all ${active ? "bg-[#1E1E1E] text-white border-[#1E1E1E]" : "bg-white text-[#737784] border-[#c3c6d5] hover:border-[#F0A500]"}`}>
                          <span className="material-symbols-outlined text-[14px]">{icons[mode]}</span>
                          {labels[mode]}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#737784] mb-1">Precio (MXN)</label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[12px] text-[#737784] font-semibold">$</span>
                      <input type="number" min="0" step="1" disabled={(product as ProductConfig & { priceMode?: string }).priceMode === "quote"} value={product.price ?? ""} onChange={(e) => { const val = e.target.value === "" ? undefined : parseFloat(e.target.value); if (val === undefined || (isValidPrice(val) && val >= 0)) updateMeta(product.id, { price: val }); }} placeholder={(product as ProductConfig & { priceMode?: string }).priceMode === "quote" ? "— a cotizar —" : "0"} className="w-full text-[12px] pl-6 pr-2 py-1.5 rounded-lg border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-white disabled:bg-[#f5f5f5] disabled:text-[#bbb]" />
                    </div>
                    {product.price !== undefined && isValidPrice(product.price) && (
                      <p className="text-[10px] text-[#1E1E1E] font-bold mt-1">{formatPrice(product.price)}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#737784] mb-1">Categoría</label>
                    <select value={product.category ?? ""} onChange={(e) => updateMeta(product.id, { category: e.target.value })} className="w-full text-[12px] px-2 py-1.5 rounded-lg border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#F0A500] bg-white">
                      <option value="">Sin categoría</option>
                      {PRODUCT_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <ImageDropZone
                imageUrl={product.imageUrl}
                label="Foto del producto"
                aspectClass="aspect-square"
                uploading={uploading === product.id}
                onUpload={(file) => handleUpload(product.id, file)}
                onRemove={() => handleRemove(product.id)}
              />
            </div>
          );
        })}
      </div>

      {products.length === 0 && (
        <div className="text-center py-16 text-[#737784] text-[14px]">
          No hay productos. Haz clic en <strong>Nuevo producto</strong> para comenzar.
        </div>
      )}
    </div>
  );
}

// ─── Hero Tab ─────────────────────────────────────────────────────────────────

function HeroTab({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const url = await uploadImage(file, "hero/background.jpg");
      onChange({ ...config, hero: { ...config.hero, backgroundImageUrl: url } });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al subir imagen");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    await deleteImage("hero/background.jpg");
    onChange({ ...config, hero: { ...config.hero, backgroundImageUrl: undefined } });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#FFF5D6] rounded-2xl p-4 text-[13px] text-[#1E1E1E] flex gap-3">
        <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">info</span>
        <p>Imagen de fondo para la sección principal (Hero). Usa una foto horizontal de alta resolución, mínimo 1400 px de ancho.</p>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[12px] text-red-600 flex gap-2">
          <span className="material-symbols-outlined text-[16px]">error</span>{error}
        </div>
      )}
      <div className="bg-white rounded-2xl border border-[#F0E8C8] p-6" style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
        <ImageDropZone
          imageUrl={config.hero.backgroundImageUrl}
          label="Imagen de fondo del Hero"
          aspectClass="aspect-[21/9]"
          uploading={uploading}
          onUpload={handleUpload}
          onRemove={handleRemove}
        />
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("gallery");
  const [config, setConfig] = useState<SiteConfig>({ gallery: DEFAULT_GALLERY, products: DEFAULT_PRODUCTS, hero: {} });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  useEffect(() => {
    if (authed) {
      setLoading(true);
      getSiteConfig().then((cfg) => { setConfig(cfg); setLoading(false); });
    }
  }, [authed]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) { setAuthed(true); setPasswordError(""); }
    else { setPasswordError("Contraseña incorrecta."); setPasswordInput(""); }
  };

  const handleSave = async () => {
    setSaving(true);
    await setSiteConfig(config);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = async () => {
    if (!resetConfirm) { setResetConfirm(true); setTimeout(() => setResetConfirm(false), 3000); return; }
    setResetConfirm(false);
    const def = { gallery: DEFAULT_GALLERY, products: DEFAULT_PRODUCTS, hero: {} };
    setConfig(def);
    await setSiteConfig(def);
  };

  const TABS: { id: Tab; label: string; icon: string }[] = [
    { id: "gallery", label: "Productos / Galería", icon: "photo_library" },
    { id: "products", label: "Destacados", icon: "star" },
    { id: "hero", label: "Hero / Portada", icon: "image" },
  ];

  // ── Login ──────────────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-[28px] p-8 space-y-6" style={{ boxShadow: "0 20px 60px rgba(0,71,171,0.12)" }}>
          <div className="text-center space-y-2">
            <div className="inline-flex w-14 h-14 items-center justify-center bg-[#FFF0C0] rounded-2xl mx-auto">
              <span className="material-symbols-outlined text-[28px] text-[#1E1E1E]">admin_panel_settings</span>
            </div>
            <h1 className="text-[22px] font-bold text-[#131b2e]">Panel Admin</h1>
            <p className="text-[13px] text-[#434653]">Sublimax Navojoa</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-[#434653] uppercase tracking-wider mb-1.5">Contraseña</label>
              <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)} placeholder="••••••••••••" autoFocus className="w-full px-4 py-3 rounded-xl border border-[#c3c6d5] bg-[#faf8ff] text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#F0A500] text-[14px]" />
              {passwordError && (
                <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">error</span>{passwordError}
                </p>
              )}
            </div>
            <button type="submit" className="w-full bg-[#1E1E1E] text-white font-semibold py-3 rounded-xl hover:bg-[#111111] transition-colors text-[14px] flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">lock_open</span>Entrar
            </button>
          </form>
          <p className="text-[10px] text-center text-[#737784]">
            Accede en: <code className="bg-[#FFF5D6] px-1.5 py-0.5 rounded text-[#1E1E1E]">tudominio.com/admin</code>
          </p>
        </div>
      </div>
    );
  }

  // ── Dashboard ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FFF9F0]">
      <header className="bg-white border-b border-[#F0E8C8] sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1E1E1E] rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">admin_panel_settings</span>
            </div>
            <div>
              <h1 className="text-[15px] font-bold text-[#131b2e] leading-none">Panel Admin</h1>
              <p className="text-[11px] text-[#434653]">Sublimax Navojoa · Supabase</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/" target="_blank" className="text-[12px] text-[#434653] hover:text-[#F0A500] flex items-center gap-1 transition-colors">
              <span className="material-symbols-outlined text-[15px]">open_in_new</span>Ver sitio
            </a>
            <button
              onClick={handleReset}
              className={`text-[12px] font-medium px-4 py-2 rounded-xl border transition-all flex items-center gap-1.5 ${resetConfirm ? "border-red-400 bg-red-50 text-red-600" : "border-[#c3c6d5] text-[#434653] hover:border-red-300 hover:text-red-500"}`}
            >
              <span className="material-symbols-outlined text-[14px]">restart_alt</span>
              {resetConfirm ? "¿Confirmar?" : "Reset"}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className={`text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 ${saved ? "bg-green-500 text-white" : "bg-[#1E1E1E] text-white hover:bg-[#111111] disabled:opacity-60"}`}
            >
              <span className="material-symbols-outlined text-[16px]">{saved ? "check" : saving ? "hourglass_empty" : "save"}</span>
              {saved ? "¡Guardado!" : saving ? "Guardando…" : "Guardar cambios"}
            </button>
          </div>
        </div>
      </header>

      <div className="bg-white border-b border-[#F0E8C8]">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="flex gap-1">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3.5 text-[13px] font-semibold border-b-2 transition-all ${activeTab === tab.id ? "border-[#1E1E1E] text-[#1E1E1E]" : "border-transparent text-[#434653] hover:text-[#131b2e]"}`}
              >
                <span className="material-symbols-outlined text-[17px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-20 gap-3 text-[#434653]">
            <div className="w-6 h-6 border-2 border-[#1E1E1E] border-t-transparent rounded-full animate-spin" />
            Cargando configuración…
          </div>
        ) : (
          <>
            {activeTab === "gallery" && <GalleryTab config={config} onChange={setConfig} />}
            {activeTab === "products" && <ProductsTab config={config} onChange={setConfig} />}
            {activeTab === "hero" && <HeroTab config={config} onChange={setConfig} />}
          </>
        )}
      </main>

      {saved && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-[13px] font-semibold px-6 py-3 rounded-full shadow-lg flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px]">check_circle</span>
          Guardado en Supabase — todos lo verán ahora
        </div>
      )}
    </div>
  );
}