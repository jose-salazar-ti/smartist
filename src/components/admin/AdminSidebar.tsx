"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  ClipboardList, 
  ShoppingBag, 
  ShieldCheck,
  Users,
  Settings,
  Tags,
  CreditCard,
  Truck,
  Activity,
  Inbox,
  ChevronDown,
  ChevronRight,
  Gift
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import SignOutButton from "@/components/SignOutButton";
import { SmartistLogo } from "@/components/ui/icons";

interface AdminSidebarProps {
  currentUser: {
    id: string;
    nombre: string;
    correo: string;
    rolId: string;
  };
  isAdmin: boolean;
  isSeller: boolean;
}

export default function AdminSidebar({ currentUser, isAdmin, isSeller }: AdminSidebarProps) {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState({
    ventas: true,
    catalog: true,
    ajustes: false,
  });

  const toggleMenu = (menuKey: keyof typeof openMenus) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  const isLinkActive = (href: string) => pathname === href;

  const activeLinkClass = "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/30 dark:text-indigo-400 border-l-4 border-indigo-500 shadow-sm";
  const inactiveLinkClass = "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white transition-all";

  return (
    <aside className="w-64 h-screen sticky top-0 bg-white/90 dark:bg-slate-950/50 backdrop-blur-2xl text-slate-700 dark:text-slate-300 flex-shrink-0 hidden md:flex flex-col border-r border-slate-200 dark:border-white/10 shadow-2xl z-20">
      
      {/* Top scrollable section: Header & Navigation */}
      <div className="flex-grow flex flex-col overflow-y-auto">
        {/* Sidebar Header */}
        <div className="h-16 px-6 flex items-center gap-2.5 border-b border-slate-200 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/40">
          <span className="font-heading font-extrabold text-base text-slate-900 dark:text-white tracking-wider flex flex-col justify-center">
            <div className="flex items-center gap-1">
              Smart<span className="text-indigo-600 dark:text-indigo-400">ist</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-indigo-600 text-white rounded font-sans font-bold uppercase tracking-normal leading-none">
                {isAdmin ? "Admin" : "Seller"}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-normal truncate max-w-[150px]">{currentUser.nombre}</span>
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          <Link href="/admin/dashboard" className={isLinkActive("/admin/dashboard") ? activeLinkClass : inactiveLinkClass}>
            <LayoutDashboard className="h-4.5 w-4.5 text-slate-450 dark:text-slate-450" />
            <span>Dashboard</span>
          </Link>

          {/* Grupo: Gestión de Ventas */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleMenu("ventas")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer text-left"
            >
              <span>Gestión de Ventas</span>
              {openMenus.ventas ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {openMenus.ventas && (
              <div className="pl-3 space-y-1">
                <Link href="/admin/pedidos" className={isLinkActive("/admin/pedidos") ? activeLinkClass : inactiveLinkClass}>
                  <ClipboardList className="h-4.5 w-4.5 text-slate-400" />
                  <span>Pedidos</span>
                </Link>
                <Link href="/admin/dedicatorias" className={isLinkActive("/admin/dedicatorias") ? activeLinkClass : inactiveLinkClass}>
                  <Gift className="h-4.5 w-4.5 text-slate-400" />
                  <span>Dedicatorias</span>
                </Link>
                {isAdmin && (
                  <Link href="/admin/mensajes" className={isLinkActive("/admin/mensajes") ? activeLinkClass : inactiveLinkClass}>
                    <Inbox className="h-4.5 w-4.5 text-slate-400" />
                    <span>Mensajes</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Grupo: Catálogo de Tienda */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => toggleMenu("catalog")}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer text-left"
            >
              <span>Catálogo de Tienda</span>
              {openMenus.catalog ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>

            {openMenus.catalog && (
              <div className="pl-3 space-y-1">
                <Link href="/admin/productos" className={isLinkActive("/admin/productos") ? activeLinkClass : inactiveLinkClass}>
                  <ShoppingBag className="h-4.5 w-4.5 text-slate-400" />
                  <span>Productos</span>
                </Link>
                <Link href="/admin/categorias" className={isLinkActive("/admin/categorias") ? activeLinkClass : inactiveLinkClass}>
                  <Tags className="h-4.5 w-4.5 text-slate-400" />
                  <span>Categorías</span>
                </Link>
              </div>
            )}
          </div>

          {/* Grupo: Ajustes y Configuración (Solo Administradores) */}
          {isAdmin && (
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => toggleMenu("ajustes")}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer text-left"
              >
                <span>Ajustes y Configuración</span>
                {openMenus.ajustes ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>

              {openMenus.ajustes && (
                <div className="pl-3 space-y-1">
                  <Link href="/admin/metodos-pago" className={isLinkActive("/admin/metodos-pago") ? activeLinkClass : inactiveLinkClass}>
                    <CreditCard className="h-4.5 w-4.5 text-slate-400" />
                    <span>Métodos de Pago</span>
                  </Link>
                  <Link href="/admin/metodos-envio" className={isLinkActive("/admin/metodos-envio") ? activeLinkClass : inactiveLinkClass}>
                    <Truck className="h-4.5 w-4.5 text-slate-400" />
                    <span>Métodos de Envío</span>
                  </Link>
                  <Link href="/admin/estados-pedido" className={isLinkActive("/admin/estados-pedido") ? activeLinkClass : inactiveLinkClass}>
                    <Activity className="h-4.5 w-4.5 text-slate-450 dark:text-slate-400" />
                    <span>Estados de Pedido</span>
                  </Link>
                  <Link href="/admin/usuarios" className={isLinkActive("/admin/usuarios") ? activeLinkClass : inactiveLinkClass}>
                    <Users className="h-4.5 w-4.5 text-slate-400" />
                    <span>Gestión de Usuarios</span>
                  </Link>
                  <Link href="/admin/ajustes" className={isLinkActive("/admin/ajustes") ? activeLinkClass : inactiveLinkClass}>
                    <Settings className="h-4.5 w-4.5 text-slate-400" />
                    <span>Ajustes del Negocio</span>
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </div>

      {/* Bottom fixed section: Theme, Logout & Connection status */}
      <div className="p-4 border-t border-slate-200 dark:border-white/5 space-y-3 flex-shrink-0 bg-slate-50/50 dark:bg-slate-950/20">
        <Link href="/" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white transition-all text-slate-500 dark:text-slate-450">
          <ShoppingBag className="h-4.5 w-4.5 text-slate-400" />
          <span>Ver Tienda Pública</span>
        </Link>

        <div className="px-3 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">Tema</span>
          <ThemeToggle />
        </div>

        <div className="px-0">
          <SignOutButton />
        </div>

        <div className="pt-3 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 border-t border-slate-200 dark:border-white/5">
          <ShieldCheck className="h-4 w-4 text-indigo-500" />
          <span>Conexión Segura</span>
        </div>
      </div>

    </aside>
  );
}
