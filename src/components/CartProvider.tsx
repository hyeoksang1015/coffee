"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { addItem, parseCart, removeItem, setQty, type CartItem } from "@/lib/cart";

// 장바구니는 방문자 브라우저(localStorage)에만 둔다. 다른 탭에서 바꿔도 storage 이벤트로 맞춘다.
const KEY = "rhythm-cart";
const EMPTY: CartItem[] = [];
let items: CartItem[] | null = null;
const listeners = new Set<() => void>();

function read() {
  if (items) return items;
  try {
    items = parseCart(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
  } catch {
    items = [];
  }
  return items;
}

function write(next: CartItem[]) {
  items = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    // 저장소가 막혀 있으면 이 탭에서만 유지한다.
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    items = null;
    l();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(l);
    window.removeEventListener("storage", onStorage);
  };
}

type Cart = {
  items: CartItem[];
  add: (item: CartItem, opts?: { open?: boolean; name?: string }) => void;
  update: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  toast: string;
};

const CartContext = createContext<Cart | null>(null);

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart 는 CartProvider 안에서만 쓸 수 있습니다.");
  return c;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const list = useSyncExternalStore(subscribe, read, () => EMPTY);
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const add = useCallback<Cart["add"]>((item, opts) => {
    write(addItem(read(), item));
    if (opts?.open) return setOpen(true);
    setToast(`[${opts?.name ?? "원두"}] 장바구니에 담았습니다.`);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(""), 2600);
  }, []);

  const value = useMemo<Cart>(
    () => ({
      items: list,
      add,
      update: (key, qty) => write(setQty(read(), key, qty)),
      remove: (key) => write(removeItem(read(), key)),
      clear: () => write([]),
      open,
      setOpen,
      toast,
    }),
    [list, add, open, toast],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
