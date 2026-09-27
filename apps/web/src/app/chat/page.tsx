'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { api, ChatConversation, ChatMessage } from '../../lib/api';
import { formatPrice, timeAgo } from '../../lib/utils';

function ChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialConvId = searchParams.get('convId');
  const recipientId = searchParams.get('recipientId');
  const listingId = searchParams.get('listingId');

  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConv, setActiveConv] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaModal, setShowMediaModal] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('hudisoft_token');
    const savedUser = localStorage.getItem('hudisoft_user');

    if (!savedToken) {
      router.push('/auth/login');
      return;
    }

    setToken(savedToken);
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch {}
    }

    initChat(savedToken);
  }, [router, initialConvId, recipientId, listingId]);

  const initChat = async (authToken: string) => {
    setLoading(true);
    try {
      let convs = await api.getConversations(authToken);

      // If user came from a listing or user profile with recipientId
      if (recipientId) {
        const initRes = await api.getOrCreateConversation(recipientId, listingId || undefined, authToken);
        if (initRes.success && initRes.data) {
          convs = await api.getConversations(authToken);
          const found = convs.find((c) => c.id === initRes.data?.id);
          if (found) {
            setActiveConv(found);
            await loadMessages(found.id, authToken);
          }
        }
      } else if (initialConvId) {
        const target = convs.find((c) => c.id === initialConvId);
        if (target) {
          setActiveConv(target);
          await loadMessages(target.id, authToken);
        } else if (convs.length > 0) {
          setActiveConv(convs[0]);
          await loadMessages(convs[0].id, authToken);
        }
      } else if (convs.length > 0) {
        setActiveConv(convs[0]);
        await loadMessages(convs[0].id, authToken);
      }

      setConversations(convs);
    } catch (err) {
      console.error('Error initializing chat:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (convId: string, authToken: string) => {
    const msgs = await api.getMessages(convId, authToken);
    setMessages(msgs);
    scrollToBottom();
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Auto-poll messages every 4 seconds for realtime experience
  useEffect(() => {
    if (!activeConv || !token) return;
    const interval = setInterval(async () => {
      const msgs = await api.getMessages(activeConv.id, token);
      if (msgs.length !== messages.length) {
        setMessages(msgs);
        scrollToBottom();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [activeConv, token, messages.length]);

  const handleSelectConv = async (conv: ChatConversation) => {
    if (!token) return;
    setActiveConv(conv);
    await loadMessages(conv.id, token);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputMessage.trim() && !mediaUrl.trim()) || !activeConv || !token || sending) return;

    setSending(true);
    const content = inputMessage.trim();
    const attach = mediaUrl.trim() || undefined;

    setInputMessage('');
    setMediaUrl('');
    setShowMediaModal(false);

    try {
      const res = await api.sendMessage(activeConv.id, { content, attachmentUrl: attach }, token);
      if (res.success && res.data) {
        setMessages((prev) => [...prev, res.data!]);
        scrollToBottom();

        // Update last message in conversation list
        setConversations((prev) =>
          prev.map((c) => (c.id === activeConv.id ? { ...c, lastMessage: res.data, updatedAt: new Date().toISOString() } : c))
        );
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (15MB)
    if (file.size > 15 * 1024 * 1024) {
      alert('Fadlan soo geli fayl ka yar 15MB');
      return;
    }

    const isVideo = file.type.startsWith('video/');
    setMediaType(isVideo ? 'video' : 'image');

    const reader = new FileReader();
    reader.onload = () => {
      setMediaUrl(reader.result as string);
      setShowMediaModal(true);
    };
    reader.readAsDataURL(file);
  };

  const filteredConversations = conversations.filter((c) => {
    const name = c.otherParticipant?.fullName || c.otherParticipant?.businessProfile?.businessName || '';
    return name.toLowerCase().includes(searchFilter.toLowerCase());
  });

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#050c15' }}>
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col">
        {/* Protection Notice Banner */}
        <div
          className="mb-4 px-4 py-2.5 rounded-2xl flex items-center justify-between gap-3 text-xs"
          style={{
            background: 'rgba(12,143,226,0.1)',
            border: '1px solid rgba(12,143,226,0.25)',
            color: '#7cc8fb',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <span>
              <strong>Fududeeye Escrow & Chat Protection:</strong> Dhammaan wadahadallada iyo lacag-bixinta waa in lagu dhex mariyaa app-ka si xaqiijinta alaabtaada iyo lacagtaadu u ahaadaan kuwo ammaan ah.
            </span>
          </div>
        </div>

        {/* Chat Application Container */}
        <div
          className="flex-1 rounded-3xl overflow-hidden flex flex-col md:flex-row border shadow-2xl"
          style={{
            background: 'rgba(10,22,40,0.85)',
            backdropFilter: 'blur(20px)',
            borderColor: 'rgba(255,255,255,0.08)',
            minHeight: '650px',
            maxHeight: 'calc(100vh - 180px)',
          }}
        >
          {/* Left Sidebar: Conversations List */}
          <div
            className={`w-full md:w-80 lg:w-96 flex flex-col border-r ${
              activeConv ? 'hidden md:flex' : 'flex'
            }`}
            style={{
              borderColor: 'rgba(255,255,255,0.06)',
              background: 'rgba(7,16,30,0.95)',
            }}
          >
            {/* Sidebar Header */}
            <div className="p-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  <span>💬</span> Farriimaha (Chats)
                </h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-500/20 text-blue-400">
                  {conversations.length}
                </span>
              </div>

              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Raadi qof ama ganacsi..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs text-white placeholder-slate-500 outline-none border transition-all"
                  style={{
                    background: 'rgba(15,32,64,0.6)',
                    borderColor: 'rgba(255,255,255,0.08)',
                  }}
                />
                <span className="absolute left-3 top-2.5 text-slate-500 text-xs">🔍</span>
              </div>
            </div>

            {/* Conversations Scroll Area */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5">
              {loading ? (
                <div className="p-8 text-center text-slate-500 text-xs">Soo rarayaa farriimaha...</div>
              ) : filteredConversations.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Weli wax wadahadal ah ma jiro. Booqo bogga alaabta si aad ula sheekaysato iibiyaha!
                </div>
              ) : (
                filteredConversations.map((conv) => {
                  const partner = conv.otherParticipant;
                  const name = partner?.businessProfile?.businessName || partner?.fullName || 'Fududeeye User';
                  const isSelected = activeConv?.id === conv.id;
                  const hasUnread = conv.lastMessage && !conv.lastMessage.isRead && conv.lastMessage.senderId !== currentUser?.id;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConv(conv)}
                      className={`w-full p-3.5 flex items-start gap-3 text-left transition-all hover:bg-blue-950/30 ${
                        isSelected ? 'bg-blue-950/60 border-l-4 border-blue-500' : ''
                      }`}
                    >
                      {/* Avatar */}
                      <div className="relative flex-shrink-0">
                        <div
                          className="w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-white text-sm"
                          style={{ background: 'linear-gradient(135deg, #0c8fe2, #005899)' }}
                        >
                          {partner?.avatarUrl || partner?.businessProfile?.logoUrl ? (
                            <img
                              src={partner.avatarUrl || partner.businessProfile?.logoUrl}
                              alt={name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            name.charAt(0).toUpperCase()
                          )}
                        </div>
                        {partner?.verificationStatus === 'VERIFIED' && (
                          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] text-white flex items-center justify-center border-2 border-slate-900">
                            ✓
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="text-sm font-semibold text-white truncate">{name}</span>
                          {conv.lastMessage && (
                            <span className="text-[10px] text-slate-400 flex-shrink-0">
                              {timeAgo(conv.lastMessage.createdAt)}
                            </span>
                          )}
                        </div>

                        {/* Listing tag if attached */}
                        {conv.listing && (
                          <div className="text-[11px] text-blue-300 truncate mb-0.5 flex items-center gap-1 font-medium">
                            <span>🏷️</span> {conv.listing.title} ({formatPrice(conv.listing.price, conv.listing.currency)})
                          </div>
                        )}

                        {/* Message snippet */}
                        <p className={`text-xs truncate ${hasUnread ? 'text-white font-bold' : 'text-slate-400'}`}>
                          {conv.lastMessage?.attachmentUrl ? '📎 Sawir/Muuqaal' : conv.lastMessage?.content || 'Bilow wadahadalka...'}
                        </p>
                      </div>

                      {/* Unread dot */}
                      {hasUnread && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500 flex-shrink-0 self-center" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Pane: Active Conversation & Messages */}
          <div className={`flex-1 flex flex-col ${!activeConv ? 'hidden md:flex' : 'flex'}`}>
            {activeConv ? (
              <>
                {/* Chat Top Header */}
                <div
                  className="p-3.5 sm:p-4 border-b flex items-center justify-between gap-3"
                  style={{
                    borderColor: 'rgba(255,255,255,0.06)',
                    background: 'rgba(12,25,46,0.95)',
                  }}
                >
                  <div className="flex items-center gap-3">
                    {/* Back button on mobile */}
                    <button
                      onClick={() => setActiveConv(null)}
                      className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white"
                    >
                      ←
                    </button>

                    <div
                      className="w-10 h-10 rounded-2xl overflow-hidden flex items-center justify-center font-bold text-white text-sm"
                      style={{ background: 'linear-gradient(135deg, #0c8fe2, #005899)' }}
                    >
                      {activeConv.otherParticipant?.avatarUrl || activeConv.otherParticipant?.businessProfile?.logoUrl ? (
                        <img
                          src={activeConv.otherParticipant.avatarUrl || activeConv.otherParticipant.businessProfile?.logoUrl}
                          alt="avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        (activeConv.otherParticipant?.fullName || 'U').charAt(0).toUpperCase()
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm sm:text-base">
                          {activeConv.otherParticipant?.businessProfile?.businessName ||
                            activeConv.otherParticipant?.fullName ||
                            'Fududeeye User'}
                        </span>
                        {activeConv.otherParticipant?.verificationStatus === 'VERIFIED' && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-semibold">
                            ✓ Verified
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Online App-ka
                      </div>
                    </div>
                  </div>

                  {/* Attached Listing Action Button */}
                  {activeConv.listing && (
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/checkout?listingId=${activeConv.listing.id}`}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-1.5 transition-transform hover:scale-105"
                        style={{ background: 'linear-gradient(135deg, #0c8fe2, #005899)' }}
                      >
                        <span>⚡</span> Iibso Hadda ({formatPrice(activeConv.listing.price, activeConv.listing.currency)})
                      </Link>
                    </div>
                  )}
                </div>

                {/* Attached Listing Bar (if conversation is about a product) */}
                {activeConv.listing && (
                  <div
                    className="px-4 py-2.5 border-b flex items-center justify-between gap-3 text-xs"
                    style={{
                      background: 'rgba(15,32,64,0.5)',
                      borderColor: 'rgba(255,255,255,0.05)',
                    }}
                  >
                    <div className="flex items-center gap-3 truncate">
                      {activeConv.listing.media?.[0]?.url && (
                        <img
                          src={activeConv.listing.media[0].url}
                          alt={activeConv.listing.title}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      )}
                      <span className="text-white font-medium truncate">{activeConv.listing.title}</span>
                      <span className="text-emerald-400 font-bold">
                        {formatPrice(activeConv.listing.price, activeConv.listing.currency)}
                      </span>
                    </div>
                    <Link
                      href={`/listing/${activeConv.listing.slug}`}
                      className="text-blue-400 hover:text-blue-300 font-semibold flex-shrink-0"
                    >
                      Eeg Alaabta →
                    </Link>
                  </div>
                )}

                {/* Messages Scroll View */}
                <div
                  className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4"
                  style={{
                    backgroundImage: 'radial-gradient(circle at center, rgba(12,143,226,0.03) 0%, transparent 70%)',
                  }}
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8">
                      <div className="text-4xl mb-2">💬</div>
                      <h4 className="text-white font-bold text-sm mb-1">Farriin u dir iibiyaha</h4>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Waxaad weydiin kartaa qiimaha, xaaladda alaabta, ama sawirro iyo muuqaallo dheeraad ah.
                      </p>
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.senderId === currentUser?.id;

                      return (
                        <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                          <div
                            className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3.5 shadow-lg ${
                              isMe
                                ? 'rounded-br-sm text-white'
                                : 'rounded-bl-sm text-slate-200'
                            }`}
                            style={{
                              background: isMe
                                ? 'linear-gradient(135deg, #0c8fe2, #0066b2)'
                                : 'rgba(15,32,64,0.9)',
                              border: isMe
                                ? '1px solid rgba(255,255,255,0.15)'
                                : '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            {/* Attachment: Image or Video */}
                            {msg.attachmentUrl && (
                              <div className="mb-2 rounded-xl overflow-hidden max-h-80 bg-black/40">
                                {msg.attachmentUrl.includes('data:video') ||
                                msg.attachmentUrl.endsWith('.mp4') ||
                                msg.attachmentUrl.endsWith('.webm') ? (
                                  <video
                                    src={msg.attachmentUrl}
                                    controls
                                    className="w-full max-h-72 object-contain rounded-xl"
                                  />
                                ) : (
                                  <img
                                    src={msg.attachmentUrl}
                                    alt="attachment"
                                    className="w-full max-h-72 object-cover rounded-xl cursor-pointer hover:opacity-95 transition-opacity"
                                    onClick={() => window.open(msg.attachmentUrl, '_blank')}
                                  />
                                )}
                              </div>
                            )}

                            {/* Message Text */}
                            {msg.content && <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>}

                            {/* Timestamp & Ticks */}
                            <div
                              className={`flex items-center gap-1 mt-1 text-[10px] ${
                                isMe ? 'text-blue-100 justify-end' : 'text-slate-400'
                              }`}
                            >
                              <span>
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              {isMe && <span>{msg.isRead ? '✓✓' : '✓'}</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Bottom Input Area */}
                <div
                  className="p-3 sm:p-4 border-t"
                  style={{
                    borderColor: 'rgba(255,255,255,0.06)',
                    background: 'rgba(7,16,30,0.95)',
                  }}
                >
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                    {/* Media Upload (Photo/Video) Button */}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      accept="image/*,video/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2.5 rounded-xl border text-slate-400 hover:text-white transition-all"
                      style={{
                        background: 'rgba(15,32,64,0.7)',
                        borderColor: 'rgba(255,255,255,0.1)',
                      }}
                      title="Ku dar Sawir ama Muuqaal (Attach Photo or Video)"
                    >
                      📎
                    </button>

                    {/* Text input */}
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Qor farriin... (Type a message)"
                      className="flex-1 py-3 px-4 rounded-xl text-sm text-white placeholder-slate-500 outline-none border transition-all"
                      style={{
                        background: 'rgba(15,32,64,0.7)',
                        borderColor: 'rgba(255,255,255,0.1)',
                      }}
                    />

                    {/* Send button */}
                    <button
                      type="submit"
                      disabled={(!inputMessage.trim() && !mediaUrl.trim()) || sending}
                      className="p-3 rounded-xl font-bold text-white transition-all disabled:opacity-40"
                      style={{ background: 'linear-gradient(135deg, #0c8fe2, #005899)' }}
                      title="Dir"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </form>
                </div>
              </>
            ) : (
              /* No Conversation Selected Placeholder */
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <div className="w-16 h-16 rounded-3xl bg-blue-500/10 flex items-center justify-center text-3xl mb-4 border border-blue-500/20">
                  💬
                </div>
                <h3 className="text-xl font-bold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Wadahadalka Tooska ah (In-App Marketplace Chat)
                </h3>
                <p className="text-sm max-w-md text-slate-400">
                  Dooro qof ama ganacsi liiska dhinaca bidix ku yaalla si aad ula sheekaysato, sawirro iyo muuqaallo isku weydaarsataan.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Media Preview Modal Before Sending */}
        {showMediaModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div
              className="glass-card max-w-md w-full p-6 rounded-3xl border border-white/10"
              style={{ background: '#0a1628' }}
            >
              <h3 className="text-lg font-bold text-white mb-4">Ku dar Farriintaada</h3>

              <div className="rounded-2xl overflow-hidden max-h-64 bg-black/60 mb-4 flex items-center justify-center">
                {mediaType === 'video' ? (
                  <video src={mediaUrl} controls className="max-h-60 w-full object-contain" />
                ) : (
                  <img src={mediaUrl} alt="preview" className="max-h-60 w-full object-contain" />
                )}
              </div>

              <input
                type="text"
                placeholder="Ku dar sharaxaad qoraal ah (optional caption)..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="w-full py-2.5 px-4 rounded-xl text-xs text-white placeholder-slate-500 outline-none border mb-4"
                style={{ background: 'rgba(15,32,64,0.7)', borderColor: 'rgba(255,255,255,0.1)' }}
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowMediaModal(false);
                    setMediaUrl('');
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 border border-white/10"
                >
                  Ka noqo (Cancel)
                </button>
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={sending}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white"
                  style={{ background: 'linear-gradient(135deg, #0c8fe2, #005899)' }}
                >
                  {sending ? 'Dirayaa...' : 'Dir Hadda (Send)'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050c15] text-white p-8 text-center">Loading Chat...</div>}>
      <ChatContent />
    </Suspense>
  );
}
