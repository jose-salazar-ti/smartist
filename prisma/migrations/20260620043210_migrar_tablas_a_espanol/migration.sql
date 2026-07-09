/*
  Warnings:

  - You are about to drop the `Customization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductVariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('CLIENTE', 'REVENDEDOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "EstadoPedido" AS ENUM ('PENDIENTE', 'PAGADO', 'PRODUCCION', 'ENVIADO', 'CANCELADO');

-- DropForeignKey
ALTER TABLE "Customization" DROP CONSTRAINT "Customization_orderItemId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";

-- DropTable
DROP TABLE "Customization";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "OrderItem";

-- DropTable
DROP TABLE "Product";

-- DropTable
DROP TABLE "ProductVariant";

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "Role";

-- CreateTable
CREATE TABLE "usuarios" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "telefono" TEXT,
    "rol" "Rol" NOT NULL DEFAULT 'CLIENTE',
    "doc_tipo" TEXT,
    "doc_numero" TEXT,
    "razon_social" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direcciones" (
    "id" SERIAL NOT NULL,
    "usr_id" TEXT NOT NULL,
    "calle" TEXT NOT NULL,
    "distrito" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "ref" TEXT,
    "principal" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "direcciones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "proveedores" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "contacto" TEXT,
    "correo" TEXT,
    "telefono" TEXT,
    "tipo" TEXT NOT NULL DEFAULT 'interno',
    "comision_porcentaje" DECIMAL(5,2) NOT NULL DEFAULT 0,

    CONSTRAINT "proveedores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "imagen" TEXT,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "productos" (
    "id" TEXT NOT NULL,
    "cat_id" INTEGER NOT NULL,
    "prov_id" INTEGER,
    "nombre" TEXT NOT NULL,
    "descrip" TEXT NOT NULL,
    "costo" DECIMAL(10,2) NOT NULL,
    "precio" DECIMAL(10,2) NOT NULL,
    "imagen" TEXT,
    "etiquetas" TEXT,
    "es_custom" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "gallery_images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "blank_mockup_url" TEXT,
    "mask_image_url" TEXT,
    "glb_model_url" TEXT,
    "mockup_config" JSONB,
    "print_dimensions" JSONB,
    "features" JSONB,
    "benefits" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variantes" (
    "id" TEXT NOT NULL,
    "prod_id" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "atributo" TEXT NOT NULL,
    "costo_ext" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "precio_ext" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,

    CONSTRAINT "variantes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "precios_volumen" (
    "id" SERIAL NOT NULL,
    "prod_id" TEXT NOT NULL,
    "cant_min" INTEGER NOT NULL,
    "cant_max" INTEGER,
    "precio_unit" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "precios_volumen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cupones" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "fecha_expira" TIMESTAMP(3) NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "cupones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedidos" (
    "id" TEXT NOT NULL,
    "usr_id" TEXT,
    "cupon_id" INTEGER,
    "estado" "EstadoPedido" NOT NULL DEFAULT 'PENDIENTE',
    "tipo_entrega" TEXT NOT NULL,
    "dir_envio" TEXT,
    "nombre_cliente_final" TEXT,
    "telf_cliente_final" TEXT,
    "tipo_comprobante" TEXT NOT NULL DEFAULT 'boleta',
    "doc_tipo" TEXT,
    "doc_numero" TEXT,
    "razon_social" TEXT,
    "total" DECIMAL(10,2) NOT NULL,
    "metodo_pago" TEXT NOT NULL,
    "voucher_url" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pedidos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pedido_items" (
    "id" TEXT NOT NULL,
    "ped_id" TEXT NOT NULL,
    "prod_id" TEXT NOT NULL,
    "var_id" TEXT,
    "cant" INTEGER NOT NULL,
    "precio_unit" DECIMAL(10,2) NOT NULL,
    "costo_unit" DECIMAL(10,2) NOT NULL,
    "diseno_url" TEXT,

    CONSTRAINT "pedido_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resenas" (
    "id" SERIAL NOT NULL,
    "prod_id" TEXT NOT NULL,
    "usr_id" TEXT NOT NULL,
    "calificacion" INTEGER NOT NULL,
    "comentario" TEXT,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resenas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lista_deseos" (
    "id" SERIAL NOT NULL,
    "usr_id" TEXT NOT NULL,
    "prod_id" TEXT NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "lista_deseos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "carrito_abandonado" (
    "id" SERIAL NOT NULL,
    "usr_id" TEXT NOT NULL,
    "data_json" TEXT NOT NULL,
    "modificado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carrito_abandonado_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_correo_key" ON "usuarios"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "categorias_slug_key" ON "categorias"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "variantes_sku_key" ON "variantes"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "cupones_codigo_key" ON "cupones"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "carrito_abandonado_usr_id_key" ON "carrito_abandonado"("usr_id");

-- AddForeignKey
ALTER TABLE "direcciones" ADD CONSTRAINT "direcciones_usr_id_fkey" FOREIGN KEY ("usr_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_cat_id_fkey" FOREIGN KEY ("cat_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "productos" ADD CONSTRAINT "productos_prov_id_fkey" FOREIGN KEY ("prov_id") REFERENCES "proveedores"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variantes" ADD CONSTRAINT "variantes_prod_id_fkey" FOREIGN KEY ("prod_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "precios_volumen" ADD CONSTRAINT "precios_volumen_prod_id_fkey" FOREIGN KEY ("prod_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_usr_id_fkey" FOREIGN KEY ("usr_id") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedidos" ADD CONSTRAINT "pedidos_cupon_id_fkey" FOREIGN KEY ("cupon_id") REFERENCES "cupones"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_ped_id_fkey" FOREIGN KEY ("ped_id") REFERENCES "pedidos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_prod_id_fkey" FOREIGN KEY ("prod_id") REFERENCES "productos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pedido_items" ADD CONSTRAINT "pedido_items_var_id_fkey" FOREIGN KEY ("var_id") REFERENCES "variantes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resenas" ADD CONSTRAINT "resenas_prod_id_fkey" FOREIGN KEY ("prod_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resenas" ADD CONSTRAINT "resenas_usr_id_fkey" FOREIGN KEY ("usr_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lista_deseos" ADD CONSTRAINT "lista_deseos_usr_id_fkey" FOREIGN KEY ("usr_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lista_deseos" ADD CONSTRAINT "lista_deseos_prod_id_fkey" FOREIGN KEY ("prod_id") REFERENCES "productos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "carrito_abandonado" ADD CONSTRAINT "carrito_abandonado_usr_id_fkey" FOREIGN KEY ("usr_id") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
