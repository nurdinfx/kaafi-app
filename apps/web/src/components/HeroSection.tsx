'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface HeroSlide {
  id: string;
  brandTag: string;
  brandAccent: string;
  mainTitle: string;
  subtitle: string;
  pills: { icon: string; title: string; subtitle: string }[];
  leftImage: string;
  rightImage: string;
  accentColor: string;
  bgGradient: string;
  link: string;
  ctaLabel: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'fashion',
    brandTag: 'Kaafi-',
    brandAccent: 'App',
    mainTitle: 'Kaafi-App\nOnline',
    subtitle: 'Dharka Dumarka ee Ugu Quruuxda Badan',
    pills: [
      { icon: '👑', title: 'Qaabab', subtitle: 'Qurux Badan' },
      { icon: '🌿', title: 'Tayo', subtitle: 'Sare Leh' },
      { icon: '🛍️', title: 'Dukaameysi', subtitle: 'Aman Ah' },
    ],
    leftImage: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=700&auto=format&fit=crop',
    rightImage: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&auto=format&fit=crop',
    accentColor: '#f97316',
    bgGradient: 'radial-gradient(ellipse at 75% 40%, rgba(249,115,22,0.3) 0%, transparent 55%), radial-gradient(ellipse at 20% 60%, rgba(217,119,6,0.2) 0%, transparent 50%), linear-gradient(135deg, #241108 0%, #3e1b0c 45%, #5a2612 75%, #351509 100%)',
    link: '/listings?categorySlug=fashion',
    ctaLabel: 'Daawo Dharka →',
  },
  {
    id: 'tech',
    brandTag: 'Kaafi-',
    brandAccent: 'App',
    mainTitle: 'Kaafi-App\nTech Hub',
    subtitle: 'Kaamirooyinka CCTV, Moobillada & Qalabka Casriga ah',
    pills: [
      { icon: '⚡', title: 'HD Quality', subtitle: 'Xallin Sare' },
      { icon: '🚀', title: 'Gaarsiin', subtitle: 'Degdeg Ah' },
      { icon: '🛡️', title: 'Dammaanad', subtitle: '1 Sano Ah' },
    ],
    leftImage: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=700&auto=format&fit=crop',
    rightImage: 'https://images.unsplash.com/photo-1557862921-37829c790f19?w=900&auto=format&fit=crop',
    accentColor: '#0ea5e9',
    bgGradient: 'radial-gradient(ellipse at 75% 40%, rgba(14,165,233,0.3) 0%, transparent 55%), radial-gradient(ellipse at 20% 60%, rgba(2,132,199,0.25) 0%, transparent 50%), linear-gradient(135deg, #071726 0%, #0d2a45 45%, #133961 75%, #081d33 100%)',
    link: '/listings?categorySlug=electronics',
    ctaLabel: 'Daawo Qalabka →',
  },
  {
    id: 'watches',
    brandTag: 'Kaafi-',
    brandAccent: 'App',
    mainTitle: 'Kaafi-App\nLuxury',
    subtitle: 'Saacadaha Automatic-ka ah & Dahabka Raaxada',
    pills: [
      { icon: '⭐', title: 'Brand Asal', subtitle: 'Tayo Heer Sare' },
      { icon: '💎', title: 'Dahab & Luul', subtitle: 'Dhalaal Joogto' },
      { icon: '🎁', title: 'Baakidh', subtitle: 'Hadiyadeed' },
    ],
    leftImage: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=700&auto=format&fit=crop',
    rightImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=900&auto=format&fit=crop',
    accentColor: '#d97706',
    bgGradient: 'radial-gradient(ellipse at 75% 40%, rgba(217,119,6,0.3) 0%, transparent 55%), radial-gradient(ellipse at 20% 60%, rgba(180,83,9,0.25) 0%, transparent 50%), linear-gradient(135deg, #211603 0%, #3a2606 45%, #54370a 75%, #241703 100%)',
    link: '/listings?categorySlug=wholesale',
    ctaLabel: 'Daawo Saacadaha →',
  },
];

