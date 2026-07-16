import { prisma } from "@/lib/prisma";
import { Card as ShadcnCard, CardContent as ShadcnCardContent, CardHeader as ShadcnCardHeader, CardTitle as ShadcnCardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ClipboardList, Landmark, Clock, PlayCircle, Eye } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import DashboardCharts from "@/components/admin/DashboardCharts";

export const revalidate = 0; // Dynamic rendering always

export default async function AdminDashboardPage() {
  // Generate date labels for last 7 days
  const last7DaysSales: { date: string; amount: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("es-PE", { weekday: "short", day: "numeric" });
    last7DaysSales.push({ date: label, amount: 0 });
  }

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  // Query database metrics using Prisma
  const [
    totalOrdersCount,
    pendingPaymentsCount,
    activeProductionCount,
    salesAggregate,
    recentOrders,
    salesLastWeek,
    shippedCount,
    cancelledCount,
    paidCount,
    prodCount,
    dbStatuses,
  ] = await Promise.all([
    prisma.pedido.count(),
    prisma.pedido.count({ where: { estadoId: "PENDING" } }),
    prisma.pedido.count({ where: { estadoId: { in: ["PAID", "PROCESSING"] } } }),
    prisma.pedido.aggregate({
      _sum: { total: true },
      where: {
        NOT: { estadoId: { in: ["PENDING", "CANCELLED"] } }, // Only count validated sales
      },
    }),
    prisma.pedido.findMany({
      take: 5,
      orderBy: { creadoEn: "desc" },
      include: {
        usuario: { select: { nombre: true, correo: true } },
        estado: true,
      },
    }),
    prisma.pedido.findMany({
      where: {
        creadoEn: { gte: sevenDaysAgo },
        NOT: { estadoId: { in: ["PENDING", "CANCELLED"] } },
      },
      select: {
        creadoEn: true,
        total: true,
      },
    }),
    prisma.pedido.count({ where: { estadoId: "SHIPPED" } }),
    prisma.pedido.count({ where: { estadoId: "CANCELLED" } }),
    prisma.pedido.count({ where: { estadoId: "PAID" } }),
    prisma.pedido.count({ where: { estadoId: "PROCESSING" } }),
    prisma.estadoPedido.findMany({ where: { inEstado: true } }),
  ]);

  const totalSales = Number(salesAggregate._sum.total || 0);

  // Populate daily amounts
  salesLastWeek.forEach((order: any) => {
    const orderDate = new Date(order.creadoEn).toLocaleDateString("es-PE", { weekday: "short", day: "numeric" });
    const dayObj = last7DaysSales.find((d) => d.date === orderDate);
    if (dayObj) {
      dayObj.amount += Number(order.total);
    }
  });

  const statusData = dbStatuses.map((s: any) => {
    let count = 0;
    if (s.id === "PENDING") count = pendingPaymentsCount;
    else if (s.id === "PAID") count = paidCount;
    else if (s.id === "PROCESSING") count = prodCount;
    else if (s.id === "SHIPPED") count = shippedCount;
    else if (s.id === "CANCELLED") count = cancelledCount;

    let chartColor = "bg-indigo-500";
    if (s.color === "amber") chartColor = "bg-amber-500";
    else if (s.color === "emerald") chartColor = "bg-emerald-500";
    else if (s.color === "indigo") chartColor = "bg-indigo-500";
    else if (s.color === "sky") chartColor = "bg-sky-500";
    else if (s.color === "rose") chartColor = "bg-rose-500";

    return {
      status: s.id,
      count,
      label: s.nombre,
      color: chartColor,
    };
  });


  return (
    <div className="space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="font-heading font-extrabold text-3xl text-slate-900 dark:text-white mb-1">
          Dashboard General
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          Resumen financiero y estado de operaciones del taller de sublimado.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Metric 1: Total Sales */}
        <ShadcnCard className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl overflow-hidden rounded-2xl">
          <ShadcnCardHeader className="flex flex-row items-center justify-between pb-2">
            <ShadcnCardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Ingresos Validados
            </ShadcnCardTitle>
            <Landmark className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
          </ShadcnCardHeader>
          <ShadcnCardContent>
            <div className="text-2xl font-extrabold text-slate-950 dark:text-white">
              S/. {totalSales.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Excluye pedidos pendientes y cancelados.
            </p>
          </ShadcnCardContent>
        </ShadcnCard>

        {/* Metric 2: Pending Validation */}
        <ShadcnCard className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl overflow-hidden rounded-2xl">
          <ShadcnCardHeader className="flex flex-row items-center justify-between pb-2">
            <ShadcnCardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pendientes de Pago
            </ShadcnCardTitle>
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </ShadcnCardHeader>
          <ShadcnCardContent>
            <div className="text-2xl font-extrabold text-slate-950 dark:text-white">
              {pendingPaymentsCount}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Vouchers de Yape/Plin por revisar.
            </p>
          </ShadcnCardContent>
        </ShadcnCard>

        {/* Metric 3: Active Production */}
        <ShadcnCard className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl overflow-hidden rounded-2xl">
          <ShadcnCardHeader className="flex flex-row items-center justify-between pb-2">
            <ShadcnCardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              En Producción
            </ShadcnCardTitle>
            <PlayCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </ShadcnCardHeader>
          <ShadcnCardContent>
            <div className="text-2xl font-extrabold text-slate-950 dark:text-white">
              {activeProductionCount}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Pedidos agendados o estampándose.
            </p>
          </ShadcnCardContent>
        </ShadcnCard>

        {/* Metric 4: Total Orders */}
        <ShadcnCard className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl overflow-hidden rounded-2xl">
          <ShadcnCardHeader className="flex flex-row items-center justify-between pb-2">
            <ShadcnCardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pedidos Totales
            </ShadcnCardTitle>
            <ClipboardList className="h-5 w-5 text-slate-600 dark:text-slate-400" />
          </ShadcnCardHeader>
          <ShadcnCardContent>
            <div className="text-2xl font-extrabold text-slate-950 dark:text-white">
              {totalOrdersCount}
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Historial de pedidos creados en la web.
            </p>
          </ShadcnCardContent>
        </ShadcnCard>

      </div>

      {/* Charts Section */}
      <DashboardCharts salesData={last7DaysSales} statusData={statusData} />

      {/* Recent Orders Table */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
            Pedidos Recientes
          </h2>
          <Link href="/admin/pedidos">
            <Button variant="link" className="text-indigo-600 text-xs font-bold">
              Ver Todos los Pedidos
            </Button>
          </Link>
        </div>

        <ShadcnCard className="border border-slate-200 dark:border-white/5 shadow-xl bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl overflow-hidden rounded-2xl">
          <ShadcnCardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50 dark:bg-white/[0.02]/80 dark:bg-white/[0.02]">
                <TableRow className="border-slate-200 dark:border-white/10 dark:border-white/[0.05]">
                  <TableHead className="font-bold text-slate-500 dark:text-slate-400">ID de Pedido</TableHead>
                  <TableHead className="font-bold text-slate-500 dark:text-slate-400">Cliente</TableHead>
                  <TableHead className="font-bold text-slate-500 dark:text-slate-400">Fecha</TableHead>
                  <TableHead className="font-bold text-slate-500 dark:text-slate-400">Total</TableHead>
                  <TableHead className="font-bold text-slate-500 dark:text-slate-400">Estado</TableHead>
                  <TableHead className="w-20 font-bold text-slate-500 dark:text-slate-400"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length > 0 ? (
                  recentOrders.map((order: any) => {
                    // Status Badge Styling
                    const statusLabel = order.estado?.nombre || order.estadoId;
                    const statusColor = order.estado?.color || "indigo";
                    let statusClass = "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20";
                    
                    if (statusColor === "amber") {
                      statusClass = "bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20";
                    } else if (statusColor === "emerald") {
                      statusClass = "bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20";
                    } else if (statusColor === "indigo") {
                      statusClass = "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20";
                    } else if (statusColor === "sky") {
                      statusClass = "bg-sky-50 text-sky-600 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20";
                    } else if (statusColor === "rose") {
                      statusClass = "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
                    }

                    return (
                      <TableRow key={order.id} className="border-slate-100 dark:border-white/5 transition-colors hover:bg-slate-50 dark:bg-white/[0.02]/80 dark:hover:bg-white/[0.02]">
                        <TableCell className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="font-medium text-slate-900 dark:text-slate-100">{order.usuario?.nombre}</div>
                          <div className="text-xs text-slate-400">{order.usuario?.correo}</div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(order.creadoEn).toLocaleDateString("es-PE", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </TableCell>
                        <TableCell className="font-bold text-sm text-slate-900 dark:text-white">
                          S/. {Number(order.total).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase border shadow-sm ${statusClass}`}>
                             {order.estadoId === "PAID" || order.estadoId === "PROCESSING" ? <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 animate-pulse"></span> : null}
                            {statusLabel}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Link href="/admin/pedidos">
                            <Button variant="ghost" size="icon" className="hover:text-indigo-600 hover:bg-slate-50 dark:bg-white/[0.02] h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-10 text-slate-500 dark:text-slate-400 text-sm">
                      Aún no hay pedidos registrados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ShadcnCardContent>
        </ShadcnCard>
      </div>

    </div>
  );
}
