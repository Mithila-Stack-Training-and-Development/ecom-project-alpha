import { create } from 'zustand';

const useStore = create((set) => ({
  cart: [],
  theme: 'light',
  user: null,
  addToCart: (product) => set((state) => ({
    cart: [...state.cart, { ...product, quantity: 1 }],
  })),
  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== id),
  })),
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light',
  })),
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

export default useStore;