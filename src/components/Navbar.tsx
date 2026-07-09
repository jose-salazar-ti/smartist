"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const cartItems = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const cartCount = mounted ? cartItems.reduce((sum, item) => sum + item.quantity, 0) : 0;

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/productos?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <nav className="navbar" id="navbar">
      <div className="container">
        <Link href="/" className="navbar-logo">
          <span className="navbar-logo-text">Smart<span>ist</span></span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`} id="navLinks">
          <Link href="/" onClick={() => setMenuOpen(false)}>Inicio</Link>
          <Link href="/productos" onClick={() => setMenuOpen(false)}>Catálogo</Link>
          <Link href="/empresas" onClick={() => setMenuOpen(false)}>Empresas</Link>
          <Link href="/emprendedores" onClick={() => setMenuOpen(false)}>Emprendedores</Link>
          <Link href="/rastrear" onClick={() => setMenuOpen(false)}>Rastrear Pedido</Link>
        </div>

        <div className="navbar-actions">
          <form onSubmit={handleSearchSubmit} className="navbar-search">
            <button type="submit" style={{ background: 'transparent', border: 'none', padding: 0, color: 'inherit', display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
            <input 
              type="search" 
              placeholder="Buscar tazas, camisetas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <Link href="/carrito" className="btn-icon cart-btn" aria-label="Carrito" style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
            {cartCount > 0 && (
              <span className="cart-badge" style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: 'white', fontSize: '10px', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                {cartCount}
              </span>
            )}
          </Link>

          <ThemeToggle />

          <Link href="/login">
            <button className="btn btn-primary btn-login flex items-center justify-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
              </svg>
              <span className="hidden sm:inline">Ingresar</span>
            </button>
          </Link>

          <button className="menu-toggle" id="menuToggle" aria-label="Menú" onClick={() => setMenuOpen(!menuOpen)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
