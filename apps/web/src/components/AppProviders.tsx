'use client';

import React from 'react';
import { LanguageProvider } from '../context/LanguageContext';
import { CartProvider } from '../context/CartContext';
import { StoreProvider } from '../context/StoreContext';
import CartDrawer from './CartDrawer';
import FloatingWhatsApp from './FloatingWhatsApp';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <StoreProvider>
        <CartProvider>
          {children}
          <CartDrawer />
          <FloatingWhatsApp />
        </CartProvider>
      </StoreProvider>
    </LanguageProvider>
  );
}
