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
  UserCheck,
  Shield,
  Sparkles,
  Layers
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
  const getNavItems = () => {
    if (currentRole === 'Admin') {
      return [
        {
          id: 'admin-dashboard',
          label: 'Admin Dashboard',
          icon: SlidersHorizontal,
          badge: rulesCount > 0 ? `${rulesCount} Rules` : null,
          badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800'
        },
        {
          id: 'guidelines-hub',
          label: 'Suggestion & PDF Hub',
          icon: FileText,
          badge: guidelinesCount > 0 ? `${guidelinesCount} PDFs` : null,
          badgeColor: 'bg-cyan-50 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border-cyan-200/80 dark:border-cyan-800'
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
          badge: pendingCount > 0 ? `${pendingCount} Pending` : 'Clear',
          badgeColor: pendingCount > 0
            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700 animate-pulse'
            : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
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
          badgeColor: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200/80 dark:border-indigo-800'
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
    <div className="flex flex-col justify-between h-full p-4 sm:p-5 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-r border-slate-200/80 dark:border-slate-800/80 transition-colors duration-200">
      <div>
        {/* Mobile Header with Close button */}
        <div className="lg:hidden flex items-center justify-between pb-3.5 mb-4 border-b border-slate-200 dark:border-slate-800">
          <span className="font-extrabold text-slate-900 dark:text-white text-sm">Navigation Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Persona Badge */}
        <div className="mb-5 p-3 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/80 dark:from-slate-800/60 dark:via-slate-850 dark:to-indigo-950/30 border border-indigo-100 dark:border-slate-800 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-glow-sm">
              <UserCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">
                {currentRole}
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                Active Session
              </span>
            </div>
          </div>
          <span className="text-[9px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/50">
            Live
          </span>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1.5">
          <p className="px-3 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
            Workspace Menus
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`relative w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-2xs border border-indigo-200/80 dark:border-indigo-800/80 font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-2">
                  {item.badge !== null && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold border transition-colors ${
                        item.badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role Tip Footer Card */}
      <div className="p-3.5 bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl text-xs text-slate-600 dark:text-slate-300 space-y-1.5 mt-6">
        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 font-bold text-xs">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
          <span>Governance Policy</span>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
          {currentRole === 'Admin' && 'Define brand tone, approved facts, and prohibited words.'}
          {currentRole === 'Content Creator' && 'Draft marketing copy and verify compliance before publishing.'}
          {currentRole === 'Reviewer' && 'Human governance gate. Inspect copy and approve or request changes.'}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col justify-between min-h-[calc(100vh-65px)] shrink-0 transition-colors duration-200">
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
          <div className="relative w-72 max-w-[85vw] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
}
