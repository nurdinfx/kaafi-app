'use client';

import React, { useState } from 'react';
import { StoreProduct } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductCardProps {
  product: StoreProduct;
  onQuickView: (product: StoreProduct) => void;
  badgeType?: 'bestseller' | 'essential' | 'discount';
}

export default function ProductCard({ product, onQuickView, badgeType = 'bestseller' }: ProductCardProps) {
  const { addToCart } = useCart();
  const { t } = useLanguage();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [hoveredImage, setHoveredImage] = useState<string | null>(null);

  const displayImage = hoveredImage || product.images[0];
  const secondaryImage = product.images[1] || product.images[0];

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

  const colorsCount = product.colors?.length || product.colorVariants?.length || 0;
  const ratingValue = product.rating || 4.8;
  const reviewsCount = product.reviewsCount || 100;

  return (
    <div
      onClick={() => onQuickView(product)}
      onMouseEnter={() => {
        if (product.images.length > 1) setHoveredImage(secondaryImage);
      }}
      onMouseLeave={() => setHoveredImage(null)}
      className="group relative bg-white rounded-xl sm:rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer hover:-translate-y-1"
    >
      {/* ── SHEIN Aspect Ratio Media (3:4) ── */}
      <div className="relative aspect-[3/4] w-full bg-slate-100/80 overflow-hidden flex items-center justify-center">
        {/* Wishlist Button (Top-left) */}
        <button
          onClick={handleWishlist}
          className={`absolute top-2.5 left-2.5 z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-md transition-all active:scale-90 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-500 border border-rose-200'
              : 'bg-white/85 hover:bg-white text-slate-500 hover:text-rose-500 border border-slate-200/60'
          }`}
          title="Wishlist"
        >
          {isWishlisted ? '❤️' : '🤍'}
        </button>

        {/* Discount Badge */}
        {product.discountPercent && product.discountPercent > 0 && (
          <div className="absolute top-2.5 right-2.5 z-10 bg-gradient-to-r from-red-600 to-rose-600 text-white font-black text-[10px] px-2 py-0.5 rounded-md shadow-md tracking-wider">
            -{product.discountPercent}%
          </div>
        )}

        {/* Multi-Color count indicator pill */}
        {colorsCount > 1 && (
          <div className="absolute bottom-2.5 left-2.5 z-10 bg-black/60 backdrop-blur-md text-white font-bold text-[10px] px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{colorsCount} {t('shein_more_colors', 'colors')}</span>
          </div>
        )}

        {/* Product Image */}
        <img
          src={displayImage}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* ── Info & SHEIN Pricing ── */}
      <div className="p-2.5 sm:p-3 flex flex-col justify-between flex-1 space-y-2">
        <div>
          {/* Title - clean line clamp */}
          <h3 className="text-slate-800 text-xs sm:text-[13px] font-medium line-clamp-2 leading-snug group-hover:text-orange-600 transition-colors">
            {product.title}
          </h3>

          {/* Rating stars & reviews count */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex text-amber-400 text-xs leading-none">
              {'★'.repeat(Math.round(ratingValue))}
            </div>
            <span className="text-[11px] font-bold text-slate-700">
              {ratingValue.toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400">
              ({reviewsCount > 999 ? '1k+' : reviewsCount})
            </span>
          </div>
        </div>

        {/* Bottom row: Price + SHEIN Cart Button */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5 flex-wrap">
            <span className="text-sm sm:text-base font-black text-rose-600 font-display">
              ${product.price.toFixed(2)}
            </span>

            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-[11px] text-slate-400 line-through">
                ${product.compareAtPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Circular Outlined Cart Button like SHEIN (Screenshot 2) */}
          <button
            onClick={handleQuickAdd}
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border flex items-center justify-center transition-all active:scale-90 shadow-2xs ${
              justAdded
                ? 'bg-emerald-600 border-emerald-600 text-white scale-110'
                : 'border-slate-300 hover:border-black text-slate-700 hover:bg-black hover:text-white bg-white'
            }`}
            title="Add to cart"
          >
            {justAdded ? (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