export default function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [nextSlide, setNextSlide] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);

  const SLIDE_DURATION = 6000;

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setNextSlide(index);
    setProgress(0);
    setTimeout(() => {
      setCurrentSlide(index);
      setNextSlide(null);
      setIsTransitioning(false);
    }, 700);
  }, [isTransitioning, currentSlide]);

  // Auto rotate
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      const next = (currentSlide + 1) % HERO_SLIDES.length;
      goToSlide(next);
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isPaused, currentSlide, goToSlide]);

  // Progress bar
  useEffect(() => {
    if (isPaused) return;
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((p) => Math.min(p + 1, 100));
    }, SLIDE_DURATION / 100);
    return () => clearInterval(interval);
  }, [currentSlide, isPaused]);

  const handleNext = () => {
    const next = (currentSlide + 1) % HERO_SLIDES.length;
    goToSlide(next);
  };
  const handlePrev = () => {
    const prev = (currentSlide - 1 + HERO_SLIDES.length) % HERO_SLIDES.length;
    goToSlide(prev);
  };

  const slide = HERO_SLIDES[currentSlide];

  return (
    <section
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative w-full overflow-hidden select-none min-h-[580px] sm:min-h-[640px] lg:min-h-[700px]"
      style={{ background: slide.bgGradient, transition: 'background 0.8s ease' }}
    >
      {/* Subtle dot pattern overlay */}
      <div className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '28px 28px' }}
      />

      {/* Animated gradient orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: slide.accentColor }}
      />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full blur-3xl opacity-10 pointer-events-none"
        style={{ background: slide.accentColor }}
      />

      {/* Progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10 z-20">
        <div
          className="h-full transition-none"
          style={{ width: `${progress}%`, background: slide.accentColor, transition: 'width 0.1s linear' }}
        />
      </div>

      {/* Main content */}
      <div className="relative w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14 pb-8 h-full flex flex-col justify-between"
        style={{ minHeight: 'inherit' }}
      >

        {/* Three-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-center flex-1 my-auto lg:my-8">

          {/* LEFT: Product / Merchandise Image */}
          <div className="hidden lg:flex lg:col-span-3 justify-center items-center">
            <div
              key={slide.id + '-left'}
              className="relative w-72 h-80 rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-black/40 group transform -rotate-2 hover:rotate-0 transition-all duration-500 animate-float-slow"
              style={{ animationDelay: '0.5s' }}
            >
              <img
                src={slide.leftImage}
                alt="Product showcase"
                className="w-full h-full object-cover object-center animate-kenburns opacity-95 group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                <span className="text-xs font-bold text-orange-200 tracking-wide">
                  ✨ Tayo Sare & Xarrago
                </span>
              </div>
              {/* Floating badge */}
              <div className="absolute top-3 right-3 bg-white/20 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/30">
                🔥 Hot Pick
              </div>
            </div>
          </div>

          {/* CENTER: Brand text, title, subtitle, pills */}
          <div className="lg:col-span-6 text-center space-y-4 sm:space-y-5 z-10 px-2">

            {/* Brand logo + name */}
            <div key={slide.id + '-brand'} className="inline-flex items-center justify-center gap-2.5 mb-1 animate-slide-up">
              <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-lg border-2 border-white/30">
                <img src="/kaafi_logo.png" alt="Kaafi-App" className="w-full h-full object-cover" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white flex items-center">
                <span>{slide.brandTag}</span>
                <span style={{ color: slide.accentColor }}>{slide.brandAccent}</span>
              </div>
            </div>

            {/* Flourish line */}
            <div className="flex items-center justify-center gap-3 text-white/40 text-xs">
              <span className="w-12 sm:w-20 h-px" style={{ background: `linear-gradient(to right, transparent, ${slide.accentColor}90)` }} />
              <span className="text-sm" style={{ color: slide.accentColor }}>❖</span>
              <span className="w-12 sm:w-20 h-px" style={{ background: `linear-gradient(to left, transparent, ${slide.accentColor}90)` }} />
            </div>

            {/* Giant animated title */}
            <h1
              key={slide.id + '-title'}
              className="text-4xl sm:text-6xl lg:text-[4.5rem] font-black text-white tracking-tight leading-[1.05] drop-shadow-2xl animate-slide-up"
              style={{ fontFamily: '"Outfit", Georgia, serif', animationDelay: '0.1s' }}
            >
              {slide.mainTitle.split('\n').map((line, i) => (
                <span key={i} className={`block ${i === 1 ? 'text-transparent bg-clip-text' : ''}`}
                  style={i === 1 ? { backgroundImage: `linear-gradient(135deg, ${slide.accentColor}, #fbbf24)` } : {}}
                >
                  {line}
                </span>
              ))}
            </h1>

            {/* Subtitle */}
            <p
              key={slide.id + '-sub'}
              className="text-base sm:text-xl lg:text-2xl font-semibold text-amber-200 font-display animate-fade-in tracking-tight drop-shadow-md"
              style={{ animationDelay: '0.2s' }}
            >
              {slide.subtitle}
            </p>

            {/* Flourish */}
            <div className="flex items-center justify-center gap-3 text-white/40 text-xs">
              <span className="w-12 sm:w-20 h-px" style={{ background: `linear-gradient(to right, transparent, ${slide.accentColor}90)` }} />
              <span className="text-sm" style={{ color: slide.accentColor }}>❖</span>
              <span className="w-12 sm:w-20 h-px" style={{ background: `linear-gradient(to left, transparent, ${slide.accentColor}90)` }} />
            </div>

            {/* Pills / Feature badges */}
            <div
              key={slide.id + '-pills'}
              className="pt-1 flex flex-wrap items-center justify-center gap-4 sm:gap-6 animate-fade-in"
              style={{ animationDelay: '0.3s' }}
            >
              {slide.pills.map((pill, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-left group cursor-default">
                  <div
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/15 backdrop-blur-md border border-white/25 flex items-center justify-center text-xl shadow-lg transition-transform group-hover:scale-110"
                    style={{ boxShadow: `0 0 20px ${slide.accentColor}30` }}
                  >
                    {pill.icon}
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white leading-tight">{pill.title}</div>
                    <div className="text-[11px] sm:text-xs text-orange-200/90 leading-tight">{pill.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Link
                href={slide.link}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-2xl font-bold text-sm text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-100"
                style={{ background: `linear-gradient(135deg, ${slide.accentColor}, #ea580c)`, boxShadow: `0 8px 32px ${slide.accentColor}50` }}
              >
                {slide.ctaLabel}
              </Link>
            </div>
          </div>

          {/* RIGHT: Model / product under arch */}
          <div className="hidden lg:flex lg:col-span-3 justify-center items-center">
            <div className="relative w-80 h-96 flex items-center justify-center">

              {/* Glowing arch */}
              <div
                className="absolute inset-0 rounded-t-full border-4 animate-arch-glow pointer-events-none"
                style={{ borderColor: `${slide.accentColor}80`, boxShadow: `0 0 50px ${slide.accentColor}50` }}
              />

              {/* Main model image */}
              <div
                key={slide.id + '-right'}
                className="relative w-72 h-[360px] rounded-t-full overflow-hidden shadow-2xl bg-black/30 border border-white/20 animate-float-slow"
                style={{ animationDelay: '1s' }}
              >
                <img
                  src={slide.rightImage}
                  alt="Featured item"
                  className="w-full h-full object-cover object-top animate-kenburns transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4">
                  <span
                    className="text-white font-black text-[10px] px-2.5 py-0.5 rounded-full w-max shadow-sm"
                    style={{ background: slide.accentColor }}
                  >
                    DOORASHADA UGU WANAAGSAN
                  </span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Prev/Next arrows */}
        <button
          onClick={handlePrev}
          className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all text-xl shadow-lg active:scale-95"
          aria-label="Slide ka hore"
        >
          ‹
        </button>
        <button
          onClick={handleNext}
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md border border-white/20 transition-all text-xl shadow-lg active:scale-95"
          aria-label="Slide xiga"
        >
          ›
        </button>

        {/* Slide dots + labels */}
        <div className="flex items-center justify-center gap-3 mt-4 sm:mt-6">
          {HERO_SLIDES.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => goToSlide(idx)}
              className={`transition-all duration-300 rounded-full ${
                idx === currentSlide
                  ? 'w-8 h-2.5'
                  : 'w-2.5 h-2.5 opacity-40 hover:opacity-70'
              }`}
              style={{ background: idx === currentSlide ? slide.accentColor : '#ffffff' }}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Bottom info bar */}
        <div className="mt-4 w-full max-w-4xl mx-auto rounded-2xl bg-white/10 backdrop-blur-md text-white p-2 sm:p-2.5 shadow-xl border border-white/20">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 divide-y sm:divide-y-0 sm:divide-x divide-white/10 text-xs items-center">

            <div className="flex items-center justify-center gap-3 px-3 py-1">
              <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-base flex-shrink-0">
                🌐
              </div>
              <div className="text-left">
                <span className="text-[11px] text-white/60 block leading-tight">Booqo Website-ka</span>
                <strong className="text-white font-bold text-xs tracking-tight">kaafi-app.com</strong>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 px-3 py-1">
              <div className="w-8 h-8 rounded-full bg-white/20 text-white flex items-center justify-center text-base flex-shrink-0">
                🛒
              </div>
              <div className="text-left">
                <span className="text-[11px] text-white/60 block leading-tight">Dukaameyso</span>
                <strong className="text-white font-bold text-xs tracking-tight">Si Fudud, Meel Kasta!</strong>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 px-3 py-1">
              <div className="w-8 h-8 rounded-full bg-orange-500/80 text-white flex items-center justify-center text-base flex-shrink-0 shadow-sm">
                📱
              </div>
              <div className="text-left">
                <span className="text-[11px] text-white/60 block leading-tight">Soo Degso App-ka</span>
                <strong className="text-white font-bold text-xs tracking-tight">kaafi-app.com/download-app</strong>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
