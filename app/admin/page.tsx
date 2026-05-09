"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    getSiteConfig,
    setSiteConfig,
    uploadImage,
    deleteImage,
    DEFAULT_GALLERY,
    DEFAULT_PRODUCTS,
    type SiteConfig,
    type GalleryItemConfig,
} from "@/lib/imageStore";

// ─── Cambia esta contraseña ────────────────────────────────────────────────
const ADMIN_PASSWORD = "quesitorrallado32";

type Tab = "gallery" | "products" | "hero";

// ─── Dropzone ────────────────────────────────────────────────────────────────

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
    }, []);

    return (
        <div className="space-y-2">
            <p className="text-[11px] font-semibold text-[#434653] uppercase tracking-wider">{label}</p>

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
                                className="bg-white text-[#0047ab] text-[12px] font-semibold px-4 py-2 rounded-full hover:bg-blue-50 transition-colors flex items-center gap-1"
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
            ${dragging ? "border-[#0047ab] bg-blue-50" : "border-[#c3c6d5] hover:border-[#0047ab] hover:bg-[#f2f3ff]"}`}
                >
                    {uploading ? (
                        <>
                            <div className="w-7 h-7 border-2 border-[#0047ab] border-t-transparent rounded-full animate-spin" />
                            <p className="text-[12px] text-[#434653]">Subiendo a Supabase…</p>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[32px] text-[#737784]">cloud_upload</span>
                            <p className="text-[12px] text-[#434653] text-center px-4">
                                Arrastra aquí, o{" "}
                                <span className="text-[#0047ab] font-semibold">selecciona una imagen</span>
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

// ─── Gallery Tab ─────────────────────────────────────────────────────────────

function GalleryTab({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
    const [uploading, setUploading] = useState<number | null>(null);
    const [error, setError] = useState("");

    const handleUpload = async (id: number, file: File) => {
        setUploading(id);
        setError("");
        try {
            const url = await uploadImage(file, `gallery/item-${id}.jpg`);
            onChange({
                ...config,
                gallery: config.gallery.map((g) => g.id === id ? { ...g, imageUrl: url } : g),
            });
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Error al subir imagen");
        } finally {
            setUploading(null);
        }
    };

    const handleRemove = async (id: number) => {
        await deleteImage(`gallery/item-${id}.jpg`);
        onChange({
            ...config,
            gallery: config.gallery.map((g) => g.id === id ? { ...g, imageUrl: undefined } : g),
        });
    };

    const updateMeta = (id: number, patch: Partial<GalleryItemConfig>) => {
        onChange({ ...config, gallery: config.gallery.map((g) => g.id === id ? { ...g, ...patch } : g) });
    };

    return (
        <div className="space-y-6">
            <div className="bg-[#eaedff] rounded-2xl p-4 text-[13px] text-[#0047ab] flex gap-3">
                <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">cloud</span>
                <p>Las imágenes se suben a <strong>Supabase Storage</strong> y son visibles para todos los visitantes. Recuerda guardar después de subir.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[12px] text-red-600 flex gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {config.gallery.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border border-[#dae2fd] p-5 space-y-4"
                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                        <div className="flex items-start justify-between">
                            <span className="text-[10px] font-semibold text-[#0047ab] uppercase tracking-wider bg-[#dae2ff] px-2.5 py-1 rounded-full">
                                Tarjeta #{item.id} {item.large ? "· Grande" : "· Pequeña"}
                            </span>
                            {item.imageUrl && (
                                <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                    En Supabase ✓
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-[#434653] uppercase tracking-wider mb-1">Título</label>
                                <input value={item.title} onChange={(e) => updateMeta(item.id, { title: e.target.value })}
                                    className="w-full text-[13px] px-3 py-2 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#0047ab] bg-[#faf8ff]" />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-[#434653] uppercase tracking-wider mb-1">Categoría</label>
                                <input value={item.badge} onChange={(e) => updateMeta(item.id, { badge: e.target.value })}
                                    className="w-full text-[13px] px-3 py-2 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#0047ab] bg-[#faf8ff]" />
                            </div>
                        </div>

                        <ImageDropZone
                            imageUrl={item.imageUrl}
                            label="Imagen del trabajo"
                            aspectClass={item.large ? "aspect-[4/3]" : "aspect-video"}
                            uploading={uploading === item.id}
                            onUpload={(file) => handleUpload(item.id, file)}
                            onRemove={() => handleRemove(item.id)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Products Tab ─────────────────────────────────────────────────────────────

function ProductsTab({ config, onChange }: { config: SiteConfig; onChange: (c: SiteConfig) => void }) {
    const [uploading, setUploading] = useState<string | null>(null);
    const [error, setError] = useState("");

    const slug = (name: string) => name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const handleUpload = async (name: string, file: File) => {
        setUploading(name);
        setError("");
        try {
            const url = await uploadImage(file, `products/${slug(name)}.jpg`);
            onChange({ ...config, products: config.products.map((p) => p.name === name ? { ...p, imageUrl: url } : p) });
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Error al subir imagen");
        } finally {
            setUploading(null);
        }
    };

    const handleRemove = async (name: string) => {
        await deleteImage(`products/${slug(name)}.jpg`);
        onChange({ ...config, products: config.products.map((p) => p.name === name ? { ...p, imageUrl: undefined } : p) });
    };

    return (
        <div className="space-y-6">
            <div className="bg-[#eaedff] rounded-2xl p-4 text-[13px] text-[#0047ab] flex gap-3">
                <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">info</span>
                <p>Sube fotos de cada producto. Recomendado: fondo blanco, formato cuadrado.</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[12px] text-red-600 flex gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {config.products.map((product) => (
                    <div key={product.name} className="bg-white rounded-2xl border border-[#dae2fd] p-5 space-y-4"
                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-[#131b2e] text-[15px]">{product.name}</h3>
                            {product.imageUrl && (
                                <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                                    En Supabase ✓
                                </span>
                            )}
                        </div>
                        <ImageDropZone
                            imageUrl={product.imageUrl}
                            label="Foto del producto"
                            aspectClass="aspect-square"
                            uploading={uploading === product.name}
                            onUpload={(file) => handleUpload(product.name, file)}
                            onRemove={() => handleRemove(product.name)}
                        />
                    </div>
                ))}
            </div>
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
            <div className="bg-[#eaedff] rounded-2xl p-4 text-[13px] text-[#0047ab] flex gap-3">
                <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">info</span>
                <p>Imagen de fondo para la sección principal. Usa foto horizontal, mín. 1400 px de ancho.</p>
            </div>
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-[12px] text-red-600 flex gap-2">
                    <span className="material-symbols-outlined text-[16px]">error</span>
                    {error}
                </div>
            )}
            <div className="bg-white rounded-2xl border border-[#dae2fd] p-6"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
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

// ─── Main ─────────────────────────────────────────────────────────────────────

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
        setConfig({ gallery: DEFAULT_GALLERY, products: DEFAULT_PRODUCTS, hero: {} });
        await setSiteConfig({ gallery: DEFAULT_GALLERY, products: DEFAULT_PRODUCTS, hero: {} });
    };

    const TABS: { id: Tab; label: string; icon: string }[] = [
        { id: "gallery", label: "Galería", icon: "photo_library" },
        { id: "products", label: "Productos", icon: "inventory_2" },
        { id: "hero", label: "Hero / Portada", icon: "image" },
    ];

    // ── Login ──────────────────────────────────────────────────────────────────
    if (!authed) {
        return (
            <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-4">
                <div className="w-full max-w-sm bg-white rounded-[28px] p-8 space-y-6"
                    style={{ boxShadow: "0 20px 60px rgba(0,71,171,0.12)" }}>
                    <div className="text-center space-y-2">
                        <div className="inline-flex w-14 h-14 items-center justify-center bg-[#dae2ff] rounded-2xl mx-auto">
                            <span className="material-symbols-outlined text-[28px] text-[#0047ab]">admin_panel_settings</span>
                        </div>
                        <h1 className="text-[22px] font-bold text-[#131b2e]">Panel de Desarrollador</h1>
                        <p className="text-[13px] text-[#434653]">SublimeArt Premium</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-semibold text-[#434653] uppercase tracking-wider mb-1.5">Contraseña</label>
                            <input type="password" value={passwordInput} onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="••••••••••••" autoFocus
                                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d5] bg-[#faf8ff] text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047ab] text-[14px] transition-all" />
                            {passwordError && (
                                <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">error</span>
                                    {passwordError}
                                </p>
                            )}
                        </div>
                        <button type="submit"
                            className="w-full bg-[#0047ab] text-white font-semibold py-3 rounded-xl hover:bg-[#00327d] transition-colors text-[14px] flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">lock_open</span>
                            Entrar
                        </button>
                    </form>

                    <p className="text-[10px] text-center text-[#737784]">
                        Accede en: <code className="bg-[#eaedff] px-1.5 py-0.5 rounded text-[#0047ab]">tudominio.com/admin</code>
                    </p>
                </div>
            </div>
        );
    }

    // ── Dashboard ─────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f2f3ff]">
            <header className="bg-white border-b border-[#dae2fd] sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#0047ab] rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[18px]">admin_panel_settings</span>
                        </div>
                        <div>
                            <h1 className="text-[15px] font-bold text-[#131b2e] leading-none">Panel de Desarrollador</h1>
                            <p className="text-[11px] text-[#434653]">SublimeArt Premium · Supabase</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <a href="/" target="_blank"
                            className="text-[12px] text-[#434653] hover:text-[#0047ab] flex items-center gap-1 transition-colors">
                            <span className="material-symbols-outlined text-[15px]">open_in_new</span>
                            Ver sitio
                        </a>
                        <button onClick={handleReset}
                            className={`text-[12px] font-medium px-4 py-2 rounded-xl border transition-all flex items-center gap-1.5
                ${resetConfirm ? "border-red-400 bg-red-50 text-red-600" : "border-[#c3c6d5] text-[#434653] hover:border-red-300 hover:text-red-500"}`}>
                            <span className="material-symbols-outlined text-[14px]">restart_alt</span>
                            {resetConfirm ? "¿Confirmar?" : "Reset"}
                        </button>
                        <button onClick={handleSave} disabled={saving}
                            className={`text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5
                ${saved ? "bg-green-500 text-white" : "bg-[#0047ab] text-white hover:bg-[#00327d] disabled:opacity-60"}`}>
                            <span className="material-symbols-outlined text-[16px]">{saved ? "check" : saving ? "hourglass_empty" : "save"}</span>
                            {saved ? "¡Guardado!" : saving ? "Guardando…" : "Guardar cambios"}
                        </button>
                    </div>
                </div>
            </header>

            <div className="bg-white border-b border-[#dae2fd]">
                <div className="max-w-5xl mx-auto px-4 md:px-6">
                    <div className="flex gap-1">
                        {TABS.map((tab) => (
                            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3.5 text-[13px] font-semibold border-b-2 transition-all
                  ${activeTab === tab.id ? "border-[#0047ab] text-[#0047ab]" : "border-transparent text-[#434653] hover:text-[#131b2e]"}`}>
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
                        <div className="w-6 h-6 border-2 border-[#0047ab] border-t-transparent rounded-full animate-spin" />
                        Cargando configuración desde Supabase…
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
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-[13px] font-semibold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Guardado en Supabase — todos lo verán ahora
                </div>
            )}
        </div>
    );
}