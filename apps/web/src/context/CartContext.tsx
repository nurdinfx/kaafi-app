'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  image: string;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  storeName?: string;
  sku?: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalItems: number;
  subtotal: number;
  discountCode: string;
  discountAmount: number;
  finalTotal: number;
  applyDiscountCode: (code: string) => boolean;
  generateWhatsAppOrderUrl: (customerName?: string, customerCity?: string) => string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fududeeye_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from storage', e);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('fududeeye_cart', JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save cart to storage', e);
    }
  }, [items]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (i) => i.id === item.id && i.selectedColor === item.selectedColor && i.selectedSize === item.selectedSize
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { ...item, quantity }];
      }
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
    setDiscountCode('');
    setDiscountAmount(0);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyDiscountCode = (code: string) => {
    const clean = code.trim().toUpperCase();
    if (clean === 'FUDUDEEYE10' || clean === 'BAKAARAHA10' || clean === 'SOMALIA10') {
      setDiscountCode(clean);
      setDiscountAmount(subtotal * 0.1);
      return true;
    } else if (clean === 'KAAFI20') {
      setDiscountCode(clean);
      setDiscountAmount(subtotal * 0.2);
      return true;
    }
    return false;
  };

  const finalTotal = Math.max(0, subtotal - discountAmount);

  const generateWhatsAppOrderUrl = (customerName = '', customerCity = 'Garoowe') => {
    let text = `*DALABKA SHANTA (KAAFI-APP ONLINE)*\n\n`;
    text += `Asc! Waxaan rabaa inaan dalbado alaabtan soo socota:\n`;
    text += `────────────────────\n`;

    items.forEach((item, index) => {
      text += `${index + 1}. *${item.title}*\n`;
      text += `   - Cadadka: ${item.quantity} xabbo\n`;
      text += `   - Qiimaha: $${(item.price * item.quantity).toFixed(2)}`;
      if (item.selectedColor) text += ` | Midab: ${item.selectedColor}`;
      if (item.selectedSize) text += ` | Cabbir: ${item.selectedSize}`;
      if (item.storeName) text += ` (Store: ${item.storeName})`;
      text += `\n`;
    });

    text += `────────────────────\n`;
    text += `*Wadarta Guud: $${finalTotal.toFixed(2)}*\n`;
    if (discountAmount > 0) {
      text += `*Qiimo Dhimis: -$${discountAmount.toFixed(2)} (${discountCode})*\n`;
    }
    if (customerName) text += `*Magaca Macmiilka:* ${customerName}\n`;
    text += `*Magaalada & Goobta:* ${customerCity}\n`;
    text += `*Habka Lacag Bixinta:* EVC Plus / eDahab / Sahal / Zaad\n\n`;
    text += `Fadlan ii xaqiiji dalabkayga iyo xilliga la ii keenayo. Mahadsanidiin!`;

    // Standard WhatsApp merchant support number for Somalia
    const waNumber = '252615000000';
    return `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        totalItems,
        subtotal,
        discountCode,
        discountAmount,
        finalTotal,
        applyDiscountCode,
        generateWhatsAppOrderUrl,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
