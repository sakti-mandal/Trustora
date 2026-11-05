import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  PenTool,
  Clock,
  History,
  Settings,
  ChevronRight,
  SlidersHorizontal,
  FileText,
  UploadCloud,
  X,
  UserCheck
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  onTabChange,
  currentRole,
  pendingCount = 0,
  rulesCount = 0,
  guidelinesCount = 0,
  isOpen = false,
  onClose
}) {
  // Build role-tailored navigation items
  const getNavItems = () => {
    if (currentRole === 'Admin') {
      return [
        {
          id: 'admin-dashboard',
          label: 'Admin Dashboard',
          icon: SlidersHorizontal,
          badge: rulesCount > 0 ? `${rulesCount} Rules` : null,
          badgeColor: 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-700'
        },
        {
          id: 'guidelines-hub',
          label: 'Suggestion & PDF Hub',
          icon: FileText,
          badge: guidelinesCount > 0 ? `${guidelinesCount} PDFs` : null,
          badgeColor: 'bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
        },
        {
          id: 'history',
          label: 'Audit History',
          icon: History,
          badge: null
        },
        {
          id: 'overview',
          label: 'Company Overview',
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: 'settings',
          label: 'System Settings',
          icon: Settings,
          badge: null
        }
      ];
    } else if (currentRole === 'Reviewer') {
      return [
        {
          id: 'reviewer-dashboard',
          label: 'Reviewer Dashboard',
          icon: Clock,
          badge: pendingCount > 0 ? `${pendingCount} Pending` : 'Queue Clear',
          badgeColor: pendingCount > 0
            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-700 animate-pulse'
            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
        },
        {
          id: 'guidelines-hub',
          label: 'Reference Guidelines & PDFs',
          icon: FileText,
          badge: null
        },
        {
          id: 'history',
          label: 'Audit History',
          icon: History,
          badge: null
        },
        {
          id: 'overview',
          label: 'Company Overview',
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: 'settings',
          label: 'System Settings',
          icon: Settings,
          badge: null
        }
      ];
    } else {
      // Content Creator
      return [
        {
          id: 'creator-dashboard',
          label: 'Creator Dashboard',
          icon: PenTool,
          badge: 'Editor',
          badgeColor: 'bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border-brand-200 dark:border-brand-700'
        },
        {
          id: 'guidelines-hub',
          label: 'Upload Suggestion PDF',
          icon: UploadCloud,
          badge: null
        },
        {
          id: 'history',
          label: 'Audit History',
          icon: History,
          badge: null
        },
        {
          id: 'overview',
          label: 'Company Overview',
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: 'settings',
          label: 'System Settings',
          icon: Settings,
          badge: null
        }
      ];
    }
  };

  const navItems = getNavItems();

  const handleItemClick = (id) => {
    onTabChange(id);
    if (onClose) onClose();
  };

  const content = (
    <div className="flex flex-col justify-between h-full p-4 bg-white dark:bg-slate-900 transition-colors duration-200">
      <div>
        {/* Mobile Header with Close button */}
        <div className="lg:hidden flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="font-bold text-navy-900 dark:text-white text-sm">Navigation Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Workspace Identifier Pill */}
        <div className="mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
              {currentRole}
            </span>
          </div>
          <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-700 dark:text-brand-300">
            Workspace
          </span>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">
            Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-900 dark:text-brand-200 shadow-xs border border-brand-200 dark:border-brand-800'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 dark:text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.badge !== null && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold border ${
                        item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-500 dark:text-brand-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Quick Hint */}
      <div className="p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-1 mt-6">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-100 font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
          <span>Active Role: {currentRole}</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
          {currentRole === 'Admin' && 'Configure company info, brand tone, facts & prohibited terms.'}
          {currentRole === 'Content Creator' && 'Draft marketing copy & verify compliance before submitting.'}
          {currentRole === 'Reviewer' && 'Inspect submitted copy, add comments & approve or request changes.'}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-col justify-between min-h-[calc(100vh-65px)] shrink-0 transition-colors duration-200">
        {content}
      </aside>

      {/* Mobile Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
            onClick={onClose}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
