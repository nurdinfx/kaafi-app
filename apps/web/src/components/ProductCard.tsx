'use client';

import React, { useState } from 'react';
import { StoreProduct } from '../context/StoreContext';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: StoreProduct;
  onQuickView: (product: StoreProduct) => void;
  badgeType?: 'bestseller' | 'essential' | 'discount';
}

export default function ProductCard({ product, onQuickView, badgeType = 'bestseller' }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      id: product.id,
      title: product.title,
      price: product.price,
      originalPrice: product.compareAtPrice,
      image: product.images[0],
      selectedColor: product.colors?.[0],
      selectedSize: product.sizes?.[0],
      storeName: product.storeName,
      sku: product.sku,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWishlisted(!isWishlisted);
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer hover:-translate-y-1"
    >
      {/* Top Media & Badges */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden flex items-center justify-center p-3">
        {/* Wishlist Button (Top-left) */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 left-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-md transition-transform active:scale-90 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-500 border border-rose-200'
              : 'bg-white/90 text-slate-400 hover:text-rose-500 border border-slate-200/70'
          }`}
          title="Ku dar rabitaanka"
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>

        {/* Quick Add To Cart Button (Top-right round orange (+)) */}
        <button
          onClick={handleQuickAdd}
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all active:scale-90 ${
            justAdded
              ? 'bg-emerald-500 text-white scale-110'
              : 'bg-orange-500 hover:bg-orange-600 text-white'
          }`}
          title="Ku dar Shanta"
        >
          {justAdded ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>

        {/* High Discount Badge (e.g. -82%, -51%) */}
        {product.discountPercent && product.discountPercent >= 40 && (
          <div className="absolute top-2.5 left-12 z-10 bg-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded shadow-sm">
            -{product.discountPercent}%
          </div>
        )}

        {/* Product Image */}
        <img
          src={product.images[0]}
          alt={product.title}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-108"
          loading="lazy"
        />
      </div>

      {/* Info Section */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-semibold text-slate-800 text-xs sm:text-sm line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
            {product.title}
          </h3>

          {product.storeName && (
            <div className="text-[11px] text-slate-400 mt-1 truncate">
              {product.storeName}
            </div>
          )}
        </div>

        {/* Price & Discounts */}
        <div className="mt-3 pt-2 border-t border-slate-100 flex flex-wrap items-baseline gap-1.5">
          <span className="text-base sm:text-lg font-black text-orange-600 font-display">
            ${product.price.toFixed(2)}
          </span>

          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-slate-400 line-through">
              ${product.compareAtPrice.toFixed(2)}
            </span>
          )}

          {product.discountPercent && product.discountPercent > 0 && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded ml-auto">
              -{product.discountPercent}% DHIMIS
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
