import { create } from 'zustand';

/* ───────── helpers ───────── */
const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem('cart')) || [];
  } catch {
    return [];
  }
};

const saveCart = (cart) => {
  try {
    localStorage.setItem('cart', JSON.stringify(cart));
  } catch {
    /* ignore quota / serialisation errors */
  }
};

/* ───────── store ───────── */
const useStore = create((set, get) => ({
  /* ─── USER ─── */
  user: null, // { id, name, email, token }
  setUser: (user) => set({ user }),

  logout: () =>
    set({
      user: null,
      cart: [],
      orders: [],
    }),

  /* ─── THEME ─── */
  theme: 'light',
  toggleTheme: () =>
    set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),

  /* ─── CART ─── */
  cart: loadCart(),

  addToCart: (product) =>
    set((state) => {
      const pid = product.id ?? product._id;
      if (!pid) {
        console.error('Product missing id/_id:', product);
        return { cart: state.cart };
      }

      const exists = state.cart.find((item) => item.id === pid);

      const updatedCart = exists
        ? state.cart.map((item) =>
            item.id === pid ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [...state.cart, { ...product, id: pid, quantity: 1 }];

      saveCart(updatedCart);
      return { cart: updatedCart };
    }),

  updateQuantity: (id, qty) =>
    set((state) => {
      const updatedCart =
        qty <= 0
          ? state.cart.filter((i) => i.id !== id)
          : state.cart.map((i) =>
              i.id === id ? { ...i, quantity: qty } : i
            );

      saveCart(updatedCart);
      return { cart: updatedCart };
    }),

  removeFromCart: (id) =>
    set((state) => {
      const updatedCart = state.cart.filter((i) => i.id !== id);
      saveCart(updatedCart);
      return { cart: updatedCart };
    }),

  clearCart: () => {
    saveCart([]);
    set({ cart: [] });
  },

  /* ─── ORDERS ─── */
  orders: [],

  fetchOrders: async (token) => {
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Backend ${res.status}: ${text}`);
      }

      set({ orders: await res.json() });
    } catch (err) {
      console.error('Order fetch error →', err);
      set({ orders: [] });
    }
  },
}));

export default useStore;
