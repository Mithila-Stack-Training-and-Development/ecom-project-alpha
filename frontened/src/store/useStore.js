import { create } from 'zustand';

const useStore = create((set) => ({
  // ─────────── USER ───────────
  user: null, // structure: { id, name, email, token, ... }

  setUser: (user) => set({ user }),

  logout: () => set({
    user: null,
    cart: [],
    orders: [],
  }),

  // ─────────── THEME ───────────
  theme: 'light',

  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),

  // ─────────── CART ───────────
  cart: [],

  addToCart: (product) =>
    set((state) => {
      const exists = state.cart.find((item) => item.id === product.id);
      return {
        cart: exists
          ? state.cart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          : [...state.cart, { ...product, quantity: 1 }],
      };
    }),

  updateQuantity: (id, qty) =>
    set((state) => ({
      cart:
        qty <= 0
          ? state.cart.filter((item) => item.id !== id)
          : state.cart.map((item) =>
              item.id === id ? { ...item, quantity: qty } : item
            ),
    })),

  removeFromCart: (id) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== id),
    })),

  clearCart: () => set({ cart: [] }),

  // ─────────── ORDERS ───────────
  orders: [],

  fetchOrders: async (token) => {
    try {
      const response = await fetch('/api/orders', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json(); // Expecting array of orders
      set({ orders: data });
    } catch (error) {
      console.error('Order fetch error:', error);
      set({ orders: [] });
    }
  },
}));

export default useStore;
