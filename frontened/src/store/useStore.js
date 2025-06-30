import { create } from 'zustand';

const useStore = create((set) => ({
  cart: [],
  theme: 'light',
  user: null,
  admin: null, // ✅ Add this line to initialize admin state

  addToCart: (product) =>
    set((state) => ({
      cart: [...state.cart, { ...product, quantity: 1 }],
    })),

  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),

  setAdmin: (admin) => set({ admin }), // ✅ Correct

  setUser: (user) => set({ user }),     // ✅ Also needed for user login

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminToken');
    set({ user: null, admin: null });
  },
}));

export default useStore;
