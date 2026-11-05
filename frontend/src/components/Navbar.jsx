import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Building2, Bell, RefreshCw, Zap, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { fetchNotifications, markNotificationRead } from '../api';

export default function Navbar({
  currentRole,
  onRoleChange,
  company,
  systemStatus,
  onLoadDemo,
  isDemoLoading,
  onNavigate,
  onSelectSubmission
}) {
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const roles = [
    { id: 'Admin', label: 'Admin', desc: 'Brand Governance & Rules' },
    { id: 'Content Creator', label: 'Content Creator', desc: 'Draft & AI Audit' },
    { id: 'Reviewer', label: 'Reviewer', desc: 'Human Approval Queue' }
  ];

  const loadNotifs = async () => {
    try {
      const data = await fetchNotifications(company?.id || 1, currentRole);
      setNotifications(data || []);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadNotifs();
    const interval = setInterval(loadNotifs, 10000);
    return () => clearInterval(interval);
  }, [company, currentRole]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3.5">
      <div className="flex items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-900 via-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/15">
            <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-navy-900 font-sans">
                TRUSTORA
              </span>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 border border-brand-200">
                Workspace
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Trust, Before It Goes Live.
            </p>
          </div>
        </div>

        {/* Center: Company Pill & Reset Button */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <Building2 className="w-4 h-4 text-brand-600" />
            <span>{company?.company_name || 'NOVA TECH'}</span>
          </div>

          <button
            onClick={onLoadDemo}
            disabled={isDemoLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 text-xs font-semibold transition active:scale-95 disabled:opacity-50"
            title="Reload Default Workspace Configuration"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDemoLoading ? 'animate-spin' : ''}`} />
            <span>{isDemoLoading ? 'Reloading...' : 'Reset Workspace'}</span>
          </button>
        </div>

        {/* Right: Role Switcher & Notifications */}
        <div className="flex items-center gap-3">
          {/* Role Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {roles.map((r) => {
              const active = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onRoleChange(r.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    active
                      ? 'bg-navy-900 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>

          {/* Interactive Notifications Bell */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="relative p-2 rounded-xl text-slate-600 hover:text-navy-900 hover:bg-slate-100 transition border border-transparent hover:border-slate-200"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
              )}
            </button>

            {/* Notification Dropdown */}
            {isNotifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-bold text-navy-900">Notifications ({notifications.length})</span>
                  <span className="text-[10px] text-slate-400 font-medium">Role: {currentRole}</span>
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
                            {n.created_at ? new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
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

          {/* User Persona */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-navy-900 text-white flex items-center justify-center text-xs font-bold shadow-inner">
              {currentRole === 'Admin' ? 'SC' : currentRole === 'Content Creator' ? 'MR' : 'ER'}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <p className="font-semibold text-slate-800">
                {currentRole === 'Admin' ? 'Sarah Chen' : currentRole === 'Content Creator' ? 'Marcus Rodriguez' : 'Elena Rostova'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">{currentRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
