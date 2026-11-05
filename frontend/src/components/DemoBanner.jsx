import React from 'react';
import { AlertCircle, CheckCircle2, ArrowRight, Play, Sparkles } from 'lucide-react';

export default function DemoBanner({ onQuickTest, onRoleChange }) {
  return (
    <div className="bg-gradient-to-r from-brand-900 via-navy-900 to-brand-950 text-white px-6 py-3 border-b border-brand-800 shadow-sm">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 text-xs">
        {/* Left: Judge guidance */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-bold tracking-wide uppercase text-[11px] text-amber-300">
            Judge Interactive Guide
          </span>
          <span className="text-slate-300 hidden md:inline">|</span>
          <span className="text-slate-200 hidden md:inline">
            Fictional Demo Company: <strong className="text-white">NOVA TECH</strong>. No login needed.
          </span>
        </div>

        {/* Workflow steps visual pill */}
        <div className="hidden xl:flex items-center gap-2 text-[11px] text-slate-300">
          <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium">1. Admin Rules</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium">2. Creator Audit</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium">3. RAG Findings</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
          <span className="bg-white/10 px-2 py-0.5 rounded text-white font-medium">4. Human Approval</span>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 self-end lg:self-auto">
          <button
            onClick={onQuickTest}
            className="flex items-center gap-1.5 px-3 py-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold rounded-lg transition active:scale-95 shadow-sm text-xs"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Test Violating Content Sample</span>
          </button>
        </div>
      </div>
    </div>
  );
}
