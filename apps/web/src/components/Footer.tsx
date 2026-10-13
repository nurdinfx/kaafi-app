'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '../context/LanguageContext';

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useLanguage();

  return (
    <footer className="mt-20 border-t border-slate-800 bg-[#050c15] text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/dukaami_icon.png"
                alt="DukaamiOnline"
                className="w-10 h-10 rounded-xl object-contain shadow-md bg-white p-0.5"
              />
              <div>
                <div className="font-bold text-white text-lg leading-none font-display">
                  <span className="text-white">Dukaami</span>
                  <span className="text-[#ff6a00]">Online</span>
                </div>
                <div className="text-xs mt-1 text-slate-500">dukaamionline.com</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              Suuqa ganacsiga casriga ah ee Soomaaliya. Ku xiraya macaamiisha, ganacsatada, iyo meheradaha dalka oo dhan.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">{t('cat_categories')}</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              {[
                { label: '🚗 Gaadiidka & Baabuurta', href: '/listings?categorySlug=vehicles' },
                { label: '🏢 Guryaha & Hantida', href: '/listings?categorySlug=real-estate' },
                { label: '📐 Dhulka & Boosaska', href: '/listings?categorySlug=land' },
                { label: '📱 Taleefannada & Qalabka', href: '/listings?categorySlug=electronics' },
                { label: '🛠️ Adeegyada Guud', href: '/listings?categorySlug=services' },
                { label: '🏭 Ganacsiga Jumlada', href: '/listings?categorySlug=wholesale' },
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="hover:text-orange-400 transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Ku Iibi DukaamiOnline</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/listings/create" className="hover:text-orange-400 transition-colors">+ Soo Dhig Xayeysiis</Link></li>
              <li><Link href="/seller/store-builder" className="hover:text-orange-400 transition-colors font-medium">🏪 Dhis Store-kaaga (Shopify Builder)</Link></li>
              <li><Link href="/seller/store-builder" className="hover:text-orange-400 transition-colors">Maamulka Meheradda</Link></li>
              <li><Link href="/chat" className="hover:text-orange-400 transition-colors">💬 Fariimaha Macaamiisha</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Amniga & Shuruudaha</h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><Link href="/chat" className="hover:text-orange-400 transition-colors">🛡️ Chat-ka Gaarka ah (Escrow)</Link></li>
              <li><Link href="/about" className="hover:text-orange-400 transition-colors">Ku saabsan DukaamiOnline</Link></li>
              <li><Link href="/trust" className="hover:text-orange-400 transition-colors">Badbaadada & Amniga</Link></li>
              <li><Link href="/terms" className="hover:text-orange-400 transition-colors">Shuruudaha Adeegga</Link></li>
              <li><Link href="/privacy" className="hover:text-orange-400 transition-colors">Xog-ilaalinta (Privacy)</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800 text-xs">
          <p className="text-slate-500">
            © {year} DukaamiOnline & Hudi-Soft Technologies. Garoowe, Puntland, Somalia.
          </p>
          <div className="flex items-center gap-4 font-semibold text-orange-400">
            <span>hada dalbo oo hada hel • All Rights Reserved</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
