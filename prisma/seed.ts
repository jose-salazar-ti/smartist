import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as path from 'path';
import * as fs from 'fs';

// Manually parse .env since Next's env loader isn't running
const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envConfig = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of envConfig) {
    if (line.trim().length > 0 && !line.startsWith('#')) {
      const [key, ...values] = line.split('=');
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim().replace(/['"]/g, '');
      }
    }
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Limpiando base de datos...");
  await prisma.carritoAbandonado.deleteMany({});
  await prisma.listaDeseos.deleteMany({});
  await prisma.resena.deleteMany({});
  await prisma.pedidoItem.deleteMany({});
  await prisma.pedido.deleteMany({});
  await prisma.cupon.deleteMany({});
  await prisma.precioVolumen.deleteMany({});
  await prisma.varianteProducto.deleteMany({});
  await prisma.producto.deleteMany({});
  await prisma.categoria.deleteMany({});
  await prisma.proveedor.deleteMany({});
  await prisma.direccion.deleteMany({});
  await prisma.usuario.deleteMany({});

  await prisma.rol.deleteMany({});
  await prisma.estadoPedido.deleteMany({});
  await prisma.metodoPago.deleteMany({});
  await prisma.metodoEnvio.deleteMany({});

  console.log("Creando roles...");
  await prisma.rol.createMany({
    data: [
      { id: "CLIENTE", nombre: "Cliente" },
      { id: "REVENDEDOR", nombre: "Revendedor" },
      { id: "ADMIN", nombre: "Administrador" },
      { id: "VENDEDOR", nombre: "Vendedor" },
    ]
  });

  console.log("Creando estados de pedido...");
  await prisma.estadoPedido.createMany({
    data: [
      {
        id: "PENDING",
        nombre: "Pendiente",
        color: "amber",
        emailTitulo: "¡Gracias por tu pedido!",
        emailDescripcion: "Hemos recibido tu pedido correctamente. Actualmente se encuentra en estado de Validación de Pago. Verificaremos el comprobante adjunto a la brevedad para comenzar la producción en el taller."
      },
      {
        id: "PAID",
        nombre: "Pagado",
        color: "emerald",
        emailTitulo: "Pago Confirmado / Listo para Producción",
        emailDescripcion: "Hemos verificado y confirmado tu pago de manera correcta. Tu pedido ya ingresó a nuestra cola de taller y la producción comenzará muy pronto."
      },
      {
        id: "PROCESSING",
        nombre: "En Taller",
        color: "indigo",
        emailTitulo: "En Proceso de Producción",
        emailDescripcion: "¡Tu pedido ya está siendo impreso y sublimado en nuestro taller! Nos estamos encargando de cada detalle para que tenga la máxima calidad."
      },
      {
        id: "SHIPPED",
        nombre: "Enviado/Listo",
        color: "sky",
        emailTitulo: "Pedido Enviado o Listo para Retiro",
        emailDescripcion: "¡Buenas noticias! Tu pedido ha sido finalizado. Si elegiste entrega a domicilio, ya está en ruta de reparto. Si elegiste recojo en taller, ya puedes acercarte a retirarlo."
      },
      {
        id: "CANCELLED",
        nombre: "Cancelado",
        color: "rose",
        emailTitulo: "Pedido Cancelado",
        emailDescripcion: "Lamentamos informarte que tu pedido ha sido cancelado. Si consideras que se trata de un error o necesitas ayuda, no dudes en escribirnos de inmediato por WhatsApp."
      }
    ]
  });

  console.log("Creando métodos de pago...");
  await prisma.metodoPago.createMany({
    data: [
      { id: "YAPE", nombre: "Yape", tipo: "QR", numero: "999999999", titular: "Smartist S.A.C." },
      { id: "PLIN", nombre: "Plin", tipo: "QR", numero: "999999999", titular: "Smartist S.A.C." },
      { id: "TARJETA", nombre: "Tarjeta de Crédito/Débito", tipo: "OTRO", inEstado: false }
    ]
  });

  console.log("Creando métodos de envío...");
  await prisma.metodoEnvio.createMany({
    data: [
      { id: "PICKUP", nombre: "Recojo en Taller", costo: 0.00, tiempoEstimado: "Gratis - Miraflores, Lima" },
      { id: "DELIVERY", nombre: "Envío a Domicilio", costo: 10.00, tiempoEstimado: "S/. 10.00 - Todo Lima" }
    ]
  });

  console.log("Creando usuarios de prueba...");
  const cliente = await prisma.usuario.create({
    data: {
      nombre: "Juan Cliente",
      correo: "cliente@example.com",
      rolId: "CLIENTE",
      docTipo: "DNI",
      docNumero: "71234567",
    }
  });

  const revendedor = await prisma.usuario.create({
    data: {
      nombre: "Pedro Distribuidor",
      correo: "revendedor@example.com",
      rolId: "REVENDEDOR",
      docTipo: "RUC",
      docNumero: "20123456789",
      razonSocial: "Sublimados del Norte S.A.C.",
    }
  });

  const admin = await prisma.usuario.create({
    data: {
      nombre: "Administrador Smartist",
      correo: "admin@gmail.com",
      rolId: "ADMIN",
    }
  });

  console.log("Creando proveedores de prueba...");
  const provInsumos = await prisma.proveedor.create({
    data: {
      nombre: "Importador de Insumos Lima",
      contacto: "Juan Pérez",
      correo: "compras@insumoslima.com",
      telefono: "987654321",
      tipo: "interno",
    }
  });

  const provJoyas = await prisma.proveedor.create({
    data: {
      nombre: "Taller Joyería San José",
      contacto: "Carlos Gómez",
      correo: "ventas@joyeriasanjose.com",
      telefono: "912345678",
      tipo: "socio",
      comisionPorcentaje: 10.00,
    }
  });

  console.log("Creando categorías...");
  const catTazas = await prisma.categoria.create({
    data: { nombre: "Tazas", slug: "tazas", imagen: "/img/mug-conical.png" }
  });

  const catJoyeria = await prisma.categoria.create({
    data: { nombre: "Joyería", slug: "joyeria", imagen: "/img/photo-slate.png" }
  });

  const catRopa = await prisma.categoria.create({
    data: { nombre: "Prendas", slug: "ropa", imagen: "/img/tshirt.png" }
  });

  const catOficina = await prisma.categoria.create({
    data: { nombre: "Oficina", slug: "oficina", imagen: "/img/mousepad-standard.png" }
  });

  console.log("Creando productos...");

  // 1. Taza Blanca
  const prodTazaBlanca = await prisma.producto.create({
    data: {
      id: "taza-blanca",
      catId: catTazas.id,
      provId: provInsumos.id,
      nombre: "Taza Blanca 11oz",
      descrip: "Taza de cerámica blanca premium importada. Ideal para regalos corporativos o personales. Resistente a microondas y lavavajillas. Calidad fotográfica HD.",
      costo: 3.00,
      precio: 15.00,
      imagen: "/img/mug-conical.png",
      etiquetas: "taza, regalo, oficina, blanca",
      esCustom: true,
      galleryImages: ["/img/mug-conical.png"],
      blankMockupUrl: "/img/mug-conical.png",
    }
  });

  await prisma.varianteProducto.create({
    data: {
      prodId: prodTazaBlanca.id,
      sku: "TAZA-11-BLA",
      atributo: "Taza Blanca 11oz con caja básica",
      costoExt: 0,
      precioExt: 0,
      stock: 100,
      imageUrl: "/img/mug-conical.png",
    }
  });

  // Agregar escalas de precios por volumen para la Taza Blanca
  await prisma.precioVolumen.createMany({
    data: [
      { prodId: prodTazaBlanca.id, cantMin: 6, cantMax: 29, precioUnit: 12.00 },
      { prodId: prodTazaBlanca.id, cantMin: 30, cantMax: null, precioUnit: 10.00 },
    ]
  });

  // 2. Taza Mágica
  const prodTazaMagica = await prisma.producto.create({
    data: {
      id: "taza-magica",
      catId: catTazas.id,
      provId: provInsumos.id,
      nombre: "Taza Mágica Color Cambiante",
      descrip: "Taza negra mate que revela tu foto o diseño a todo color cuando se vierte líquido caliente. ¡El regalo sorpresa perfecto!",
      costo: 5.00,
      precio: 25.00,
      imagen: "/img/mug-magic.png",
      etiquetas: "taza, sorpresa, magia, caliente",
      esCustom: true,
      galleryImages: ["/img/mug-magic.png"],
      blankMockupUrl: "/img/mug-magic.png",
      maskImageUrl: "/img/taza_silueta.png",
    }
  });

  await prisma.varianteProducto.create({
    data: {
      prodId: prodTazaMagica.id,
      sku: "TAZA-MAG-NEG",
      atributo: "Taza Mágica 11oz Negro Mate",
      costoExt: 0,
      precioExt: 0,
      stock: 50,
      imageUrl: "/img/mug-magic.png",
    }
  });

  // 3. Collar de Joyería
  const prodCollar = await prisma.producto.create({
    data: {
      id: "collar-corazon",
      catId: catJoyeria.id,
      provId: provJoyas.id,
      nombre: "Collar Corazón Grabado",
      descrip: "Hermoso collar de dije corazón de plata ley 925 fabricado por joyeros locales. Personaliza el dije con un grabado láser de nombre, fecha o iniciales.",
      costo: 25.00,
      precio: 60.00,
      imagen: "/img/photo-slate.png",
      etiquetas: "collar, joyeria, plata, regalo, pareja",
      esCustom: false,
    }
  });

  // Variante plata (base, sin costo extra)
  await prisma.varianteProducto.create({
    data: {
      prodId: prodCollar.id,
      sku: "COL-PLA-925",
      atributo: "Plata Ley 925",
      costoExt: 0,
      precioExt: 0,
      stock: 20,
      imageUrl: "/img/photo-slate.png",
    }
  });

  // Variante oro (baño de oro 18k, con costo y precio extra)
  await prisma.varianteProducto.create({
    data: {
      prodId: prodCollar.id,
      sku: "COL-ORO-18K",
      atributo: "Plata con Baño de Oro 18K",
      costoExt: 5.00,
      precioExt: 15.00,
      stock: 10,
      imageUrl: "/img/photo-slate.png",
    }
  });

  // 4. Polo Blanco
  const prodPolo = await prisma.producto.create({
    data: {
      id: "polo-blanco",
      catId: catRopa.id,
      provId: provInsumos.id,
      nombre: "Polo Blanco Sublimado (A4)",
      descrip: "Polo cuello redondo 100% poliéster tacto algodón. Impresión máxima tamaño A4 en el pecho o espalda. Colores vivos que no se destiñen.",
      costo: 10.00,
      precio: 30.00,
      imagen: "/img/tshirt.png",
      etiquetas: "ropa, polo, sublimado, anime, personalizado",
      esCustom: true,
      galleryImages: ["/img/tshirt.png"],
      blankMockupUrl: "/img/tshirt.png",
    }
  });

  await prisma.varianteProducto.createMany({
    data: [
      { prodId: prodPolo.id, sku: "POL-BLA-S", atributo: "Talla S", costoExt: 0, precioExt: 0, stock: 50 },
      { prodId: prodPolo.id, sku: "POL-BLA-M", atributo: "Talla M", costoExt: 0, precioExt: 0, stock: 50 },
      { prodId: prodPolo.id, sku: "POL-BLA-L", atributo: "Talla L", costoExt: 0, precioExt: 0, stock: 50 },
    ]
  });

  console.log("Creando cupones de prueba...");
  await prisma.cupon.createMany({
    data: [
      { codigo: "BIENVENIDA", tipo: "monto_fijo", valor: 5.00, fechaExpira: new Date("2027-12-31"), activo: true },
      { codigo: "CORPORATIVO10", tipo: "porcentaje", valor: 10.00, fechaExpira: new Date("2027-12-31"), activo: true },
    ]
  });

  console.log("¡Base de datos poblada en español exitosamente!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
