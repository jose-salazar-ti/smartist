# Plan Detallado de Implementación por Fases (Next.js & PostgreSQL)

Este documento contiene la hoja de ruta de ingeniería de software, detallando los archivos, componentes, base de datos y tareas técnicas que implementaremos paso a paso para cada una de las 4 fases del proyecto.

---

## FASE 1: Estructura Base, Entorno y Modelado (Semana 1-2)
*Objetivo:* Instalar las herramientas en tu computadora, levantar la base de datos PostgreSQL y configurar el esquema relacional con Prisma.

### 1.1 Configuración del Entorno de Desarrollo (Local)
*   **Instalación global:** Instalar Node.js LTS y `pnpm` en tu sistema operativo usando `winget`.
*   **Inicialización:** Ejecutar `pnpm create next-app@latest` con TypeScript, Tailwind CSS, ESLint y App Router en la carpeta raíz.
*   **Estructura de Carpetas:** Crear las carpetas de nuestro Monolito Modular: `src/components`, `src/lib`, `src/services`, `src/types` y `doc/`.

### 1.2 Base de Datos (PostgreSQL & Prisma)
*   **Instalar Prisma:** Agregar Prisma CLI como dependencia de desarrollo: `pnpm add -D prisma` e inicializarlo con `pnpm prisma init`.
*   **Modelado del Esquema (`prisma/schema.prisma`):**
    *   Definir el modelo `User` con roles (`CLIENT` y `ADMIN`).
    *   Definir el modelo `Product` (taza, remera, gorra).
    *   Definir el modelo `ProductVariant` (para manejar combinaciones de color/talla/precio).
    *   Definir el modelo `Order` (pedidos) y `OrderItem` (detalle).
    *   Definir el modelo `Customization` (donde se guardará la imagen del cliente y las opciones).
*   **Migración:** Ejecutar la migración inicial para crear las tablas físicas en tu PostgreSQL local o en Supabase: `pnpm prisma migrate dev --name init`.

### 1.3 Inicialización de UI y Estilos (shadcn/ui)
*   **Inicializar Componentes:** Ejecutar `pnpm dlx shadcn-ui@latest init` para configurar las variables de color y temas.
*   **Componentes Reutilizables:** Agregar los componentes base desde la terminal:
    *   `pnpm dlx shadcn-ui@latest add button card dialog input label table select toast`

---

## FASE 2: Landing Page, Catálogo y Pago por Yape/Plin MVP (Semana 3-4)
*Objetivo:* Crear la tienda pública básica y el panel de control del administrador para recibir y procesar las primeras ventas reales con Yape o Plin.

### 2.1 Página de Inicio (Tienda Pública)
*   **Archivos:** `src/app/(shop)/page.tsx`
*   **Componentes:**
    *   `Navbar` y `Footer` responsivos.
    *   `HeroSection` (Presentación visual impactante).
    *   `ProductGrid` (Lista los productos llamando al servicio de base de datos).
    *   `ProductCard` (Foto del producto, precio, botón de ver).

### 2.2 Ficha de Producto y Carga de Archivo
*   **Archivos:** `src/app/(shop)/productos/[id]/page.tsx`
*   **Lógica:**
    *   El usuario selecciona la variante (ej. Taza Blanca).
    *   Caja de carga de imagen tradicional (`<input type="file" />`) para que el cliente suba su imagen o foto en alta calidad.
    *   Botón "Agregar al Carrito".
*   **Servicio Backend (`src/services/productService.ts`):** Función `getProductById(id)` para consultar los datos en PostgreSQL.

### 2.3 Carrito y Checkout con QR de Yape/Plin (Manual)
*   **Carrito (`src/app/(shop)/carrito/page.tsx`):** Lista los productos seleccionados y las imágenes adjuntas.
*   **Checkout (`src/app/(shop)/checkout/page.tsx`):**
    *   Formulario de dirección de entrega o selección de "Retiro en Taller" (costo S/ 0).
    *   Muestra el código QR de tu Yape y Plin para escanear en pantalla.
    *   Campo para subir la captura de pantalla de la transferencia (voucher).
    *   Botón "Confirmar Pedido".
*   **API Endpoint (`src/app/api/pedidos/route.ts`):** Recibe los datos y guarda la orden en la base de datos con estado `PENDING_VERIFICATION`.

### 2.4 Panel Administrativo (Procesamiento de Pedidos V1)
*   **Dashboard (`src/app/(admin)/admin/dashboard/page.tsx`):** Estadísticas básicas de dinero facturado y cantidad de pedidos.
*   **Pedidos (`src/app/(admin)/admin/pedidos/page.tsx`):**
    *   Tabla con todos los pedidos.
    *   Diálogo para hacer clic y ver la captura del Yape/Plin subida por el cliente.
    *   Botón "Aprobar Pago" (cambia el estado de la orden a `PAID` e inicia el flujo).
    *   Botón para descargar el diseño original cargado por el cliente para imprimirlo.

