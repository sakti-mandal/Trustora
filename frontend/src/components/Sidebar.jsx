import React from 'react';
import {
  LayoutDashboard,
  FileCheck2,
  PenTool,
  Clock,
  History,
  Settings,
  Sparkles,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onTabChange,
  currentRole,
  pendingCount = 0,
  guidelineCount = 0
}) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
      roleTag: 'All'
    },
    {
      id: 'guidelines',
      label: 'Brand Guidelines',
      icon: FileCheck2,
      badge: guidelineCount > 0 ? guidelineCount : null,
      roleTag: 'Admin'
    },
    {
      id: 'content-review',
      label: 'Content Review',
      icon: PenTool,
      badge: null,
      roleTag: 'Creator'
    },
    {
      id: 'review-queue',
      label: 'Review Queue',
      icon: Clock,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
      roleTag: 'Reviewer'
    },
    {
      id: 'history',
      label: 'History & Audits',
      icon: History,
      badge: null,
      roleTag: 'All'
    },
    {
      id: 'settings',
      label: 'Settings & AI',
      icon: Settings,
      badge: null,
      roleTag: 'Admin'
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 min-h-[calc(100vh-65px)]">
      <div>
        {/* Navigation Items */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Workspace Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-50 text-brand-900 font-semibold shadow-xs border border-brand-200/80'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-brand-600' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== null && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                        item.badgeColor || 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-500" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Hackathon Callout Card */}
        <div className="mt-8 p-3.5 rounded-xl bg-gradient-to-br from-slate-900 to-navy-900 text-white shadow-sm border border-slate-800">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold text-slate-100">Team REDO • Round 2</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            AI-powered brand governance preventing guideline violations, prohibited terms & unverified claims.
          </p>
          <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>CodeNexus 2026</span>
            <span className="text-emerald-400 font-semibold">Zero-Login Mode</span>
          </div>
        </div>
      </div>

      {/* Role Quick Hint */}
      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
        <div className="flex items-center gap-2 text-slate-700 font-semibold mb-1">
          <ShieldAlert className="w-3.5 h-3.5 text-brand-600" />
          <span>Active Role: {currentRole}</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-normal">
          {currentRole === 'Admin' && 'Manage guidelines, upload PDFs & define brand rules.'}
          {currentRole === 'Content Creator' && 'Draft marketing copy & trigger real-time AI compliance.'}
          {currentRole === 'Reviewer' && 'Human-in-the-loop review, approve or request changes.'}
        </p>
      </div>
    </aside>
  );
}
