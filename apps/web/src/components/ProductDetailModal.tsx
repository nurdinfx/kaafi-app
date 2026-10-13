'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { StoreProduct, ProductReview, useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

interface ProductDetailModalProps {
  product: StoreProduct | null;
  onClose: () => void;
}

export default function ProductDetailModal({ product, onClose }: ProductDetailModalProps) {
  const { addToCart } = useCart();
  const { t, isRTL } = useLanguage();
  const { addProductReview, incrementReviewHelpful } = useStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState<string>(
    product?.colorVariants?.[0]?.name || product?.colors?.[0] || 'White'
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    product?.sizes?.[2] || product?.sizes?.[0] || '8 (S)'
  );
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTagFilter, setActiveTagFilter] = useState<string>('ALL');

  // Customer Review Form state (Full functional)
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewFit, setReviewFit] = useState<'Small' | 'True to Size' | 'Large'>('True to Size');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewColor, setReviewColor] = useState(selectedColor);
  const [reviewSize, setReviewSize] = useState(selectedSize);
  const [reviewSubmittedToast, setReviewSubmittedToast] = useState(false);

  if (!product) return null;

  // Sync image when color is changed if color variant has an image
  const handleSelectColor = (colorName: string) => {
    setSelectedColor(colorName);
    const variant = product.colorVariants?.find((c) => c.name === colorName);
    if (variant && variant.image) {
      const idx = product.images.indexOf(variant.image);
      if (idx !== -1) {
        setSelectedImageIndex(idx);
      }
    }
  };

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
        selectedSize,
        storeName: product.storeName,
        sku: product.sku,
      },
      quantity
    );

    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    addProductReview(product.id, {
      userName: reviewAuthor.trim() || 'Verified Customer',
      rating: reviewRating,
      overallFit: reviewFit,
      color: reviewColor || selectedColor,
      size: reviewSize || selectedSize,
      comment: reviewComment.trim(),
    });

    setReviewSubmittedToast(true);
    setShowReviewForm(false);
    setReviewComment('');
    setTimeout(() => setReviewSubmittedToast(false), 3500);
  };

  const ratingScore = product.rating || 4.76;
  const reviewsCount = product.reviewsCount || (product.reviews?.length ? product.reviews.length : 1000);
  const fitData = product.fitBreakdown || { small: 9, trueToSize: 88, large: 3 };

  // Filter reviews by tag
  const filteredReviews = product.reviews && product.reviews.length > 0 ? product.reviews : [];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto animate-fade-in">
      {/* Dark overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="flex min-h-screen items-center justify-center p-2 sm:p-4 md:p-6 text-center">
        <div
          className="relative w-full max-w-5xl transform overflow-hidden rounded-2xl sm:rounded-3xl bg-white text-left shadow-2xl transition-all border border-slate-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg transition-colors cursor-pointer shadow-xs"
            aria-label="Close"
          >
            ✕
          </button>

          {/* ── TOP BREADCRUMB (SHEIN STYLE) ── */}
          <div className="px-6 pt-5 pb-2 text-[11px] text-slate-500 border-b border-slate-100 flex items-center gap-1.5 flex-wrap overflow-hidden">
            <span className="hover:text-slate-900 cursor-pointer">Home</span>
            <span>/</span>
            <span className="hover:text-slate-900 cursor-pointer">Women Apparel</span>
            <span>/</span>
            <span className="hover:text-slate-900 cursor-pointer">{product.category}</span>
            <span>/</span>
            <span className="text-slate-800 font-medium truncate max-w-xs">{product.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 sm:p-6 lg:p-8">
            {/* ── LEFT: SHEIN PRODUCT GALLERY (5 COLUMNS) ── */}
            <div className="lg:col-span-5 flex flex-col-reverse sm:flex-row gap-3">
              {/* Thumbnail Strip */}
              {product.images.length > 1 && (
                <div className="flex sm:flex-col gap-2 overflow-x-auto sm:overflow-y-auto max-h-[480px] scrollbar-hide py-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-14 h-16 sm:w-16 sm:h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-black ring-1 ring-black'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Main Photo (Tall 3:4 aspect ratio) */}
              <div className="flex-1 relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-50 border border-slate-200 flex items-center justify-center group">
                <img
                  src={currentImage}
                  alt={product.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Discount Tag */}
                {product.discountPercent && product.discountPercent > 0 && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-sm shadow-md tracking-wider">
                    -{product.discountPercent}%
                  </div>
                )}
              </div>
            </div>

            {/* ── RIGHT: SHEIN PRODUCT DETAILS & PURCHASING (7 COLUMNS) ── */}
            <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
              <div>
                {/* Trends badge & Title */}
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-black px-2 py-0.5 rounded tracking-wider uppercase">
                    {t('shein_trends', 'Trends')}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    SKU: {product.sku}
                  </span>
                </div>

                <h1 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 leading-snug">
                  {product.title}
                </h1>

                {/* Rating & Review Header */}
                <div className="mt-2 flex items-center gap-2 text-xs flex-wrap">
                  <div className="flex text-amber-400 text-sm">
                    {'★'.repeat(Math.round(ratingScore))}
                  </div>
                  <span className="font-bold text-slate-800">{ratingScore.toFixed(2)}</span>
                  <a
                    href="#reviews-section"
                    className="text-slate-500 hover:text-black underline font-medium"
                  >
                    ({reviewsCount > 999 ? '1000+' : reviewsCount} {t('shein_customer_reviews', 'Reviews')})
                  </a>
                </div>

                {/* Price block */}
                <div className="mt-3 flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-2xl sm:text-3xl font-black text-rose-600 font-display">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.compareAtPrice && product.compareAtPrice > product.price && (
                    <span className="text-sm text-slate-400 line-through">
                      ${product.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                  {product.discountPercent && (
                    <span className="bg-rose-100 text-rose-700 font-bold text-xs px-2 py-0.5 rounded">
                      -{product.discountPercent}%
                    </span>
                  )}
                </div>

                {/* Installments note */}
                <div className="mt-1 text-xs text-slate-500">
                  {t('shein_pay_installments', 'Pay in full, or in 3 instalments with mobile money')}
                </div>

                {/* Bestseller banner */}
                <div className="mt-3 flex items-center gap-2 bg-amber-50 border border-amber-200/70 p-2.5 rounded-xl text-xs text-amber-900 font-semibold">
                  <span>🏆</span>
                  <span>{t('shein_bestseller_badge', '#1 Bestseller in Fashion')}</span>
                </div>

                {/* Free Shipping banner */}
                <div className="mt-2.5 flex items-center gap-2 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl text-xs text-emerald-800 font-bold">
                  <span>🚚</span>
                  <span>{t('shein_free_shipping_est', 'Free Shipping & Est. 3 Working Days')}</span>
                </div>

                {/* ── SHEIN COLOR SELECTOR ── */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-bold text-slate-800">
                      {t('shein_color_label', 'Color:')} <span className="font-semibold text-slate-600">{selectedColor}</span>
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2.5">
                    {(product.colorVariants && product.colorVariants.length > 0
                      ? product.colorVariants
                      : (product.colors || ['Standard']).map((c) => ({
                          name: c,
                          image: product.images[0],
                          hex: undefined,
                          isHot: false,
                        }))
                    ).map((col, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectColor(col.name)}
                        className={`group relative w-12 h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          selectedColor === col.name
                            ? 'border-black ring-1 ring-black shadow-md'
                            : 'border-slate-200 opacity-80 hover:opacity-100 hover:border-slate-400'
                        }`}
                        title={col.name}
                      >
                        {col.image ? (
                          <img src={col.image} alt={col.name} className="w-full h-full object-cover" />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center text-[10px] font-bold text-slate-600 bg-slate-100"
                            style={{ backgroundColor: col.hex || '#e2e8f0' }}
                          >
                            {col.name.slice(0, 3)}
                          </div>
                        )}
                        {col.isHot && (
                          <span className="absolute top-0.5 right-0.5 bg-red-600 text-white text-[8px] font-black px-1 rounded-2xs">
                            HOT
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── SHEIN SIZE SELECTOR ── */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{t('shein_size_label', 'Size')}</span>
                      <span className="text-[11px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold border border-slate-200">
                        {t('shein_uk_size', 'UK Size')} ▾
                      </span>
                    </div>
                    <button type="button" className="text-slate-500 hover:text-black font-semibold flex items-center gap-1">
                      <span>📏</span>
                      <span>{t('shein_size_guide', 'Size Guide')}</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(product.sizes && product.sizes.length > 0
                      ? product.sizes
                      : ['4 (XXS)', '6 (XS)', '8 (S)', '10 (M)', '12/14 (L)', '16 (XL)', '18 (XXL)']
                    ).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedSize(sz)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          selectedSize === sz
                            ? 'bg-black text-white border-black shadow-md'
                            : 'bg-white text-slate-800 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>

                  <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
                    <span className="hover:underline cursor-pointer">{t('shein_not_your_size', 'Not your size? Tell me your size')} &gt;</span>
                    <span className="text-emerald-700 font-medium">✓ {selectedSize} {t('shein_eligible_delivery', 'eligible for Est. 3 Working Days')}</span>
                  </div>
                </div>

                {/* ── QUANTITY & ADD TO CART (SHEIN BIG BLACK BAR) ── */}
                <div className="mt-5 pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="w-8 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-800">
                        {quantity}
                      </span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="w-8 h-10 flex items-center justify-center text-slate-600 hover:bg-slate-100 font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Big Bold SHEIN ADD TO CART Button */}
                    <button
                      onClick={handleAddToCart}
                      className="flex-1 py-3.5 px-6 rounded-xl font-black text-sm tracking-widest text-white bg-black hover:bg-slate-800 shadow-xl transition-all duration-200 flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      <span>🛒</span>
                      <span>{t('shein_add_to_cart_btn', 'ADD TO CART')}</span>
                    </button>

                    {/* Heart Wishlist */}
                    <button
                      onClick={() => setIsWishlisted(!isWishlisted)}
                      className={`w-12 h-12 rounded-xl border flex items-center justify-center text-lg transition-all cursor-pointer ${
                        isWishlisted
                          ? 'bg-rose-50 border-rose-300 text-rose-500'
                          : 'border-slate-300 text-slate-400 hover:text-rose-500 bg-white'
                      }`}
                      title="Wishlist"
                    >
                      {isWishlisted ? '❤️' : '🤍'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    {t('shein_points_note', 'Earn loyalty reward points calculated at checkout.')}
                  </p>

                  {addedToast && (
                    <div className="p-3 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl animate-fade-in flex items-center gap-2">
                      <span>✓</span>
                      <span>{t('sb_toast_prod_added', 'Added to cart successfully!')}</span>
                    </div>
                  )}
                </div>

                {/* ── SECURITY & SHIPPING ASSURANCES (SCREENSHOT 4 RIGHT SIDE) ── */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5 text-xs text-slate-700 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold">
                    <span>🛡️</span>
                    <span>{t('shein_shopping_security', 'Shopping Security')}</span>
                    <span className="text-slate-400 font-normal">| {t('shein_safe_payments_badge', 'Safe Payments')} • {t('shein_privacy_protection_badge', 'Privacy Protection')}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1">
                    <span className="text-slate-500">
                      {t('shein_sold_by_trader', 'Sold by Business Trader:')} <strong>{product.storeName}</strong>
                    </span>
                    <Link
                      href={`/stores/${product.storeSlug}`}
                      onClick={onClose}
                      className="text-orange-600 hover:underline font-bold"
                    >
                      Visit Store ↗
                    </Link>
                  </div>

                  <div className="text-[11px] text-slate-500">
                    📍 {t('shein_ships_from', 'Ships from Local Warehouse Hub')} • {t('shein_free_returns', '30-Day Free Returns')}
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* ── FULL FUNCTIONAL CUSTOMER REVIEWS SECTION (EXACT SHEIN SCREENSHOT 4) ── */}
          <div id="reviews-section" className="border-t border-slate-200 p-4 sm:p-6 lg:p-8 bg-slate-50/50">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 font-display flex items-center gap-2">
                  <span>{t('shein_customer_reviews', 'Customer Reviews')}</span>
                  <span className="text-sm font-semibold text-slate-500">
                    ({reviewsCount > 999 ? '1000+' : reviewsCount})
                  </span>
                </h3>
                <span className="text-xs text-slate-400">
                  {t('shein_review_policy', 'Review Policy')}
                </span>
              </div>

              {/* Write Review Button */}
              <button
                onClick={() => setShowReviewForm(!showReviewForm)}
                className="px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-slate-900 hover:bg-black transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>✍️</span>
                <span>{t('shein_write_review', 'Write a Review')}</span>
              </button>
            </div>

            {/* Review feedback toast */}
            {reviewSubmittedToast && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-lg flex items-center gap-2 animate-fade-in">
                <span>🎉</span>
                <span>Mahadsanid! Qiimeyntaada si guul leh ayaa loo daabacay, waxayna soo gashay liiska macaamiisha!</span>
              </div>
            )}

            {/* ── INTERACTIVE ADD REVIEW MODAL / FORM ── */}
            {showReviewForm && (
              <form
                onSubmit={handleSubmitReview}
                className="mb-8 p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-lg space-y-4 text-xs animate-fade-in"
              >
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h4 className="font-bold text-sm text-slate-900 font-display">
                    {t('shein_write_review_title', 'Rate & Review this Product')}
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="text-slate-400 hover:text-slate-700 font-bold p-1"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Reviewer Name */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {t('shein_your_name', 'Your Name')}*
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewAuthor}
                      onChange={(e) => setReviewAuthor(e.target.value)}
                      placeholder="e.g. Fartun A. / o***1"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-black"
                    />
                  </div>

                  {/* Star Rating Selection */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {t('shein_your_rating', 'Rating (1 - 5 Stars)')}*
                    </label>
                    <div className="flex items-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className={`text-xl transition-transform hover:scale-125 ${
                            star <= reviewRating ? 'text-amber-400' : 'text-slate-300'
                          }`}
                        >
                          ★
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">
                        {reviewRating} / 5
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Overall Fit */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {t('shein_select_fit', 'How was the fit?')}
                    </label>
                    <select
                      value={reviewFit}
                      onChange={(e) => setReviewFit(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-black"
                    >
                      <option value="True to Size">{t('shein_fit_true', 'True to Size')}</option>
                      <option value="Small">{t('shein_fit_small', 'Small')}</option>
                      <option value="Large">{t('shein_fit_large', 'Large')}</option>
                    </select>
                  </div>

                  {/* Color */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {t('shein_select_color', 'Color purchased')}
                    </label>
                    <input
                      type="text"
                      value={reviewColor}
                      onChange={(e) => setReviewColor(e.target.value)}
                      placeholder="e.g. White"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none"
                    />
                  </div>

                  {/* Size */}
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {t('shein_select_size', 'Size purchased')}
                    </label>
                    <input
                      type="text"
                      value={reviewSize}
                      onChange={(e) => setReviewSize(e.target.value)}
                      placeholder="e.g. M"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    {t('shein_review_comment', 'Your Review Comment')}*
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Faalladaada ku saabsan tayada dharka, tolmada, iyo gaarsiinta..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs text-slate-800 focus:outline-none focus:border-black"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 rounded-xl font-bold text-xs text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl font-bold text-xs text-white bg-black hover:bg-slate-800 transition-colors shadow-sm"
                  >
                    {t('shein_submit_review', 'Submit Review')}
                  </button>
                </div>
              </form>
            )}

            {/* ── SHEIN SCORE & OVERALL FIT PROGRESS BREAKDOWN (SCREENSHOT 4) ── */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 mb-6">
              {/* Score Left */}
              <div className="md:col-span-4 flex items-center gap-4 border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-6">
                <span className="text-4xl sm:text-5xl font-black text-slate-900 font-display">
                  {ratingScore.toFixed(2)}
                </span>
                <div>
                  <div className="flex text-amber-400 text-base leading-none mb-1">
                    {'★'.repeat(5)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {t('shein_review_policy', 'Review Policy')} ⓘ
                  </div>
                </div>
              </div>

              {/* Overall Fit Breakdown Progress Bars Right */}
              <div className="md:col-span-8 flex flex-col justify-center space-y-2">
                <div className="text-xs font-bold text-slate-800 mb-1">
                  {t('shein_overall_fit', 'Overall Fit:')}
                </div>

                <div className="grid grid-cols-3 gap-3 text-xs">
                  {/* Small */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>{t('shein_fit_small', 'Small')}</span>
                      <span className="font-bold text-slate-700">{fitData.small}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400 rounded-full"
                        style={{ width: `${fitData.small}%` }}
                      />
                    </div>
                  </div>

                  {/* True to Size */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-900 font-bold mb-1">
                      <span>{t('shein_fit_true', 'True to Size')}</span>
                      <span>{fitData.trueToSize}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-black rounded-full"
                        style={{ width: `${fitData.trueToSize}%` }}
                      />
                    </div>
                  </div>

                  {/* Large */}
                  <div>
                    <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                      <span>{t('shein_fit_large', 'Large')}</span>
                      <span className="font-bold text-slate-700">{fitData.large}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-slate-400 rounded-full"
                        style={{ width: `${fitData.large}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ── SHEIN REVIEW TAG CHIPS (SCREENSHOT 4) ── */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide">
              {(product.reviewTags || [
                'Fast Logistics (4)',
                'Will Repurchase (1)',
                'Good Fabric Material (100+)',
                'True to Size (50+)',
                'Costume (13)',
                'Formal Occasions (10)',
                'Basic (5)',
              ]).map((tag, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTagFilter(tag === activeTagFilter ? 'ALL' : tag)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    activeTagFilter === tag
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold'
                      : 'bg-amber-50/80 text-amber-900/80 border border-amber-100 hover:bg-amber-100/60'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* ── LIST OF INDIVIDUAL CUSTOMER REVIEWS (SCREENSHOT 4) ── */}
            <div className="space-y-4">
              {filteredReviews.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 text-xs">
                  Weli ma jirto faallo gaar ah oo la daabacay. Noqo qofka ugu horreeya ee qora!
                </div>
              ) : (
                filteredReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5 transition-all hover:border-slate-300"
                  >
                    {/* User & Date Header */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono">{rev.userName}</span>
                        {rev.verifiedPurchase && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200 font-bold">
                            ✓ {t('shein_verified_purchase', 'Verified Purchase')}
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 text-[11px]">{rev.date}</span>
                    </div>

                    {/* Stars */}
                    <div className="flex text-amber-400 text-xs leading-none">
                      {'★'.repeat(rev.rating)}
                    </div>

                    {/* Fit & Variant Attributes (Screenshot 4) */}
                    <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
                      <span>
                        {t('shein_overall_fit', 'Overall Fit:')} <strong className="text-slate-800">{rev.overallFit}</strong>
                      </span>
                      {rev.color && (
                        <span>
                          {t('shein_color_label', 'Color:')} <strong className="text-slate-800">{rev.color}</strong>
                        </span>
                      )}
                      {rev.size && (
                        <span>
                          {t('shein_size_label', 'Size:')} <strong className="text-slate-800">{rev.size}</strong>
                        </span>
                      )}
                    </div>

                    {/* Review text */}
                    <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                      {rev.comment}
                    </p>

                    {/* Photos attached */}
                    {rev.images && rev.images.length > 0 && (
                      <div className="flex gap-2 pt-1">
                        {rev.images.map((img, i) => (
                          <div
                            key={i}
                            className="w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100"
                          >
                            <img src={img} alt="" className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Helpful button (CLICKABLE AND INCREMENTAL) */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                      <button
                        onClick={() => incrementReviewHelpful(product.id, rev.id)}
                        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-black transition-colors font-medium cursor-pointer py-1 px-2 rounded-lg hover:bg-slate-50"
                      >
                        <span>👍</span>
                        <span>
                          {t('shein_helpful', 'Helpful')} ({rev.helpfulCount})
                        </span>
                      </button>

                      <span className="text-slate-400 text-[11px] cursor-pointer hover:underline">
                        Report
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
