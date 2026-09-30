'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StoreProduct } from '../context/StoreContext';
import { useCart } from '../context/CartContext';

interface ProductDetailModalProps {
  product: StoreProduct | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addToCart } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>(product?.colors?.[0] || 'Standard');
  const [selectedSize, setSelectedSize] = useState<string>(product?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!product) return null;

  const currentImage = product.images[selectedImageIndex] || product.images[0];

  const handleAddToCart = () => {
    addToCart(
      {
        id: product.id,
        title: product.title,
        price: product.price,
        originalPrice: product.compareAtPrice,
        image: currentImage,
        selectedColor,
        selectedSize: selectedSize || undefined,
        storeName: product.storeName,
        sku: product.sku,
      },
      quantity
    );

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleWhatsAppDirect = () => {
    const text = `Asc ${product.storeName}! Waxaan rabaa inaan si toos ah u iibsado alaabtan:\n*${product.title}*\nQiimaha: $${product.price}\nSKU: ${product.sku}\nCadadka: ${quantity} xabbo\nMidabka: ${selectedColor}\nFadlan iiga soo jawaaba!`;
    const waUrl = `https://wa.me/252615000000?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-4 sm:p-6 text-center">
        <div
          className="relative w-full max-w-4xl transform overflow-hidden rounded-3xl bg-white text-left shadow-2xl transition-all border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg transition-colors"
          >
            ✕
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 sm:p-8">
            {/* Left: Gallery */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center group">
                <img
                  src={currentImage}
                  alt={product.title}
                  className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                />

                {/* Discount Tag */}
                {product.discountPercent && product.discountPercent > 0 && (
                  <div className="absolute top-3 left-3 bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-md shadow-md tracking-wider">
                    -{product.discountPercent}% DHIMIS
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex gap-2.5 overflow-x-auto pb-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-orange-500 ring-2 ring-orange-200'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Specifications snippet (Faahfaahinta) */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs text-slate-700">
                <h4 className="font-bold text-slate-900 mb-2 font-display text-sm">
                  📋 Faahfaahinta
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="text-slate-500">Choice:</div>
                  <div className="font-medium text-slate-800">Haa (Verified Quality)</div>
                  <div className="text-slate-500">Asalka (Origin):</div>
                  <div className="font-medium text-slate-800">Original Import</div>
                  <div className="text-slate-500">Brand Name:</div>
                  <div className="font-medium text-slate-800">{product.storeName}</div>
                  <div className="text-slate-500">Xaaladda:</div>
                  <div className="font-medium text-emerald-600 font-semibold">{product.condition || 'NEW (Cusub)'}</div>
                </div>
              </div>
            </div>

            {/* Right: Info & Actions */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                {/* Category Breadcrumb */}
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1.5 font-medium">
                  <span>Elektarooniyada Macmiilka</span>
                  <span>/</span>
                  <span className="text-orange-600 font-semibold">{product.category}</span>
                </div>

                {/* Title */}
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug font-display">
                  {product.title}
                </h2>

                {/* SKU */}
                <div className="text-xs text-slate-400 mt-1 font-mono">
                  SKU: {product.sku}
                </div>

                {/* Price Display */}
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="text-3xl font-black text-orange-600 font-display">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-lg text-slate-400 line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                  {product.discountPercent && (
                    <span className="bg-emerald-100 text-emerald-700 font-bold text-xs px-2 py-0.5 rounded">
                      -{product.discountPercent}% DHIMIS
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 mt-1">
                  ✓ Cashuurtu way ku jirtaa
                </div>

                {/* Safe Payment Guarantee */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-200">
                  <span>🔒</span>
                  <span>Lacag bixin aamin ah: <strong>EVC Plus / eDahab / Sahal / Premier Bank</strong></span>
                </div>

                {/* Color Selector */}
                {product.colors && product.colors.length > 0 && (
                  <div className="mt-4">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      COLOR: <span className="text-orange-600 font-normal">{selectedColor}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.colors.map((c) => (
                        <button
                          key={c}
                          onClick={() => setSelectedColor(c)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            selectedColor === c
                              ? 'border-orange-500 bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                              : 'border-slate-300 text-slate-700 hover:border-slate-400 bg-white'
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Size Selector */}
                {product.sizes && product.sizes.length > 0 && (
                  <div className="mt-3">
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      CABIRKA (SIZE): <span className="text-orange-600 font-normal">{selectedSize}</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {product.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            selectedSize === s
                              ? 'border-orange-500 bg-orange-50 text-orange-600 ring-2 ring-orange-200'
                              : 'border-slate-300 text-slate-700 hover:border-slate-400 bg-white'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stock Indicator */}
                <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>
                    Waa la Helaa (In Stock - {product.stockQuantity} xabbo ayaa bakhaarka yaalla)
                  </span>
                </div>

                {/* Quantity */}
                <div className="mt-4 flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-700">Tirada:</span>
                  <div className="flex items-center border border-slate-300 rounded-xl bg-white shadow-xs overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-xs font-bold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                      className="w-8 h-8 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div className="flex gap-2">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 shadow-lg shadow-orange-500/25 transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5"
                  >
                    <span>🛒</span>
                    Ku Dar Shanta (Add to Cart)
                  </button>

                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-xl transition-all ${
                      isWishlisted
                        ? 'bg-rose-50 border-rose-300 text-rose-500'
                        : 'border-slate-300 text-slate-400 hover:text-rose-500 hover:border-slate-400 bg-white'
                    }`}
                    title="Ku dar liiska rabitaanka"
                  >
                    {isWishlisted ? '❤️' : '🤍'}
                  </button>
                </div>

                {/* Seller Store Card */}
                <div className="flex items-center justify-between p-3 rounded-2xl bg-orange-50/70 border border-orange-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-orange-200 text-orange-700 flex items-center justify-center font-bold text-sm">
                      🏪
                    </div>
                    <div>
                      <div className="text-[11px] text-slate-500">Waxa Iibiya:</div>
                      <Link
                        href={`/stores/${product.storeSlug}`}
                        onClick={onClose}
                        className="text-xs font-bold text-slate-900 hover:text-orange-600 underline"
                      >
                        {product.storeName}
                      </Link>
                    </div>
                  </div>

                  <button
                    onClick={handleWhatsAppDirect}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-transform hover:scale-105"
                  >
                    <span>💬</span>
                    WhatsApp
                  </button>
                </div>

                {addedToast && (
                  <div className="text-center py-2 px-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl animate-fade-in">
                    ✓ Alaabtan si guul leh ayaa loogu daray Shantaada!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description Tab (Sharaxaadda Alaabta) */}
          <div className="border-t border-slate-200 p-6 sm:p-8 bg-slate-50/50">
            <h3 className="font-bold text-slate-900 text-base mb-2 font-display">
              Sharaxaadda Alaabta (Description)
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
