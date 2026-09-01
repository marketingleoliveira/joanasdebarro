import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  quantity: number;
  stock: number;
}

interface CartContextType {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextType>({
  items: [], count: 0, subtotal: 0, add: () => {}, setQty: () => {}, remove: () => {}, clear: () => {},
});

export const useCart = () => useContext(CartContext);

const KEY = 'jdb-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add: CartContextType['add'] = (item, qty = 1) => {
    setItems((prev) => {
      const found = prev.find((i) => i.productId === item.productId);
      if (found) {
        return prev.map((i) =>
          i.productId === item.productId
            ? { ...i, ...item, quantity: Math.min(i.quantity + qty, Math.max(item.stock, 1)) }
            : i,
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const setQty = (productId: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, quantity: Math.max(1, qty) } : i)),
    );

  const remove = (productId: string) => setItems((prev) => prev.filter((i) => i.productId !== productId));
  const clear = () => setItems([]);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.quantity, 0),
      subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
      add,
      setQty,
      remove,
      clear,
    }),
    [items],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
