"use client";

import Link from "next/link";
import { getCategoryIconByKey } from "@/components/ui/icons";

export default function CategoriesSection() {
  return (
    <section className="categories" id="categorias">
      <div className="container">
        <div className="categories-header reveal">
          <div className="section-label">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
            Categorías
          </div>
          <h2 className="section-title">
            Encuentra tu producto <span className="gradient-text">ideal</span>
          </h2>
          <p className="section-subtitle">
            Desde tazas para el día a día hasta kits corporativos completos. Todos personalizables con tu propio diseño.
          </p>
        </div>

        <div className="categories-grid">
          <Link href="/productos?category=Tazas" className="category-card reveal reveal-delay-1" style={{ textDecoration: 'none' }}>
            <div className="category-icon">{getCategoryIconByKey("taza", { size: 28 })}</div>
            <div className="category-name">Tazas</div>
            <div className="category-count">12 productos</div>
          </Link>
          <Link href="/productos?category=Parejas" className="category-card reveal reveal-delay-2" style={{ textDecoration: 'none' }}>
            <div className="category-icon">{getCategoryIconByKey("amor", { size: 28 })}</div>
            <div className="category-name">Enamorados</div>
            <div className="category-count">8 productos</div>
          </Link>
          <Link href="/empresas" className="category-card reveal reveal-delay-3" style={{ textDecoration: 'none' }}>
            <div className="category-icon">{getCategoryIconByKey("corporativo", { size: 28 })}</div>
            <div className="category-name">Corporativo</div>
            <div className="category-count">15 productos</div>
          </Link>
          <Link href="/emprendedores" className="category-card reveal reveal-delay-4" style={{ textDecoration: 'none' }}>
            <div className="category-icon">{getCategoryIconByKey("rocket", { size: 28 })}</div>
            <div className="category-name">Emprendedores</div>
            <div className="category-count">10 productos</div>
          </Link>
          <Link href="/productos?category=Oficina" className="category-card reveal reveal-delay-5" style={{ textDecoration: 'none' }}>
            <div className="category-icon">{getCategoryIconByKey("laptop", { size: 28 })}</div>
            <div className="category-name">Oficina & Gaming</div>
            <div className="category-count">6 productos</div>
          </Link>
        </div>
      </div>
    </section>
  );
}
