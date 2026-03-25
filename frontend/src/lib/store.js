import { create } from "zustand";
import { persist } from "zustand/middleware";

function upsertItem(cart, product, customization = {}) {
  const existing = cart.find((item) => item.id === product._id && JSON.stringify(item.customization) === JSON.stringify(customization));

  if (existing) {
    return cart.map((item) =>
      item.id === product._id && JSON.stringify(item.customization) === JSON.stringify(customization)
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    );
  }

  return [
    ...cart,
    {
      id: product._id,
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      customization,
      quantity: 1,
    },
  ];
}

export const useMorlaStore = create(
  persist(
    (set, get) => ({
      cart: [],
      favorites: [],
      customer: null,
      loyaltyPoints: 240,
      addToCart: (product, customization = {}) =>
        set((state) => ({
          cart: upsertItem(state.cart, product, customization),
        })),
      removeFromCart: (itemId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== itemId),
        })),
      updateQuantity: (itemId, quantity) =>
        set((state) => ({
          cart: state.cart
            .map((item) => (item.id === itemId ? { ...item, quantity: Math.max(1, quantity) } : item))
            .filter(Boolean),
        })),
      clearCart: () => set({ cart: [] }),
      toggleFavorite: (product) =>
        set((state) => ({
          favorites: state.favorites.includes(product._id)
            ? state.favorites.filter((item) => item !== product._id)
            : [...state.favorites, product._id],
        })),
      setCustomer: (customer) => set({ customer }),
      clearCustomer: () => set({ customer: null }),
      earnPoints: (amount) =>
        set((state) => ({
          loyaltyPoints: state.loyaltyPoints + Math.max(0, Math.floor(amount / 5)),
        })),
      spendPoints: (points) =>
        set((state) => ({
          loyaltyPoints: Math.max(0, state.loyaltyPoints - points),
        })),
      subtotal: () =>
        get().cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      cartCount: () => get().cart.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: "morla-coffee-store",
    },
  ),
);
