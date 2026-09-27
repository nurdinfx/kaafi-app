'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api, Notification } from '../../lib/api';

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'TRANSACTION' | 'OFFER' | 'SYSTEM'>('ALL');
  const [token, setToken] = useState<string | null>(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('hudisoft_token');
    if (!savedToken) {
      router.push('/auth/login');
      return;
    }
    setToken(savedToken);
    loadNotifications(savedToken);
  }, [router]);

  const loadNotifications = async (authToken: string) => {
    setLoading(true);
    try {
      const data = await api.getNotifications(authToken);
      setNotifications(data);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    if (!token) return;
    try {
      await api.markNotificationRead(id, token);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!token) return;
    setMarkingAll(true);
    try {
      await api.markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    } finally {
      setMarkingAll(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    if (filter === 'TRANSACTION') return n.type === 'TRANSACTION' || n.type === 'DELIVERY';
    if (filter === 'OFFER') return n.type === 'OFFER';
    if (filter === 'SYSTEM') return n.type === 'SYSTEM';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'TRANSACTION':
        return '🛍️';
      case 'DELIVERY':
        return '🚚';
      case 'OFFER':
        return '🏷️';
      case 'MESSAGE':
        return '💬';
      case 'SOCIAL':
        return '❤️';
      default:
        return '🔔';
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#050c15' }}>
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3">
              <h1
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                Ogeysiisyada (Notifications)
              </h1>
              {unreadCount > 0 && (
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                  style={{ background: '#0c8fe2', color: '#fff' }}
                >
                  {unreadCount} cusub
                </span>
              )}
            </div>
            <p className="text-sm mt-1" style={{ color: '#94b4d0' }}>
              La soco dalabyadaada, gorgortanka, iyo dhaqdhaqaaqa suuqa Fududeeye
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: 'rgba(12, 143, 226, 0.15)',
                color: '#38bdf8',
                border: '1px solid rgba(12, 143, 226, 0.3)',
              }}
            >
              {markingAll ? 'Waa la calaamadinayaa...' : 'Dhammaan Akhriso (Mark all read)'}
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div
          className="flex items-center gap-2 pb-3 mb-6 overflow-x-auto border-b"
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          {[
            { key: 'ALL', label: `Dhammaan (${notifications.length})` },
            { key: 'UNREAD', label: `Aan la akhrin (${unreadCount})` },
            { key: 'TRANSACTION', label: 'Dalabyada & Logistics' },
            { key: 'OFFER', label: 'Gorgortanka (Offers)' },
            { key: 'SYSTEM', label: 'System' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap"
              style={{
                background: filter === tab.key ? 'rgba(12, 143, 226, 0.2)' : 'transparent',
                color: filter === tab.key ? '#38bdf8' : '#94b4d0',
                border: filter === tab.key ? '1px solid rgba(12, 143, 226, 0.4)' : '1px solid transparent',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification List */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="p-4 rounded-xl animate-pulse"
                style={{ background: 'rgba(15, 32, 64, 0.4)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="h-4 w-1/3 bg-blue-900/40 rounded mb-2" />
                <div className="h-3 w-2/3 bg-blue-900/20 rounded" />
              </div>
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div
            className="text-center py-16 rounded-2xl"
            style={{
              background: 'rgba(15, 32, 64, 0.3)',
              border: '1px dashed rgba(255,255,255,0.1)',
            }}
          >
            <div className="text-4xl mb-3">🔔</div>
            <h3 className="text-lg font-semibold text-white mb-1">Wax ogeysiis ah ma jiraan</h3>
            <p className="text-sm max-w-sm mx-auto" style={{ color: '#94b4d0' }}>
              Halkan waxaad ku arki doontaa cusbooneysiinta dalabyadaada, farriimaha, iyo gorgortanka.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification) => {
              const content = (
                <div
                  key={notification.id}
                  onClick={() => {
                    if (!notification.isRead) handleMarkAsRead(notification.id);
                  }}
                  className="p-4 rounded-xl transition-all cursor-pointer flex items-start gap-3.5 group"
                  style={{
                    background: notification.isRead
                      ? 'rgba(15, 32, 64, 0.35)'
                      : 'rgba(12, 143, 226, 0.08)',
                    border: notification.isRead
                      ? '1px solid rgba(255,255,255,0.06)'
                      : '1px solid rgba(12, 143, 226, 0.3)',
                    boxShadow: notification.isRead
                      ? 'none'
                      : '0 4px 16px rgba(12, 143, 226, 0.06)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                    style={{
                      background: notification.isRead
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(12, 143, 226, 0.2)',
                    }}
                  >
                    {getTypeIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4
                        className={`text-sm font-semibold truncate ${
                          notification.isRead ? 'text-slate-300' : 'text-white'
                        }`}
                      >
                        {notification.title}
                      </h4>
                      <span className="text-[11px] whitespace-nowrap" style={{ color: '#6287a2' }}>
                        {new Date(notification.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: notification.isRead ? '#829bb0' : '#b2cde5' }}
                    >
                      {notification.message}
                    </p>
                  </div>

                  {!notification.isRead && (
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5"
                      style={{ background: '#0c8fe2' }}
                      title="Unread"
                    />
                  )}
                </div>
              );

              if (notification.linkUrl) {
                return (
                  <Link key={notification.id} href={notification.linkUrl} className="block no-underline">
                    {content}
                  </Link>
                );
              }
              return content;
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
