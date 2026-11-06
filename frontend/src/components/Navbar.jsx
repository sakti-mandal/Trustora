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
  ChevronDown,
  Sun,
  Moon,
  PenTool,
  Shield,
  FileCheck,
  LogOut
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
  isMobileSidebarOpen,
  theme = 'light',
  onToggleTheme,
  currentUser,
  onLogout
}) {
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  const roles = [
    { id: 'Admin', label: 'Admin', icon: Shield },
    { id: 'Content Creator', label: 'Creator', icon: PenTool },
    { id: 'Reviewer', label: 'Reviewer', icon: CheckCircle2 }
  ];

  const loadNotifs = async () => {
    try {
      const data = await fetchNotifications(company?.id || 1, currentRole);
      setNotifications(data || []);
    } catch (e) { }
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
    } catch (e) { }

    if (notif.submission_id) {
      onSelectSubmission(notif.submission_id);
      if (notif.notification_type === 'review_request') {
        onRoleChange('Reviewer');
        onNavigate('reviewer-dashboard');
      } else {
        onRoleChange('Content Creator');
        onNavigate('creator-dashboard');
      }
    }
    setIsNotifOpen(false);
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const currentPersona = currentUser
    ? {
        name: currentUser.full_name || 'Team Member',
        email: currentUser.email || `${currentRole.toLowerCase().replace(' ', '')}@novatech.io`,
        initials: (currentUser.full_name || currentRole)
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      }
    : currentRole === 'Admin'
    ? { name: 'Sarah Chen', email: 'admin@novatech.io', initials: 'SC' }
    : currentRole === 'Content Creator'
    ? { name: 'Marcus Rodriguez', email: 'creator@novatech.io', initials: 'MR' }
    : { name: 'Elena Rostova', email: 'reviewer@novatech.io', initials: 'ER' };

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-7 py-3 transition-colors duration-200">
      <div className="flex items-center justify-between gap-3 sm:gap-6">

        {/* Left: Mobile Toggle & Brand Identity */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={onToggleMobileSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95"
            aria-label="Toggle navigation menu"
          >
            {isMobileSidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>

          {/* Logo Badge */}
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white shadow-glow-sm shrink-0">
            <ShieldCheck className="w-5 h-5 stroke-[2.4]" />
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white font-sans">
                TRUSTORA
              </span>
              <span className="hidden sm:inline-flex items-center text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80">
                Governance
              </span>
            </div>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium hidden md:block leading-none mt-0.5">
              Trust, Before It Goes Live.
            </span>
          </div>

          {/* Company Workspace Pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 ml-2">
            <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="truncate max-w-[130px]">{company?.company_name || 'NOVA TECH'}</span>
          </div>
        </div>

        {/* Center: Brand Compliance Score Meter */}
        <div className="flex items-center justify-center">
          <ScoreMeter scoreData={scoreData} currentRole={currentRole} />
        </div>

        {/* Right: Segmented Role Switcher, Dark Mode, Notifications, Avatar */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">

          {/* Segmented Role Switcher */}
          <div className="flex items-center bg-slate-100/90 dark:bg-slate-800/90 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 shadow-2xs">
            {roles.map((r) => {
              const active = currentRole === r.id;
              const Icon = r.icon;
              return (
                <button
                  key={r.id}
                  onClick={() => onRoleChange(r.id)}
                  className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 cursor-pointer ${active
                      ? 'bg-indigo-600 text-white shadow-glow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50'
                    }`}
                  title={`Switch to ${r.label} Dashboard`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{r.label}</span>
                </button>
              );
            })}
          </div>

          {/* Theme Toggle Button */}
          {onToggleTheme && (
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition active:scale-95 cursor-pointer shadow-2xs"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-600" />
              )}
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-2xl text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 transition active:scale-95 cursor-pointer shadow-2xs"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </button>

            {isNotifOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Notifications ({notifications.length})</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase">{currentRole}</span>
                </div>

                <div className="max-h-72 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/60">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-start gap-2.5 ${!n.is_read ? 'bg-indigo-50/40 dark:bg-indigo-950/30 font-medium' : ''
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
                          <p className="text-[11px] font-bold text-slate-800 dark:text-slate-100">{n.title}</p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{n.message}</p>
                          <p className="text-[9px] text-slate-400 dark:text-slate-500">
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
                    <div className="p-5 text-center text-xs text-slate-400 dark:text-slate-500">
                      No notifications for {currentRole}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Menu Dropdown */}
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-1.5 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-95 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center text-xs font-black shadow-glow-sm">
                {currentPersona.initials}
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden sm:block" />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-60 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <p className="font-extrabold text-slate-900 dark:text-white text-sm">{currentPersona.name}</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{currentPersona.email}</p>
                  <span className="mt-2 inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                    Active: {currentRole}
                  </span>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate('guidelines-hub');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition font-semibold"
                  >
                    Suggestion & Guideline PDF Hub
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onNavigate('settings');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition font-semibold"
                  >
                    System Architecture & Settings
                  </button>
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onLoadDemo();
                    }}
                    disabled={isDemoLoading}
                    className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition font-semibold flex items-center gap-2"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDemoLoading ? 'animate-spin text-indigo-600' : ''}`} />
                    <span>Reset Workspace Data</span>
                  </button>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out / Switch User</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
