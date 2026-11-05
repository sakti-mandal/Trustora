import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  PenTool,
  Clock,
  History,
  Settings,
  ChevronRight,
  SlidersHorizontal
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onTabChange,
  currentRole,
  pendingCount = 0,
  rulesCount = 0
}) {
  const navItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'brand-rules',
      label: 'Brand Rules & Admin',
      icon: SlidersHorizontal,
      badge: rulesCount > 0 ? rulesCount : null
    },
    {
      id: 'content-review',
      label: 'Content Creator',
      icon: PenTool,
      badge: null
    },
    {
      id: 'review-queue',
      label: 'Review Queue',
      icon: Clock,
      badge: pendingCount > 0 ? pendingCount : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200'
    },
    {
      id: 'history',
      label: 'Audit History',
      icon: History,
      badge: null
    },
    {
      id: 'settings',
      label: 'Settings & System',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <aside className="w-64 border-r border-slate-200 bg-white flex flex-col justify-between p-4 min-h-[calc(100vh-65px)]">
      <div>
        {/* Navigation Items */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Navigation
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
      </div>

      {/* Role Quick Hint */}
      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 space-y-1">
        <div className="flex items-center gap-2 text-slate-800 font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-brand-600" />
          <span>Active Role: {currentRole}</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-normal">
          {currentRole === 'Admin' && 'Configure company info, brand tone, facts & prohibited terms.'}
          {currentRole === 'Content Creator' && 'Draft marketing copy & verify compliance before submitting.'}
          {currentRole === 'Reviewer' && 'Inspect submitted copy, add comments & approve or request changes.'}
        </p>
      </div>
    </aside>
  );
}
