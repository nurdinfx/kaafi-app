'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { api } from '../../../lib/api';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || searchParams.get('returnUrl') || '/';
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'otp';

  const [tab, setTab] = useState<'otp' | 'password' | 'register'>(initialTab);

  const [phone, setPhone] = useState('+252');
  const [otpCode, setOtpCode] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [city, setCity] = useState('Garoowe');

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const isStoreBuilderRedirect = redirectParam.includes('store-builder');

  const onAuthSuccess = (token: string, user: any) => {
    localStorage.setItem('hudisoft_token', token);
    localStorage.setItem('hudisoft_user', JSON.stringify(user));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
      window.dispatchEvent(new Event('storage'));
    }
    router.push(redirectParam);
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.sendOtp(phone);
      if (res.success) {
        setOtpSent(true);
        setSuccessMsg(`OTP sent to ${phone}! (Development code: ${res.data?.devCode || '123456'})`);
      } else {
        setError(res.message || res.error?.message || 'Failed to send OTP.');
      }
    } catch {
      setError('Network error connecting to API.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.verifyOtp(phone, otpCode);
      if (res.success && res.data?.token) {
        onAuthSuccess(res.data.token, res.data.user);
      } else {
        setError(res.message || res.error?.message || 'Invalid verification code.');
      }
    } catch {
      setError('Verification failed. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.loginWithPassword(phone, password);
      if (res.success && res.data?.token) {
        onAuthSuccess(res.data.token, res.data.user);
      } else {
        setError(res.message || res.error?.message || 'Invalid phone or password.');
      }
    } catch {
      setError('Login failed. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await api.registerUser({ phoneNumber: phone, fullName, city, password });
      if (res.success && res.data?.token) {
        onAuthSuccess(res.data.token, res.data.user);
      } else {
        setError(res.message || res.error?.message || 'Lambarkaan horey ayaa loogu diiwaangashaday (An account with this phone or email already exists).');
      }
    } catch {
      setError('Registration failed. Check your network.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <Navbar />

      <div className="max-w-md mx-auto px-4 py-16">
        {isStoreBuilderRedirect && (
          <div className="mb-6 p-4 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-200 shadow-xl flex items-start gap-3 animate-slide-up">
            <span className="text-2xl flex-shrink-0">🏪</span>
            <div className="text-xs">
              <p className="font-bold text-orange-400 text-sm">Furashada Store-ka Cusub (Shopify Store)</p>
              <p className="text-slate-300 mt-1 leading-relaxed">
                Si aad u furato meheraddaada una maamusho logo-daada, banner-kaaga iyo badeecooyinkaaga, waa qasab inaad marka hore is-diiwaangeliso (Sign Up) ama aad soo gasho (Sign In).
              </p>
            </div>
          </div>
        )}

        <div className="text-center mb-8">
          <img
            src="/dukaami_icon.png"
            alt="DukaamiOnline"
            className="w-16 h-16 rounded-2xl object-contain shadow-lg mx-auto mb-3 bg-white p-1"
          />
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Welcome to DukaamiOnline
          </h1>
          <p className="text-xs mt-1" style={{ color: '#94b4d0' }}>
            Somalia&apos;s digital marketplace platform
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(15,32,64,0.8)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            type="button"
            onClick={() => { setTab('otp'); setError(''); }}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={tab === 'otp' ? { background: '#0c8fe2', color: 'white' } : { color: '#94b4d0' }}
          >
            📱 Phone OTP
          </button>
          <button
            type="button"
            onClick={() => { setTab('password'); setError(''); }}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={tab === 'password' ? { background: '#0c8fe2', color: 'white' } : { color: '#94b4d0' }}
          >
            🔑 Password
          </button>
          <button
            type="button"
            onClick={() => { setTab('register'); setError(''); }}
            className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
            style={tab === 'register' ? { background: '#0c8fe2', color: 'white' } : { color: '#94b4d0' }}
          >
            ✨ Register
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl text-xs font-medium border"
            style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        {successMsg && (
          <div className="p-3 mb-4 rounded-xl text-xs font-medium border"
            style={{ background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)', color: '#34d399' }}>
            {successMsg}
          </div>
        )}

        <div className="glass-card p-6">
          {/* OTP Tab */}
          {tab === 'otp' && (
            !otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
                    Somalia Phone Number (Taleefankaaga)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+25261..."
                    className="input-field"
                  />
                  <p className="text-xs mt-1" style={{ color: '#94b4d0' }}>
                    Supported: Hormuud / Golis / Telesom (+252 61/90/63...)
                  </p>
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center"
                >
                  {loading ? 'Sending Code...' : 'Send SMS OTP (Dir Lambarka)'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className="input-field text-center tracking-widest text-lg font-bold"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full justify-center"
                >
                  {loading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-xs text-blue-400 block text-center w-full"
                >
                  Use a different number
                </button>
              </form>
            )
          )}

          {/* Password Tab */}
          {tab === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+252..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          )}

          {/* Register Tab */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Full Name (Magacaaga)</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Axmed Cali Faarax"
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+252..."
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>City</label>
                <select value={city} onChange={(e) => setCity(e.target.value)} className="input-field">
                  <option value="Garoowe">Garoowe</option>
                  <option value="Bosaso">Bosaso</option>
                  <option value="Galkayo">Galkayo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-accent w-full justify-center"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
