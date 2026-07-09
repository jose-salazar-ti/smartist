-- ============================================================
-- Smartist - Estructura de Base de Datos (PostgreSQL / Supabase)
-- Generado desde: prisma/schema.prisma
-- Fecha: 2026-06-11
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- TIPOS ENUMERADOS
-- ────────────────────────────────────────────────────────────

CREATE TYPE "Role" AS ENUM ('CLIENT', 'ADMIN');

CREATE TYPE "OrderStatus" AS ENUM (
  'PENDING',     -- Pedido creado, esperando pago
  'PAID',        -- Pago validado
  'PROCESSING',  -- En producción / sublimación
  'SHIPPED',     -- Enviado / listo para recojo
  'CANCELLED'    -- Cancelado
);


-- ────────────────────────────────────────────────────────────
-- TABLA: User
-- Usuarios del sistema (clientes y administradores)
-- ────────────────────────────────────────────────────────────

CREATE TABLE "User" (
  "id"           TEXT         NOT NULL DEFAULT gen_random_uuid(),
  "email"        TEXT         NOT NULL,
  "passwordHash" TEXT         NOT NULL,
  "name"         TEXT         NOT NULL,
  "role"         "Role"       NOT NULL DEFAULT 'CLIENT',
  "createdAt"    TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User" ("email");


-- ────────────────────────────────────────────────────────────
-- TABLA: Product
-- Catálogo de productos (tazas, camisetas, mousepads, etc.)
-- ────────────────────────────────────────────────────────────

CREATE TABLE "Product" (
  "id"             TEXT         NOT NULL DEFAULT gen_random_uuid(),
  "name"           TEXT         NOT NULL,
  "description"    TEXT         NOT NULL,
  "category"       TEXT         NOT NULL,            -- Ej: "Tazas", "Camisetas", "Oficina"
  "isCustomizable" BOOLEAN      NOT NULL DEFAULT false,
  "isActive"       BOOLEAN      NOT NULL DEFAULT true, -- false = producto desactivado (no aparece en tienda)
  "createdAt"      TIMESTAMPTZ  NOT NULL DEFAULT now(),

  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);


-- ────────────────────────────────────────────────────────────
-- TABLA: ProductVariant
-- Variantes de cada producto (tamaño, color, etc.)
-- Cada variante tiene su propio precio, SKU, stock e imagen.
-- ────────────────────────────────────────────────────────────

CREATE TABLE "ProductVariant" (
  "id"        TEXT           NOT NULL DEFAULT gen_random_uuid(),
  "productId" TEXT           NOT NULL,
  "sku"       TEXT           NOT NULL,                -- Código único de inventario
  "title"     TEXT           NOT NULL,                -- Ej: "Taza Blanca 11oz", "Camiseta L"
  "price"     DECIMAL(10,2)  NOT NULL,
  "stock"     INTEGER        NOT NULL DEFAULT 0,
  "imageUrl"  TEXT,                                   -- URL de la imagen (nullable)

  CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "ProductVariant_productId_fkey"
    FOREIGN KEY ("productId") REFERENCES "Product"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "ProductVariant_sku_key" ON "ProductVariant" ("sku");


-- ────────────────────────────────────────────────────────────
-- TABLA: Order
-- Pedidos de los clientes
-- ────────────────────────────────────────────────────────────

CREATE TABLE "Order" (
  "id"               TEXT          NOT NULL DEFAULT gen_random_uuid(),
  "userId"           TEXT,                                  -- Nullable (pedidos de invitados)
  "status"           "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "totalAmount"      DECIMAL(10,2) NOT NULL,
  "paymentIntentId"  TEXT,                                  -- ID de pasarela de pago
  "voucherUrl"       TEXT,                                  -- Comprobante de Yape/Plin
  "shippingAddress"  TEXT,                                  -- Dirección de envío
  "shippingDistrict" TEXT,                                  -- Distrito
  "pickupMethod"     TEXT          NOT NULL,                -- "DELIVERY" | "PICKUP"
  "createdAt"        TIMESTAMPTZ   NOT NULL DEFAULT now(),

  CONSTRAINT "Order_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Order_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE SET NULL
    ON UPDATE CASCADE
);


-- ────────────────────────────────────────────────────────────
-- TABLA: OrderItem
-- Líneas de cada pedido (qué variante, cantidad, precio)
-- ────────────────────────────────────────────────────────────

CREATE TABLE "OrderItem" (
  "id"        TEXT           NOT NULL DEFAULT gen_random_uuid(),
  "orderId"   TEXT           NOT NULL,
  "variantId" TEXT           NOT NULL,
  "quantity"  INTEGER        NOT NULL,
  "price"     DECIMAL(10,2)  NOT NULL,                -- Precio unitario al momento de la compra

  CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "OrderItem_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT "OrderItem_variantId_fkey"
    FOREIGN KEY ("variantId") REFERENCES "ProductVariant"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE
);


-- ────────────────────────────────────────────────────────────
-- TABLA: Customization
-- Personalización de un ítem del pedido (diseño del cliente)
-- Relación 1:1 con OrderItem
-- ────────────────────────────────────────────────────────────

CREATE TABLE "Customization" (
  "id"            TEXT  NOT NULL DEFAULT gen_random_uuid(),
  "orderItemId"   TEXT  NOT NULL,
  "userDesignUrl"  TEXT  NOT NULL,                     -- URL del diseño subido por el cliente
  "details"       JSONB,                               -- Coordenadas, texto, fuentes, etc.

  CONSTRAINT "Customization_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "Customization_orderItemId_fkey"
    FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE
);

CREATE UNIQUE INDEX "Customization_orderItemId_key" ON "Customization" ("orderItemId");


-- ============================================================
-- DIAGRAMA DE RELACIONES (ER)
-- ============================================================
--
--  ┌──────────┐       ┌──────────────────┐       ┌──────────────┐
--  │   User   │──1:N──│      Order       │──1:N──│  OrderItem   │
--  │──────────│       │──────────────────│       │──────────────│
--  │ id (PK)  │       │ id (PK)          │       │ id (PK)      │
--  │ email    │       │ userId (FK)?     │       │ orderId (FK) │
--  │ password │       │ status           │       │ variantId(FK)│
--  │ name     │       │ totalAmount      │       │ quantity     │
--  │ role     │       │ paymentIntentId  │       │ price        │
--  │ createdAt│       │ voucherUrl       │       └──────┬───────┘
--  └──────────┘       │ shippingAddress  │              │ 1:1
--                     │ shippingDistrict │       ┌──────┴───────────┐
--                     │ pickupMethod     │       │  Customization   │
--                     │ createdAt        │       │──────────────────│
--                     └──────────────────┘       │ id (PK)          │
--                                                │ orderItemId (FK) │
--  ┌──────────────┐       ┌──────────────────┐   │ userDesignUrl    │
--  │   Product    │──1:N──│ ProductVariant   │   │ details (JSONB)  │
--  │──────────────│       │──────────────────│   └──────────────────┘
--  │ id (PK)      │       │ id (PK)          │
--  │ name         │       │ productId (FK)   │
--  │ description  │       │ sku (UNIQUE)     │
--  │ category     │       │ title            │
--  │ isCustomizable│      │ price            │
--  │ isActive     │       │ stock            │
--  │ createdAt    │       │ imageUrl?        │
--  └──────────────┘       └──────────────────┘
--
-- ============================================================
-- RELACIONES CLAVE:
--   • User        → Order         (1:N)  Un usuario tiene muchos pedidos
--   • Order       → OrderItem     (1:N)  Un pedido tiene muchas líneas
--   • OrderItem   → Customization (1:1)  Un ítem puede tener una personalización
--   • Product     → ProductVariant(1:N)  Un producto tiene muchas variantes
--   • OrderItem   → ProductVariant(N:1)  Cada línea referencia una variante
-- ============================================================
