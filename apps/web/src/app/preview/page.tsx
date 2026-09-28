'use client';

import { useState, useEffect } from 'react';

export default function MobilePreviewPage() {
  const [currentTime, setCurrentTime] = useState('9:14');
  const [batteryLevel] = useState(25);
  const [islandOpen, setIslandOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<'dark' | 'light'>('dark');
  const [iframeKey, setIframeKey] = useState(0);
  const [activePath, setActivePath] = useState('/');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      let h = d.getHours();
      h = h % 12 || 12;
      const m = d.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);

    const savedTheme = (localStorage.getItem('fududeeye_theme') as 'dark' | 'light') || 'dark';
    setCurrentTheme(savedTheme);

    return () => clearInterval(interval);
  }, []);

  const toggleTheme = () => {
    const next = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(next);
    localStorage.setItem('fududeeye_theme', next);
    if (next === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    }
    setIframeKey((k) => k + 1);
  };

  const navigateTo = (path: string) => {
    setActivePath(path);
    setIslandOpen(false);
    setIframeKey((k) => k + 1);
  };

  return (
    <div className="w-screen h-screen overflow-hidden flex items-center justify-center bg-[#070b14] select-none p-2 relative font-[-apple-system,BlinkMacSystemFont,'SF_Pro_Text','SF_Pro_Display','Inter',sans-serif]">
      {/* Subtle modern backdrop glow */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(#0c8fe2_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* ────────────────────────────────────────────────────────
          THE IPHONE 16 PRO DEVICE CHASSIS (Fixed 393px Width)
         ──────────────────────────────────────────────────────── */}
      <div
        className="relative w-[393px] h-[852px] max-w-[98vw] max-h-[96vh] rounded-[52px] bg-black shadow-[0_0_0_12px_#1b2028,0_0_0_14px_#333c4d,0_25px_70px_rgba(0,0,0,0.95)] flex flex-col overflow-hidden border border-white/10 flex-shrink-0"
        style={{
          boxShadow:
            '0 0 0 10px #1e2530, 0 0 0 12px #374151, 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(12, 143, 226, 0.15)',
        }}
      >
        {/* Physical hardware side buttons */}
        <div className="absolute -left-[14px] top-[90px] w-[4px] h-[26px] bg-[#3a3f4a] rounded-l-sm pointer-events-none z-50" />
        <div className="absolute -left-[14px] top-[135px] w-[4px] h-[48px] bg-[#3a3f4a] rounded-l-sm pointer-events-none z-50" />
        <div className="absolute -left-[14px] top-[195px] w-[4px] h-[48px] bg-[#3a3f4a] rounded-l-sm pointer-events-none z-50" />
        <div className="absolute -right-[14px] top-[150px] w-[4px] h-[75px] bg-[#3a3f4a] rounded-r-sm pointer-events-none z-50" />

        {/* ────────────────────────────────────────────────────────
            iOS STATUS BAR (Top of iPhone - Exactly matching user's iPhone)
           ──────────────────────────────────────────────────────── */}
        <div className="relative w-full h-[50px] px-6 pt-2 flex items-center justify-between text-white z-50 bg-[#050c15]/95 backdrop-blur-md flex-shrink-0">
          {/* Left: Time (9:14 style) */}
          <div className="w-16 flex items-center">
            <span className="text-[15px] font-semibold tracking-tight text-white">
              {currentTime}
            </span>
          </div>

          {/* Center: Dynamic Island (Interactive pill) */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 z-50">
            <div
              onClick={() => setIslandOpen(!islandOpen)}
              className={`bg-black rounded-full transition-all duration-300 ease-out cursor-pointer flex items-center shadow-[0_4px_20px_rgba(0,0,0,0.95)] border border-white/10 ${
                islandOpen
                  ? 'w-[320px] h-[95px] px-4 py-2 flex-col justify-between'
                  : 'w-[122px] h-[34px] px-3.5 justify-between hover:scale-105'
              }`}
            >
              {!islandOpen ? (
                <>
                  {/* Selfie Camera Dot */}
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0a1020] border border-blue-900/40 relative">
                    <div className="absolute inset-0.5 rounded-full bg-blue-400/20" />
                  </div>
                  {/* Mic / Sensor Dot */}
                  <div className="w-2 h-2 rounded-full bg-[#151922]" />
                </>
              ) : (
                /* Dynamic Island Controls */
                <div className="w-full h-full flex flex-col justify-between py-1 text-white">
                  <div className="flex items-center justify-between text-xs font-semibold px-1">
                    <span className="text-blue-400 font-bold">Kaafi-App OS</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleTheme();
                        }}
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 hover:bg-white/30 text-yellow-300 transition-all"
                      >
                        {currentTheme === 'dark' ? '☀️ White' : '🌙 Dark'}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIframeKey((k) => k + 1);
                        }}
                        className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 hover:bg-white/20 text-slate-300"
                      >
                        🔄 Reload
                      </button>
                    </div>
                  </div>

                  {/* Quick Routes */}
                  <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] py-0.5">
                    {[
                      { label: 'Suuqa', path: '/' },
                      { label: 'Alaabta', path: '/listings' },
                      { label: 'Chat', path: '/chat' },
                      { label: 'Orders', path: '/orders' },
                      { label: 'Stores', path: '/stores' },
                    ].map((item) => (
                      <button
                        key={item.path}
                        onClick={(e) => {
                          e.stopPropagation();
                          navigateTo(item.path);
                        }}
                        className={`px-2 py-0.5 rounded-md font-medium transition-all ${
                          activePath === item.path
                            ? 'bg-blue-600 text-white'
                            : 'bg-white/10 text-slate-300 hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Signal, Wi-Fi, Battery (25%) */}
          <div className="w-20 flex items-center justify-end gap-1.5 pr-0.5">
            {/* Cellular signal */}
            <div className="flex items-end gap-[1.5px] h-[10.5px]">
              <div className="w-[3px] h-[3.5px] bg-white rounded-[0.5px]" />
              <div className="w-[3px] h-[5.5px] bg-white rounded-[0.5px]" />
              <div className="w-[3px] h-[7.5px] bg-white rounded-[0.5px]" />
              <div className="w-[3px] h-[10px] bg-white rounded-[0.5px]" />
            </div>

            {/* Wi-Fi */}
            <svg className="w-[14px] h-[12px] fill-white" viewBox="0 0 24 24">
              <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98C20.93 5.9 16.69 4 12 4zm0 2.92c3.98 0 7.58 1.62 10.18 4.22L12 18.3 1.82 11.14C4.42 8.54 8.02 6.92 12 6.92z" />
            </svg>

            {/* Battery 25% with number inside */}
            <div className="flex items-center gap-[1px]">
              <div className="w-[24px] h-[12px] rounded-[4px] border border-white/90 flex items-center justify-center p-[1px] relative bg-black/40">
                <span className="text-[9px] font-bold text-white leading-none font-mono">
                  {batteryLevel}
                </span>
              </div>
              <div className="w-[1.5px] h-[4px] bg-white/80 rounded-r-[1px]" />
            </div>
          </div>
        </div>

        {/* ────────────────────────────────────────────────────────
            APP CONTENT (Rendered inside 393px Mobile Width!)
           ──────────────────────────────────────────────────────── */}
        <div className="flex-1 w-full h-full relative overflow-hidden bg-[#050c15]">
          <iframe
            key={iframeKey}
            src={activePath}
            className="w-full h-full border-0"
            style={{
              paddingBottom: '20px',
            }}
            title="Kaafi-App"
          />

          {/* ────────────────────────────────────────────────────────
              iOS BOTTOM HOME BAR (Rounded Pill)
             ──────────────────────────────────────────────────────── */}
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-[138px] h-[5px] bg-white/60 rounded-full z-40 pointer-events-none shadow-md backdrop-blur-sm" />
        </div>
      </div>
    </div>
  );
}
