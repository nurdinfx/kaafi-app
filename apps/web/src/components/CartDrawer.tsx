'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    subtotal,
    discountAmount,
    discountCode,
    finalTotal,
    applyDiscountCode,
    generateWhatsAppOrderUrl,
    clearCart,
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerCity, setCustomerCity] = useState('Garoowe');

  if (!isCartOpen) return null;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const ok = applyDiscountCode(promoInput);
    if (ok) {
      setPromoMessage({ type: 'success', text: `Koodhka ${promoInput.toUpperCase()} waa la aqbalay! (10% Dhimis)` });
    } else {
      setPromoMessage({ type: 'error', text: 'Koodhkan ma shaqeynayo. Isticmaal: FUDUDEEYE10' });
    }
  };

  const handleWhatsAppCheckout = () => {
    const url = generateWhatsAppOrderUrl(customerName, customerCity);
    window.open(url, '_blank');
  };

  const freeShippingThreshold = 50;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white text-slate-800 shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-orange-500 to-amber-600 text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-lg">
                🛒
              </div>
              <div>
                <h2 className="font-bold text-lg leading-tight font-display">
                  Shantada Wax Iibsiga
                </h2>
                <p className="text-xs text-orange-100">
                  {items.length === 0 ? 'Shantadu way maran tahay' : `${items.reduce((s, i) => s + i.quantity, 0)} shay ayaa ku jira`}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(false)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition-colors text-white"
              aria-label="Close cart"
            >
              ✕
            </button>
          </div>

          {/* Free Shipping bar */}
          <div className="bg-orange-50 px-5 py-2.5 border-b border-orange-100">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1 font-medium">
              <span>
                {subtotal >= freeShippingThreshold ? (
                  <span className="text-emerald-600 font-bold">🎉 Hambalyo! Waxaad heshay Gaarsiin Bilaash ah</span>
                ) : (
                  <span>
                    Ku dar <strong className="text-orange-600 font-bold">${(freeShippingThreshold - subtotal).toFixed(2)}</strong> si aad u hesho Gaarsiin Bilaash ah
                  </span>
                )}
              </span>
              <span className="font-bold text-orange-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-orange-200/60 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-orange-500 h-1.5 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart items list */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center text-4xl mb-4 shadow-inner">
                  🛍️
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">
                  Shantadaada waxba kuma jiraan
                </h3>
                <p className="text-sm text-slate-500 max-w-xs mb-6">
                  Dhexdhufo alaabooyinka aad jeceshahay si aad ugu darto shantaada.
                </p>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-500 shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5"
                >
                  Bilow Dukaameysiga →
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={`${item.id}-${item.selectedColor}-${item.selectedSize}`}
                  className="flex gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-orange-200 transition-colors shadow-sm"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-slate-900 text-sm line-clamp-2 leading-snug">
                          {item.title}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 text-xs"
                          title="Ka saar"
                        >
                          🗑️
                        </button>
                      </div>

                      {item.storeName && (
                        <p className="text-[11px] text-orange-600 font-medium mt-0.5 truncate">
                          🏪 {item.storeName}
                        </p>
                      )}

                      {(item.selectedColor || item.selectedSize) && (
                        <div className="flex gap-1.5 mt-1 text-[11px] text-slate-500">
                          {item.selectedColor && (
                            <span className="bg-slate-200 px-1.5 py-0.5 rounded">
                              {item.selectedColor}
                            </span>
                          )}
                          {item.selectedSize && (
                            <span className="bg-slate-200 px-1.5 py-0.5 rounded">
                              {item.selectedSize}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60">
                      <div className="font-bold text-slate-900 text-sm">
                        ${(item.price * item.quantity).toFixed(2)}
                        {item.quantity > 1 && (
                          <span className="text-[11px] font-normal text-slate-500 ml-1">
                            (${item.price.toFixed(2)} / xabbo)
                          </span>
                        )}
                      </div>

                      {/* Quantity Controller */}
                      <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-7 h-7 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              {/* Promo code */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Koodh dhimis (e.g. FUDUDEEYE10)"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs border border-slate-300 focus:outline-none focus:border-orange-500 bg-white"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl text-xs font-bold text-orange-700 bg-orange-100 hover:bg-orange-200 transition-colors"
                >
                  Dhimis
                </button>
              </form>

              {promoMessage && (
                <p className={`text-xs ${promoMessage.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {promoMessage.text}
                </p>
              )}

              {/* Totals */}
              <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-200">
                <div className="flex justify-between">
                  <span>Wadarta Alaabta:</span>
                  <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Qiimo Dhimis ({discountCode}):</span>
                    <span>-${discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Gaarsiinta:</span>
                  <span className="font-semibold text-emerald-600">
                    {subtotal >= freeShippingThreshold ? 'Bilaash (Free)' : '$2.00'}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Wadarta Guud:</span>
                  <span className="text-orange-600">
                    ${(finalTotal + (subtotal >= freeShippingThreshold ? 0 : 2)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Delivery Details Inputs for WhatsApp checkout */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Magacaaga"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 bg-white text-slate-800"
                />
                <select
                  value={customerCity}
                  onChange={(e) => setCustomerCity(e.target.value)}
                  className="px-2.5 py-1.5 rounded-lg text-xs border border-slate-300 bg-white text-slate-800"
                >
                  <option value="Garoowe">📍 Garoowe</option>
                  <option value="Muqdisho">📍 Muqdisho</option>
                  <option value="Hargeisa">📍 Hargeisa</option>
                  <option value="Bosaso">📍 Bosaso</option>
                  <option value="Kismaayo">📍 Kismaayo</option>
                  <option value="Baydhabo">📍 Baydhabo</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                {/* Direct WhatsApp Order */}
                <button
                  onClick={handleWhatsAppCheckout}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-transform hover:-translate-y-0.5"
                >
                  <span className="text-lg">💬</span>
                  Ku Dalbo WhatsApp (Direct Order)
                </button>

                {/* Web Checkout */}
                <Link
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-md transition-transform hover:-translate-y-0.5"
                >
                  <span>🛒</span>
                  Gudub Lacag Bixinta (Checkout)
                </Link>
              </div>

              <div className="text-center pt-1">
                <button
                  onClick={clearCart}
                  className="text-[11px] text-slate-400 hover:text-rose-500 underline"
                >
                  Faaruqi Shantada (Clear Cart)
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
