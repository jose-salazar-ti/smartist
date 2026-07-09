"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";

interface SalesDay {
  date: string; // e.g. "Lun 18", "Mar 19"
  amount: number;
}

interface StatusCount {
  status: string; // "PENDIENTE" | "PAGADO" | "PRODUCCION" | "ENVIADO" | "CANCELADO"
  count: number;
  label: string;
  color: string;
}

interface DashboardChartsProps {
  salesData: SalesDay[];
  statusData: StatusCount[];
}

export default function DashboardCharts({ salesData, statusData }: DashboardChartsProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeBar, setActiveBar] = useState<number | null>(null);
  const [activePoint, setActivePoint] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-[300px] w-full bg-slate-100/50 dark:bg-white/[0.02] animate-pulse rounded-2xl" />;
  }

  const isDark = resolvedTheme === "dark";

  // --- SVG Dimensions ---
  const width = 500;
  const height = 220;
  const paddingX = 40;
  const paddingY = 30;

  // --- Calculate Line Chart Coordinates ---
  const maxSales = Math.max(...salesData.map(d => d.amount), 100);
  const points = salesData.map((day, idx) => {
    const x = paddingX + (idx * (width - paddingX * 2)) / (salesData.length - 1 || 1);
    const y = height - paddingY - (day.amount * (height - paddingY * 2)) / maxSales;
    return { x, y, day };
  });

  // Build SVG path
  const linePath = points.map((p, idx) => `${idx === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  // Area path
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : "";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      
      {/* Chart 1: Revenue Line Chart */}
      <div className="border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl shadow-xl p-5 flex flex-col">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Ingresos (Últimos 7 días)
          </h3>
          <p className="text-2xl font-extrabold text-slate-950 dark:text-white mt-1">
            Tendencia de Ventas
          </p>
        </div>

        <div className="relative flex-grow h-[220px]">
          <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
            <defs>
              <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
              const y = paddingY + ratio * (height - paddingY * 2);
              const gridVal = (maxSales * (1 - ratio)).toFixed(0);
              return (
                <g key={idx} className="opacity-40">
                  <line 
                    x1={paddingX} 
                    y1={y} 
                    x2={width - paddingX} 
                    y2={y} 
                    stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"} 
                    strokeDasharray="4 4"
                  />
                  <text 
                    x={paddingX - 8} 
                    y={y + 4} 
                    textAnchor="end" 
                    fill="#94a3b8" 
                    className="text-[9px] font-semibold"
                  >
                    S/. {gridVal}
                  </text>
                </g>
              );
            })}

            {/* Area under the line */}
            {areaPath && (
              <path d={areaPath} fill="url(#areaGlow)" />
            )}

            {/* Main Area line */}
            {linePath && (
              <path 
                d={linePath} 
                fill="none" 
                stroke="url(#lineGrad)" 
                strokeWidth="3.5" 
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Interactive Data Points */}
            {points.map((p, idx) => (
              <g 
                key={idx}
                onMouseEnter={() => setActivePoint(idx)}
                onMouseLeave={() => setActivePoint(null)}
                className="cursor-pointer"
              >
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={activePoint === idx ? 8 : 4.5} 
                  fill={isDark ? "#0f172a" : "#ffffff"} 
                  stroke={activePoint === idx ? "#a855f7" : "#6366f1"} 
                  strokeWidth="2.5"
                  className="transition-all duration-200"
                />
                
                {/* Invisible larger hover target */}
                <circle cx={p.x} cy={p.y} r={16} fill="transparent" />

                {/* X Axis Labels */}
                <text 
                  x={p.x} 
                  y={height - 8} 
                  textAnchor="middle" 
                  fill="#94a3b8" 
                  className="text-[9px] font-semibold"
                >
                  {p.day.date}
                </text>
              </g>
            ))}
          </svg>

          {/* Simple HTML Dynamic Tooltip */}
          {activePoint !== null && (
            <div 
              className="absolute bg-slate-900/90 dark:bg-white/95 text-white dark:text-slate-950 px-3 py-1.5 rounded-lg shadow-xl text-xs font-bold pointer-events-none transition-all duration-150 border border-white/10"
              style={{
                left: `${(points[activePoint].x / width) * 100}%`,
                top: `${(points[activePoint].y / height) * 100 - 18}%`,
                transform: "translate(-50%, -100%)",
              }}
            >
              <div className="font-semibold text-[9.5px] opacity-75">{points[activePoint].day.date}</div>
              S/. {points[activePoint].day.amount.toFixed(2)}
            </div>
          )}
        </div>
      </div>

      {/* Chart 2: Order Status Distribution */}
      <div className="border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/40 dark:backdrop-blur-xl rounded-2xl shadow-xl p-5 flex flex-col">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Distribución de Pedidos
          </h3>
          <p className="text-2xl font-extrabold text-slate-950 dark:text-white mt-1">
            Por Estado Operativo
          </p>
        </div>

        <div className="flex-grow flex flex-col justify-center space-y-4">
          {statusData.map((item, idx) => {
            const maxVal = Math.max(...statusData.map(s => s.count), 1);
            const percentage = (item.count / maxVal) * 100;

            return (
              <div 
                key={item.status} 
                className="space-y-1.5"
                onMouseEnter={() => setActiveBar(idx)}
                onMouseLeave={() => setActiveBar(null)}
              >
                <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-350">
                  <span className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${item.color}`} />
                    {item.label}
                  </span>
                  <span className="font-mono text-slate-900 dark:text-white bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                    {item.count} {item.count === 1 ? "pedido" : "pedidos"}
                  </span>
                </div>

                <div className="h-3 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden relative">
                  <div 
                    className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                    style={{ 
                      width: `${percentage}%`,
                      filter: activeBar === idx ? "brightness(1.1)" : "none",
                      boxShadow: activeBar === idx ? "0 0 12px currentColor" : "none"
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
