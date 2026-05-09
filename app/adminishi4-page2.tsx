"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    getSiteConfig,
    setSiteConfig,
    resetSiteConfig,
    processImage,
    DEFAULT_GALLERY,
    DEFAULT_PRODUCTS,
    type SiteConfig,
    type GalleryItemConfig,
} from "@/lib/imageStore";

// ─── Password ──────────────────────────────────────────────────────────────
// Cambia esta contraseña por la que quieras
const ADMIN_PASSWORD = "sublimeart2026";

// ─── Types ─────────────────────────────────────────────────────────────────
type Tab = "gallery" | "products" | "hero";

// ─── Utility ───────────────────────────────────────────────────────────────
function humanSize(base64: string) {
    const bytes = Math.round((base64.length * 3) / 4);
    return bytes > 1_000_000
        ? `${(bytes / 1_000_000).toFixed(1)} MB`
        : `${Math.round(bytes / 1024)} KB`;
}

// ─── Sub-components ────────────────────────────────────────────────────────

function ImageDropZone({
    imageUrl,
    onUpload,
    onRemove,
    label,
    aspectClass = "aspect-video",
}: {
    imageUrl?: string;
    onUpload: (base64: string) => void;
    onRemove: () => void;
    label: string;
    aspectClass?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleFile = async (file: File) => {
        if (!file.type.startsWith("image/")) {
            setError("Solo se permiten imágenes (JPG, PNG, WebP).");
            return;
        }
        if (file.size > 20_000_000) {
            setError("La imagen es demasiado grande (máx. 20 MB).");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const base64 = await processImage(file);
            onUpload(base64);
        } catch {
            setError("No se pudo procesar la imagen. Intenta con otra.");
        } finally {
            setLoading(false);
        }
    };

    const onDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) handleFile(file);
        },
        []
    );

    return (
        <div className="space-y-2">
            <p className="text-[11px] font-semibold text-[#434653] uppercase tracking-wider">
                {label}
            </p>

            {imageUrl ? (
                <div className={`relative ${aspectClass} rounded-2xl overflow-hidden group`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt={label}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                            onClick={() => inputRef.current?.click()}
                            className="bg-white text-[#0047ab] text-[12px] font-semibold px-4 py-2 rounded-full hover:bg-blue-50 transition-colors flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[14px]">
                                swap_horiz
                            </span>
                            Cambiar
                        </button>
                        <button
                            onClick={onRemove}
                            className="bg-white/20 text-white text-[12px] font-semibold px-4 py-2 rounded-full hover:bg-red-500 transition-colors flex items-center gap-1"
                        >
                            <span className="material-symbols-outlined text-[14px]">
                                delete
                            </span>
                            Quitar
                        </button>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white/80 text-[10px] px-2 py-0.5 rounded-full">
                        {humanSize(imageUrl)}
                    </div>
                </div>
            ) : (
                <div
                    onDragOver={(e) => {
                        e.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={onDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`${aspectClass} rounded-2xl border-2 border-dashed cursor-pointer flex flex-col items-center justify-center gap-2 transition-all
            ${dragging
                            ? "border-[#0047ab] bg-blue-50"
                            : "border-[#c3c6d5] hover:border-[#0047ab] hover:bg-[#f2f3ff]"
                        }`}
                >
                    {loading ? (
                        <>
                            <div className="w-6 h-6 border-2 border-[#0047ab] border-t-transparent rounded-full animate-spin" />
                            <p className="text-[12px] text-[#434653]">Procesando…</p>
                        </>
                    ) : (
                        <>
                            <span className="material-symbols-outlined text-[32px] text-[#737784]">
                                add_photo_alternate
                            </span>
                            <p className="text-[12px] text-[#434653] text-center px-4">
                                Arrastra una imagen aquí, o{" "}
                                <span className="text-[#0047ab] font-semibold">
                                    haz clic para seleccionar
                                </span>
                            </p>
                            <p className="text-[10px] text-[#737784]">JPG, PNG, WebP — máx. 20 MB</p>
                        </>
                    )}
                </div>
            )}

            {error && (
                <p className="text-[11px] text-red-500 flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">error</span>
                    {error}
                </p>
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

// ─── Gallery Tab ────────────────────────────────────────────────────────────

function GalleryTab({
    config,
    onChange,
}: {
    config: SiteConfig;
    onChange: (c: SiteConfig) => void;
}) {
    const updateItem = (id: number, patch: Partial<GalleryItemConfig>) => {
        onChange({
            ...config,
            gallery: config.gallery.map((g) =>
                g.id === id ? { ...g, ...patch } : g
            ),
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-[#eaedff] rounded-2xl p-4 text-[13px] text-[#0047ab] flex gap-3">
                <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">
                    info
                </span>
                <p>
                    Sube imágenes reales de tus trabajos para cada tarjeta de la galería.
                    Cuando no hay imagen, se muestra el fondo degradado original.
                    <strong> Recuerda guardar después de hacer cambios.</strong>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {config.gallery.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-[#dae2fd] p-5 space-y-4"
                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <span className="text-[10px] font-semibold text-[#0047ab] uppercase tracking-wider bg-[#dae2ff] px-2.5 py-1 rounded-full">
                                    Tarjeta #{item.id} {item.large ? "· Grande" : "· Pequeña"}
                                </span>
                            </div>
                            {item.imageUrl && (
                                <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">
                                        check_circle
                                    </span>
                                    Imagen activa
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[11px] font-semibold text-[#434653] uppercase tracking-wider mb-1">
                                    Título
                                </label>
                                <input
                                    value={item.title}
                                    onChange={(e) =>
                                        updateItem(item.id, { title: e.target.value })
                                    }
                                    className="w-full text-[13px] px-3 py-2 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#0047ab] bg-[#faf8ff]"
                                />
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-[#434653] uppercase tracking-wider mb-1">
                                    Categoría
                                </label>
                                <input
                                    value={item.badge}
                                    onChange={(e) =>
                                        updateItem(item.id, { badge: e.target.value })
                                    }
                                    className="w-full text-[13px] px-3 py-2 rounded-xl border border-[#c3c6d5] focus:outline-none focus:ring-2 focus:ring-[#0047ab] bg-[#faf8ff]"
                                />
                            </div>
                        </div>

                        <ImageDropZone
                            imageUrl={item.imageUrl}
                            label="Imagen del trabajo"
                            aspectClass={item.large ? "aspect-[4/3]" : "aspect-video"}
                            onUpload={(base64) => updateItem(item.id, { imageUrl: base64 })}
                            onRemove={() => updateItem(item.id, { imageUrl: undefined })}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Products Tab ───────────────────────────────────────────────────────────

function ProductsTab({
    config,
    onChange,
}: {
    config: SiteConfig;
    onChange: (c: SiteConfig) => void;
}) {
    const updateProduct = (name: string, imageUrl: string | undefined) => {
        onChange({
            ...config,
            products: config.products.map((p) =>
                p.name === name ? { ...p, imageUrl } : p
            ),
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-[#eaedff] rounded-2xl p-4 text-[13px] text-[#0047ab] flex gap-3">
                <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">
                    info
                </span>
                <p>
                    Sube fotos de cada producto. Aparecerán en las tarjetas de la sección
                    de productos. Recomendado: fondo blanco o transparente, formato cuadrado.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {config.products.map((product) => (
                    <div
                        key={product.name}
                        className="bg-white rounded-2xl border border-[#dae2fd] p-5 space-y-4"
                        style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-[#131b2e] text-[15px]">
                                {product.name}
                            </h3>
                            {product.imageUrl && (
                                <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">
                                        check_circle
                                    </span>
                                    Imagen activa
                                </span>
                            )}
                        </div>

                        <ImageDropZone
                            imageUrl={product.imageUrl}
                            label="Foto del producto"
                            aspectClass="aspect-square"
                            onUpload={(base64) => updateProduct(product.name, base64)}
                            onRemove={() => updateProduct(product.name, undefined)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

// ─── Hero Tab ───────────────────────────────────────────────────────────────

function HeroTab({
    config,
    onChange,
}: {
    config: SiteConfig;
    onChange: (c: SiteConfig) => void;
}) {
    return (
        <div className="space-y-6">
            <div className="bg-[#eaedff] rounded-2xl p-4 text-[13px] text-[#0047ab] flex gap-3">
                <span className="material-symbols-outlined text-[18px] flex-shrink-0 mt-0.5">
                    info
                </span>
                <p>
                    Sube una imagen de fondo para la sección principal (Hero). Usa una foto
                    horizontal de alta calidad, mínimo 1400 px de ancho. Si no hay imagen,
                    se muestra el fondo animado original.
                </p>
            </div>

            <div className="bg-white rounded-2xl border border-[#dae2fd] p-6 space-y-5"
                style={{ boxShadow: "0 2px 12px rgba(0,0,0,0.04)" }}>
                <ImageDropZone
                    imageUrl={config.hero.backgroundImageUrl}
                    label="Imagen de fondo del Hero"
                    aspectClass="aspect-[21/9]"
                    onUpload={(base64) =>
                        onChange({
                            ...config,
                            hero: { ...config.hero, backgroundImageUrl: base64 },
                        })
                    }
                    onRemove={() =>
                        onChange({ ...config, hero: { ...config.hero, backgroundImageUrl: undefined } })
                    }
                />
            </div>
        </div>
    );
}

// ─── Main Admin Page ────────────────────────────────────────────────────────

export default function AdminPage() {
    const [authed, setAuthed] = useState(false);
    const [passwordInput, setPasswordInput] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [activeTab, setActiveTab] = useState<Tab>("gallery");
    const [config, setConfig] = useState<SiteConfig>({
        gallery: DEFAULT_GALLERY,
        products: DEFAULT_PRODUCTS,
        hero: {},
    });
    const [saved, setSaved] = useState(false);
    const [resetConfirm, setResetConfirm] = useState(false);

    // Load config from localStorage on mount
    useEffect(() => {
        if (authed) {
            setConfig(getSiteConfig());
        }
    }, [authed]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordInput === ADMIN_PASSWORD) {
            setAuthed(true);
            setPasswordError("");
        } else {
            setPasswordError("Contraseña incorrecta. Intenta de nuevo.");
            setPasswordInput("");
        }
    };

    const handleSave = () => {
        setSiteConfig(config);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
    };

    const handleReset = () => {
        if (!resetConfirm) {
            setResetConfirm(true);
            setTimeout(() => setResetConfirm(false), 3000);
            return;
        }
        resetSiteConfig();
        setConfig(getSiteConfig());
        setResetConfirm(false);
    };

    const TABS: { id: Tab; label: string; icon: string }[] = [
        { id: "gallery", label: "Galería", icon: "photo_library" },
        { id: "products", label: "Productos", icon: "inventory_2" },
        { id: "hero", label: "Hero / Portada", icon: "image" },
    ];

    // ── Login Screen ──────────────────────────────────────────────────────────
    if (!authed) {
        return (
            <div className="min-h-screen bg-[#faf8ff] flex items-center justify-center p-4">
                <div
                    className="w-full max-w-sm bg-white rounded-[28px] p-8 space-y-6"
                    style={{ boxShadow: "0 20px 60px rgba(0,71,171,0.12)" }}
                >
                    <div className="text-center space-y-2">
                        <div className="inline-flex w-14 h-14 items-center justify-center bg-[#dae2ff] rounded-2xl mx-auto">
                            <span className="material-symbols-outlined text-[28px] text-[#0047ab]">
                                admin_panel_settings
                            </span>
                        </div>
                        <h1 className="text-[22px] font-bold text-[#131b2e] font-headline-lg">
                            Panel de Desarrollador
                        </h1>
                        <p className="text-[13px] text-[#434653]">SublimeArt Premium</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-semibold text-[#434653] uppercase tracking-wider mb-1.5">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                placeholder="••••••••••••"
                                autoFocus
                                className="w-full px-4 py-3 rounded-xl border border-[#c3c6d5] bg-[#faf8ff] text-[#131b2e] focus:outline-none focus:ring-2 focus:ring-[#0047ab] focus:border-[#0047ab] text-[14px] transition-all"
                            />
                            {passwordError && (
                                <p className="mt-1.5 text-[11px] text-red-500 flex items-center gap-1">
                                    <span className="material-symbols-outlined text-[13px]">error</span>
                                    {passwordError}
                                </p>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-[#0047ab] text-white font-semibold py-3 rounded-xl hover:bg-[#00327d] transition-colors text-[14px] flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-[18px]">lock_open</span>
                            Entrar
                        </button>
                    </form>

                    <p className="text-[10px] text-center text-[#737784]">
                        Esta página no es visible para tus visitantes.<br />
                        Accede en: <code className="bg-[#eaedff] px-1.5 py-0.5 rounded text-[#0047ab]">tudominio.com/admin</code>
                    </p>
                </div>
            </div>
        );
    }

    // ── Admin Dashboard ────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#f2f3ff]">
            {/* Header */}
            <header className="bg-white border-b border-[#dae2fd] sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-[#0047ab] rounded-xl flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[18px]">
                                admin_panel_settings
                            </span>
                        </div>
                        <div>
                            <h1 className="text-[15px] font-bold text-[#131b2e] leading-none">
                                Panel de Desarrollador
                            </h1>
                            <p className="text-[11px] text-[#434653]">SublimeArt Premium</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <a
                            href="/"
                            target="_blank"
                            className="text-[12px] text-[#434653] hover:text-[#0047ab] flex items-center gap-1 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[15px]">
                                open_in_new
                            </span>
                            Ver sitio
                        </a>

                        <button
                            onClick={handleReset}
                            className={`text-[12px] font-medium px-4 py-2 rounded-xl border transition-all flex items-center gap-1.5
                ${resetConfirm
                                    ? "border-red-400 bg-red-50 text-red-600"
                                    : "border-[#c3c6d5] text-[#434653] hover:border-red-300 hover:text-red-500"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[14px]">
                                restart_alt
                            </span>
                            {resetConfirm ? "¿Confirmar reset?" : "Reset"}
                        </button>

                        <button
                            onClick={handleSave}
                            className={`text-[13px] font-semibold px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5
                ${saved
                                    ? "bg-green-500 text-white"
                                    : "bg-[#0047ab] text-white hover:bg-[#00327d]"
                                }`}
                        >
                            <span className="material-symbols-outlined text-[16px]">
                                {saved ? "check" : "save"}
                            </span>
                            {saved ? "¡Guardado!" : "Guardar cambios"}
                        </button>
                    </div>
                </div>
            </header>

            {/* Tab navigation */}
            <div className="bg-white border-b border-[#dae2fd]">
                <div className="max-w-5xl mx-auto px-4 md:px-6">
                    <div className="flex gap-1">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-5 py-3.5 text-[13px] font-semibold border-b-2 transition-all
                  ${activeTab === tab.id
                                        ? "border-[#0047ab] text-[#0047ab]"
                                        : "border-transparent text-[#434653] hover:text-[#131b2e]"
                                    }`}
                            >
                                <span className="material-symbols-outlined text-[17px]">
                                    {tab.icon}
                                </span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <main className="max-w-5xl mx-auto px-4 md:px-6 py-8">
                {activeTab === "gallery" && (
                    <GalleryTab config={config} onChange={setConfig} />
                )}
                {activeTab === "products" && (
                    <ProductsTab config={config} onChange={setConfig} />
                )}
                {activeTab === "hero" && (
                    <HeroTab config={config} onChange={setConfig} />
                )}
            </main>

            {/* Floating save banner */}
            {saved && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white text-[13px] font-semibold px-6 py-3 rounded-full shadow-lg flex items-center gap-2 animate-fade-in">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    Cambios guardados correctamente
                </div>
            )}
        </div>
    );
}