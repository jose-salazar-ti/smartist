# Stack de Herramientas: Web de Productos Sublimables

Este documento detalla el stack tecnológico seleccionado para el desarrollo del e-commerce de productos sublimables, justificando cada herramienta desde una perspectiva de ingeniería de software senior.

---

## 1. Núcleo del Proyecto (Frontend y Backend)

### **Next.js (React Framework)**
*   **Rol:** Framework full-stack para el desarrollo tanto del frontend público como de las APIs y el panel administrativo.
*   **¿Por qué Next.js?**
    *   **Renderizado Híbrido:** Permite usar Server-Side Rendering (SSR) y Static Site Generation (SSG). Esto garantiza que las páginas de productos carguen de inmediato y sean indexadas perfectamente por los motores de búsqueda (SEO impecable).
    *   **App Router:** Facilita la creación de páginas y subpáginas con un sistema de carpetas intuitivo y optimizado.
    *   **API Integrada (Route Handlers):** Podemos crear nuestra API REST dentro del mismo proyecto sin necesidad de levantar un servidor backend separado, lo que facilita el despliegue y reduce costos.
    *   **Seguridad:** Permite realizar operaciones críticas (como conectarse a la base de datos o verificar pagos) en el servidor sin exponer claves secretas al navegador del cliente.

---

## 2. Base de Datos y Persistencia de Datos

### **PostgreSQL**
*   **Rol:** Base de datos relacional principal.
*   **¿Por qué PostgreSQL?**
    *   **Robustez y Consistencia:** Para transacciones de e-commerce (pagos, inventario, pedidos), la integridad referencial y el cumplimiento ACID de Postgres son cruciales para evitar pérdidas de datos.
    *   **Soporte JSONB:** Permite guardar configuraciones dinámicas de personalización (como fuentes, colores, coordenadas y textos elegidos por el usuario) en un campo de tipo JSON indexado sin forzar cambios rígidos en el esquema.

### **Prisma ORM o Drizzle ORM**
*   **Rol:** Mapeador Objeto-Relacional para interactuar con la base de datos utilizando código TypeScript tipado.
*   **¿Por qué?**
    *   **Seguridad de Tipos:** Detecta errores en las consultas de base de datos durante el desarrollo y no en producción.
    *   **Migraciones sencillas:** Genera y aplica los cambios en el esquema de la base de datos de manera automatizada y segura mediante archivos de migración declarativos.

---

## 3. Interfaz de Usuario y Diseño (UI/UX)

### **Tailwind CSS**
*   **Rol:** Framework de diseño rápido basado en clases de utilidad.
*   **¿Por qué?**
    *   **Consistencia visual:** Permite maquetar interfaces responsivas e interactivas de forma veloz directamente en el código de React.
    *   **Rendimiento:** Genera un archivo CSS final sumamente ligero porque solo incluye las clases utilizadas.

### **shadcn/ui**
*   **Rol:** Componentes de interfaz de usuario altamente personalizables y accesibles.
*   **¿Por qué?**
    *   A diferencia de librerías rígidas como Material UI, `shadcn/ui` copia el código directamente a tu proyecto, permitiéndote tener control absoluto sobre el estilo visual de los componentes (tablas, modales, alertas, selectores, etc.), ideal para el panel administrativo.

---

## 4. Gestión de Archivos (Clave para Sublimación)

### **AWS S3 o Cloudinary**
*   **Rol:** Almacenamiento externo en la nube de imágenes cargadas por los usuarios.
*   **¿Por qué?**
    *   **Escalabilidad:** Los archivos para sublimación suelen ser imágenes pesadas (alta resolución en PNG, PDF o TIFF). Almacenarlos en el servidor web ralentizaría la aplicación y consumiría espacio en disco costoso.
    *   **Cloudinary (Recomendado para visualización):** Permite redimensionar y optimizar las imágenes del cliente de manera automática en el frontend para mostrar previsualizaciones rápidas sin consumir ancho de banda excesivo.
        *   *¿Es de pago?* **Tiene una capa gratuita muy generosa** (25 créditos al mes, donde 1 crédito = 1 GB de almacenamiento o 1,000 transformaciones de imagen). Para empezar de forma gratuita es ideal.
    *   **AWS S3 (Recomendado para producción):** Ideal para almacenar el archivo original y pesado que el administrador descargará desde el panel de control para realizar la sublimación física.
        *   *¿Es de pago?* **Tiene una capa gratuita de 5 GB** durante los primeros 12 meses. Después de eso, el costo es de **pago por uso extremadamente bajo** (aproximadamente $0.023 USD al mes por cada Gigabyte almacenado). Pagarás solo centavos de dólar al inicio.
    *   **Google Drive (Alternativa Administrativa / Híbrida):**
        *   *¿Se puede usar?* **Sí, para el flujo de trabajo del administrador.**
        *   *Enfoque recomendado:* No se recomienda usar Google Drive para mostrar imágenes en la web pública (es lento y sus enlaces no son estables). Sin embargo, es excelente para que el servidor **suba automáticamente el diseño original en alta resolución a tu carpeta de Google Drive** una vez que se confirme la compra. Así, el administrador tiene los archivos organizados directamente en su Drive listo para imprimir.

---

## 5. Integración de Pagos y Seguridad

### **Stripe o Mercado Pago**
*   **Rol:** Procesador de pagos integrado en el flujo de caja.
*   **¿Por qué?**
    *   Ambas plataformas ofrecen SDKs modernos, APIs REST robustas y soporte para Webhooks (notificaciones del servidor al confirmar un pago), lo cual permite automatizar el cambio de estado del pedido a "Listo para producción" de forma segura.
