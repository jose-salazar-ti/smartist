import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesState {
  favorites: string[];
  toggleFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      toggleFavorite: (productId) => {
        set((state) => {
          const isFav = state.favorites.includes(productId);
          const newFavorites = isFav
            ? state.favorites.filter((id) => id !== productId)
            : [...state.favorites, productId];
          return { favorites: newFavorites };
        });
      },
      isFavorite: (productId) => {
        return get().favorites.includes(productId);
      },
    }),
    {
      name: 'smartist-favorites',
    }
  )
);
