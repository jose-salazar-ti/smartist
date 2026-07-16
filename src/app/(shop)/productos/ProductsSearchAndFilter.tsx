"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";
import { getCategoryIconByKey } from "@/components/ui/icons";

interface FilterBtn {
  id: string;
  label: string;
  emoji: string;
}

const defaultFilters: FilterBtn[] = [
  { id: "Todos", label: "Todos los Artículos", emoji: "✨" },
  { id: "tazas", label: "Tazas Personalizadas", emoji: "taza" },
  { id: "ropa", label: "Ropa & Textil", emoji: "ropa" },
  { id: "oficina", label: "Oficina & Tech", emoji: "laptop" }
];

function getCategoryEmoji(name: string): string {
  const norm = name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  if (norm.includes("taza")) return "taza";
  if (norm.includes("ropa") || norm.includes("textil") || norm.includes("polo") || norm.includes("camiseta") || norm.includes("prenda")) return "ropa";
  if (norm.includes("oficina") || norm.includes("tech") || norm.includes("mouse") || norm.includes("computa")) return "laptop";
  if (norm.includes("pareja") || norm.includes("enamora") || norm.includes("amor")) return "heart";
  if (norm.includes("regalo") || norm.includes("detalle")) return "gift";
  if (norm.includes("llavero")) return "key";
  if (norm.includes("gorra")) return "cap";
  if (norm.includes("termo") || norm.includes("tomatodo") || norm.includes("vaso") || norm.includes("botella") || norm.includes("vasos")) return "bottle";
  if (norm.includes("joyeria") || norm.includes("joya") || norm.includes("gema") || norm.includes("collar") || norm.includes("pulsera")) return "joyeria";
  if (norm.includes("rompecabezas") || norm.includes("puzzle")) return "rompecabezas";
  return "tag";
}

const renderFilterIcon = (emojiOrKey: string) => {
  if (!emojiOrKey) return "🏷️";
  
  const iconKeys = [
    "taza", "tazas", "mug", 
    "ropa", "polos", "textil", "shirt", "prendas", "prenda",
    "gift", "regalo", "regalos", 
    "key", "llavero", "llaveros", 
    "cap", "gorra", "gorras", 
    "bottle", "termo", "vaso", "tomatodo", "vasos",
    "laptop", "tech", "oficina", 
    "heart", "pareja", "amor", 
    "facebook", "instagram", "tiktok", "whatsapp", "tag",
    "joyeria", "joyería", "gem",
    "puzzle", "rompecabezas"
  ];

  const normKey = emojiOrKey.toLowerCase().trim();
  if (iconKeys.includes(normKey)) {
    return getCategoryIconByKey(normKey, { size: 16, style: { display: 'inline-block', verticalAlign: 'middle' } });
  }

  if (emojiOrKey.startsWith("http") || emojiOrKey.startsWith("/")) {
    return <img src={emojiOrKey} alt="icon" style={{ width: '16px', height: '16px', objectFit: 'cover', borderRadius: '3px', display: 'inline-block', verticalAlign: 'middle' }} />;
  }

  return emojiOrKey;
};