---

## FASE 3: Automatización de Operaciones e Integración de Google Drive (Semana 5-6)
*Objetivo:* Ahorrar tu tiempo operativo en el taller subiendo automáticamente las imágenes de alta resolución de los clientes a tu Google Drive personal.

### 3.1 Integración con Google Drive API
*   **Configuración:** Crear una Cuenta de Servicio en Google Cloud Console, habilitar la API de Google Drive y generar la clave secreta JSON.
*   **Servicio (`src/services/driveService.ts`):**
    *   Inicializa la conexión segura de Google Drive usando `src/lib/drive.ts`.
    *   Función `uploadFileToDrive(fileName, fileStream, folderName)`:
        *   Crea una carpeta con el número de pedido (ej. `Pedido #1024 - Juan Perez`) dentro de una carpeta principal en tu Drive.
        *   Sube el diseño original del cliente en esa carpeta de forma automática.
*   **Automatización:** El servidor de Next.js ejecuta esta función automáticamente en segundo plano cuando el administrador presiona el botón "Aprobar Pago" en su panel.

### 3.2 Validador Automático de Calidad (DPI Checker)
*   **Componente:** `src/components/shop/dpi-checker.tsx`
*   **Lógica en Frontend:**
    *   Al seleccionar una imagen, se utiliza código JavaScript en el navegador para leer las dimensiones reales de la foto en píxeles.
    *   Calculamos el tamaño físico del producto final (ej. una taza mide aprox. 20 cm x 9.5 cm de área imprimible).
    *   Calculamos la densidad de píxeles: `DPI = Píxeles / Pulgadas`.
    *   Si el resultado es menor a 150 DPI, muestra una advertencia en color rojo: *"Tu imagen tiene baja resolución. Recomendamos subir una imagen de mayor tamaño para evitar borrosidad al sublimar."*

### 3.3 Generador Automático de Cotizaciones en PDF
*   **Archivos:** `src/app/(shop)/cotizaciones/` y `src/services/pdfService.ts`
*   **Lógica:**
    *   Para clientes mayoristas, la web genera un archivo PDF formal al instante usando la librería `jspdf` o `pdfkit`.
    *   El PDF incluye: Logo de tu marca, datos del cliente, tabla de precios según la escala de descuentos (ej. 10% de descuento por más de 50 tazas), imagen de previsualización del diseño y plazos de entrega.
    *   El cliente recibe el PDF y un botón para contactarte a tu WhatsApp para cerrar la venta.

---

## FASE 4: Experiencia Premium, Customizador 3D y Realidad Aumentada (Semana 7+)
*Objetivo:* Incorporar la tecnología visual más avanzada en la web para lograr el efecto "WOW", aumentar tus ventas y automatizar la personalización.

### 4.1 Visor 3D y Realidad Aumentada (AR)
*   **Tecnología:** Google `<model-viewer>` (librería web ligera).
*   **Archivos:** `src/components/customizer/three-viewer.tsx`
*   **Implementación:**
    *   Cargamos un modelo 3D estático de la taza en formato `.glb`.
    *   Utilizamos Canvas HTML5 para tomar la imagen subida por el cliente y aplicarla dinámicamente como textura (envoltura) sobre el cilindro de la taza 3D.
    *   Habilitamos el botón de Realidad Aumentada (`ar-button`). Cuando el usuario presiona el botón en su celular, la web le solicita usar la cámara nativa de Android/iOS y proyecta la taza giratoria sobre su mesa física.

### 4.2 Sorpresa Digital interactiva por Código QR
*   **Generador de QR (`src/services/qrService.ts`):** Genera una imagen de código QR que apunta a `tutienda.com/regalo/[id]` para cada pedido de regalo.
*   **La Sorpresa (`src/app/(shop)/regalo/[id]/page.tsx`):**
    *   Una página Next.js animada usando la librería **Framer Motion**.
    *   Al escanear el QR, muestra confeti, globos flotando y reproduce la dedicatoria en video, audio o carta que el comprador le dejó al destinatario.

### 4.3 Diseñador Asistido por Inteligencia Artificial (Generador IA)
*   **API de DALL-E/Stable Diffusion (`src/app/api/ai-generate/route.ts`):** 
    *   Conexión con la API de OpenAI.
    *   El cliente escribe un texto (prompt) en el customizador y el servidor le devuelve 3 imágenes generadas por IA listas para ser posicionadas sobre el modelo 3D del producto.
