# Estructura de Carpetas del Proyecto (Next.js Modular Monolith)

Para construir un sistema ordenado, escalable y preparado para una futura migración o integración con Flutter (V2), utilizaremos la siguiente estructura de directorios en Next.js utilizando TypeScript, Tailwind CSS y Prisma.

---

## Estructura General

```text
sublimacion/
├── prisma/                     # Configuración y esquemas de base de datos (PostgreSQL)
│   ├── schema.prisma           # Modelos de datos (User, Product, Order, etc.)
│   └── migrations/             # Historial de cambios de base de datos
├── public/                     # Archivos estáticos públicos (logos, imágenes base)
│   └── models/                 # Modelos 3D (.glb, .gltf) para el previsualizador
├── src/
│   ├── app/                    # Enrutador de Next.js (App Router)
│   ├── components/             # Componentes visuales de React
│   ├── lib/                    # Inicialización de clientes y utilidades del sistema
│   ├── services/               # Lógica de negocio pura (Base de Datos, Google Drive)
│   └── types/                  # Definición de tipos de TypeScript comunes
├── herramientas.md             # Documentación de herramientas
├── funciones.md                # Documentación de funcionalidades
├── package.json                # Dependencias del proyecto
├── tailwind.config.ts          # Configuración de Tailwind CSS
└── tsconfig.json               # Configuración de TypeScript
```

---

## Detalle de Carpetas en `src/`

### 1. `src/app/` (Rutas y API)
Utilizamos "Route Groups" (carpetas entre paréntesis como `(shop)` y `(admin)`) para separar visualmente las rutas de la tienda y del administrador, manteniendo URLs limpias.

```text
src/app/
├── (shop)/                     # --- RUTA DE TIENDA PÚBLICA ---
│   ├── page.tsx                # Página de inicio (Landing y catálogo)
│   ├── productos/[id]/         # Ficha del producto
│   ├── personalizar/[id]/      # El customizador visual interactivo (2D/3D)
│   ├── carrito/                # Resumen de compra
│   ├── checkout/               # Formulario de compra (Subida de voucher Yape/Plin)
│   ├── pedidos/[id]/           # Seguimiento paso a paso del pedido (Producción)
│   └── regalo/[id]/            # Página especial animada de la dedicatoria QR
│
├── (admin)/                    # --- PANEL DE ADMINISTRACIÓN PRIVADO ---
│   ├── admin/
│   │   ├── dashboard/          # Estadísticas de venta
│   │   ├── pedidos/            # Gestión de órdenes (Aprobar Yape, subir a Drive)
│   │   └── productos/          # Gestión de catálogo y stock
│
├── api/                        # --- ENDPOINTS REST (Usados por Web y Flutter V2) ---
│   ├── productos/              # GET (Listar tazas) / POST (Crear)
│   ├── pedidos/                # GET (Detalle) / POST (Crear pedido)
│   ├── upload/                 # Procesamiento y subida temporal de archivos
│   └── drive/                  # Trigger manual para subir archivos a Google Drive
│
├── layout.tsx                  # Layout global (HTML base, Google Fonts, etc.)
└── globals.css                 # Estilos globales y tokens de diseño
```

### 2. `src/components/` (Componentes React)
Separamos los componentes por su contexto de uso para evitar archivos gigantescos.

```text
src/components/
├── ui/                         # Componentes base e individuales de shadcn/ui
│   ├── button.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   └── table.tsx
├── shop/                       # Componentes específicos de la tienda
│   ├── product-card.tsx
│   └── cart-drawer.tsx
├── admin/                      # Componentes del panel administrativo
│   ├── order-row.tsx           # Fila de pedido con visor de comprobante de pago
│   └── stat-card.tsx
└── customizer/                 # Componentes del editor interactivo
    ├── canvas-editor.tsx       # Editor 2D (manipulación de textos e imágenes con Fabric.js)
    └── three-viewer.tsx        # Visor 3D y botón de Realidad Aumentada (model-viewer)
```

### 3. `src/lib/` (Configuraciones de Servicios)
Aquí inicializamos las conexiones a herramientas externas. Son configuraciones estáticas.

```text
src/lib/
├── db.ts                       # Cliente único de Prisma (conexión a PostgreSQL)
├── cloudinary.ts               # Configuración del SDK de Cloudinary
├── drive.ts                    # Configuración de Google Drive API (Cuenta de servicio)
└── utils.ts                    # Funciones utilitarias (formatear dinero, fechas, etc.)
```

### 4. `src/services/` (Lógica de Negocio - Backend Puro)
Esta carpeta es el corazón del backend. La tienda y la API REST llaman a estos servicios. **Si en el futuro migramos a una API en otro servidor, solo nos llevaremos esta carpeta.**

```text
src/services/
├── productService.ts           # Consultar productos de la base de datos
├── orderService.ts             # Crear pedidos, actualizar estado (Pago, Horno, etc.)
├── uploadService.ts            # Subir imágenes de personalización a Cloudinary
└── driveService.ts             # Subir el diseño original del cliente a Google Drive
```
