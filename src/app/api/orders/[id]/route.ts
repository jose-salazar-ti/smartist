import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { verifyAdmin } from "@/lib/auth-utils";
import { sendOrderStatusUpdateEmail } from "@/services/email";


// GET order by ID (with nested items, variant names, and customizations)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const searchId = resolvedParams.id.replace('#', '').toLowerCase();
    
    const o = await prisma.pedido.findFirst({
      where: {
        id: { startsWith: searchId }
      },
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
      },
    });

    if (!o) {
      return NextResponse.json(
        { error: "No se encontró el pedido solicitado." },
        { status: 404 }
      );
    }

    const mappedOrder = {
      id: o.id,
      userId: o.usrId,
      user: o.usuario ? { name: o.usuario.nombre, email: o.usuario.correo } : null,
      status: o.estadoId,
      totalAmount: Number(o.total),
      voucherUrl: o.voucherUrl,
      shippingAddress: o.dirEnvio,
      shippingDistrict: o.dirEnvio ? "" : null,
      pickupMethod: o.tipoEntregaId,
      nombreClienteFinal: o.nombreClienteFinal,
      telfClienteFinal: o.telfClienteFinal,
      tipoComprobante: o.tipoComprobante,
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
    };

    return NextResponse.json(mappedOrder);
  } catch (error: any) {
    console.error("Fetch order error:", error);
    return NextResponse.json(
      { error: "Ocurrió un error al cargar el pedido." },
      { status: 500 }
    );
  }
}

// PATCH order status (Update tracking status)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await verifyAdmin();
    if (!auth.isAdmin) return auth.errorResponse!;

    const resolvedParams = await params;
    const body = await req.json();
    const { status } = body;

    // Obtener estados activos de la base de datos
    const activeStates = await prisma.estadoPedido.findMany({
      where: { inEstado: true },
      select: { id: true }
    });
    const allowedStatuses = activeStates.map((s: any) => s.id);

    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Estado no válido para actualización." },
        { status: 400 }
      );
    }

    const orderBefore = await prisma.pedido.findUnique({
      where: { id: resolvedParams.id },
      include: {
        pedidoItems: true
      }
    });

    if (!orderBefore) {
      return NextResponse.json(
        { error: "Pedido no encontrado." },
        { status: 404 }
      );
    }

    const previousStatus = orderBefore.estadoId;

    const updatedOrder = await prisma.$transaction(async (tx: any) => {
      const order = await tx.pedido.update({
        where: { id: resolvedParams.id },
        data: { estadoId: status },
        include: {
          usuario: {
            select: {
              nombre: true,
              correo: true,
            },
          },
          estado: true,
        },
      });

      // Adjust inventory if status changes to/from CANCELLED
      if (previousStatus !== "CANCELLED" && status === "CANCELLED") {
        // Cancelled: return stock
        for (const item of orderBefore.pedidoItems) {
          if (item.varId) {
            await tx.varianteProducto.update({
              where: { id: item.varId },
              data: {
                stock: {
                  increment: item.cant,
                },
              },
            });
          }
        }
      } else if (previousStatus === "CANCELLED" && status !== "CANCELLED") {
        // Reactivated: subtract stock again
        for (const item of orderBefore.pedidoItems) {
          if (item.varId) {
            await tx.varianteProducto.update({
              where: { id: item.varId },
              data: {
                stock: {
                  decrement: item.cant,
                },
              },
            });
          }
        }
      }

      return order;
    });

    if (updatedOrder.usuario?.correo) {
      try {
        await sendOrderStatusUpdateEmail(updatedOrder.usuario.correo, {
          orderId: updatedOrder.id,
          customerName: updatedOrder.usuario.nombre,
          statusName: updatedOrder.estado.nombre,
          statusColor: updatedOrder.estado.color,
          emailTitulo: updatedOrder.estado.emailTitulo,
          emailDescripcion: updatedOrder.estado.emailDescripcion,
          total: Number(updatedOrder.total),
          statusId: updatedOrder.estadoId,
        });
      } catch (emailErr) {
        console.error("Failed to send status update email:", emailErr);
      }
    }

    return NextResponse.json({
      ...updatedOrder,
      status: updatedOrder.estadoId
    });
  } catch (error: any) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Error al actualizar el estado del pedido." },
      { status: 500 }
    );
  }
}