export default function ProductsSearchAndFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentCategory = searchParams.get("category") || "Todos";
  const currentSearch = searchParams.get("search") || "";
  const currentCustomizable = searchParams.get("customizable") === "true";
  
  const [searchVal, setSearchVal] = useState(currentSearch);
  const [filters, setFilters] = useState<FilterBtn[]>(defaultFilters);

  // Load categories dynamically
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetch("/api/categorias");
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data) && data.length > 0) {
            const mapped: FilterBtn[] = [
              { id: "Todos", label: "Todos los Artículos", emoji: "✨" },
              ...data.map((c: any) => ({
                id: c.slug, // Uses slug as ID for robust query matching
                label: c.nombre,
                emoji: (c.imagen && (c.imagen.startsWith("http") || c.imagen.includes("/uploads/"))) 
                  ? c.imagen 
                  : getCategoryEmoji(c.nombre)
              }))
            ];
            setFilters(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to load shop categories filters:", err);
      }
    };
    loadCategories();
  }, []);

  // Keep search input sync with searchParams
  useEffect(() => {
    setSearchVal(currentSearch);
  }, [currentSearch]);

  const updateFilters = (category: string, search: string, customizable: boolean) => {
    const params = new URLSearchParams();
    if (category !== "Todos") {
      params.set("category", category);
    }
    if (search.trim()) {
      params.set("search", search.trim());
    }
    if (customizable) {
      params.set("customizable", "true");
    }
    router.push(`/productos?${params.toString()}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters(currentCategory, searchVal, currentCustomizable);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '40px' }}>
      
      {/* Top Search & Category Heading */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
        
        {/* Category Selector Tabs Scrollable Wrapper */}
        <div style={{ 
          position: 'relative', 
          flex: '1 1 auto', 
          maxWidth: '100%', 
          overflow: 'hidden'
        }}>
          {/* Right edge fade effect */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: '40px',
            background: 'linear-gradient(90deg, transparent, var(--bg-dark))',
            pointerEvents: 'none',
            zIndex: 10
          }} />
          
          <div className="scrollbar-hide" style={{ 
            display: 'flex', 
            gap: '8px', 
            overflowX: 'auto', 
            whiteSpace: 'nowrap',
            paddingBottom: '8px',
            WebkitOverflowScrolling: 'touch',
            width: '100%'
          }}>
            {filters.map((filter) => {
              const isActive = currentCategory.toLowerCase() === filter.id.toLowerCase();
              return (
                <button
                  key={filter.id}
                  onClick={() => updateFilters(filter.id, searchVal, currentCustomizable)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 18px',
                    borderRadius: '99px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
                    background: isActive ? 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)' : 'var(--bg-dark-3)',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: isActive ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none',
                    flexShrink: 0
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = 'var(--text-muted)';
                  }}
                  onMouseOut={(e) => {
                    if (!isActive) e.currentTarget.style.borderColor = 'var(--border)';
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                    {renderFilterIcon(filter.emoji)}
                  </span>
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search bar inside Catalog page */}
        <form onSubmit={handleSearchSubmit} style={{ 
          position: 'relative', 
          width: '100%', 
          maxWidth: '360px',
          background: 'var(--bg-dark-3)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          padding: '2px 14px',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <button type="submit" style={{ background: 'transparent', border: 'none', padding: 0, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', cursor: 'pointer', marginRight: '8px' }}>
            <Search size={18} />
          </button>
          <input
            type="search"
            placeholder="Buscar por nombre o descripción..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '13px',
              padding: '10px 0',
              outline: 'none',
              width: '100%'
            }}
          />
        </form>

      </div>

      {/* Row for Options and active filters indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Customizable checkbox */}
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '8px', 
          fontSize: '13px', 
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          userSelect: 'none'
        }}>
          <input 
            type="checkbox"
            checked={currentCustomizable}
            onChange={(e) => updateFilters(currentCategory, searchVal, e.target.checked)}
            style={{
              accentColor: 'var(--primary)',
              width: '15px',
              height: '15px',
              cursor: 'pointer'
            }}
          />
          <span>🎨 Ver solo artículos personalizables en vivo</span>
        </label>

        {/* Showing query parameters indicator if active */}
        {(currentSearch || currentCategory !== "Todos" || currentCustomizable) && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span>Filtros activos:</span>
            {currentCategory !== "Todos" && (
              <span style={{ padding: '4px 12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-light)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                Categoría: {filters.find(f => f.id.toLowerCase() === currentCategory.toLowerCase())?.label || currentCategory}
              </span>
            )}
            {currentSearch && (
              <span style={{ padding: '4px 12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-light)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                Búsqueda: "{currentSearch}"
              </span>
            )}
            {currentCustomizable && (
              <span style={{ padding: '4px 12px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-light)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
                Personalizable
              </span>
            )}
            <button 
              onClick={() => {
                setSearchVal("");
                router.push("/productos");
              }}
              style={{ fontSize: '11px', color: 'var(--primary-light)', background: 'transparent', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: '4px' }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
