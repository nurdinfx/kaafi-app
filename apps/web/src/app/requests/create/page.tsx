'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import Footer from '../../../components/Footer';
import { api, Category } from '../../../lib/api';

export default function CreateRequestPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetBudget, setTargetBudget] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [quantity, setQuantity] = useState('1');
  const [city, setCity] = useState('Garoowe');
  const [landmark, setLandmark] = useState('');
  const [urgency, setUrgency] = useState('NORMAL');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getCategories().then((cats) => {
      setCategories(cats);
      if (cats.length > 0) setCategoryId(cats[0].id);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const token = typeof window !== 'undefined' ? localStorage.getItem('hudisoft_token') : null;
    if (!token) {
      setError('Please login first to submit a buyer request.');
      setSubmitting(false);
      return;
    }

    try {
      const res = await api.createBuyerRequest({
        categoryId,
        title,
        description,
        targetBudget: targetBudget ? parseFloat(targetBudget) : undefined,
        currency,
        quantity: parseInt(quantity, 10) || 1,
        city,
        landmark: landmark || undefined,
        urgency,
      }, token);

      if (res.success) {
        router.push('/requests');
      } else {
        setError(res.message || 'Failed to submit buyer request.');
      }
    } catch {
      setError('Network error. Check your connection or login.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main>
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2"
            style={{ background: 'rgba(249,115,22,0.12)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.2)' }}>
            📋 Request What You Need
          </div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Post a Buyer Request
          </h1>
          <p className="text-sm mt-1" style={{ color: '#94b4d0' }}>
            Can&apos;t find what you need? Describe it here and verified sellers in Garoowe will send you competitive offers directly.
          </p>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-xl text-sm font-medium border"
            style={{ background: 'rgba(239,68,68,0.12)', borderColor: 'rgba(239,68,68,0.3)', color: '#f87171' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Category *</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="input-field"
              required
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.icon} {c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
              What are you looking for? (Title) *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. 2018 Toyota RAV4 Automatic in good condition / 50 Bags of Basmati Rice"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
              Detailed Description & Requirements *
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Specify color preference, brand, required condition, maximum budget, timeline, delivery needs..."
              className="input-field resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Target Budget</label>
              <input
                type="number"
                min="0"
                step="any"
                value={targetBudget}
                onChange={(e) => setTargetBudget(e.target.value)}
                placeholder="Optional"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Currency</label>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="input-field">
                <option value="USD">USD ($)</option>
                <option value="SOS">SOS (Shilling)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Quantity</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Your City *</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="input-field">
                <option value="Garoowe">Garoowe (Puntland)</option>
                <option value="Bosaso">Bosaso (Puntland)</option>
                <option value="Galkayo">Galkayo (Mudug)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>Urgency Level</label>
              <select value={urgency} onChange={(e) => setUrgency(e.target.value)} className="input-field">
                <option value="NORMAL">Standard (Within 1-2 weeks)</option>
                <option value="URGENT">⚡ Urgent (Within 24-48 hours)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: '#94b4d0' }}>
              Landmark / Location Reference (Optional)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="e.g. Near New Garoowe Hospital / Hodan market"
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl font-black text-white text-base transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ea580c)',
              boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? 'Submitting Request...' : '📢 Broadcast Request to Sellers'}
          </button>
        </form>
      </div>

      <Footer />
    </main>
  );
}
