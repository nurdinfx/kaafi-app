'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function VisualSearchModal({ isOpen, onClose }: VisualSearchModalProps) {
  const router = useRouter();
  const [selectedTag, setSelectedTag] = useState('');

  if (!isOpen) return null;

  const sampleVisualCategories = [
    { label: 'Dharka Dumarka (Abaya & Hijab)', query: 'hijab', icon: '👗' },
    { label: 'Kaamirooyinka CCTV & Amniga', query: 'camera', icon: '📹' },
    { label: 'Saacadaha Raga & Automatic', query: 'watch', icon: '⌚' },
    { label: 'Moobilada & Accessories', query: 'phone', icon: '📱' },
    { label: 'T-Shirts & Dharka Raga', query: 'shirt', icon: '👕' },
    { label: 'Cod-baahiyeyaasha Bluetooth', query: 'speaker', icon: '🔊' },
  ];

  const handleSearch = (q: string) => {
    onClose();
    router.push(`/listings?q=${encodeURIComponent(q)}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div
        className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center font-bold"
        >
          ✕
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto text-2xl shadow-inner">
            📷
          </div>
          <h3 className="font-bold text-xl text-slate-900 font-display">
            Raadinta Sawirka (Visual Search)
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Soo geli ama dooro sawirka badeecada aad raadinayso si laguu helo nooca saxda ah.
          </p>
        </div>

        {/* Drag & Drop Simulation Area */}
        <div className="border-2 border-dashed border-orange-300 rounded-2xl p-6 text-center bg-orange-50/50 hover:bg-orange-50 transition-colors cursor-pointer mb-6">
          <div className="text-3xl mb-2">📤</div>
          <p className="text-xs font-bold text-slate-700">
            Halkan ku dhufo si aad sawir uga soo doorato taleefankaaga/kumbuyuutarkaaga
          </p>
          <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WEBP ilaa 10MB</p>
        </div>

        {/* Quick visual search categories */}
        <div>
          <h4 className="text-xs font-bold text-slate-700 mb-3 uppercase tracking-wider">
            Ama Ka Raadi Qaybaha Caanka ah:
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {sampleVisualCategories.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleSearch(cat.query)}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50 text-left transition-colors text-xs font-semibold text-slate-700"
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="truncate">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
