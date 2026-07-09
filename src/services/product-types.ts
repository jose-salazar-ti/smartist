export interface ProductVariant {
  id: string;
  title: string;
  sku: string;
  price: number;
  stock: number;
  imageUrl?: string;
  glbModelUrl?: string | null;
  blankMockupUrl?: string | null;
  maskImageUrl?: string | null;
  printDimensions?: any | null;
  mockupConfig?: any | null;
  options: {
    [key: string]: string; // e.g. { talla: "M" } or { capacidad: "11oz" }
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  isCustomizable: boolean;
  basePrice: number;
  imageUrl: string;
  galleryImages: string[];
  blankMockupUrl: string | null;
  maskImageUrl: string | null;
  glbModelUrl?: string | null;
  mockupConfig?: any;
  printDimensions?: any;
  features?: any;
  benefits?: any;
  variants: ProductVariant[];
  destacado?: boolean;
}
