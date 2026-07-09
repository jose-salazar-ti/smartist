import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique id for this cart line item
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  productName: string;
  variantTitle: string;
  productImage: string;
  customDesignBase64?: string; // Guarda el diseño final temporalmente (en RAM/LocalStorage)
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        set((state) => {
          // Si el producto NO es personalizado, podemos agruparlo si es la misma variante
          if (!item.customDesignBase64) {
            const existing = state.items.find(
              (i) => i.variantId === item.variantId && !i.customDesignBase64
            );
            if (existing) {
              return {
                items: state.items.map((i) =>
                  i.id === existing.id
                    ? { ...i, quantity: i.quantity + item.quantity }
                    : i
                ),
              };
            }
          }
          
          // Si es personalizado, siempre se añade como un ítem único nuevo
          return { items: [...state.items, item] };
        });
      },
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, quantity) } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },
    }),
    {
      name: 'sublimacion-cart', // Nombre bajo el que se guardará en el navegador
    }
  )
);
