import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

// 1. Icono de Lupa con degradado para búsquedas vacías
export function GradientSearchIcon({ size = 32, ...props }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="url(#magGradient)" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      {...props}
    >
      <defs>
        <linearGradient id="magGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

// 2. Icono de Bolsa de Compras para el paso 1
export function StepCartIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

// 3. Icono de Paleta para el paso 2
export function StepPaletteIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.7255 3.09032 17.1962 4.85857 19C5.34784 19.4893 5.41944 20.2524 5.09706 20.8267L4.76742 21.4127C4.43632 22.0013 4.86178 22.7228 5.53924 22.7228H12Z" />
      <circle cx="7.5" cy="10.5" r="1.5" fill="currentColor" />
      <circle cx="11.5" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="16.5" cy="9.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="14.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

// 4. Icono de Tarjeta para el paso 3
export function StepCardIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2" />
      <line x1="2" y1="10" x2="22" y2="10" />
    </svg>
  );
}

// 5. Icono de Camión para el paso 4
export function StepTruckIcon({ size = 24, ...props }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <rect x="1" y="3" width="15" height="13" />
      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  );
}

// 6. Redes Sociales
export function FacebookIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export function InstagramIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051C.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
    </svg>
  );
}

export function TikTokIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.06-2.89-.52-4.06-1.41-.67-.5-1.22-1.18-1.57-1.96V14.5c.01 1.94-.49 3.96-1.68 5.5-1.5 1.95-4.05 3.09-6.52 2.91-2.44-.17-4.83-1.61-5.94-3.83-1.39-2.72-1.07-6.39.84-8.75 1.62-2 4.29-3.01 6.83-2.58v4.07c-1.43-.26-3 .15-3.85 1.33-.87 1.17-.92 2.87-.14 4.09.84 1.3 2.5 1.95 3.99 1.53 1.16-.32 1.99-1.39 2.01-2.6V.02z"/>
    </svg>
  );
}

export function WhatsAppIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      {...props}
    >
      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.73-1.45L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.623-1.023-5.086-2.885-6.948C16.59 2.007 14.13 1.01 11.499 1.01c-5.437 0-9.862 4.371-9.866 9.8.001 2.009.529 3.968 1.536 5.717L1.93 22.083l5.803-1.517zM17.65 14.49c-.3-.15-1.782-.878-2.057-.978-.275-.1-.475-.15-.675.15-.2.3-.775.977-.95 1.178-.175.2-.35.225-.65.075-3.56-1.783-5.183-3.238-6.626-5.712-.3-.52-.075-.775.125-.975.18-.18.4-.475.6-.7.2-.225.275-.375.4-.625.125-.25.062-.475-.031-.675-.094-.2-1.782-4.29-1.812-4.364-.29-.705-.623-.623-.846-.623l-.71-.01c-.25 0-.66.094-.99.46-.34.375-1.282 1.254-1.282 3.057 0 1.8 1.306 3.54 1.488 3.79.18.25 2.583 3.94 6.26 5.525.875.378 1.56.602 2.09.77.88.28 1.68.24 2.3.15.7-.1 1.78-.727 2.03-1.43.25-.705.25-1.307.17-1.43-.07-.123-.27-.197-.57-.347z"/>
    </svg>
  );
}

// 7. Iconos de Categorías Comunes
export function MugIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
      <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
      <line x1="6" y1="2" x2="6" y2="4" />
      <line x1="10" y1="2" x2="10" y2="4" />
      <line x1="14" y1="2" x2="14" y2="4" />
    </svg>
  );
}

export function ShirtIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.38 3.46L16 6.14V4a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v2.14L3.62 3.46a2 2 0 0 0-2.38.9L0 7.82a2 2 0 0 0 .58 2.56L5 13.5V20a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6.5l4.42-3.12a2 2 0 0 0 .58-2.56l-1.24-3.46a2 2 0 0 0-2.38-.9Z" />
    </svg>
  );
}

export function GiftIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7Z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7Z" />
    </svg>
  );
}

export function KeyIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="m21 2-9.6 9.6" />
      <path d="m15.5 7.5 3 3M14 6l3 3" />
    </svg>
  );
}

export function CapIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 18h20" />
      <path d="M18.5 9A6.5 6.5 0 0 0 12 2.5h-1A6.5 6.5 0 0 0 4.5 9v3h14Z" />
      <path d="M12 2.5V6" />
    </svg>
  );
}

export function BottleIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M8.5 2h7" />
      <path d="M9 2v4a3 3 0 0 0 3 3h0a3 3 0 0 0 3-3V2" />
      <path d="M7 9v11a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9" />
    </svg>
  );
}

export function LaptopIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
      <line x1="2" y1="20" x2="22" y2="20" />
      <line x1="12" y1="17" x2="12" y2="20" />
    </svg>
  );
}

export function HeartIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

export function TagIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

