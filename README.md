# SublimArt Premium — Next.js Full-Stack

Tienda de sublimación personalizada con **formulario de cotización funcional**, **envío de correos automático**, **botón de WhatsApp dinámico** y diseño premium responsivo.

---

## 🚀 Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router) |
| Estilos | Tailwind CSS |
| Animaciones | Framer Motion |
| Formularios | React Hook Form + Zod |
| Email (opción A) | **Resend** *(recomendado para Vercel)* |
| Email (opción B) | Nodemailer / Gmail SMTP |
| Notificaciones | Sonner |
| Lenguaje | TypeScript |
| Deploy | Vercel |

---

## 📁 Estructura del proyecto

```
sublimeart-premium/
├── app/
│   ├── api/
│   │   └── contact/
│   │       └── route.ts        ← API Route backend (POST /api/contact)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── Navbar.tsx              ← Navegación sticky con menú mobile
│   ├── Hero.tsx                ← Hero con animaciones
│   ├── Products.tsx            ← Catálogo con botones "Personalizar"
│   ├── Process.tsx             ← Sección proceso creativo
│   ├── Gallery.tsx             ← Bento grid galería
│   ├── Testimonials.tsx        ← Reseñas de clientes
│   ├── QuoteForm.tsx           ← Formulario de cotización COMPLETO
│   ├── WhatsAppButton.tsx      ← Botón flotante WhatsApp dinámico
│   └── Footer.tsx              ← Footer completo con links funcionales
├── lib/
│   ├── config.ts               ← Configuración central del sitio
│   ├── email.ts                ← Servicio de email (Resend / Nodemailer)
│   └── validations.ts          ← Esquemas Zod + lista de productos
├── .env.example                ← Plantilla de variables de entorno
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```

---

## ⚙️ Instalación local

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus datos reales

# 3. Iniciar servidor de desarrollo
npm run dev
# Abre http://localhost:3000
```

---

## 🔐 Variables de entorno

Edita `.env.local` (nunca lo subas a GitHub):

```env
# ─── Proveedor de email ────────────────────────────────
EMAIL_PROVIDER=resend       # "resend" | "nodemailer"

# ─── Opción A: Resend (recomendado) ───────────────────
RESEND_API_KEY=re_xxxxxxxxxxxx
RESEND_FROM_EMAIL=cotizaciones@tudominio.com

# ─── Opción B: Gmail / Nodemailer ─────────────────────
EMAIL_USER=tu@gmail.com
EMAIL_PASS=xxxx xxxx xxxx xxxx   # Contraseña de app Google

# ─── Destino de cotizaciones ──────────────────────────
CONTACT_EMAIL=ventas@tutienda.com

# ─── WhatsApp (con código de país, sin espacios) ──────
NEXT_PUBLIC_WHATSAPP_NUMBER=5215512345678
```

---

## 📧 Configurar Resend (opción recomendada)

1. Crea cuenta gratuita en [resend.com](https://resend.com)
2. Ve a **API Keys** → genera una nueva clave
3. En **Domains** → agrega y verifica tu dominio (o usa `onboarding@resend.dev` para pruebas)
4. Pon la clave en `RESEND_API_KEY`
5. Pon tu email verificado en `RESEND_FROM_EMAIL`
6. Asegúrate de que `EMAIL_PROVIDER=resend`

> **Plan gratuito de Resend**: 3,000 emails/mes · 100/día · ideal para empezar.

---

## 📧 Configurar Gmail / Nodemailer (opción alternativa)

1. Ve a [myaccount.google.com/security](https://myaccount.google.com/security)
2. Activa **Verificación en 2 pasos**
3. Busca **Contraseñas de aplicación** → genera una para "Correo"
4. Copia los 16 caracteres en `EMAIL_PASS`
5. Pon tu correo en `EMAIL_USER`
6. Cambia `EMAIL_PROVIDER=nodemailer`

---

## 📱 Configurar WhatsApp

En `.env.local`:
```env
NEXT_PUBLIC_WHATSAPP_NUMBER=5215512345678
```

- Incluye código de país (52 = México, 57 = Colombia, 34 = España…)
- Sin espacios, guiones ni paréntesis
- Se usa en el botón flotante y en el footer

---

## 🌐 Deploy en Vercel

```bash
# Opción 1: Vercel CLI
npm i -g vercel
vercel --prod

# Opción 2: GitHub + Vercel (recomendado)
# 1. Sube el proyecto a un repo de GitHub
# 2. Ve a vercel.com → "New Project" → importa el repo
# 3. En "Environment Variables" añade todas las vars del .env.example
# 4. Click "Deploy" 🚀
```

### Variables en el dashboard de Vercel
En **Project Settings → Environment Variables**, agrega:

| Variable | Entorno |
|----------|---------|
| `RESEND_API_KEY` | Production, Preview |
| `RESEND_FROM_EMAIL` | Production, Preview |
| `CONTACT_EMAIL` | Production, Preview |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Production, Preview |
| `EMAIL_PROVIDER` | Production, Preview |

---

## ✏️ Personalización rápida

### Cambiar nombre/contacto del negocio
Edita **`lib/config.ts`**:
```ts
export const SITE_CONFIG = {
  name: "Tu Tienda",
  email: "tu@email.com",
  phone: "+52 55 XXXX XXXX",
  whatsappMessage: "Hola, quiero una cotización",
  // ...
};
```

### Agregar/quitar productos del formulario
Edita el array `PRODUCTS` en **`lib/validations.ts`**.

### Cambiar colores
Edita los tokens en **`tailwind.config.ts`** → sección `colors`.

---

## 🔒 Seguridad implementada

- ✅ Validación Zod en frontend **y** backend (doble capa)
- ✅ Sanitización de strings (strips HTML, límite de longitud)
- ✅ Rate limiting por IP: máx 3 envíos/minuto
- ✅ Credenciales SOLO en variables de entorno (nunca en el cliente)
- ✅ Variables `NEXT_PUBLIC_` solo para datos no sensibles
- ✅ Método POST único en el endpoint; GET devuelve 405

---

## 🛠️ Scripts disponibles

```bash
npm run dev      # Servidor local con hot reload
npm run build    # Compilar para producción
npm run start    # Iniciar servidor de producción
npm run lint     # Revisar código con ESLint
```

---

## 📋 Funcionalidades implementadas

| Feature | Estado |
|---------|--------|
| Formulario de cotización completo | ✅ |
| Validación React Hook Form + Zod | ✅ |
| API Route `/api/contact` | ✅ |
| Envío de email via Resend | ✅ |
| Envío de email via Nodemailer | ✅ |
| Template HTML del email | ✅ |
| Botón WhatsApp flotante dinámico | ✅ |
| Toast notifications (Sonner) | ✅ |
| Estado loading con spinner | ✅ |
| Confirmación visual post-envío | ✅ |
| Rate limiting básico | ✅ |
| Menú mobile responsive | ✅ |
| Animaciones Framer Motion | ✅ |
| Botones "Personalizar" → pre-llenan form | ✅ |
| Variables de entorno `.env` | ✅ |
| Compatible 100% con Vercel | ✅ |

---

## 🆘 Soporte

Si tienes problemas al configurar el proyecto, revisa:
1. Que todas las variables de entorno estén bien escritas en Vercel
2. Que el dominio esté verificado en Resend
3. Que usaste "Contraseña de aplicación" (no la contraseña normal) de Gmail
4. Revisa los logs en Vercel: **Project → Functions → Logs**
