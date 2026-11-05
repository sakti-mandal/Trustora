import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Building2,
  Bell,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Menu,
  X,
  User,
  ChevronDown
} from 'lucide-react';
import ScoreMeter from './ScoreMeter';
import { fetchNotifications, markNotificationRead } from '../api';

export default function Navbar({
  currentRole,
  onRoleChange,
  company,
  systemStatus,
  onLoadDemo,
  isDemoLoading,
  onNavigate,
  onSelectSubmission,
  scoreData,
  onToggleMobileSidebar,
  isMobileSidebarOpen
}) {
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const roles = [
    { id: 'Admin', label: 'Admin', short: 'Admin' },
    { id: 'Content Creator', label: 'Creator', short: 'Creator' },
    { id: 'Reviewer', label: 'Reviewer', short: 'Review' }
  ];

  const loadNotifs = async () => {
    try {
      const data = await fetchNotifications(company?.id || 1, currentRole);
      setNotifications(data || []);
    } catch (e) {}
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 10000);
    return () => clearInterval(interval);
  }, [company, currentRole]);

  // Click outside listener for dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    try {
      await markNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, is_read: true } : n))
      );
    } catch (e) {}

    if (notif.submission_id) {
      onSelectSubmission(notif.submission_id);
      if (notif.notification_type === 'review_request') {
        onRoleChange('Reviewer');
        onNavigate('review-queue');
      } else {
        onRoleChange('Content Creator');
        onNavigate('content-review');
      }
    }
    setIsNotifOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const currentPersona =
    currentRole === 'Admin'
      ? { name: 'Sarah Chen', email: 'admin@novatech.io', initials: 'SC' }
      : currentRole === 'Content Creator'
      ? { name: 'Marcus Rodriguez', email: 'creator@novatech.io', initials: 'MR' }
      : { name: 'Elena Rostova', email: 'reviewer@novatech.io', initials: 'ER' };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-3 sm:px-6 py-2.5 sm:py-3 transition-all">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Mobile Hamburger & Brand Logo */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition active:scale-95"
            aria-label="Toggle navigation menu"
          >
            {isMobileSidebarOpen ? (
              <X className="w-5 h-5 text-slate-800" />
            ) : (
              <Menu className="w-5 h-5 text-slate-800" />
            )}
          </button>

          {/* Logo */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-brand-900 via-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/15 shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-lg sm:text-xl tracking-tight text-navy-900 font-sans">
                TRUSTORA
              </span>
              <span className="hidden xl:inline text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.2 rounded bg-brand-50 text-brand-700 border border-brand-200">
                Workspace
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium hidden md:block leading-none">
              Trust, Before It Goes Live.
            </span>
          </div>

          {/* Company Badge (Hidden on small mobile) */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 ml-2">
            <Building2 className="w-3.5 h-3.5 text-brand-600" />
            <span className="truncate max-w-[120px]">{company?.company_name || 'NOVA TECH'}</span>
          </div>
        </div>

        {/* Center: Brand Compliance Score Meter */}
        <div className="flex items-center justify-center">
          <ScoreMeter scoreData={scoreData} currentRole={currentRole} />
        </div>

        {/* Right: Role Switcher, Notifications & Profile Menu */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Role Switcher */}
          <div className="flex items-center bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200">
            {roles.map((r) => {
              const active = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onRoleChange(r.id)}
                  className={`px-2 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold rounded-lg transition-all ${
                    active
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span className="hidden sm:inline">{r.label}</span>
                  <span className="sm:hidden">{r.short}</span>
                </button>
              );
            })}
          </div>

          {/* Notifications Bell Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition active:scale-95 border border-transparent hover:border-slate-200"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-76 sm:w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900">Notifications ({notifications.length})</span>
                  <span className="text-[10px] text-slate-400 font-medium">{currentRole}</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition flex items-start gap-2.5 ${
                          !n.is_read ? 'bg-brand-50/40 font-medium' : ''
                        }`}
                      >
                        <div className="mt-0.5 shrink-0">
                          {n.notification_type === 'review_request' && (
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                          )}
                          {n.notification_type === 'changes_requested' && (
                            <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                          )}
                          {n.notification_type === 'approved' && (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          )}
                          {n.notification_type === 'rejected' && (
                            <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                          )}
                        </div>
                        <div className="space-y-0.5 flex-1">
                          <p className="text-[11px] font-bold text-slate-800">{n.title}</p>
                          <p className="text-[11px] text-slate-500 leading-snug">{n.message}</p>
                          <p className="text-[9px] text-slate-400">
                            {n.created_at
                              ? new Date(n.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })
                              : 'Recent'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No notifications for {currentRole}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile Menu Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 transition active:scale-95"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-navy-900 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                {currentPersona.initials}
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                <div className="px-3 py-2 border-b border-slate-100 mb-2">
                  <p className="font-bold text-slate-900">{currentPersona.name}</p>
                  <p className="text-[11px] text-slate-500 truncate">{currentPersona.email}</p>
                  <span className="mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                    Role: {currentRole}
                  </span>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition font-medium"
                  >
                    System Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLoadDemo();
                    }}
                    disabled={isDemoLoading}
                    className="w-full text-left px-3 py-1.5 rounded-lg hover:bg-slate-100 text-slate-700 transition font-medium flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDemoLoading ? 'animate-spin' : ''}`} />
                    <span>Reset Workspace Data</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
