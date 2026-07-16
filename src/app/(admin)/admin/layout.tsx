import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import { verifyAdmin } from "@/lib/auth-utils";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await verifyAdmin();
  if (!auth.isAdmin) {
    redirect("/login");
  }

  return (
    <div
      className="flex min-h-screen bg-cover bg-fixed relative"
      style={{
        background: "var(--admin-bg)",
      }}
    >
      {/* Subtle dot-grid pattern overlay */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.07) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      {/* Background glow orb */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          top: "-15%",
          right: "-10%",
          width: "700px",
          height: "700px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 65%)",
          pointerEvents: "none",
          zIndex: 0,
          filter: "blur(40px)",
        }}
      />
      
      {/* Sidebar Navigation */}
      <AdminSidebar 
        currentUser={auth.user!} 
        isAdmin={auth.isAdmin} 
        isSeller={auth.isSeller} 
      />

      {/* Main Backoffice Content Area */}
      <div className="flex-grow flex flex-col min-w-0 relative z-10">
        
        {/* Mobile Header Nav */}
        <header className="h-16 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 flex items-center justify-between px-6 md:hidden sticky top-0 z-50 shadow-sm">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-base text-slate-900 dark:text-white tracking-wider flex items-center gap-1">
              Smart<span className="text-indigo-600 dark:text-indigo-400">ist</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-indigo-600 text-white rounded font-sans font-bold uppercase tracking-normal leading-none">Admin</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 text-xs font-semibold">
            <Link href="/admin/dashboard" className="text-slate-600 dark:text-slate-300">Dashboard</Link>
            <Link href="/admin/pedidos" className="text-slate-600 dark:text-slate-300">Pedidos</Link>
            <Link href="/admin/productos" className="text-slate-600 dark:text-slate-300">Productos</Link>
            <Link href="/admin/categorias" className="text-slate-600 dark:text-slate-300">Categorías</Link>
            <Link href="/admin/ajustes" className="text-slate-600 dark:text-slate-300">Ajustes</Link>
            <ThemeToggle />
          </div>
        </header>

        {/* Content Children */}
        <main className="p-6 md:p-8 flex-grow">
          {children}
        </main>
      </div>

    </div>
  );
}
