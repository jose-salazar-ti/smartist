import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyAdmin } from "@/lib/auth-utils";
import { sendOrderConfirmationEmail } from "@/services/email";

// GET all orders for administration panel
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const orders = await prisma.pedido.findMany({
      orderBy: { creadoEn: "desc" },
      include: {
        usuario: {
          select: {
            nombre: true,
            correo: true,
          },
        },
        pedidoItems: {
          include: {
            producto: true,
            variante: true,
          },
        },
        estado: true,
        tipoEntrega: true,
        metodoPago: true,
        dedicatoria: true,
      },
    });

    const mappedOrders = orders.map((o: any) => ({
      id: o.id,
      userId: o.usrId,
      user: o.usuario ? { name: o.usuario.nombre, email: o.usuario.correo } : null,
      status: o.estadoId, // PENDING, PAID, PROCESSING, SHIPPED, CANCELLED
      totalAmount: Number(o.total),
      voucherUrl: o.voucherUrl,
      shippingAddress: o.dirEnvio,
      shippingDistrict: o.dirEnvio ? "" : null,
      pickupMethod: o.tipoEntregaId,
      nombreClienteFinal: o.nombreClienteFinal,
      telfClienteFinal: o.telfClienteFinal,
      tipoComprobante: o.tipoComprobante,
      dedicatoria: o.dedicatoria || null,
      docTipo: o.docTipo,
      docNumero: o.docNumero,
      razonSocial: o.razonSocial,
      createdAt: o.creadoEn,
      orderItems: o.pedidoItems.map((item: any) => ({
        id: item.id,
        price: Number(item.precioUnit),
        quantity: item.cant,
        variant: item.variante ? {
          id: item.variante.id,
          title: item.variante.atributo,
          sku: item.variante.sku,
          price: Number(item.precioUnit),
          imageUrl: item.variante.imageUrl || undefined,
          product: {
            id: item.producto.id,
            name: item.producto.nombre
          }
        } : {
          id: "",
          title: "Producto base",
          sku: "",
          price: Number(item.precioUnit),
          product: {
            id: item.producto.id,
            name: item.producto.nombre
          }
        },
        customization: item.disenoUrl || item.detalles ? {
          id: item.id,
          userDesignUrl: item.disenoUrl || "",
          details: item.detalles || {}
        } : null
      }))
    }));

    return NextResponse.json(mappedOrders);
  } catch (error: any) {
    console.error("Fetch all orders error:", error);
    return NextResponse.json(
      { error: "Error al cargar el listado de pedidos." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      email,
      phone,
      pickupMethod,
      shippingAddress,
      shippingDistrict,
      voucherUrl,
      items,
      // Optional Billing Fields
      tipoComprobante,
      docTipo,
      docNumero,
      razonSocial,
      // Optional Reseller Dropshipping Recipient Fields
      nombreClienteFinal,
      telfClienteFinal,
    } = body;

    // Validation
    if (!name || !email || !phone || !pickupMethod || !items || items.length === 0) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios para procesar la orden." },
        { status: 400 }
      );
    }

    // 1. Resolve or create user by email
    let user = await prisma.usuario.findUnique({
      where: { correo: email },
    });

    if (!user) {
      user = await prisma.usuario.create({
        data: {
          correo: email,
          nombre: name,
          telefono: phone,
          rolId: "CLIENTE",
          docTipo: docTipo || null,
          docNumero: docNumero || null,
          razonSocial: razonSocial || null,
        },
      });
    }

    // Calculate total amount
    const totalAmount = items.reduce(
      (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    // Build order items with cost prices
    const orderItemsData: any[] = [];
    for (const item of items) {
      const dbVariant = await prisma.varianteProducto.findUnique({
        where: { id: item.variantId },
        include: { producto: true }
      });

      const costPrice = dbVariant 
        ? (Number(dbVariant.producto.costo) + Number(dbVariant.costoExt))
        : 0.00;

      const hasCustomization = item.customDesignBase64 || item.customText || item.customTextRight;

      orderItemsData.push({
        producto: { connect: { id: dbVariant ? dbVariant.prodId : (item.productId || "") } },
        variante: dbVariant ? { connect: { id: item.variantId } } : undefined,
        cant: Number(item.quantity),
        precioUnit: Number(item.price),
        costoUnit: costPrice,
        disenoUrl: item.customDesignBase64 || null,
        detalles: hasCustomization ? {
          customText: item.customText || "",
          customTextRight: item.customTextRight || "",
          textColor: item.textColor || "",
          textFont: item.textFont || "",
          mugDesignMode: item.mugDesignMode || "duplicated"
        } : undefined
      });
    }

    // 2. Create Order with nested items and decrement stock in a safe transaction
    const order = await prisma.$transaction(async (tx: any) => {
      const newOrder = await tx.pedido.create({
        data: {
          usrId: user.id,
          estadoId: "PENDING",
          total: totalAmount,
          tipoEntregaId: pickupMethod,
          dirEnvio: pickupMethod === "DELIVERY" ? shippingAddress : null,
          nombreClienteFinal: nombreClienteFinal || null,
          telfClienteFinal: telfClienteFinal || null,
          tipoComprobante: tipoComprobante || "boleta",
          docTipo: docTipo || null,
          docNumero: docNumero || null,
          razonSocial: razonSocial || null,
          metodoPagoId: (body.metodoPago || "YAPE").toUpperCase(),
          voucherUrl: voucherUrl || null,
          pedidoItems: {
            create: orderItemsData,
          },
        },
      });

      // Decrement stock for each item's variant
      for (const item of items) {
        if (item.variantId) {
          await tx.varianteProducto.update({
            where: { id: item.variantId },
            data: {
              stock: {
                decrement: Number(item.quantity),
              },
            },
          });
        }
      }

      return newOrder;
    });

    // 3. Send Order Confirmation Email asynchronously
    try {
      const emailItems = items.map((item: any) => ({
        name: item.productName || item.name || "Producto",
        variantTitle: item.variantTitle || item.variant || "Estándar",
        quantity: Number(item.quantity),
        price: Number(item.price)
      }));

      await sendOrderConfirmationEmail(email, {
        orderId: order.id,
        customerName: name,
        total: totalAmount,
        pickupMethod,
        items: emailItems
      });
    } catch (emailErr) {
      console.error("Failed to send order confirmation email:", emailErr);
    }

    return NextResponse.json({ success: true, orderId: order.id });
  } catch (error: any) {
    console.error("Order creation API error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al guardar tu pedido en el servidor." },
      { status: 500 }
    );
  }
}
