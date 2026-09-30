'use client';

import React, { useState } from 'react';

export default function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  const phoneNumber = '252615000000'; // Somali customer service number

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const text = message.trim() || 'Asc! Waxaan rabaa inaan wax ka weydiiyo adeegyada iyo alaabta Kaafi-App Online.';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      {/* Quick Chat Popup */}
      {isOpen && (
        <div className="mb-3 w-80 rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-slide-up text-slate-800">
          {/* Header */}
          <div className="bg-emerald-600 p-4 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold">
                💬
              </div>
              <div>
                <h4 className="font-bold text-sm leading-tight">Kaafi-App WhatsApp Support</h4>
                <p className="text-[11px] text-emerald-100">Khadka tooska ah • Jawaab degdeg ah</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white text-lg font-bold"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-4 bg-emerald-50/50 space-y-3">
            <div className="bg-white p-3 rounded-xl rounded-tl-none shadow-xs text-xs text-slate-700 border border-slate-100">
              Asc! Ku soo dhowow xarunta macaamiisha ee Kaafi-App Online. Maxaan maanta kugu caawinnaa?
            </div>

            <form onSubmit={handleSendMessage} className="space-y-2">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Qor fariintaada halkan..."
                rows={2}
                className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-500 bg-white"
              />
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-colors"
              >
                <span>Furo WhatsApp</span>
                <span>→</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative group w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20ba5a] text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95"
        aria-label="WhatsApp Support"
        title="Nala soo xiriir WhatsApp"
      >
        {/* Pulse wave ring */}
        <span className="absolute -inset-1 rounded-full bg-[#25D366] opacity-40 animate-ping pointer-events-none" />

        {/* WhatsApp SVG Icon */}
        <svg className="w-8 h-8 fill-current relative z-10" viewBox="0 0 24 24">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.083-2.121-.508-1.74-.723-2.883-2.483-2.971-2.6-.088-.117-.71-1.002-.71-1.914 0-.912.478-1.36.648-1.543.17-.183.371-.228.495-.228.125 0 .25.002.359.006.115.006.269-.044.421.322.156.376.533 1.303.58 1.398.047.095.078.207.016.332-.063.125-.094.204-.187.314-.094.11-.198.246-.282.33-.094.094-.192.197-.082.386.11.189.489.807 1.05 1.306.724.644 1.334.843 1.523.937.189.094.3.08.411-.048.112-.128.477-.557.604-.748.127-.191.254-.159.427-.095.174.064 1.1.518 1.29.613.19.095.317.143.364.223.048.08.048.463-.096.868zM12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.436 5.176L2 22l4.982-1.393A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.143a8.106 8.106 0 01-4.223-1.182l-.303-.18-3.053.854.819-2.991-.197-.319A8.104 8.104 0 1112 20.143z" />
        </svg>
      </button>
    </div>
  );
}
