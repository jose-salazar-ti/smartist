# Guía de Seguridad y Buenas Prácticas (E-commerce de Sublimación)

La seguridad es un pilar fundamental en cualquier aplicación que maneje información de usuarios, subida de archivos y transacciones de dinero. Como desarrolladores, debemos implementar la seguridad en capas (defensa en profundidad).

Aquí tienes el diseño de seguridad que implementaremos en nuestro monolito de Next.js y base de datos PostgreSQL.

---

## 1. Autenticación y Control de Acceso (¿Quién entra a dónde?)

### **Auth.js (NextAuth.js)**
*   Utilizaremos el estándar de la industria para Next.js: **NextAuth.js** para gestionar el registro, inicio de sesión y sesiones de usuarios.
*   **Sesiones seguras:** Las sesiones se almacenan en **HTTP-Only Cookies** cifradas. Estas cookies no pueden ser leídas por código JavaScript en el navegador, lo que previene ataques de robo de sesión tipo XSS (Cross-Site Scripting).

### **Middleware de Next.js (Protección de Rutas)**
*   Crearemos un archivo `middleware.ts` en la raíz del proyecto.
*   Este archivo interceptará cualquier petición a rutas administrativas (ej. `/admin/:path*`). Si un usuario intenta entrar y su rol no es `ADMIN`, el sistema lo redirigirá inmediatamente a la página de login. La validación ocurre en el servidor antes de renderizar cualquier página.

---

## 2. Seguridad en la Subida de Archivos (Punto Crítico en Sublimación)
Dado que los usuarios subirán sus propios diseños en alta resolución, este es un vector de ataque común (subida de scripts maliciosos, saturación del disco, etc.).

*   **Validación de Tipo de Archivo (MIME Type):** En el backend, verificaremos que el archivo sea estrictamente una imagen o documento permitido (ej. `image/png`, `image/jpeg`, `application/pdf`). No confiaremos solo en la extensión del archivo (ej. cambiar `.exe` a `.png`).
*   **Límite de Tamaño de Archivo:** Restringiremos las subidas a un tamaño máximo razonable (ej. 20 MB) tanto en el cliente como en el servidor para evitar ataques de Denegación de Servicio (DoS) por llenado de memoria.
*   **Almacenamiento Seguro (URLs Firmadas / Presigned URLs):** Las imágenes no se guardarán en nuestro servidor web. En su lugar, el cliente solicitará una "URL firmada temporal" a nuestro backend, y subirá el archivo directamente a Cloudinary o AWS S3 de forma segura.

---

## 3. Seguridad en los Pagos (PCI-DSS Compliance)
Para evitar multas y responsabilidades legales, nunca debemos almacenar información financiera en nuestra base de datos.

*   **Tokenización de Tarjetas:** Ni las tarjetas de crédito ni sus códigos de seguridad (CVV) tocarán nuestro servidor. Pasarelas como Stripe, Culqi o Niubiz proveen formularios seguros que capturan los datos y nos devuelven un *Token* seguro. Nosotros solo guardaremos ese token para procesar el cobro.
*   **Firma de Webhooks:** Cuando la pasarela de pagos confirme una compra enviando una petición a nuestra API, verificaremos la **firma criptográfica** de esa petición usando una clave secreta compartida. Esto evita que atacantes simulen pagos exitosos falsificando peticiones HTTP.

---

## 4. Validación de Datos (Zod)
Nunca debemos confiar en la información que viene del cliente (el navegador). Un atacante puede saltarse las validaciones del formulario visual.

*   **Esquemas con Zod:** Utilizaremos la librería **Zod** para validar estrictamente la estructura de todos los datos que ingresen a nuestras APIs o Server Actions.
*   *Ejemplo:* Si el usuario envía un pedido, Zod verificará en el servidor que el correo tenga formato de correo, que las cantidades sean números enteros positivos y que no haya texto malicioso inyectado.

---

## 5. Seguridad de Base de Datos y Variables de Entorno

*   **Prevención de Inyección SQL:** Al usar **Prisma ORM**, todas las consultas a PostgreSQL se parametrizan automáticamente por defecto. Esto hace que sea virtualmente imposible sufrir ataques de inyección SQL.
*   **Variables de Entorno Seguras (`.env`):** Las contraseñas de la base de datos, claves secretas de pago y accesos a Google Drive se almacenarán en un archivo `.env` que estará en el listado de `.gitignore` (nunca se subirá a GitHub). Compartiremos un archivo `.env.example` con los nombres de las variables vacías para desarrollo.

---

## 6. Cabeceras de Seguridad HTTP (CORS y CSP)
Configuraremos Next.js para enviar cabeceras de seguridad automáticas:
*   **CORS (Cross-Origin Resource Sharing):** Restringiremos qué dominios pueden hacer peticiones a nuestra API para evitar robos de datos desde webs externas maliciosas.
*   **Content Security Policy (CSP):** Controla qué scripts, imágenes y conexiones puede cargar el navegador, mitigando ataques de inyección de scripts.
