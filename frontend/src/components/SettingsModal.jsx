import React from 'react';
import {
  Settings,
  Database,
  Cpu,
  Shield,
  Layers,
  Building,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function SettingsModal({ systemStatus, company, rulesCount }) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-2xl font-black text-navy-900 dark:text-white tracking-tight">
          System Architecture & Governance Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Governance engine specifications, persistent database connection, and AI pipeline status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: AI & Governance Engine */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-navy-900 dark:text-white">
            <Cpu className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>AI Governance & RAG Engine</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Gemini AI Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full border text-[11px] ${
                  systemStatus?.gemini_api_configured
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                }`}
              >
                {systemStatus?.gemini_api_configured ? 'Active (Gemini 2.5 Flash)' : 'Rule-Based Demo Mode'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Rule Engine:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Deterministic Policy & Regex Matcher
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Unverified Claim Detection:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Verified against Admin's Approved Facts
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Active Governance Rules:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {rulesCount} rules loaded
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Database & Architecture */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-navy-900 dark:text-white">
            <Database className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <span>Company Workspace & Database</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Active Organization:</span>
              <span className="font-bold text-navy-900 dark:text-white">
                {company?.company_name || 'NOVA TECH'} (ID #{company?.id || 1})
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Database Engine:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                SQLite 3 (Persistent relational store)
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Governance Enforcement:</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                Connected Role-Based Human Workflow
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Organization Domain ID:</span>
              <span className="font-mono font-bold text-violet-600 dark:text-violet-400">
                @{company?.email_domain || 'novatech.io'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <span className="text-slate-600 dark:text-slate-300 font-medium">Theme Mode:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Light & Dark Mode Enabled
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