export function SmartistLogo({ size = 32, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill="url(#logoGradient)" />
      <path d="M9 22C9 18 13 17 16 16C19 15 23 14 23 10C23 6 19 6 16 6C13 6 10 7 9 9" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M23 10C23 14 19 15 16 16C13 17 9 18 9 22C9 26 13 26 16 26C19 26 22 25 23 23" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function BuildingIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
      <line x1="9" y1="22" x2="9" y2="16" />
      <line x1="15" y1="22" x2="15" y2="16" />
      <line x1="9" y1="16" x2="15" y2="16" />
      <path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M12 6h.01M12 10h.01" />
    </svg>
  );
}

export function RocketIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4.5 16.5c-1.5 1.25-2.5 3.5-2.5 3.5s2.25-1 3.5-2.5" />
      <path d="M12 12l9-9-9 9Z" />
      <path d="M12 12c-1.5 4-1 7.5-1 7.5s3.5.5 7.5-1" />
      <path d="M9 15c-2.5-2.5-6-3-6-3s.5 3.5 3 6c2.5 2.5 6 3 6 3s-.5-3.5-3-6Z" />
    </svg>
  );
}

export function SparklesIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275Z" />
      <path d="m5 3 1 2.5L8.5 6 6 7 5 9.5 4 7 1.5 6 4 5.5Z" />
      <path d="m19 17 1 2.5 2.5.5-2.5 1-1 2.5-1-2.5-2.5-1 2.5-1Z" />
    </svg>
  );
}

export function GemIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 3h12l4 6-10 13L2 9Z" />
      <path d="M11 3 8 9l4 13 4-13-3-6" />
      <path d="M2 9h20" />
    </svg>
  );
}

export function PuzzleIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22c-1.5 0-3-.5-4-1.5C6 19.5 6 18 6 18a1.5 1.5 0 0 0-1.5-1.5c-1.5 0-2.5 1-2.5 1S1 16 1 14.5a3 3 0 0 1 3-3h.5A1.5 1.5 0 0 0 6 10c0-1.5-1-2.5-1-2.5S6.5 6 8 6a1.5 1.5 0 0 0 1.5-1.5c0-1.5-1-2.5-1-2.5S10 1 11.5 1a3 3 0 0 1 3 3v.5A1.5 1.5 0 0 0 16 6c1.5 0 2.5-1 2.5-1S20 6.5 20 8a1.5 1.5 0 0 0 1.5 1.5c1.5 0 2.5-1 2.5-1S23 11 23 12.5a3 3 0 0 1-3 3h-.5a1.5 1.5 0 0 0-1.5 1.5c0 1.5 1 2.5 1 2.5S17.5 21 16 21a1.5 1.5 0 0 0-1.5 1.5c0 1.5 1 2.5 1 2.5" />
    </svg>
  );
}

// Helper para mapear una key o nombre de icono a su respectivo componente
export function getCategoryIconByKey(key: string, props?: IconProps) {
  const norm = key.toLowerCase().trim();
  switch (norm) {
    case "mug":
    case "taza":
    case "tazas":
      return <MugIcon {...props} />;
    case "shirt":
    case "ropa":
    case "polos":
    case "textil":
      return <ShirtIcon {...props} />;
    case "gift":
    case "regalo":
    case "regalos":
      return <GiftIcon {...props} />;
    case "key":
    case "llavero":
    case "llaveros":
      return <KeyIcon {...props} />;
    case "cap":
    case "gorra":
    case "gorras":
      return <CapIcon {...props} />;
    case "bottle":
    case "termo":
    case "vaso":
    case "tomatodo":
    case "vasos":
      return <BottleIcon {...props} />;
    case "laptop":
    case "tech":
    case "oficina":
      return <LaptopIcon {...props} />;
    case "heart":
    case "pareja":
    case "amor":
    case "enamorados":
      return <HeartIcon {...props} />;
    case "facebook":
      return <FacebookIcon {...props} />;
    case "instagram":
      return <InstagramIcon {...props} />;
    case "tiktok":
      return <TikTokIcon {...props} />;
    case "whatsapp":
      return <WhatsAppIcon {...props} />;
    case "building":
    case "corporativo":
    case "empresa":
    case "empresas":
      return <BuildingIcon {...props} />;
    case "rocket":
    case "emprendedor":
    case "emprendedores":
      return <RocketIcon {...props} />;
    case "sparkles":
    case "todos":
    case "estrella":
    case "estrellas":
      return <SparklesIcon {...props} />;
    case "gem":
    case "joyeria":
    case "joyería":
      return <GemIcon {...props} />;
    case "puzzle":
    case "rompecabezas":
      return <PuzzleIcon {...props} />;
    case "cat":
    case "cats":
    case "gato":
    case "gatos":
      return <CatIcon {...props} />;
    default:
      return <TagIcon {...props} />;
  }
}

export function CatIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      {...props}
    >
      <path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 2.67-2 3.5 0 .67.53 1.11 1.25 1.26 2.06.6 2.06.9 4.14.9 6.24a8 8 0 0 1-16 0c0-2.1.3-4.18.9-6.24.15-.81.59-1.53 1.26-2.06.83-2 1.72-2 3.5 0 .65-.17 1.33-.26 2-.26Z" />
      <path d="M9 14h.01" strokeWidth="3" />
      <path d="M15 14h.01" strokeWidth="3" />
      <path d="M8 18c2 1 6 1 8 0" />
    </svg>
  );
}
