import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sublimax Navojoa — Impresión Personalizada",
  description:
    "Servicio de sublimación de alta gama para empresas, eventos y regalos personales. Tazas, termos, playeras, mousepads y más con tu diseño.",
  keywords: [
    "sublimación",
    "personalización",
    "tazas personalizadas",
    "termos",
    "playeras",
    "regalos corporativos",
  ],
  openGraph: {
    title: "Sublimax Navojoa",
    description: "Convertimos tus ideas en productos únicos",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`light ${inter.variable} ${montserrat.variable}`}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-surface text-on-surface font-body-md" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "var(--font-inter), sans-serif",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
