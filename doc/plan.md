# Hoja de Ruta del Negocio: E-commerce de Sublimación

Esta hoja de ruta detalla el plan estratégico combinando el **desarrollo técnico de la web** y las **acciones de marketing/comunidad** para lanzar el negocio minimizando riesgos y acelerando el tiempo de venta.

---

## Fase 1: Marca, Validación y Comunidad (Semanas 1 y 2)
*El objetivo de esta fase es validar que las personas quieren tus diseños y empezar a acumular clientes interesados.*

### **Acciones de Negocio y Marketing:**
1.  **Definición de Marca:** Elige el nombre de la tienda y crea un logo sencillo y estético (puedes usar Canva).
2.  **Lanzamiento de Redes Sociales:** Crea cuentas en **TikTok** e **Instagram** enfocadas en creadores de contenido de procesos (detrás de cámaras, preparación de productos, empaques, etc.).
3.  **Compra del Dominio:** Adquiere tu dominio propio (ej. `tutienda.com` o `tutienda.pe`).
4.  **Embudos de Venta Manual:** Coloca un enlace en tu perfil de redes que dirija a los clientes a tu **WhatsApp**. Realiza tus primeras 5-10 ventas de forma manual para aprender el comportamiento del cliente.

### **Acciones de Desarrollo (En Paralelo):**
1.  Inicialización de la estructura del proyecto en Next.js con Tailwind CSS y TypeScript.
2.  Configuración de la Base de Datos PostgreSQL en la nube (Supabase / Neon) y conexión con Prisma ORM.

---

## Fase 2: Lanzamiento del MVP Web (Semanas 3 y 4)
*El objetivo es tener una plataforma profesional que te dé credibilidad y te permita recibir pedidos automatizados.*

### **Acciones de Negocio y Marketing:**
1.  Toma fotos reales en alta calidad de tus productos sublimados más exitosos.
2.  Redirige el enlace de tus redes sociales desde WhatsApp hacia tu **nueva tienda web**.

### **Acciones de Desarrollo:**
1.  **Página de Inicio (Landing Page):** Diseño premium que muestre tu propuesta de valor, categorías de productos y testimonios/garantías.
2.  **Catálogo de Productos (Fase 1):** Ficha de producto simple con galería de imágenes, selección de variantes (colores, tamaños) y botón para subir su archivo de diseño original.
3.  **Checkout y Pago Local (Yape/Plin):**
    *   Formulario de dirección de envío o retiro en taller.
    *   Pantalla de pago con tu código QR de Yape o Plin.
    *   Formulario para que el cliente suba la captura de pantalla de su pago (voucher).
4.  **Panel Administrativo (Fase 1):**
    *   Pestaña para ver pedidos entrantes, verificar el voucher de pago y descargar el diseño subido por el cliente.
5.  **Despliegue a Producción:** Publicación de la web en Vercel conectada a tu dominio propio.

---

## Fase 3: Automatización de Operaciones (Semanas 5 y 6)
*El objetivo de esta fase es ahorrar tu tiempo de trabajo administrativo a medida que las ventas diarias suben.*

### **Acciones de Negocio y Marketing:**
1.  Incentiva a los clientes que compren a subir historias en Instagram mostrando su unboxing a cambio de un descuento en su próxima compra.

### **Acciones de Desarrollo:**
1.  **Integración con Google Drive:** Subida automática de los diseños en alta resolución de los clientes desde la web a tu carpeta compartida de Google Drive al aprobar un pedido.
2.  **Validador de Resolución (DPI Check):** Programación del sistema en el frontend que analiza la calidad de la foto subida por el cliente y le advierte si saldrá borrosa.
3.  **Sistema de Cotizaciones Corporativas:** Formulario para pedidos mayoristas que calcula descuentos dinámicos por cantidad y genera un archivo PDF formal de cotización en el acto.
4.  **Emails Transaccionales:** Configuración de correos automáticos usando Resend (Confirmación de compra, Boleta de pago y envío).

---

## Fase 4: Experiencia Premium y Escala (Semana 7 en adelante)
*El objetivo es implementar las funciones avanzadas que harán que tu web sea única en el mercado.*

### **Acciones de Negocio y Marketing:**
1.  Campañas publicitarias de pago (Meta Ads / TikTok Ads) dirigidas al público corporativo (empresas y eventos) y de regalos emocionales.

### **Acciones de Desarrollo:**
1.  **Customizador Interactivo 3D + Realidad Aumentada (AR):** Implementación de `<model-viewer>` de Google. Los usuarios editan su taza en 3D en pantalla y la proyectan en su mesa real usando la cámara del celular.
2.  **Sorpresa Digital por Código QR:** Sistema de dedicatorias con música, globos, fotos y video accesible mediante el escaneo de un código QR impreso en el empaque.
3.  **Pasarela de Pago 100% Automática:** Conexión con Niubiz, Culqi o Mercado Pago para aceptar tarjetas de crédito de forma nativa.
4.  **Generador de Diseños por Inteligencia Artificial (Fase 2 avanzada):** Integración de DALL-E en el customizador para que los clientes creen ilustraciones con texto.
