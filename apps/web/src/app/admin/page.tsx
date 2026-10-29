'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { formatPrice, timeAgo } from '../../lib/utils';
import { useStore } from '../../context/StoreContext';

type AdminTab = 'OVERVIEW' | 'TRANSACTIONS' | 'ORDERS' | 'STORES' | 'LIVE_FEED' | 'USERS' | 'AUDIT' | 'LISTINGS' | 'CATEGORIES' | 'SYSTEM';

export default function SuperAdminPortal() {
  const router = useRouter();
  const { deleteStore } = useStore();

  // Hydration protection
  const [isMounted, setIsMounted] = useState(false);

  // Navigation & View State
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Private Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('admin@hudisoft.com');
  const [loginPassword, setLoginPassword] = useState('Admin@Garoowe2026');
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('hudisoft_token');
    localStorage.removeItem('hudisoft_user');
    setToken(null);
    setCurrentUser(null);
  };

  // New Admin Provisioning Modal State
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminPhone, setNewAdminPhone] = useState('+252');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminRole, setNewAdminRole] = useState('SUPER_ADMIN');
  const [creatingAdmin, setCreatingAdmin] = useState(false);

  // Notifications / Feedback
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Data States
  const [analytics, setAnalytics] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txSummary, setTxSummary] = useState<any>({ totalVolume: 0, totalCommission: 0, totalCount: 0 });
  const [stores, setStores] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [liveActivity, setLiveActivity] = useState<any>(null);

  // ─── Listings Management State ────────────────────────────
  const [adminListings, setAdminListings] = useState<any[]>([]);
  const [adminListingsTotal, setAdminListingsTotal] = useState(0);
  const [listingStatusFilter, setListingStatusFilter] = useState('ALL');
  const [listingSearch, setListingSearch] = useState('');
  const [showAddListingModal, setShowAddListingModal] = useState(false);
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [newListingTitle, setNewListingTitle] = useState('');
  const [newListingDesc, setNewListingDesc] = useState('');
  const [newListingPrice, setNewListingPrice] = useState('');
  const [newListingCategory, setNewListingCategory] = useState('');
  const [newListingVertical, setNewListingVertical] = useState('PRODUCT');
  const [newListingCondition, setNewListingCondition] = useState('NEW');
  const [newListingCurrency, setNewListingCurrency] = useState('USD');
  const [newListingCity, setNewListingCity] = useState('Garoowe');
  const [newListingInventory, setNewListingInventory] = useState('1');
  const [newListingNegotiable, setNewListingNegotiable] = useState(false);
  const [newListingImageUrl, setNewListingImageUrl] = useState('');
  const [savingListing, setSavingListing] = useState(false);

  const handleListingImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      alert('Sawirku wuxuu ka weyn yahay 8MB. Fadlan soo dooro sawir ka yar 8MB.');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setNewListingImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // ─── Categories Management State ──────────────────────────
  const [adminCategories, setAdminCategories] = useState<any[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [newCatName, setNewCatName] = useState('');
  const [newCatSlug, setNewCatSlug] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('');
  const [newCatVertical, setNewCatVertical] = useState('PRODUCT');
  const [newCatCommission, setNewCatCommission] = useState('5');
  const [savingCategory, setSavingCategory] = useState(false);

  // ─── System Wipe State ─────────────────────────────────────
  const [wiping, setWiping] = useState(false);
  const [wipeResult, setWipeResult] = useState<any | null>(null);

  // Filters
  const [txStatusFilter, setTxStatusFilter] = useState('ALL');
  const [txProviderFilter, setTxProviderFilter] = useState('ALL');
  const [txSearch, setTxSearch] = useState('');

  const [orderStatusFilter, setOrderStatusFilter] = useState('ALL');
  const [orderFulfillmentFilter, setOrderFulfillmentFilter] = useState('ALL');
  const [orderSearch, setOrderSearch] = useState('');

  const [storeSearch, setStoreSearch] = useState('');
  const [storeVerifiedFilter, setStoreVerifiedFilter] = useState('ALL');

  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');

  // Modal / Drawer Selection
  const [selectedTx, setSelectedTx] = useState<any | null>(null);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  // Auto-refresh interval toggle for Live Monitor
  const [autoRefreshLive, setAutoRefreshLive] = useState(true);

  // Mount Guard
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Fetch all admin data
  const fetchAllData = useCallback(async (authToken: string) => {
    setRefreshing(true);
    setErrorMsg('');

    // 1. ALWAYS load customer stores from local storage first so they are immediately visible!
    let localCustomerStores: any[] = [];
    try {
      const localSaved = localStorage.getItem('kaafi_merchant_stores_clean_v2');
      if (localSaved) {
        const parsed = JSON.parse(localSaved);
        if (Array.isArray(parsed)) {
          localCustomerStores = parsed.map((ls: any) => ({
            id: ls.id,
            slug: ls.slug,
            businessName: ls.businessName,
            tagline: ls.tagline,
            description: ls.bio,
            logoUrl: ls.logoUrl,
            coverImageUrl: ls.bannerUrl,
            phone: ls.phone,
            whatsappNumber: ls.whatsappNumber,
            city: ls.city,
            landmarkAddress: ls.district,
            isVerified: !!ls.isVerified,
            createdAt: ls.createdDate || new Date().toISOString(),
            owner: {
              fullName: ls.ownerName || 'Merchant Owner',
              phoneNumber: ls.ownerPhone || ls.phone,
              isActive: true,
            },
            _count: {
              listings: (ls.products || []).length,
              branches: 1,
              employees: 1,
            },
          }));
        }
      }
    } catch {}

    try {
      const results = await Promise.allSettled([
        api.getAdminAnalytics(authToken),
        api.getAdminTransactions(authToken, { limit: 100 }),
        api.getAdminStores(authToken),
        api.getAdminUsers(authToken, { limit: 100 }),
        api.getAdminAuditLogs(authToken, 50),
        api.getAdminLiveActivity(authToken),
        api.adminGetAllListings(authToken, { limit: 100 }),
        api.adminGetAllCategories(authToken),
      ]);

      const analyticsRes = results[0].status === 'fulfilled' ? results[0].value : null;
      const txRes = results[1].status === 'fulfilled' ? results[1].value : null;
      const storesRes = results[2].status === 'fulfilled' ? results[2].value : null;
      const usersRes = results[3].status === 'fulfilled' ? results[3].value : null;
      const auditRes = results[4].status === 'fulfilled' ? results[4].value : null;
      const liveRes = results[5].status === 'fulfilled' ? results[5].value : null;
      const listingsRes = results[6].status === 'fulfilled' ? results[6].value : null;
      const catsRes = results[7].status === 'fulfilled' ? results[7].value : null;

      if (analyticsRes?.success) setAnalytics(analyticsRes.data);
      if (txRes?.success) {
        setTransactions(txRes.data || []);
        if (txRes.summary) setTxSummary(txRes.summary);
      }

      let combinedStores: any[] = [];
      if (storesRes?.success && Array.isArray(storesRes.data?.stores)) {
        combinedStores = [...storesRes.data.stores];
        setSellers(storesRes.data?.sellers || []);
      }

      // Merge local customer stores so they are ALWAYS available in admin
      localCustomerStores.forEach((ls: any) => {
        const idx = combinedStores.findIndex(
          (cs: any) => cs.id === ls.id || cs.slug === ls.slug
        );
        if (idx === -1) {
          combinedStores.push(ls);
        } else {
          // If either backend or local is verified, preserve verified status
          combinedStores[idx].isVerified = combinedStores[idx].isVerified || ls.isVerified;
        }
      });

      setStores(combinedStores);
      if (usersRes?.success) setUsers(usersRes.data || []);
      if (auditRes?.success) setAuditLogs(auditRes.data || []);
      if (liveRes?.success) setLiveActivity(liveRes.data);
      if (listingsRes?.success) {
        setAdminListings(listingsRes.data || []);
        setAdminListingsTotal(listingsRes.meta?.total || 0);
      }
      if (catsRes?.success) setAdminCategories(catsRes.data || []);
    } catch {
      // In case of unexpected failure, ensure stores are at least local stores
      setStores(localCustomerStores);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Check Auth on Mount
  useEffect(() => {
    if (!isMounted) return;

    const savedToken = localStorage.getItem('hudisoft_token');
    const storedUser = localStorage.getItem('hudisoft_user');

    if (!savedToken) {
      setLoading(false);
      return;
    }

    setToken(savedToken);
    let parsedUser: any = null;
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser);
        setCurrentUser(parsedUser);
      } catch {}
    }

    const userRoles = parsedUser?.roles || [];
    const hasAdminAccess =
      userRoles.includes('SUPER_ADMIN') ||
      userRoles.includes('FINANCE_ADMIN') ||
      userRoles.includes('MODERATOR') ||
      parsedUser?.email === 'admin@hudisoft.com' ||
      parsedUser?.phoneNumber === '+252907000001' ||
      parsedUser?.phoneNumber === '+252615000000';

    if (hasAdminAccess) {
      fetchAllData(savedToken);
    } else {
      setLoading(false);
    }
  }, [isMounted, fetchAllData]);

  // Real-time listener for store creation & verification across tabs
  useEffect(() => {
    if (!token) return;
    const handleSync = () => {
      fetchAllData(token);
    };
    window.addEventListener('kaafi_stores_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('kaafi_stores_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [token, fetchAllData]);

  // Periodic polling for live monitor with safe failure backoff
  useEffect(() => {
    if (!token || !autoRefreshLive) return;
    let failCount = 0;
    const interval = setInterval(async () => {
      try {
        const liveRes = await api.getAdminLiveActivity(token);
        if (liveRes.success && liveRes.data) {
          setLiveActivity(liveRes.data);
          failCount = 0;
        } else {
          failCount++;
          if (failCount >= 2) {
            // Stop polling to prevent console flood if backend endpoint is not active
            clearInterval(interval);
          }
        }
      } catch {
        failCount++;
        if (failCount >= 2) clearInterval(interval);
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [token, autoRefreshLive]);

  // Toast auto-clear
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 4500);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  // Check Super Admin Authorization
  const roles = currentUser?.roles || [];
  const isAdmin =
    roles.includes('SUPER_ADMIN') ||
    roles.includes('FINANCE_ADMIN') ||
    roles.includes('MODERATOR') ||
    currentUser?.email === 'admin@hudisoft.com' ||
    currentUser?.phoneNumber === '+252907000001' ||
    currentUser?.phoneNumber === '+252615000000';

  // ── PRIVATE ADMIN LOGIN HANDLER ───────────────────────────────
  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    try {
      const res = await api.loginWithPassword(loginIdentifier.trim(), loginPassword);

      if (!res.success || !res.data?.token) {
        setLoginError(res.message || 'Aqoonsiga maamulka waa khalad (Invalid credentials).');
        setLoginLoading(false);
        return;
      }

      const loggedUser = res.data.user;
      const userRoles = loggedUser.roles || [];
      const hasPrivileges =
        userRoles.includes('SUPER_ADMIN') ||
        userRoles.includes('FINANCE_ADMIN') ||
        userRoles.includes('MODERATOR') ||
        loggedUser.email === 'admin@hudisoft.com' ||
        loggedUser.phoneNumber === '+252907000001' ||
        loggedUser.phoneNumber === '+252615000000';

      if (!hasPrivileges) {
        setLoginError('❌ RUKHSAD MA HAYSATID: Koontadani waa macaamiil ama meherad caadi ah. Xaruntan waxaa u gooni ah maamulka DukaamiOnline oo kaliya.');
        setLoginLoading(false);
        return;
      }

      localStorage.setItem('hudisoft_token', res.data.token);
      localStorage.setItem('hudisoft_user', JSON.stringify(loggedUser));
      setToken(res.data.token);
      setCurrentUser(loggedUser);
      setSuccessMsg(`Ku soo dhowow Xarunta Maamulka Sare: ${loggedUser.fullName}`);
      fetchAllData(res.data.token);
    } catch {
      setLoginError('Server-ka lama xiriiri karin. Fadlan hubi xiriirka shabakadda.');
    } finally {
      setLoginLoading(false);
    }
  };

  // ── CREATE NEW ADMIN ACCOUNT (STAFF PROVISIONING) ─────────────
  const handleCreateNewAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setCreatingAdmin(true);
    setErrorMsg('');

    try {
      const res = await api.createAdminUser(
        {
          fullName: newAdminName.trim(),
          phoneNumber: newAdminPhone.trim(),
          email: newAdminEmail.trim() || undefined,
          password: newAdminPassword,
          roleName: newAdminRole,
          city: 'Garoowe',
        },
        token
      );

      if (res.success) {
        setSuccessMsg(`Account maamul cusub oo loogu talagalay "${newAdminName}" (${newAdminRole}) si guul leh baa loo abuuray!`);
        setShowAddAdminModal(false);
        setNewAdminName('');
        setNewAdminPhone('+252');
        setNewAdminEmail('');
        setNewAdminPassword('');
        // Refresh users
        const usersRes = await api.getAdminUsers(token, { limit: 100 });
        if (usersRes.success) setUsers(usersRes.data || []);
      } else {
        setErrorMsg(res.message || 'Failed to create admin user.');
      }
    } catch {
      setErrorMsg('Khalad baa dhacay marka maamulaha cusub la abuurayay.');
    } finally {
      setCreatingAdmin(false);
    }
  };

  // ── TRANSACTION / ORDER CONTROLS ─────────────────────────────
  const handleUpdateTxStatus = async (
    txId: string,
    newStatus: string,
    options: { releaseEscrow?: boolean; refundBuyer?: boolean; notes?: string } = {}
  ) => {
    if (!token) return;
    setActionInProgress(txId);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await api.updateAdminTransactionStatus(
        txId,
        {
          status: newStatus,
          notes: options.notes || `Updated to ${newStatus} by Admin`,
          releaseEscrow: options.releaseEscrow,
          refundBuyer: options.refundBuyer,
        },
        token
      );

      if (res.success) {
        setSuccessMsg(`Dhaqdhaqaaqa #${txId.slice(0, 8)} waxaa lagu bedelay: ${newStatus}`);
        setTransactions((prev) =>
          prev.map((t) => (t.id === txId ? { ...t, status: newStatus, escrowHold: options.releaseEscrow ? { ...t.escrowHold, status: 'RELEASED' } : options.refundBuyer ? { ...t.escrowHold, status: 'REFUNDED' } : t.escrowHold } : t))
        );
        if (selectedTx?.id === txId) {
          setSelectedTx((prev: any) => ({ ...prev, status: newStatus }));
        }
      } else {
        setErrorMsg(res.message || 'Failed to update transaction.');
      }
    } catch {
      setErrorMsg('Khalad baa dhacay marka xaaladda la bedelayay.');
    } finally {
      setActionInProgress(null);
    }
  };

  // ── STORE MANAGEMENT CONTROLS ────────────────────────────────
  const handleToggleStoreVerification = async (storeId: string, currentVerified: boolean) => {
    setActionInProgress(storeId);
    setErrorMsg('');
    const newStatus = !currentVerified;

    try {
      // 1. Call backend API if admin token exists
      if (token) {
        try {
          await api.updateAdminStoreStatus(storeId, { isVerified: newStatus }, token);
        } catch (e) {
          console.warn('Backend store update failed, syncing locally:', e);
        }
      }

      // 2. Synchronize localStorage stores so storefronts & marketplace immediately update
      try {
        const localSaved = localStorage.getItem('kaafi_merchant_stores_clean_v2');
        if (localSaved) {
          const localStores = JSON.parse(localSaved);
          if (Array.isArray(localStores)) {
            const updated = localStores.map((ls: any) => {
              if (ls.id === storeId || ls.slug === storeId) {
                return { ...ls, isVerified: newStatus };
              }
              return ls;
            });
            localStorage.setItem('kaafi_merchant_stores_clean_v2', JSON.stringify(updated));
          }
        }
      } catch {}

      // 3. Dispatch global sync event for real-time reactivity
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('kaafi_stores_updated', {
            detail: { slugOrId: storeId, isVerified: newStatus },
          })
        );
        window.dispatchEvent(new Event('storage'));
      }

      // 4. Update admin local state
      setStores((prev) =>
        prev.map((s) => (s.id === storeId || s.slug === storeId ? { ...s, isVerified: newStatus } : s))
      );

      setSuccessMsg(
        newStatus
          ? `✓ Meheradda waa la xaqiijiyay (VERIFIED)! Hadda waa public oo dadweynuhu way arki karaan.`
          : `Xaqiijintii waa laga noqday meheradda (UNVERIFIED). Dadweynaha kama muuqato.`
      );
    } catch {
      setErrorMsg('Khalad baa dhacay marka meheradda la xaqiijinayay.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleToggleStoreActive = async (storeId: string, ownerActive: boolean) => {
    if (!token) return;
    setActionInProgress(storeId);
    setErrorMsg('');

    try {
      const newActive = !ownerActive;
      const res = await api.updateAdminStoreStatus(storeId, { isActive: newActive }, token);
      if (res.success) {
        setSuccessMsg(`Meheradda waxaa laga dhigay: ${newActive ? 'FIRFIRCOON (ACTIVE)' : 'JOOJIYAY (SUSPENDED)'}`);
        setStores((prev) =>
          prev.map((s) =>
            s.id === storeId ? { ...s, owner: { ...s.owner, isActive: newActive } } : s
          )
        );
      } else {
        setErrorMsg(res.message || 'Failed to change store status.');
      }
    } catch {
      setErrorMsg('Khalad baa dhacay marka meheradda la joojinayay/fasaxayay.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleRejectStore = async (storeId: string, storeName: string) => {
    if (!window.confirm(`Ma hubtaa inaad diiddo meheradda "${storeName}"? Meheradda lama xaqiijinayo, milkiilahana waxaa laga dhigayaa mid la joojiyay (Suspended).`)) {
      return;
    }
    setActionInProgress(storeId);
    setErrorMsg('');

    try {
      if (token) {
        try {
          await api.updateAdminStoreStatus(storeId, { isVerified: false, isActive: false }, token);
        } catch (e) {
          console.warn('Backend store reject failed:', e);
        }
      }

      // 2. Synchronize localStorage
      try {
        const localSaved = localStorage.getItem('kaafi_merchant_stores_clean_v2');
        if (localSaved) {
          const localStores = JSON.parse(localSaved);
          if (Array.isArray(localStores)) {
            const updated = localStores.map((ls: any) => {
              if (ls.id === storeId || ls.slug === storeId) {
                return { ...ls, isVerified: false, status: 'REJECTED' };
              }
              return ls;
            });
            localStorage.setItem('kaafi_merchant_stores_clean_v2', JSON.stringify(updated));
          }
        }
      } catch {}

      // 3. Dispatch global sync event
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('kaafi_stores_updated', {
            detail: { slugOrId: storeId, isVerified: false, status: 'REJECTED' },
          })
        );
        window.dispatchEvent(new Event('storage'));
      }

      // 4. Update admin local state
      setStores((prev) =>
        prev.map((s) =>
          s.id === storeId || s.slug === storeId
            ? { ...s, isVerified: false, owner: { ...s.owner, isActive: false } }
            : s
        )
      );

      setSuccessMsg(`✕ Meheradda "${storeName}" waa la diiday (REJECTED).`);
    } catch {
      setErrorMsg('Khalad baa dhacay marka meheradda la diidayay.');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeleteStore = async (storeIdOrSlug: string, storeName: string) => {
    if (!window.confirm(`Ma hubtaa inaad tirtirto meheradda "${storeName}" iyo dhammaan alaabteeda? Tallaabadan dib looma noqon karo.`)) {
      return;
    }
    setActionInProgress(storeIdOrSlug);
    setErrorMsg('');
    try {
      if (token) {
        await api.adminDeleteStore(storeIdOrSlug, token);
      }
      await deleteStore(storeIdOrSlug);
      setStores((prev) => prev.filter((s: any) => s.id !== storeIdOrSlug && s.slug !== storeIdOrSlug));
      setSuccessMsg(`Meheradda "${storeName}" si buuxda ayaa loo tirtiray.`);
    } catch {
      setErrorMsg('Khalad baa dhacay marka meheradda la tirtirayay.');
    } finally {
      setActionInProgress(null);
    }
  };

  // ── USER MANAGEMENT CONTROLS ─────────────────────────────────
  const handleUpdateUserStatus = async (userId: string, data: { isActive?: boolean; verificationStatus?: string }) => {
    if (!token) return;
    setActionInProgress(userId);
    setErrorMsg('');

    try {
      const res = await api.updateUserStatusAdmin(userId, data, token);
      if (res.success) {
        setSuccessMsg('Xogta isticmaalaha si guul leh baa loo cusbooneysiiyay.');
        setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...data } : u)));
      } else {
        setErrorMsg(res.message || 'Failed to update user.');
      }
    } catch {
      setErrorMsg('Khalad baa dhacay marka isticmaalaha la bedelayay.');
    } finally {
      setActionInProgress(null);
    }
  };

  // Filtered Transactions
  const filteredTransactions = transactions.filter((t) => {
    if (txStatusFilter !== 'ALL' && t.status !== txStatusFilter) return false;
    if (txProviderFilter !== 'ALL') {
      const hasProvider = t.payments?.some((p: any) => p.provider === txProviderFilter);
      if (!hasProvider) return false;
    }
    if (txSearch.trim()) {
      const q = txSearch.toLowerCase();
      const matchNum = t.transactionNumber?.toLowerCase().includes(q);
      const matchBuyer = t.buyer?.fullName?.toLowerCase().includes(q);
      const matchPhone = t.buyer?.phoneNumber?.toLowerCase().includes(q) || t.recipientPhone?.includes(q);
      if (!matchNum && !matchBuyer && !matchPhone) return false;
    }
    return true;
  });

  // Filtered Orders (focused on fulfillment)
  const filteredOrders = transactions.filter((t) => {
    if (orderStatusFilter !== 'ALL' && t.status !== orderStatusFilter) return false;
    if (orderFulfillmentFilter !== 'ALL' && t.fulfillmentType !== orderFulfillmentFilter) return false;
    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
      const matchNum = t.transactionNumber?.toLowerCase().includes(q);
      const matchPhone = t.recipientPhone?.includes(q) || t.buyer?.phoneNumber?.includes(q);
      const matchBuyer = t.buyer?.fullName?.toLowerCase().includes(q);
      const matchCity = t.deliveryCity?.toLowerCase().includes(q);
      if (!matchNum && !matchPhone && !matchBuyer && !matchCity) return false;
    }
    return true;
  });

  // Filtered Stores
  const filteredStores = stores.filter((s) => {
    if (storeVerifiedFilter === 'VERIFIED' && !s.isVerified) return false;
    if (storeVerifiedFilter === 'UNVERIFIED' && s.isVerified) return false;
    if (storeSearch.trim()) {
      const q = storeSearch.toLowerCase();
      const matchName = s.businessName?.toLowerCase().includes(q);
      const matchSlug = s.slug?.toLowerCase().includes(q);
      const matchPhone = s.phone?.includes(q);
      const matchOwner = s.owner?.fullName?.toLowerCase().includes(q);
      if (!matchName && !matchSlug && !matchPhone && !matchOwner) return false;
    }
    return true;
  });

  // Filtered Users
  const filteredUsers = users.filter((u) => {
    if (userRoleFilter !== 'ALL') {
      const hasRole = u.roles?.some((r: any) => r.role?.name === userRoleFilter);
      if (!hasRole) return false;
    }
    if (userSearch.trim()) {
      const q = userSearch.toLowerCase();
      const matchName = u.fullName?.toLowerCase().includes(q);
      const matchPhone = u.phoneNumber?.includes(q);
      if (!matchName && !matchPhone) return false;
    }
    return true;
  });

  // Calculate live escrow in vault
  const escrowHeldTotal = transactions
    .filter((t) => t.escrowHold?.status === 'HELD')
    .reduce((sum, t) => sum + (t.subtotalAmount || 0), 0);

  // Show full-screen loader while checking auth state
  if (!isMounted || loading) {
    return (
      <div className="min-h-screen bg-[#040810] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-2xl"
            style={{ background: 'linear-gradient(135deg, #ea580c, #f97316)' }}>
            K
          </div>
          <div className="w-6 h-6 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin" />
          <p className="text-[11px] font-mono text-slate-600">Initializing Dukaami Admin OS...</p>
        </div>
      </div>
    );
  }

  // ── PRIVATE SECURITY GATE: LOGIN SCREEN ─────────────────────────────
  // (Customers & Stores NEVER see the dashboard; only authorized staff)
  if (!token || !isAdmin) {
    return (
      <main className="flex-1 flex items-center justify-center min-h-[calc(100vh-2.5rem)] relative overflow-hidden bg-[#030712] py-10 px-4">
        {/* Animated Cyber Aurora & Orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-orange-600/20 to-amber-500/10 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }} />
          <div className="absolute -bottom-32 -right-32 w-[550px] h-[550px] rounded-full bg-gradient-to-br from-blue-600/20 to-cyan-500/10 blur-[140px] animate-pulse" style={{ animationDuration: '8s', animationDelay: '2s' }} />
          <div className="absolute top-1/3 right-1/4 w-[350px] h-[350px] rounded-full bg-purple-600/10 blur-[100px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '1s' }} />
          
          {/* Cyber Grid */}
          <div
            className="absolute inset-0 opacity-40"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
              backgroundSize: '50px 50px',
            }}
          />
          {/* Laser Scanlines */}
          <div className="admin-scanline absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/60 to-transparent" />
        </div>

        <div className="admin-login-card relative z-10 w-full max-w-[460px]">
          {/* Top Security Status Pill */}
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>GAROOWE CORE: 100% ONLINE</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
              <span>🔒</span>
              <span>AES-256 VAULT</span>
            </div>
          </div>

          {/* Luxury Main Glass Card */}
          <div
            className="admin-logo-pulse rounded-3xl border border-slate-700/60 p-7 sm:p-9 space-y-6 shadow-2xl"
            style={{
              background: 'linear-gradient(145deg, rgba(15,23,42,0.95) 0%, rgba(8,14,28,0.98) 100%)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Holographic Logo & Emblem */}
            <div className="admin-fade-in-1 text-center space-y-3">
              <div className="relative inline-flex items-center justify-center">
                {/* Radar Waves Behind Logo */}
                <div className="admin-radar-wave-1 absolute w-24 h-24 rounded-full border border-orange-500/30 pointer-events-none" />
                <div className="admin-radar-wave-2 absolute w-28 h-28 rounded-full border border-cyan-500/25 pointer-events-none" />
                
                {/* Center Badge */}
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-3xl font-black text-white shadow-2xl relative z-10 admin-floating border border-orange-400/30"
                  style={{
                    background: 'linear-gradient(135deg, #f97316 0%, #ea580c 50%, #c2410c 100%)',
                    boxShadow: '0 0 35px rgba(249,115,22,0.45)',
                  }}
                >
                  K
                </div>

                {/* Verified Shield Pin */}
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#091122] flex items-center justify-center z-20 shadow-lg">
                  <span className="text-[10px] text-white font-black">✓</span>
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">Dukaami Admin OS</h1>
                <p className="text-xs text-orange-400/90 font-mono font-semibold tracking-wider mt-0.5">
                  ENTERPRISE COMMAND GATEWAY
                </p>
                <p className="text-[11px] text-slate-400 mt-1">
                  Xarunta Maamulka Sare: Web-ka, App-ka (Flutter), & Lacagaha
                </p>
              </div>
            </div>

            {/* Quick 1-Click Fast Fill Pill */}
            <div className="admin-fade-in-2">
              <button
                type="button"
                onClick={() => {
                  setLoginIdentifier('admin@hudisoft.com');
                  setLoginPassword('Admin@Garoowe2026');
                  setLoginError('');
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:text-orange-300 text-xs font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span className="text-sm">⚡</span>
                <span>Guji Halkan: Buuxi Aqoonsiga Super Admin (One-Click)</span>
              </button>
            </div>

            {/* Error Banner */}
            {loginError && (
              <div
                className="admin-fade-in-1 p-3.5 rounded-2xl border text-xs leading-relaxed"
                style={{
                  background: 'rgba(239,68,68,0.12)',
                  borderColor: 'rgba(239,68,68,0.35)',
                  color: '#fca5a5',
                }}
              >
                <div className="flex items-start gap-2.5">
                  <span className="text-red-400 text-base leading-none">⚠️</span>
                  <span>{loginError}</span>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleAdminLoginSubmit} className="admin-fade-in-3 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Email / Phone</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono">admin@hudisoft.com</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">👤</span>
                  <input
                    id="admin-identifier"
                    type="text"
                    required
                    autoComplete="username"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="admin@hudisoft.com"
                    className="admin-input-glow w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white placeholder-slate-600 transition-all font-mono"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                  <span>Furaha Sirta ah (Password)</span>
                  <span className="text-[10px] text-slate-500 font-normal font-mono">Admin@Garoowe2026</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 text-sm">🔑</span>
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoComplete="current-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="admin-input-glow w-full pl-10 pr-10 py-3 rounded-xl text-sm text-white placeholder-slate-600 transition-all font-mono"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs p-1"
                    title={showPassword ? 'Qari furaha' : 'Muuji furaha'}
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <button
                id="admin-login-btn"
                type="submit"
                disabled={loginLoading}
                className="admin-shimmer-btn w-full py-3.5 px-4 rounded-xl text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-xl transition-all cursor-pointer"
                style={{
                  opacity: loginLoading ? 0.75 : 1,
                }}
              >
                {loginLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Xaqiijinayaa Aqoonsiga...</span>
                  </>
                ) : (
                  <>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <rect x="3" y="11" width="18" height="11" rx="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span>Soo Gal Xarunta Maamulka →</span>
                  </>
                )}
              </button>
            </form>

            {/* Credential Specs */}
            <div
              className="rounded-2xl p-3.5 space-y-1.5 text-[11px] border"
              style={{
                background: 'rgba(255,255,255,0.02)',
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center justify-between text-slate-400">
                <span className="font-semibold text-slate-300">Aqoonsiga Rasmiga ah:</span>
                <span className="font-mono text-emerald-400 text-[10px]">100% Real Database</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-500">Email:</span>
                <span className="text-orange-400">admin@hudisoft.com</span>
              </div>
              <div className="flex items-center justify-between font-mono text-[11px]">
                <span className="text-slate-500">Password:</span>
                <span className="text-orange-400">Admin@Garoowe2026</span>
              </div>
            </div>
          </div>

          {/* Footer link to public web */}
          <div className="text-center mt-5">
            <Link
              href="/"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors font-mono inline-flex items-center gap-1.5"
            >
              <span>←</span>
              <span>Ku Laabo Suuqa Guud (Marketplace Web)</span>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="flex-1 flex overflow-hidden min-h-[calc(100vh-2.5rem)]">
      {/* ── SIDEBAR NAVIGATION ── */}
      <aside
        className={`fixed inset-y-10 left-0 z-40 w-64 bg-[#091122] border-r border-slate-800/90 flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-64'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 flex items-center justify-center font-black text-white text-base shadow-md shadow-orange-500/20">
              K
            </div>
            <div>
              <div className="text-xs font-black text-white tracking-wide uppercase">
                Dukaami Admin OS
              </div>
              <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                All Systems Synced
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white text-lg p-1"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto font-medium text-xs">
          {[
            { id: 'OVERVIEW', label: 'Xarunta Guud (Overview)', icon: '📊', count: null },
            { id: 'LISTINGS', label: 'Alaabaha Platform-ka', icon: '🛍️', count: adminListings.length },
            { id: 'CATEGORIES', label: 'Qaybaha Alaabada', icon: '🗂️', count: adminCategories.length },
            { id: 'TRANSACTIONS', label: 'Dhaqdhaqaaqa Lacagta', icon: '💳', count: transactions.length },
            { id: 'ORDERS', label: 'Maamulka Dalabyada', icon: '📦', count: filteredOrders.length },
            { id: 'STORES', label: 'Meheradaha (Stores)', icon: '🏬', count: stores.length },
            { id: 'LIVE_FEED', label: 'Nidaamka Tooska ah (Live)', icon: '📡', count: 'LIVE' },
            { id: 'USERS', label: 'Isticmaalayaasha & KYC', icon: '👥', count: users.length },
            { id: 'AUDIT', label: 'Diiwaanka Amniga (Audit)', icon: '🔒', count: auditLogs.length },
            { id: 'SYSTEM', label: 'Nidaamka & Nadiifinta', icon: '⚙️', count: null },
          ].map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id as AdminTab);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-base">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.count !== null && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-bold ${
                      item.count === 'LIVE'
                        ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                        : isActive
                        ? 'bg-orange-500/25 text-orange-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Operator Profile in Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80 bg-[#060c18]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center text-xs">
                {currentUser?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-bold text-white truncate">
                  {currentUser?.fullName || 'Super Admin'}
                </div>
                <div className="text-[10px] text-orange-400 font-mono">
                  {roles[0] || 'SUPER_ADMIN'}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Ka Bax (Sign Out)"
              className="px-2.5 py-1 rounded-lg bg-rose-500/15 hover:bg-rose-500/30 text-rose-300 hover:text-white border border-rose-500/30 transition-all text-xs font-bold flex items-center gap-1"
            >
              <span>🚪</span>
              <span>Ka Bax</span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT WORKSPACE ── */}
      <main className="flex-1 flex flex-col bg-[#070d18] overflow-y-auto">
        {/* Top Control Bar */}
        <header className="sticky top-0 z-30 bg-[#091122]/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            >
              ☰
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                {activeTab === 'OVERVIEW' && '📊 Platform Command Center & Analytics'}
                {activeTab === 'LISTINGS' && '🛍️ Maamulka Alaabaha Platform-ka (Admin Products)'}
                {activeTab === 'CATEGORIES' && '🗂️ Qaybaha Alaabada (Category Management)'}
                {activeTab === 'TRANSACTIONS' && '💳 Dhaqdhaqaaqa Dhammaan Lacagaha (Transactions & Escrow)'}
                {activeTab === 'ORDERS' && '📦 Dalabyada App & Web (Orders & Fulfillment)'}
                {activeTab === 'STORES' && '🏬 Meheradaha & Dukaamada Suuqa (Store Management)'}
                {activeTab === 'LIVE_FEED' && '📡 Nidaamka Tooska ah (Live App & Web Activity Pulse)'}
                {activeTab === 'USERS' && '👥 Isticmaalayaasha, Ganacsatada & Wadayaasha'}
                {activeTab === 'AUDIT' && '🔒 Diiwaanka Amniga (Immutable Audit Trail)'}
                {activeTab === 'SYSTEM' && '⚙️ Nidaamka Xakameeynta & Nadiifinta Xogta'}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Xakamee oo kormeero dhammaan howlaha nidaamka DukaamiOnline ee App-ka (Flutter) iyo Web-ka.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Engine Status */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-mono text-emerald-400 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>GAROOWE CORE: 100% REAL</span>
            </div>

            <button
              onClick={() => token && fetchAllData(token)}
              disabled={refreshing}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span className={refreshing ? 'animate-spin' : ''}>🔄</span>
              <span className="hidden sm:inline">Cusbooneysii (Refresh)</span>
            </button>

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-orange-600/15 hover:bg-orange-600/25 border border-orange-500/30 text-orange-300 text-xs font-semibold flex items-center gap-1 transition-all"
            >
              <span>🌐</span>
              <span className="hidden md:inline">Suuqa Web-ka</span>
            </a>

            {/* Prominent Header Sign Out Button */}
            <button
              onClick={handleLogout}
              className="px-3.5 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 hover:border-rose-500/60 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
              title="Ka bax xarunta maamulka si aad u tijaabiso login page-ka cusub"
            >
              <span>🚪</span>
              <span>Ka Bax</span>
            </button>
          </div>
        </header>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="m-4 mb-0 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>⚠️</span>
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-white">✕</button>
          </div>
        )}
        {successMsg && (
          <div className="m-4 mb-0 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* ── TAB CONTENT ── */}
        <div className="p-4 sm:p-6 space-y-6">

          {/* ══════════════════════════════════════════════════════════════
              TAB 1: OVERVIEW & SYSTEM METRICS
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Top Metric Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                <div className="admin-card-hover p-4 rounded-2xl bg-[#0d1627] border border-slate-800/90 border-t-2 border-t-emerald-500 shadow-lg">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400">Platform GMV</span>
                    <span className="text-xs">💰</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono tracking-tight">
                    {formatPrice(analytics?.gmv || txSummary.totalVolume || 0)}
                  </div>
                  <div className="text-[10px] text-emerald-500/80 mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" />
                    <span>Real sales volume</span>
                  </div>
                </div>

                <div className="admin-card-hover p-4 rounded-2xl bg-[#0d1627] border border-slate-800/90 border-t-2 border-t-cyan-500 shadow-lg">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400">Escrow in Vault</span>
                    <span className="text-xs">🛡️</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono tracking-tight">
                    {formatPrice(escrowHeldTotal)}
                  </div>
                  <div className="text-[10px] text-cyan-500/80 mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-cyan-400" />
                    <span>Safe until delivery</span>
                  </div>
                </div>

                <div className="admin-card-hover p-4 rounded-2xl bg-[#0d1627] border border-slate-800/90 border-t-2 border-t-orange-500 shadow-lg">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400">Platform Revenue</span>
                    <span className="text-xs">⚡</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-orange-400 font-mono tracking-tight">
                    {formatPrice(analytics?.platformCommission || txSummary.totalCommission || 0)}
                  </div>
                  <div className="text-[10px] text-orange-500/80 mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-orange-400" />
                    <span>Net commissions</span>
                  </div>
                </div>

                <div className="admin-card-hover p-4 rounded-2xl bg-[#0d1627] border border-slate-800/90 border-t-2 border-t-blue-500 shadow-lg">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400">Total Orders</span>
                    <span className="text-xs">📦</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                    {transactions.length}
                  </div>
                  <div className="text-[10px] text-blue-400 mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-blue-400" />
                    <span>App & Web orders</span>
                  </div>
                </div>

                <div className="admin-card-hover p-4 rounded-2xl bg-[#0d1627] border border-slate-800/90 border-t-2 border-t-purple-500 shadow-lg">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400">Active Stores</span>
                    <span className="text-xs">🏬</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono tracking-tight">
                    {stores.length}
                  </div>
                  <div className="text-[10px] text-purple-400/80 mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-purple-400" />
                    <span>{stores.filter((s) => s.isVerified).length} verified</span>
                  </div>
                </div>

                <div className="admin-card-hover p-4 rounded-2xl bg-[#0d1627] border border-slate-800/90 border-t-2 border-t-amber-500 shadow-lg">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-slate-400">Registered Users</span>
                    <span className="text-xs">👥</span>
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight">
                    {users.length}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-amber-400" />
                    <span>Real accounts only</span>
                  </div>
                </div>
              </div>

              {/* System Architecture & Status Breakdown */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Real-time System Data Panel */}
                <div className="p-5 rounded-2xl bg-[#0d1627] border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Platform Data Summary</span>
                  </h3>
                  <div className="space-y-3 text-xs">
                    {[
                      { label: 'Total Users Registered', value: analytics?.totalUsers ?? users.length, color: 'text-white' },
                      { label: 'Active Seller Profiles', value: analytics?.totalSellers ?? sellers.length, color: 'text-blue-400' },
                      { label: 'Business Storefronts', value: analytics?.totalBusinesses ?? stores.length, color: 'text-purple-400' },
                      { label: 'Active Listings', value: analytics?.totalListings ?? '—', color: 'text-emerald-400' },
                      { label: 'Total Transactions', value: analytics?.totalTransactions ?? transactions.length, color: 'text-orange-400' },
                      { label: 'Escrow Held (in vault)', value: escrowHeldTotal > 0 ? `$${escrowHeldTotal.toFixed(2)}` : '$0.00', color: 'text-cyan-400' },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400">{row.label}</span>
                        <span className={`font-bold font-mono ${row.color}`}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Action Controller */}
                <div className="p-5 rounded-2xl bg-[#0d1627] border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>🎛️</span>
                    <span>Direct Action Quick Links</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => { setActiveTab('TRANSACTIONS'); setTxStatusFilter('PENDING_PAYMENT'); }}
                      className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-left border border-slate-700/50 transition-colors"
                    >
                      <div className="text-amber-400 font-bold">Pending Payments</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {transactions.filter((t) => t.status === 'PENDING_PAYMENT').length} transactions
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab('ORDERS'); setOrderStatusFilter('ACCEPTED'); }}
                      className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-left border border-slate-700/50 transition-colors"
                    >
                      <div className="text-cyan-400 font-bold">Orders in Pipeline</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {transactions.filter((t) => ['ACCEPTED', 'PREPARING', 'READY', 'IN_TRANSIT'].includes(t.status)).length} orders
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab('STORES'); setStoreVerifiedFilter('UNVERIFIED'); }}
                      className="p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-left border border-slate-700/50 transition-colors"
                    >
                      <div className="text-purple-400 font-bold">Unverified Stores</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {stores.filter((s) => !s.isVerified).length} stores waiting
                      </div>
                    </button>

                    <button
                      onClick={() => { setActiveTab('USERS'); setShowAddAdminModal(true); }}
                      className="p-3 rounded-xl bg-orange-600/20 hover:bg-orange-600/30 text-left border border-orange-500/40 transition-colors"
                    >
                      <div className="text-orange-400 font-bold">➕ Add Admin</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">Create staff account</div>
                    </button>
                  </div>
                </div>

                {/* Real Cities Breakdown from transactions */}
                <div className="p-5 rounded-2xl bg-[#0d1627] border border-slate-800 space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>📍</span>
                    <span>Orders by City (Real Data)</span>
                  </h3>
                  <div className="space-y-2 text-xs">
                    {(() => {
                      const cityMap: Record<string, number> = {};
                      transactions.forEach((t) => {
                        const city = t.deliveryCity || 'Unknown';
                        cityMap[city] = (cityMap[city] || 0) + 1;
                      });
                      const sorted = Object.entries(cityMap).sort((a, b) => b[1] - a[1]).slice(0, 6);
                      const total = sorted.reduce((s, [, c]) => s + c, 0);
                      if (sorted.length === 0) return (
                        <div className="text-slate-500 py-4 text-center">No delivery data yet</div>
                      );
                      return sorted.map(([city, count]) => {
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                          <div key={city} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-slate-300 font-semibold truncate max-w-[130px]">{city}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-500">{count} orders</span>
                                <span className="text-orange-400 font-mono font-bold">{pct}%</span>
                              </div>
                            </div>
                            <div className="h-1 rounded-full bg-slate-800">
                              <div className="h-1 rounded-full bg-orange-500/60" style={{ width: `${pct}%`, transition: 'width 1s ease' }} />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              {/* Recent Orders preview */}
              <div className="p-5 rounded-2xl bg-[#0d1627] border border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white">Dalabyadii ugu dambeeyay (Recent Transactions Across Systems)</h3>
                  <button
                    onClick={() => setActiveTab('TRANSACTIONS')}
                    className="text-xs text-orange-400 hover:text-orange-300 font-semibold"
                  >
                    Dhammaan Eeg ({transactions.length}) →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 pb-2">
                        <th className="pb-2.5">Tx ID / Number</th>
                        <th className="pb-2.5">Macmiilka (Buyer)</th>
                        <th className="pb-2.5">Lacagta (Amount)</th>
                        <th className="pb-2.5">Bixinta (Method)</th>
                        <th className="pb-2.5">Xaaladda (Status)</th>
                        <th className="pb-2.5">Waqtiga (Time)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <div className="relative w-16 h-16 flex items-center justify-center">
                                <div className="admin-radar-wave-1 absolute inset-0 rounded-full border border-emerald-500/35" />
                                <div className="admin-radar-wave-2 absolute inset-0 rounded-full border border-orange-500/25" />
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-xl shadow-inner relative z-10">
                                  📡
                                </div>
                              </div>
                              <div>
                                <div className="text-sm font-black text-white tracking-wide">
                                  Nidaamku Waa Nadiif &amp; Toos u Diyaar (Zero Mock Transactions)
                                </div>
                                <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto leading-relaxed">
                                  Dhammaan xogtii tijaabada ahayd waa la tirtiray si buuxda. Nidaamku wuxuu toos ugu xiranyahay Kaafi App (Flutter) iyo Web-ka, dalabyada iyo bixinta dhabta ah ee macaamiisha ayaana si toos ah halkan ugu soo dhacaya.
                                </p>
                              </div>
                              <div className="flex items-center gap-2 mt-1 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                                  LIVE SURVEILLANCE ACTIVE: GAROOWE / PUNTLAND NODE
                                </span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        transactions.slice(0, 6).map((tx) => (
                          <tr key={tx.id} className="hover:bg-slate-800/30">
                            <td className="py-2.5 font-mono font-semibold text-white">
                              {tx.transactionNumber}
                            </td>
                            <td className="py-2.5">
                              <div className="text-white font-medium">{tx.buyer?.fullName || 'Guest'}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{tx.buyer?.phoneNumber || tx.recipientPhone}</div>
                            </td>
                            <td className="py-2.5 font-mono font-bold text-emerald-400">
                              {formatPrice(tx.totalAmount)}
                            </td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                                {tx.payments?.[0]?.provider || 'EVC_PLUS'}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-slate-400 text-[11px]">
                              {timeAgo(tx.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 2: TRANSACTIONS & PAYMENTS CONTROL
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'TRANSACTIONS' && (
            <div className="space-y-4">
              {/* Filter Strip */}
              <div className="p-4 rounded-2xl bg-[#0d1627] border border-slate-800 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    value={txSearch}
                    onChange={(e) => setTxSearch(e.target.value)}
                    placeholder="Raadi Tx#, Magac, ama Taleefan..."
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 w-56 focus:outline-none focus:border-orange-500"
                  />

                  <select
                    value={txStatusFilter}
                    onChange={(e) => setTxStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">Dhammaan Xaaladaha (All Status)</option>
                    <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                    <option value="PAYMENT_CONFIRMED">PAYMENT_CONFIRMED</option>
                    <option value="ACCEPTED">ACCEPTED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                    <option value="REFUNDED">REFUNDED</option>
                    <option value="DISPUTED">DISPUTED</option>
                  </select>

                  <select
                    value={txProviderFilter}
                    onChange={(e) => setTxProviderFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">Dhammaan Bixinta (Payment Rails)</option>
                    <option value="EVC_PLUS">EVC Plus (Hormuud)</option>
                    <option value="SAHAL">Sahal (Golis)</option>
                    <option value="ZAAD">Zaad (Telesom)</option>
                    <option value="WALLET">Hudi-Soft Wallet</option>
                  </select>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Waxaa la helay: <span className="text-white font-bold">{filteredTransactions.length}</span> transactions
                </div>
              </div>

              {/* Transactions Table */}
              <div className="rounded-2xl bg-[#0d1627] border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#091122] text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Tx ID / Number</th>
                        <th className="p-3.5">Macmiilka (Buyer)</th>
                        <th className="p-3.5">Wadarta / Commission</th>
                        <th className="p-3.5">Bixinta (Gateway)</th>
                        <th className="p-3.5">Escrow State</th>
                        <th className="p-3.5">Xaaladda Nidaamka</th>
                        <th className="p-3.5 text-right">Awoodda Maamulka (Admin Controls)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-12 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center gap-3">
                              <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow-inner">
                                💳
                              </div>
                              <div className="text-sm font-bold text-slate-200">
                                Wax Dhaqdhaqaaq ah Ma Jiraan (Clean Database)
                              </div>
                              <p className="text-xs text-slate-400 max-w-md mx-auto">
                                Nidaamka waa la nadiifiyay si buuxda. Dhaqdhaqaaq kasta oo laga sameeyo EVC Plus, Sahal, Zaad ama Kaafi Wallet wuxuu si toos ah uga muuqanayaa halkan.
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[10px] font-mono text-emerald-400">0 PENDING ESCROW / 100% HEALTHY</span>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredTransactions.map((tx) => {
                          const isProcessing = actionInProgress === tx.id;
                          const isEscrowHeld = tx.escrowHold?.status === 'HELD';
                          return (
                            <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                              <td className="p-3.5">
                                <div className="font-mono font-bold text-white flex items-center gap-1.5">
                                  <span>{tx.transactionNumber}</span>
                                </div>
                                <div className="text-[10px] text-slate-400 mt-0.5">
                                  {new Date(tx.createdAt).toLocaleDateString()} · {tx.deliveryCity}
                                </div>
                              </td>

                              <td className="p-3.5">
                                <div className="font-medium text-white">{tx.buyer?.fullName || 'Buyer'}</div>
                                <div className="text-[10px] font-mono text-slate-400">
                                  {tx.buyer?.phoneNumber || tx.recipientPhone}
                                </div>
                              </td>

                              <td className="p-3.5">
                                <div className="font-mono font-bold text-emerald-400 text-sm">
                                  {formatPrice(tx.totalAmount)}
                                </div>
                                <div className="text-[10px] text-orange-400/90 font-mono">
                                  Comm: {formatPrice(tx.commissionAmount)} ({tx.commissionRateUsed || 5}%)
                                </div>
                              </td>

                              <td className="p-3.5">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono font-bold text-[10px] border border-slate-700">
                                  {tx.payments?.[0]?.provider || 'EVC_PLUS'}
                                </span>
                                {tx.payments?.[0]?.providerReference && (
                                  <div className="text-[9px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px]">
                                    Ref: {tx.payments[0].providerReference}
                                  </div>
                                )}
                              </td>

                              <td className="p-3.5">
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                    tx.escrowHold?.status === 'RELEASED'
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : tx.escrowHold?.status === 'HELD'
                                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                      : tx.escrowHold?.status === 'REFUNDED'
                                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                      : 'bg-slate-800 text-slate-400'
                                  }`}
                                >
                                  {tx.escrowHold?.status || 'DIRECT'}
                                </span>
                              </td>

                              <td className="p-3.5">
                                <span
                                  className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                                    tx.status === 'COMPLETED'
                                      ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                      : tx.status === 'PAYMENT_CONFIRMED'
                                      ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                      : tx.status === 'PENDING_PAYMENT'
                                      ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                                      : tx.status === 'CANCELLED' || tx.status === 'REFUNDED'
                                      ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                      : 'bg-purple-500/15 text-purple-400 border border-purple-500/30'
                                  }`}
                                >
                                  {tx.status}
                                </span>
                              </td>

                              <td className="p-3.5 text-right space-x-1.5 whitespace-nowrap">
                                <button
                                  onClick={() => setSelectedTx(tx)}
                                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold border border-slate-700"
                                >
                                  Faahfaahin
                                </button>

                                {isEscrowHeld && (
                                  <button
                                    onClick={() =>
                                      handleUpdateTxStatus(tx.id, 'COMPLETED', {
                                        releaseEscrow: true,
                                        notes: 'Admin manual release of escrow to seller',
                                      })
                                    }
                                    disabled={isProcessing}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 text-[11px] font-bold"
                                  >
                                    Fasax Escrow
                                  </button>
                                )}

                                {tx.status !== 'REFUNDED' && tx.status !== 'CANCELLED' && (
                                  <button
                                    onClick={() =>
                                      handleUpdateTxStatus(tx.id, 'REFUNDED', {
                                        refundBuyer: true,
                                        notes: 'Admin issued refund to buyer wallet',
                                      })
                                    }
                                    disabled={isProcessing}
                                    className="px-2.5 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 text-[11px] font-semibold"
                                  >
                                    Refund
                                  </button>
                                )}

                                {tx.status === 'PENDING_PAYMENT' && (
                                  <button
                                    onClick={() =>
                                      handleUpdateTxStatus(tx.id, 'PAYMENT_CONFIRMED', {
                                        notes: 'Admin manual payment confirmation override',
                                      })
                                    }
                                    disabled={isProcessing}
                                    className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 text-[11px] font-semibold"
                                  >
                                    Xaqiiji Lacagta
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 3: ORDERS & FULFILLMENT CONTROL
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'ORDERS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0d1627] border border-slate-800 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    placeholder="Raadi Dalabka#, Taleefanka, Magaca..."
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 w-56 focus:outline-none focus:border-orange-500"
                  />

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">Dhammaan Xaaladaha Dalabka</option>
                    <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                    <option value="PAYMENT_CONFIRMED">PAYMENT_CONFIRMED</option>
                    <option value="ACCEPTED">ACCEPTED (Ganacsadaha aqbalay)</option>
                    <option value="PREPARING">PREPARING (La diyaarinayaa)</option>
                    <option value="READY">READY (Diyaar ah)</option>
                    <option value="IN_TRANSIT">IN_TRANSIT (Waddada ku jira)</option>
                    <option value="DELIVERED">DELIVERED (La gaarsiiyay)</option>
                    <option value="COMPLETED">COMPLETED (Dhammaystiran)</option>
                    <option value="CANCELLED">CANCELLED (La joojiyay)</option>
                  </select>

                  <select
                    value={orderFulfillmentFilter}
                    onChange={(e) => setOrderFulfillmentFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">Nooca Gaarsiinta (All Methods)</option>
                    <option value="CUSTOMER_PICKUP">CUSTOMER_PICKUP</option>
                    <option value="SELLER_DELIVERY">SELLER_DELIVERY</option>
                    <option value="DRIVER_DELIVERY">DRIVER_DELIVERY</option>
                  </select>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Dalabyada la helay: <span className="text-white font-bold">{filteredOrders.length}</span>
                </div>
              </div>

              {/* Order Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOrders.length === 0 ? (
                  <div className="col-span-full p-12 text-center bg-[#0d1627] rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <div className="admin-radar-wave-1 absolute inset-0 rounded-full border border-orange-500/30" />
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow-inner relative z-10">
                        📦
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-200">
                      Ma Jiraan Dalabyo Pipeline-ka Ku Jira (0 Active Orders)
                    </div>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Dhammaan xogtii hore ee tijaabada ahayd waa la tirtiray. Nidaamku wuxuu si toos ah u sugayaa dalabyada dhabta ah ee macaamiisha Kaafi App (Flutter) iyo Web-ka.
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono text-emerald-400">ORDER DISPATCH ENGINE: LISTENING</span>
                    </div>
                  </div>
                ) : (
                  filteredOrders.map((ord) => {
                    const isProcessing = actionInProgress === ord.id;
                    return (
                      <div
                        key={ord.id}
                        className="p-5 rounded-2xl bg-[#0d1627] border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all space-y-4"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                            <div>
                              <span className="font-mono font-bold text-white text-sm">
                                {ord.transactionNumber}
                              </span>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {new Date(ord.createdAt).toLocaleString()}
                              </div>
                            </div>

                            <span
                              className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                                ord.status === 'COMPLETED'
                                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                                  : ord.status === 'DELIVERED'
                                  ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30'
                                  : ord.status === 'IN_TRANSIT'
                                  ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                  : ord.status === 'CANCELLED'
                                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                                  : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>

                          <div className="pt-3 space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Macmiilka:</span>
                              <span className="font-semibold text-white">
                                {ord.buyer?.fullName || 'Customer'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Taleefanka:</span>
                              <span className="font-mono text-slate-300">
                                {ord.recipientPhone || ord.buyer?.phoneNumber}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Goobta (City/Landmark):</span>
                              <span className="text-slate-300 text-right truncate max-w-[180px]">
                                {ord.deliveryCity} {ord.deliveryLandmark ? `(${ord.deliveryLandmark})` : ''}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Alaabta (Items):</span>
                              <span className="font-semibold text-white">
                                {ord.items?.length || 1} x Items
                              </span>
                            </div>
                            <div className="flex justify-between pt-1 border-t border-slate-800/60 font-mono">
                              <span className="text-slate-400">Wadarta Dalabka:</span>
                              <span className="font-bold text-emerald-400 text-sm">
                                {formatPrice(ord.totalAmount)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <select
                            value={ord.status}
                            disabled={isProcessing}
                            onChange={(e) => handleUpdateTxStatus(ord.id, e.target.value)}
                            className="flex-1 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-semibold text-white focus:outline-none"
                          >
                            <option value="PENDING_PAYMENT">PENDING_PAYMENT</option>
                            <option value="PAYMENT_CONFIRMED">PAYMENT_CONFIRMED</option>
                            <option value="ACCEPTED">ACCEPTED</option>
                            <option value="PREPARING">PREPARING</option>
                            <option value="READY">READY</option>
                            <option value="IN_TRANSIT">IN_TRANSIT</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                          </select>

                          <button
                            onClick={() => setSelectedTx(ord)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                          >
                            Arag
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 4: STORES & MERCHANTS CONTROL
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'STORES' && (
            <div className="space-y-4">

              {/* ── PENDING VERIFICATION ALERT BANNER ── */}
              {stores.filter((s: any) => !s.isVerified).length > 0 && (
                <div className="p-4 rounded-2xl border border-amber-500/40 bg-amber-500/5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-lg flex-shrink-0">
                      ⏳
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-amber-400">
                        Meherado Sugaya Oggolaanshaha — Pending Store Verification
                      </h3>
                      <p className="text-[11px] text-amber-400/70">
                        {stores.filter((s: any) => !s.isVerified).length} store(s) waxay xoog ku sugayaan inaad xaqiijiso si ay dadka ugu muuqdaan.
                      </p>
                    </div>
                    <div className="ml-auto">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        {stores.filter((s: any) => !s.isVerified).length} Pending
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {stores.filter((s: any) => !s.isVerified).map((st: any) => {
                      const isProcessing = actionInProgress === st.id;
                      return (
                        <div key={st.id} className="p-4 rounded-xl bg-[#0d1627] border border-amber-500/20 hover:border-amber-500/40 transition-all">
                          <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm overflow-hidden flex-shrink-0">
                              {st.logoUrl ? (
                                <img src={st.logoUrl} alt={st.businessName} className="w-full h-full object-cover" />
                              ) : (
                                st.businessName.charAt(0)
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-white text-xs truncate">{st.businessName}</div>
                              <div className="text-[10px] font-mono text-amber-400">/{st.slug}</div>
                              <div className="text-[10px] text-slate-400 truncate">{st.owner?.fullName} · {st.owner?.phoneNumber}</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleStoreVerification(st.id, false)}
                              disabled={isProcessing}
                              className="flex-1 px-3 py-2 rounded-xl text-xs font-bold transition-all border bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30 disabled:opacity-50 flex items-center justify-center gap-1"
                            >
                              {isProcessing ? '⏳' : '✓ Ogolow (Verify)'}
                            </button>
                            <button
                              onClick={() => handleRejectStore(st.id, st.businessName)}
                              disabled={isProcessing}
                              className="px-3 py-2 rounded-xl text-xs font-bold transition-all border bg-amber-600/20 text-amber-400 border-amber-500/30 hover:bg-amber-600/30 disabled:opacity-50"
                              title="Diidi codsiga meheradda"
                            >
                              ✕ Diidi
                            </button>
                            <button
                              onClick={() => handleDeleteStore(st.id, st.businessName)}
                              disabled={isProcessing}
                              className="px-3 py-2 rounded-xl text-xs font-bold transition-all border bg-rose-600/15 text-rose-400 border-rose-500/25 hover:bg-rose-600/25 disabled:opacity-50"
                              title="Tirtir meheradda"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-[#0d1627] border border-slate-800 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  <input
                    type="text"
                    value={storeSearch}
                    onChange={(e) => setStoreSearch(e.target.value)}
                    placeholder="Raadi Meheradda, Slug, Taleefan..."
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 w-56 focus:outline-none focus:border-orange-500"
                  />

                  <select
                    value={storeVerifiedFilter}
                    onChange={(e) => setStoreVerifiedFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="ALL">Dhammaan Meheradaha (All Stores)</option>
                    <option value="VERIFIED">Meheradaha La Xaqiijiyay (Verified Only)</option>
                    <option value="UNVERIFIED">Aan La Xaqiijin (Pending / Unverified)</option>
                  </select>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  Wadarta Meheradaha: <span className="text-white font-bold">{filteredStores.length}</span>
                </div>
              </div>

              {/* Stores Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredStores.length === 0 ? (
                  <div className="col-span-full p-12 text-center bg-[#0d1627] rounded-2xl border border-slate-800 flex flex-col items-center justify-center gap-3">
                    <div className="relative w-14 h-14 flex items-center justify-center">
                      <div className="admin-radar-wave-1 absolute inset-0 rounded-full border border-purple-500/30" />
                      <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shadow-inner relative z-10">
                        🏬
                      </div>
                    </div>
                    <div className="text-sm font-bold text-slate-200">
                      Ma Jiraan Meherado Diiwaangashan (0 Active Stores)
                    </div>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      Suuqu waa nadiif oo diyaar u yahay meheradaha dhabta ah. Meherad kasta oo iska diiwaangelisa Kaafi App ama Web-ka waxay ka soo muuqanaysaa halkan si aad u xaqiijiso (Verify) ama u maamusho.
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[10px] font-mono text-emerald-400">STORE ONBOARDING SYSTEM: READY</span>
                    </div>
                  </div>
                ) : (
                  filteredStores.map((st) => {
                    const isProcessing = actionInProgress === st.id;
                    const isOwnerActive = st.owner?.isActive !== false;
                    return (
                      <div
                        key={st.id}
                        className={`p-5 rounded-2xl bg-[#0d1627] border flex flex-col justify-between space-y-4 transition-all ${
                          !isOwnerActive ? 'border-rose-900/50 opacity-70' : 'border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 border-b border-slate-800/80 pb-3">
                            <div className="flex items-center gap-2.5">
                              <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-sm overflow-hidden flex-shrink-0">
                                {st.logoUrl ? (
                                  <img src={st.logoUrl} alt={st.businessName} className="w-full h-full object-cover" />
                                ) : (
                                  st.businessName.charAt(0)
                                )}
                              </div>
                              <div>
                                <h3 className="font-bold text-white text-sm leading-tight flex items-center gap-1.5">
                                  <span>{st.businessName}</span>
                                  {st.isVerified && (
                                    <span title="Verified Merchant Badge" className="text-blue-400 text-xs">✓</span>
                                  )}
                                </h3>
                                <div className="text-[10px] font-mono text-orange-400 mt-0.5">
                                  /{st.slug}
                                </div>
                              </div>
                            </div>

                            <div className="text-right">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  st.isVerified
                                    ? 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {st.isVerified ? 'VERIFIED' : 'UNVERIFIED'}
                              </span>
                              <div className="mt-1">
                                <span
                                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold ${
                                    isOwnerActive ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                                  }`}
                                >
                                  {isOwnerActive ? 'ACTIVE' : 'SUSPENDED'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="pt-3 space-y-1.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Mulkiilaha (Owner):</span>
                              <span className="font-semibold text-white">
                                {st.owner?.fullName || 'Merchant'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Taleefanka:</span>
                              <span className="font-mono text-slate-300">
                                {st.phone}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Magaalada:</span>
                              <span className="text-slate-300">
                                {st.city || 'Garoowe'}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Badeecooyinka (Listings):</span>
                              <span className="font-mono font-bold text-white">
                                {st._count?.listings || 0} badeeco
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                          <a
                            href={`/stores/${st.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                          >
                            Dukaanka ↗
                          </a>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleToggleStoreVerification(st.id, !!st.isVerified)}
                              disabled={isProcessing}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                st.isVerified
                                  ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                                  : 'bg-emerald-600/20 text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/30'
                              }`}
                            >
                              {st.isVerified ? 'Ka qaad Xaqiijinta' : '✓ Xaqiiji (Verify)'}
                            </button>

                            {!st.isVerified && (
                              <button
                                onClick={() => handleRejectStore(st.id, st.businessName)}
                                disabled={isProcessing}
                                className="px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border bg-amber-600/20 text-amber-400 border-amber-500/30 hover:bg-amber-600/30"
                                title="Diidi meheradda"
                              >
                                ✕ Diidi
                              </button>
                            )}

                            <button
                              onClick={() => handleToggleStoreActive(st.id, isOwnerActive)}
                              disabled={isProcessing}
                              className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                                isOwnerActive
                                  ? 'bg-rose-600/20 text-rose-400 border-rose-500/30 hover:bg-rose-600/30'
                                  : 'bg-blue-600/20 text-blue-400 border-blue-500/30 hover:bg-blue-600/30'
                              }`}
                            >
                              {isOwnerActive ? 'Jooji (Suspend)' : 'Fasax (Activate)'}
                            </button>

                            <button
                              onClick={() => handleDeleteStore(st.id, st.businessName)}
                              disabled={isProcessing}
                              className="p-1.5 rounded-xl text-xs font-bold transition-all border bg-rose-600/10 text-rose-400/80 border-rose-500/20 hover:bg-rose-600/25 hover:text-rose-300"
                              title="Tirtir meheradda"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 5: REALTIME LIVE MONITOR & PULSE
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'LIVE_FEED' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-[#0d1627] border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping" />
                  <div>
                    <h3 className="font-bold text-white text-sm">
                      Nidaamka Tooska ah (Real-time Live Activity Across App & Web)
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Dhacdo kasta oo ka dhacda Mobile App-ka iyo Web-ka oo toos u soo dhaceysa.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoRefreshLive}
                      onChange={(e) => setAutoRefreshLive(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-orange-500"
                    />
                    <span>Auto-refresh (10s)</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-[#0d1627] border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>💳</span>
                    <span>Recent Live Transactions</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {(liveActivity?.recentTransactions || transactions.slice(0, 8)).length === 0 ? (
                      <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800 flex flex-col items-center justify-center gap-2">
                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
                          📡
                        </div>
                        <div className="font-bold text-slate-300 text-xs">Weli Ma Jiraan Dhaqdhaqaaqyo Toos ah</div>
                        <p className="text-[11px] text-slate-500 max-w-xs">
                          Nidaamka tooska ah wuxuu u furanyahay macaamiisha dhabta ah. Dalab kasta oo cusub halkan ayuu si toos ah uga muuqanayaa.
                        </p>
                      </div>
                    ) : (
                      (liveActivity?.recentTransactions || transactions.slice(0, 8)).map((tx: any) => (
                        <div
                          key={tx.id}
                          className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between"
                        >
                          <div>
                            <div className="font-mono font-bold text-white">{tx.transactionNumber}</div>
                            <div className="text-[11px] text-slate-400">
                              {tx.buyer?.fullName} ({tx.buyer?.phoneNumber})
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono font-bold text-emerald-400">
                              {formatPrice(tx.totalAmount)}
                            </div>
                            <div className="text-[10px] text-slate-400">{timeAgo(tx.createdAt)}</div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-[#0d1627] border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>👥</span>
                    <span>New Registered Users (App & Web)</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {(liveActivity?.recentUsers || users.slice(0, 8)).map((u: any) => (
                      <div
                        key={u.id}
                        className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white">{u.fullName}</div>
                          <div className="text-[11px] text-slate-400 font-mono">{u.phoneNumber}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                            {u.city || 'Garoowe'}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-0.5">{timeAgo(u.createdAt)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 6: USERS & KYC + NEW ADMIN PROVISIONING
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'USERS' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0d1627] border border-slate-800 flex flex-wrap gap-3 items-center justify-between">
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Raadi Magaca ama Taleefanka..."
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 w-56 focus:outline-none focus:border-orange-500"
                  />
                  <div className="text-xs text-slate-400 font-mono">
                    Wadarta: <span className="text-white font-bold">{filteredUsers.length}</span>
                  </div>
                </div>

                {/* Button to provision new admin account */}
                <button
                  onClick={() => setShowAddAdminModal(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-orange-600/20"
                >
                  <span>➕</span>
                  <span>Ku dar Maamule Cusub (Create Admin Account)</span>
                </button>
              </div>

              <div className="rounded-2xl bg-[#0d1627] border border-slate-800 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#091122] text-slate-400 font-semibold border-b border-slate-800">
                      <tr>
                        <th className="p-3.5">Magaca / Taleefanka</th>
                        <th className="p-3.5">Magaalada</th>
                        <th className="p-3.5">Doorka (Roles)</th>
                        <th className="p-3.5">Xaqiijinta (KYC)</th>
                        <th className="p-3.5">Xaaladda Koontada</th>
                        <th className="p-3.5 text-right">Ficilada (Actions)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredUsers.map((u) => {
                        const isProcessing = actionInProgress === u.id;
                        return (
                          <tr key={u.id} className="hover:bg-slate-800/20">
                            <td className="p-3.5">
                              <div className="font-bold text-white">{u.fullName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{u.phoneNumber}</div>
                            </td>
                            <td className="p-3.5 text-slate-300">{u.city || 'Garoowe'}</td>
                            <td className="p-3.5">
                              {u.roles?.map((r: any) => (
                                <span
                                  key={r.role?.name}
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-mono mr-1 font-bold ${
                                    ['SUPER_ADMIN', 'FINANCE_ADMIN', 'MODERATOR'].includes(r.role?.name)
                                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                                      : 'bg-slate-800 text-slate-300'
                                  }`}
                                >
                                  {r.role?.name}
                                </span>
                              ))}
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                  u.verificationStatus === 'VERIFIED'
                                    ? 'bg-emerald-500/15 text-emerald-400'
                                    : 'bg-slate-800 text-slate-400'
                                }`}
                              >
                                {u.verificationStatus || 'PENDING'}
                              </span>
                            </td>
                            <td className="p-3.5">
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                                  u.isActive !== false ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                                }`}
                              >
                                {u.isActive !== false ? 'ACTIVE' : 'SUSPENDED'}
                              </span>
                            </td>
                            <td className="p-3.5 text-right space-x-1.5">
                              {u.verificationStatus !== 'VERIFIED' && (
                                <button
                                  onClick={() => handleUpdateUserStatus(u.id, { verificationStatus: 'VERIFIED' })}
                                  disabled={isProcessing}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-[11px] font-bold"
                                >
                                  Xaqiiji (Verify)
                                </button>
                              )}
                              <button
                                onClick={() => handleUpdateUserStatus(u.id, { isActive: u.isActive === false })}
                                disabled={isProcessing}
                                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                                  u.isActive !== false
                                    ? 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/30'
                                    : 'bg-blue-600/20 text-blue-400 hover:bg-blue-600/30'
                                }`}
                              >
                                {u.isActive !== false ? 'Jooji (Suspend)' : 'Fasax (Activate)'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 7: SECURITY & AUDIT TRAIL
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'AUDIT' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#0d1627] border border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-white text-sm">Diiwaanka Amniga (Append-Only Audit Trail)</h3>
                  <p className="text-[11px] text-slate-400">
                    Dhammaan ficilada maamulayaasha iyo isbeddelada nidaamka oo xafidan (Tamper-evident).
                  </p>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  Total Records: {auditLogs.length}
                </div>
              </div>

              <div className="space-y-2">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-[#0d1627] border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-orange-400">{log.action}</span>
                        <span className="text-slate-400">by {log.user?.fullName || log.userId}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        Target: {log.entityType} ({log.entityId})
                      </div>
                    </div>
                    <div className="font-mono text-[10px] text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 8: ADMIN LISTINGS MANAGEMENT (No Store Required)
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'LISTINGS' && (
            <div className="space-y-5">
              {/* Top Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <input
                    type="text"
                    placeholder="Raadi alaab..."
                    value={listingSearch}
                    onChange={(e) => setListingSearch(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs placeholder-slate-500 focus:border-orange-500 focus:outline-none w-44"
                  />
                  <select
                    value={listingStatusFilter}
                    onChange={(e) => setListingStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-xs focus:border-orange-500 focus:outline-none"
                  >
                    <option value="ALL">Dhammaan Xaaladaha</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="DRAFT">DRAFT</option>
                    <option value="PAUSED">PAUSED</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                  <span className="text-xs text-slate-400 font-mono">{adminListings.length} alaab</span>
                </div>
                <button
                  onClick={() => { setEditingListing(null); setNewListingTitle(''); setNewListingDesc(''); setNewListingPrice(''); setNewListingCategory(''); setNewListingVertical('PRODUCT'); setNewListingCondition('NEW'); setNewListingCurrency('USD'); setNewListingCity('Garoowe'); setNewListingInventory('1'); setNewListingNegotiable(false); setNewListingImageUrl(''); setShowAddListingModal(true); }}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20"
                >
                  <span>➕</span>
                  <span>Ku dar Alaab Cusub</span>
                </button>
              </div>

              {/* Listings Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {adminListings
                  .filter((l) => {
                    if (listingStatusFilter !== 'ALL' && l.status !== listingStatusFilter) return false;
                    if (listingSearch.trim()) {
                      const q = listingSearch.toLowerCase();
                      return l.title?.toLowerCase().includes(q) || l.seller?.fullName?.toLowerCase().includes(q);
                    }
                    return true;
                  })
                  .map((listing) => (
                    <div key={listing.id} className="admin-card-hover p-4 rounded-2xl bg-[#0d1627] border border-slate-800 space-y-3 relative overflow-hidden">
                      {/* Status badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          listing.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                          listing.status === 'DRAFT' ? 'bg-slate-700 text-slate-400' :
                          'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}>{listing.status}</span>
                      </div>

                      {/* Image */}
                      <div className="w-full h-28 rounded-xl bg-slate-900 overflow-hidden border border-slate-800">
                        {listing.media?.[0]?.url ? (
                          <img src={listing.media[0].url} alt={listing.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-3xl text-slate-700">📦</div>
                        )}
                      </div>

                      <div>
                        <div className="font-bold text-white text-sm truncate pr-14">{listing.title}</div>
                        <div className="text-orange-400 font-mono font-bold text-sm mt-0.5">
                          {listing.currency} {listing.price?.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">
                          {listing.category?.name} · {listing.city} · {listing.seller?.fullName || 'Admin'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Stock: <span className="text-white font-mono">{listing.inventoryCount}</span></span>
                        <span>Views: <span className="text-white font-mono">{listing.viewsCount}</span></span>
                        <span>Orders: <span className="text-white font-mono">{listing._count?.transactionItems || 0}</span></span>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingListing(listing);
                            setNewListingTitle(listing.title);
                            setNewListingDesc(listing.description);
                            setNewListingPrice(String(listing.price));
                            setNewListingCategory(listing.categoryId);
                            setNewListingVertical(listing.verticalType);
                            setNewListingCondition(listing.condition);
                            setNewListingCurrency(listing.currency);
                            setNewListingCity(listing.city);
                            setNewListingInventory(String(listing.inventoryCount));
                            setNewListingNegotiable(listing.isNegotiable);
                            setNewListingImageUrl(listing.media?.[0]?.url || '');
                            setShowAddListingModal(true);
                          }}
                          className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all"
                        >
                          ✏️ Wax ka bedel
                        </button>
                        <button
                          onClick={async () => {
                            if (!token || !confirm(`"${listing.title}" ma tirtirayaa? Tani waa mid aan dib loo soo celin karin.`)) return;
                            setActionInProgress(listing.id);
                            const res = await api.adminDeleteListing(listing.id, token);
                            if (res.success) {
                              setSuccessMsg(res.message || 'Alaabta waa la tirtiray.');
                              setAdminListings((prev) => prev.filter((l) => l.id !== listing.id));
                            } else {
                              setErrorMsg(res.message || 'Khalad baa dhacay.');
                            }
                            setActionInProgress(null);
                          }}
                          disabled={actionInProgress === listing.id}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs font-semibold border border-rose-500/30 transition-all"
                        >
                          {actionInProgress === listing.id ? '...' : '🗑️'}
                        </button>
                      </div>
                    </div>
                  ))}
              </div>

              {adminListings.filter((l) => {
                if (listingStatusFilter !== 'ALL' && l.status !== listingStatusFilter) return false;
                if (listingSearch.trim()) {
                  const q = listingSearch.toLowerCase();
                  return l.title?.toLowerCase().includes(q) || l.seller?.fullName?.toLowerCase().includes(q);
                }
                return true;
              }).length === 0 && (
                <div className="text-center py-16 text-slate-500">
                  <div className="text-4xl mb-3">📦</div>
                  <div className="font-semibold">Wax alaab ah lama helin</div>
                  <div className="text-xs mt-1">Guji "Ku dar Alaab Cusub" si aad uga bilawdo</div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 9: ADMIN CATEGORY MANAGEMENT
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'CATEGORIES' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-400 font-mono">{adminCategories.length} qaybood</div>
                <button
                  onClick={() => { setEditingCategory(null); setNewCatName(''); setNewCatSlug(''); setNewCatDesc(''); setNewCatIcon('📦'); setNewCatVertical('PRODUCT'); setNewCatCommission('5'); setShowAddCategoryModal(true); }}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20"
                >
                  <span>➕</span>
                  <span>Qayb Cusub</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {adminCategories.map((cat) => (
                  <div key={cat.id} className="admin-card-hover p-4 rounded-2xl bg-[#0d1627] border border-slate-800 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{cat.icon || '📂'}</span>
                        <div>
                          <div className="font-bold text-white text-sm">{cat.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">{cat.slug}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        cat.isActive ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-400'
                      }`}>
                        {cat.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Commission: <span className="text-orange-400 font-bold">{cat.commissionRate}%</span></span>
                      <span className="text-slate-500">{cat._count?.listings || 0} alaab</span>
                      <span className="text-slate-500 capitalize text-[10px]">{cat.verticalType}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setNewCatName(cat.name);
                          setNewCatSlug(cat.slug);
                          setNewCatDesc(cat.description || '');
                          setNewCatIcon(cat.icon || '');
                          setNewCatVertical(cat.verticalType);
                          setNewCatCommission(String(cat.commissionRate));
                          setShowAddCategoryModal(true);
                        }}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                      >
                        ✏️ Wax ka bedel
                      </button>
                      <button
                        onClick={async () => {
                          if (!token) return;
                          if ((cat._count?.listings || 0) > 0) { setErrorMsg(`Ma tirtiri kartid: ${cat._count.listings} alaab ayaa ku jirta qeybtan.`); return; }
                          if (!confirm(`"${cat.name}" ma tirtirayaa?`)) return;
                          setActionInProgress(cat.id);
                          const res = await api.adminDeleteCategory(cat.id, token);
                          if (res.success) { setSuccessMsg(res.message || 'Qeybta waa la tirtiray.'); setAdminCategories((prev) => prev.filter((c) => c.id !== cat.id)); }
                          else setErrorMsg(res.message || 'Khalad baa dhacay.');
                          setActionInProgress(null);
                        }}
                        disabled={actionInProgress === cat.id}
                        className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 text-xs border border-rose-500/30"
                      >
                        {actionInProgress === cat.id ? '...' : '🗑️'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {adminCategories.length === 0 && (
                <div className="text-center py-16 text-slate-500">
                  <div className="text-4xl mb-3">🗂️</div>
                  <div className="font-semibold">Wax qaybood ah lama helin</div>
                  <div className="text-xs mt-1">Abuur qaybta alaabaha adiga oo guji "Qayb Cusub"</div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              TAB 10: SYSTEM DATA MANAGEMENT & WIPE
          ══════════════════════════════════════════════════════════════ */}
          {activeTab === 'SYSTEM' && (
            <div className="space-y-6 max-w-2xl">
              <div className="p-5 rounded-2xl bg-[#0d1627] border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>⚙️</span>
                  <span>Xakameeynta Nidaamka (System Controls)</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Halkan waxaad ka nadiifin kartaa xogta nidaamka. Labadaba xulashooyinka hoose waa kuwo aan dib loo soo celin karin.
                  Fadlan aad u taxadar marka aad isticmaalayso.
                </p>
              </div>

              {/* Wipe Option 1: Transactions Only */}
              <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/25 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">🧹</span>
                  <div>
                    <div className="font-bold text-amber-300 text-sm">Nadiifi Dhaqdhaqaaqa Lacagta Keliya</div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Waxay tirtiraysaa: Transactions, Payments, Escrow, Chat, Reviews, Disputes, Offers, Notifications.
                      <br />
                      <span className="text-emerald-400 font-semibold">Waxay kaaga taagtaa: Users, Listings, Categories, Stores.</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!token) return;
                    if (!confirm('⚠️ DIGNIIN: Dhammaan transactions, payments, chat, reviews, disputes ayaa la tirtiri doonaa. Haddaad xaqiijiso guji OK.')) return;
                    setWiping(true); setWipeResult(null); setErrorMsg(''); setSuccessMsg('');
                    const res = await api.adminClearSystemData('TRANSACTIONS_ONLY', token);
                    setWiping(false);
                    if (res.success) {
                      setWipeResult(res.data);
                      setSuccessMsg('✅ ' + (res.message || 'Dhaqdhaqaaqa lacagta oo dhan waa la nadiifiyay.'));
                      setTransactions([]); setTxSummary({ totalVolume: 0, totalCommission: 0, totalCount: 0 }); setAuditLogs([]);
                    } else { setErrorMsg(res.message || 'Khalad baa dhacay.'); }
                  }}
                  disabled={wiping}
                  className="px-5 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 transition-all"
                >
                  {wiping ? (<><span className="animate-spin">⏳</span><span>La nadiifiyaa...</span></>) : (<><span>🧹</span><span>Nadiifi Dhaqdhaqaaqa Lacagta</span></>)}
                </button>
              </div>

              {/* Wipe Option 2: Full Wipe */}
              <div className="p-5 rounded-2xl bg-rose-500/5 border border-rose-500/25 space-y-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">💥</span>
                  <div>
                    <div className="font-bold text-rose-400 text-sm">Nadiifinta Guud (Full Wipe)</div>
                    <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Waxay tirtiraysaa: <span className="text-rose-300 font-semibold">DHAMMAAN</span> - Transactions, Listings, Stores, Users (Admin mooyee), Categories aad lahayn alaab.
                      <br />
                      <span className="text-rose-400 font-bold">⚠️ Tani waa xaaladda ugu darnaan. Admin account-ka keliya ayaa harsan doonaa.</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (!token) return;
                    const confirmText = prompt('⛔ DIGNIIN ADAG: Geli "TIRTIR-DHAMMAAN" si aad u xaqiijiso full wipe:');
                    if (confirmText !== 'TIRTIR-DHAMMAAN') { setErrorMsg('Wax la qoray kuma habboonayn. Hawlgalka waa la joojiyay.'); return; }
                    setWiping(true); setWipeResult(null); setErrorMsg(''); setSuccessMsg('');
                    const res = await api.adminClearSystemData('FULL_WIPE', token);
                    setWiping(false);
                    if (res.success) {
                      setWipeResult(res.data);
                      setSuccessMsg('✅ ' + (res.message || 'Nidaamka oo dhan waa la nadiifiyay.'));
                      setTransactions([]); setTxSummary({ totalVolume: 0, totalCommission: 0, totalCount: 0 });
                      setStores([]); setSellers([]); setUsers([]); setAuditLogs([]); setAdminListings([]); setAuditLogs([]);
                    } else { setErrorMsg(res.message || 'Khalad baa dhacay.'); }
                  }}
                  disabled={wiping}
                  className="px-5 py-2.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/35 text-rose-300 text-xs font-bold flex items-center gap-2 transition-all"
                >
                  {wiping ? (<><span className="animate-spin">⏳</span><span>La nadiifiyaa...</span></>) : (<><span>💥</span><span>Full Wipe — Nadiifi Dhammaan</span></>)}
                </button>
              </div>

              {/* Wipe Results */}
              {wipeResult && (
                <div className="p-4 rounded-2xl bg-[#0d1627] border border-slate-800 space-y-2">
                  <div className="text-xs font-bold text-emerald-400 mb-2">📊 Natiijooyinka Nadiifinta ({wipeResult.clearType})</div>
                  <div className="grid grid-cols-2 gap-1">
                    {Object.entries(wipeResult.results || {}).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between text-[11px] font-mono p-1.5 rounded-lg bg-slate-900">
                        <span className="text-slate-400">{key}</span>
                        <span className="text-white font-bold">{String(val)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* System Info */}
              <div className="p-4 rounded-2xl bg-[#0d1627] border border-slate-800 space-y-2 text-xs">
                <div className="font-bold text-white text-sm">📋 Xogta Nidaamka Hadda</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Isticmaalayaasha', val: users.length },
                    { label: 'Alaabaha', val: adminListings.length },
                    { label: 'Meheradaha', val: stores.length },
                    { label: 'Transactions', val: transactions.length },
                    { label: 'Qaybaha', val: adminCategories.length },
                    { label: 'Audit Logs', val: auditLogs.length },
                  ].map(({ label, val }) => (
                    <div key={label} className="flex justify-between items-center p-2 rounded-lg bg-slate-900 font-mono">
                      <span className="text-slate-400">{label}</span>
                      <span className="text-white font-bold">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ── MODAL: CREATE NEW ADMIN STAFF ACCOUNT ── */}
      {showAddAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d1627] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">
                  ➕ Ku dar Maamule Cusub
                </h3>
                <p className="text-xs text-slate-400">
                  U samee akoon maamul qof cusub oo ku soo biiraya kooxda Kaafi App.
                </p>
              </div>
              <button
                onClick={() => setShowAddAdminModal(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateNewAdmin} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Magaca Buuxa (Full Name)</label>
                <input
                  type="text"
                  required
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="e.g. Axmed Cali Faarax"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Taleefanka (Phone Number)</label>
                <input
                  type="text"
                  required
                  value={newAdminPhone}
                  onChange={(e) => setNewAdminPhone(e.target.value)}
                  placeholder="+252907000002"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Email (Ikhtiyaari)</label>
                <input
                  type="email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="staff@hudisoft.com"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Doorka Maamulka (Admin Role)</label>
                <select
                  value={newAdminRole}
                  onChange={(e) => setNewAdminRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none"
                >
                  <option value="SUPER_ADMIN">SUPER_ADMIN (Awood Buuxda oo Dhammaan Nidaamka ah)</option>
                  <option value="FINANCE_ADMIN">FINANCE_ADMIN (Maamulka Lacagaha & Escrow)</option>
                  <option value="MODERATOR">MODERATOR (Kormeerka Dukaamada & Xayaysiimaha)</option>
                  <option value="OPERATIONS_ADMIN">OPERATIONS_ADMIN (Maamulka Dalabyada & Gaarsiinta)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Furaha Sirta ah (Password)</label>
                <input
                  type="password"
                  required
                  value={newAdminPassword}
                  onChange={(e) => setNewAdminPassword(e.target.value)}
                  placeholder="Ugu yaraan 6 xaraf"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddAdminModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-semibold"
                >
                  Ka noqo
                </button>
                <button
                  type="submit"
                  disabled={creatingAdmin}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-md shadow-orange-600/30"
                >
                  {creatingAdmin ? 'La abuurayaa...' : 'Abuur Akoonka Maamulka'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── TRANSACTION / ORDER DETAIL MODAL DRAWER ── */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0d1627] border border-slate-800 rounded-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base font-mono">
                  Dalabka #{selectedTx.transactionNumber}
                </h3>
                <div className="text-xs text-slate-400">
                  {new Date(selectedTx.createdAt).toLocaleString()} · {selectedTx.fulfillmentType}
                </div>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-xs">
              <div>
                <div className="text-slate-400">Wadarta (Total)</div>
                <div className="font-bold text-emerald-400 text-sm">{formatPrice(selectedTx.totalAmount)}</div>
              </div>
              <div>
                <div className="text-slate-400">Commission</div>
                <div className="font-bold text-orange-400 text-sm">{formatPrice(selectedTx.commissionAmount)}</div>
              </div>
              <div>
                <div className="text-slate-400">Status</div>
                <div className="font-bold text-white text-sm">{selectedTx.status}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-300 uppercase">Alaabta Dalabka (Items)</h4>
              {selectedTx.items?.map((it: any) => (
                <div key={it.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">{it.listing?.title || 'Product Item'}</div>
                    <div className="text-slate-400">Qty: {it.quantity} x {formatPrice(it.unitPrice)}</div>
                  </div>
                  <div className="font-mono font-bold text-emerald-400">
                    {formatPrice(it.totalPrice)}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-1">
              <div className="font-bold text-white mb-1">Xogta Macmiilka & Gaarsiinta</div>
              <div>Macmiilka: <span className="text-white font-semibold">{selectedTx.buyer?.fullName}</span></div>
              <div>Taleefanka: <span className="text-slate-300 font-mono">{selectedTx.recipientPhone || selectedTx.buyer?.phoneNumber}</span></div>
              <div>Goobta: <span className="text-slate-300">{selectedTx.deliveryCity} {selectedTx.deliveryLandmark ? `(${selectedTx.deliveryLandmark})` : ''}</span></div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
              >
                Xir (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT LISTING ── */}
      {showAddListingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-[#0d1627] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 my-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">
                  {editingListing ? '✏️ Wax ka bedel Alaabta' : '🛍️ Ku dar Alaab Cusub'}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingListing ? 'Cusboonaysii xogta alaabta.' : 'Admin si toos ah u dari karaa alaab — store ma loo baahna.'}
                </p>
              </div>
              <button onClick={() => setShowAddListingModal(false)} className="text-slate-400 hover:text-white text-lg p-1">✕</button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!token) return;
                setSavingListing(true);
                setErrorMsg('');
                try {
                  const data = {
                    title: newListingTitle.trim(),
                    description: newListingDesc.trim(),
                    price: parseFloat(newListingPrice),
                    currency: newListingCurrency,
                    categoryId: newListingCategory,
                    verticalType: newListingVertical,
                    condition: newListingCondition,
                    inventoryCount: parseInt(newListingInventory, 10),
                    isNegotiable: newListingNegotiable,
                    city: newListingCity,
                    mediaUrls: newListingImageUrl.trim() ? [newListingImageUrl.trim()] : [],
                    status: 'ACTIVE',
                  };
                  let res: any;
                  if (editingListing) {
                    res = await api.adminUpdateListing(editingListing.id, data, token);
                    if (res.success) {
                      setSuccessMsg(`Alaabta "${newListingTitle}" si guul leh waa la cusbooneysiiyay.`);
                      setAdminListings((prev) => prev.map((l) => l.id === editingListing.id ? { ...l, ...data, media: data.mediaUrls.length ? [{ url: data.mediaUrls[0] }] : l.media } : l));
                    }
                  } else {
                    res = await api.adminCreateListing(data, token);
                    if (res.success) {
                      setSuccessMsg(res.message || `Alaabta "${newListingTitle}" si guul leh waa loogu daray suuqa!`);
                      setAdminListings((prev) => [res.data, ...prev]);
                    }
                  }
                  if (res.success) {
                    setShowAddListingModal(false);
                  } else {
                    setErrorMsg(res.message || 'Khalad baa dhacay.');
                  }
                } catch {
                  setErrorMsg('Server-ka lama xiriiri karin.');
                } finally {
                  setSavingListing(false);
                }
              }}
              className="space-y-3 text-xs"
            >
              {/* Title */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Magaca Alaabta *</label>
                <input
                  type="text" required value={newListingTitle}
                  onChange={(e) => setNewListingTitle(e.target.value)}
                  placeholder="e.g. Samsung Galaxy A55 128GB"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Sharaxaadda *</label>
                <textarea
                  required value={newListingDesc} rows={3}
                  onChange={(e) => setNewListingDesc(e.target.value)}
                  placeholder="Sharax alaabta si faahfaahsan..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-orange-500 focus:outline-none resize-none"
                />
              </div>

              {/* Price & Currency */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-300 mb-1">Qiimaha *</label>
                  <input
                    type="number" required min="0" step="0.01" value={newListingPrice}
                    onChange={(e) => setNewListingPrice(e.target.value)}
                    placeholder="e.g. 150"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Lacag</label>
                  <select value={newListingCurrency} onChange={(e) => setNewListingCurrency(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none">
                    <option>USD</option>
                    <option>SOS</option>
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Qaybta Alaabta *</label>
                <select required value={newListingCategory} onChange={(e) => setNewListingCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none">
                  <option value="">— Dooro Qayb —</option>
                  {adminCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.icon || ''} {cat.name} ({cat.verticalType})</option>
                  ))}
                </select>
              </div>

              {/* Vertical & Condition */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nooca</label>
                  <select value={newListingVertical} onChange={(e) => setNewListingVertical(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none">
                    <option value="PRODUCT">PRODUCT</option>
                    <option value="VEHICLE">VEHICLE</option>
                    <option value="REAL_ESTATE">REAL_ESTATE</option>
                    <option value="SERVICE">SERVICE</option>
                    <option value="WHOLESALE">WHOLESALE</option>
                    <option value="FOOD">FOOD</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Xaaladda</label>
                  <select value={newListingCondition} onChange={(e) => setNewListingCondition(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none">
                    <option value="NEW">NEW (Cusub)</option>
                    <option value="LIKE_NEW">LIKE_NEW</option>
                    <option value="USED_GOOD">USED_GOOD</option>
                    <option value="USED_FAIR">USED_FAIR</option>
                  </select>
                </div>
              </div>

              {/* City & Inventory */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Magaalada</label>
                  <select value={newListingCity} onChange={(e) => setNewListingCity(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none">
                    {['Garoowe', 'Bosaso', 'Qardho', 'Galkayo', 'Mogadishu', 'Hargeysa', 'Berbera'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tirada Stock</label>
                  <input
                    type="number" min="0" value={newListingInventory}
                    onChange={(e) => setNewListingInventory(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Image Picker from Device & URL */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                  <span>Sawirka Alaabta *</span>
                  <span className="text-[10px] text-orange-400 font-normal">Dooro Device-kaaga ama URL</span>
                </label>

                {newListingImageUrl ? (
                  <div className="relative w-full h-40 rounded-2xl overflow-hidden border-2 border-orange-500/50 bg-slate-900 group shadow-lg">
                    <img src={newListingImageUrl} alt="Product Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <label htmlFor="admin-listing-file-input" className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold cursor-pointer transition-all shadow-md">
                        🔄 Beddel Sawirka
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewListingImageUrl('')}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md"
                      >
                        ✕ Tirtir
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="admin-listing-file-input"
                    className="flex flex-col items-center justify-center p-5 border-2 border-dashed border-orange-500/50 hover:border-orange-500 rounded-2xl bg-orange-500/5 hover:bg-orange-500/10 cursor-pointer transition-all text-center group"
                  >
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 group-hover:bg-orange-500/20 flex items-center justify-center text-2xl mb-2 transition-transform group-hover:scale-110">
                      📷
                    </div>
                    <span className="font-bold text-orange-400 text-xs">
                      Dooro Sawirka Device-kaaga (Gallery / Camera / PC)
                    </span>
                    <span className="text-[10px] text-slate-400 mt-1">
                      Taabo si aad sawir uga soo doorato taleefankaaga ama kombuyuutarkaaga
                    </span>
                  </label>
                )}

                <input
                  type="file"
                  id="admin-listing-file-input"
                  accept="image/*"
                  className="hidden"
                  onChange={handleListingImageUpload}
                />

                {/* Optional direct URL input */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">Ama URL:</span>
                  <input
                    type="url"
                    value={newListingImageUrl.startsWith('data:') ? '' : newListingImageUrl}
                    onChange={(e) => setNewListingImageUrl(e.target.value)}
                    placeholder="https://example.com/sawir.jpg"
                    className="flex-1 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-700/80 text-white text-[11px] placeholder-slate-500 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Negotiable */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={newListingNegotiable} onChange={(e) => setNewListingNegotiable(e.target.checked)} className="w-4 h-4 accent-orange-500" />
                <span className="text-slate-300 font-semibold">Qiimahu waa la wadahadli karaa (Negotiable)</span>
              </label>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddListingModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold">
                  Jooji
                </button>
                <button type="submit" disabled={savingListing}
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all disabled:opacity-60">
                  {savingListing ? '⏳ La kaydinayaa...' : editingListing ? '✅ Cusboonaysii' : '🛍️ Ku dar Suuqa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: ADD / EDIT CATEGORY ── */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d1627] border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">
                  {editingCategory ? '✏️ Wax ka bedel Qaybta' : '🗂️ Abuur Qayb Cusub'}
                </h3>
                <p className="text-xs text-slate-400">
                  {editingCategory ? 'Cusboonaysii xogta qaybta.' : 'Samee qayb cusub oo alaabaha platform-ka.'}
                </p>
              </div>
              <button onClick={() => setShowAddCategoryModal(false)} className="text-slate-400 hover:text-white text-lg p-1">✕</button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!token) return;
                setSavingCategory(true);
                setErrorMsg('');
                try {
                  const data = {
                    name: newCatName.trim(),
                    slug: newCatSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-'),
                    description: newCatDesc.trim() || undefined,
                    icon: newCatIcon.trim() || undefined,
                    verticalType: newCatVertical,
                    commissionRate: parseFloat(newCatCommission),
                  };
                  let res: any;
                  if (editingCategory) {
                    res = await api.adminUpdateCategory(editingCategory.id, { name: data.name, description: data.description, icon: data.icon, commissionRate: data.commissionRate }, token);
                    if (res.success) {
                      setSuccessMsg(`Qaybta "${newCatName}" si guul leh waa la cusbooneysiiyay.`);
                      setAdminCategories((prev) => prev.map((c) => c.id === editingCategory.id ? { ...c, ...data } : c));
                    }
                  } else {
                    res = await api.adminCreateCategory(data, token);
                    if (res.success) {
                      setSuccessMsg(res.message || `Qaybta "${newCatName}" si guul leh waa la abuuray!`);
                      setAdminCategories((prev) => [res.data, ...prev]);
                    }
                  }
                  if (res.success) {
                    setShowAddCategoryModal(false);
                  } else {
                    setErrorMsg(res.message || 'Khalad baa dhacay.');
                  }
                } catch {
                  setErrorMsg('Server-ka lama xiriiri karin.');
                } finally {
                  setSavingCategory(false);
                }
              }}
              className="space-y-3 text-xs"
            >
              {/* Icon & Name */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Icon</label>
                  <input type="text" value={newCatIcon} onChange={(e) => setNewCatIcon(e.target.value)}
                    placeholder="📦"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-center text-xl focus:border-orange-500 focus:outline-none" />
                </div>
                <div className="col-span-3">
                  <label className="block font-semibold text-slate-300 mb-1">Magaca Qaybta *</label>
                  <input type="text" required value={newCatName}
                    onChange={(e) => {
                      setNewCatName(e.target.value);
                      if (!editingCategory) setNewCatSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''));
                    }}
                    placeholder="e.g. Taleefanada, Gawaari..."
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-orange-500 focus:outline-none" />
                </div>
              </div>

              {/* Slug */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Slug (URL) *</label>
                <input type="text" required value={newCatSlug} onChange={(e) => setNewCatSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="e.g. taleefanada"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 font-mono text-xs placeholder-slate-500 focus:border-orange-500 focus:outline-none" />
              </div>

              {/* Description */}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Sharaxaadda</label>
                <textarea value={newCatDesc} rows={2} onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Sharax qaybta si gaaban..."
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-orange-500 focus:outline-none resize-none" />
              </div>

              {/* Vertical & Commission */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Nooca</label>
                  <select value={newCatVertical} onChange={(e) => setNewCatVertical(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none">
                    <option value="PRODUCT">PRODUCT</option>
                    <option value="VEHICLE">VEHICLE</option>
                    <option value="REAL_ESTATE">REAL_ESTATE</option>
                    <option value="SERVICE">SERVICE</option>
                    <option value="WHOLESALE">WHOLESALE</option>
                    <option value="FOOD">FOOD</option>
                    <option value="LAND">LAND</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Commission %</label>
                  <input type="number" min="0" max="100" step="0.5" value={newCatCommission}
                    onChange={(e) => setNewCatCommission(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-white text-xs focus:border-orange-500 focus:outline-none" />
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={() => setShowAddCategoryModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold">
                  Jooji
                </button>
                <button type="submit" disabled={savingCategory}
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all disabled:opacity-60">
                  {savingCategory ? '⏳ La kaydinayaa...' : editingCategory ? '✅ Cusboonaysii' : '🗂️ Abuur Qayb'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
