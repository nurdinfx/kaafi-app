export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-20 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)', background: '#050c15' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <img
                src="/kaafi_logo.png"
                alt="Kaafi-App"
                className="w-10 h-10 rounded-xl object-cover shadow-md"
              />
              <div>
                <div className="font-bold text-white text-lg leading-none" style={{ fontFamily: 'Outfit, sans-serif' }}>Kaafi-App</div>
                <div className="text-xs mt-1" style={{ color: '#94b4d0' }}>Garoowe, Somalia</div>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#94b4d0' }}>
              Somalia&apos;s leading multi-category marketplace. Connecting buyers, sellers, and businesses across Puntland and beyond.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Categories</h3>
            <ul className="space-y-2 text-sm" style={{ color: '#94b4d0' }}>
              {[
                { label: '🚗 Vehicles & Automotive', href: '/listings?categorySlug=vehicles' },
                { label: '🏢 Real Estate & Properties', href: '/listings?categorySlug=real-estate' },
                { label: '📐 Land & Plots', href: '/listings?categorySlug=land' },
                { label: '📱 Electronics & Phones', href: '/listings?categorySlug=electronics' },
                { label: '🛠️ Services & Freelance', href: '/listings?categorySlug=services' },
                { label: '🏭 B2B Wholesale', href: '/listings?categorySlug=wholesale' },
              ].map((l) => (
                <li key={l.href}>
                  <a href={l.href} className="hover:text-blue-300 transition-colors">{l.label}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Sellers */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Sell on Kaafi-App</h3>
            <ul className="space-y-2 text-sm" style={{ color: '#94b4d0' }}>
              <li><a href="/listings/create" className="hover:text-blue-300 transition-colors">Post a Listing</a></li>
              <li><a href="/stores/create" className="hover:text-blue-300 transition-colors">Create Business Store</a></li>
              <li><a href="/seller" className="hover:text-blue-300 transition-colors">Seller Dashboard</a></li>
              <li><a href="/requests" className="hover:text-blue-300 transition-colors">View Buyer Requests</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-semibold text-white mb-4 text-sm">Support & Company</h3>
            <ul className="space-y-2 text-sm" style={{ color: '#94b4d0' }}>
              <li><a href="https://wa.me/252611000000" className="hover:text-blue-300 transition-colors">💬 WhatsApp Support</a></li>
              <li><a href="/about" className="hover:text-blue-300 transition-colors">About Hudi-Soft</a></li>
              <li><a href="/trust" className="hover:text-blue-300 transition-colors">Trust & Safety</a></li>
              <li><a href="/terms" className="hover:text-blue-300 transition-colors">Terms of Service</a></li>
              <li><a href="/privacy" className="hover:text-blue-300 transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 border-t"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs" style={{ color: '#94b4d0' }}>
            © {year} Hudi-Soft Technologies. Garoowe, Puntland, Somalia.
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: '#94b4d0' }}>
            <span>🇸🇴 Somalia · Puntland · Garoowe</span>
            <span>|</span>
            <span>💵 USD · SOS</span>
            <span>|</span>
            <span>📱 EVC Plus · ZAAD · SAHAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
