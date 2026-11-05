import React from 'react';
import { ShieldCheck, Sparkles, Building2, UserCheck, Bell, RefreshCw, Zap } from 'lucide-react';

export default function Navbar({
  currentRole,
  onRoleChange,
  company,
  systemStatus,
  onLoadDemo,
  isDemoLoading
}) {
  const roles = [
    { id: 'Admin', label: 'Admin', desc: 'Brand Guidelines & Rules' },
    { id: 'Content Creator', label: 'Content Creator', desc: 'Draft & AI Audit' },
    { id: 'Reviewer', label: 'Reviewer', desc: 'Human Approval Queue' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 px-6 py-3">
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

        {/* Center: Company Selector & Demo Data Loader */}
        <div className="flex items-center gap-3">
          {/* Active Company Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-brand-600" />
            <span>{company?.company_name || 'NOVA TECH'}</span>
            <span className="text-[10px] font-normal text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              Demo Company
            </span>
          </div>

          {/* Quick Load Demo Data Button */}
          <button
            onClick={onLoadDemo}
            disabled={isDemoLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition shadow-sm active:scale-95 disabled:opacity-50"
            title="Reset or Load NOVA TECH Demo Data with Guidelines & Rules"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isDemoLoading ? 'animate-spin' : ''}`} />
            <span>{isDemoLoading ? 'Loading Demo...' : 'Load Demo Data'}</span>
          </button>
        </div>

        {/* Right: Role Switcher & User Profile */}
        <div className="flex items-center gap-3">
          {/* Role Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {roles.map((r) => {
              const active = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => onRoleChange(r.id)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
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

          {/* AI Mode Badge */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium border bg-slate-50 text-slate-600 border-slate-200">
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>
              {systemStatus?.gemini_api_configured
                ? 'Gemini RAG Active'
                : 'Rule-Based Demo Mode'}
            </span>
          </div>

          {/* Active Persona Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-600 to-navy-900 text-white flex items-center justify-center text-xs font-bold shadow-inner">
              {currentRole === 'Admin' ? 'SC' : currentRole === 'Content Creator' ? 'MR' : 'ER'}
            </div>
            <div className="hidden xl:block text-left text-xs leading-tight">
              <p className="font-semibold text-slate-800">
                {currentRole === 'Admin' ? 'Sarah Chen' : currentRole === 'Content Creator' ? 'Marcus R.' : 'Elena Rostova'}
              </p>
              <p className="text-[10px] text-slate-500 font-medium">{currentRole}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
