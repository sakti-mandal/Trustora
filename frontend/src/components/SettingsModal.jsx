import React from 'react';
import {
  Settings,
  Database,
  Cpu,
  Shield,
  Layers,
  Sparkles,
  Building,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function SettingsModal({ systemStatus, company, guidelinesCount, rulesCount }) {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
          System Architecture & Governance Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          RAG engine specifications, persistent database connection, and AI pipeline status.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: AI & RAG Configuration */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-navy-900">
            <Cpu className="w-5 h-5 text-brand-600" />
            <span>AI System & RAG Engine</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">Gemini API Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full border text-[11px] ${
                  systemStatus?.gemini_api_configured
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                {systemStatus?.gemini_api_configured ? 'Active (Gemini 2.5 Flash)' : 'Rule-Based Demo Mode'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">Vector Index Retrieval:</span>
              <span className="font-semibold text-slate-800">
                Lexical & Semantic Cosine Vector Retrieval
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">Document Chunking:</span>
              <span className="font-semibold text-slate-800">
                150-word sliding window with 30-word overlap
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">Extraction Engines:</span>
              <span className="font-semibold text-slate-800">
                pypdf & python-docx XML parser
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Database & Company Context */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-navy-900">
            <Database className="w-5 h-5 text-emerald-600" />
            <span>Persistent Database (SQLAlchemy)</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">Database Dialect:</span>
              <span className="font-bold text-slate-800">
                {systemStatus?.database || 'SQLite / PostgreSQL'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">Active Company Workspace:</span>
              <span className="font-bold text-navy-900">
                {company?.company_name || 'NOVA TECH'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">Active Brand Guidelines:</span>
              <span className="font-semibold text-slate-800">{guidelinesCount} documents</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">Active Brand Rules:</span>
              <span className="font-semibold text-slate-800">{rulesCount} active rules</span>
            </div>
          </div>
        </div>
      </div>

      {/* Project & Hackathon Meta */}
      <div className="bg-gradient-to-br from-navy-900 to-slate-900 text-white p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400">
                Hackathon Project Info
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-xs text-slate-300">CodeNexus India 2026 – Round 2</span>
            </div>
            <h3 className="text-lg font-extrabold text-white">
              TRUSTORA — AI-Powered Brand Governance Platform
            </h3>
            <p className="text-xs text-slate-300 mt-1">
              Team: <strong>REDO</strong> | Tagline: <em>Trust, Before It Goes Live.</em>
            </p>
          </div>

          <div className="text-right text-xs text-slate-400">
            <span className="inline-block px-3 py-1 bg-white/10 rounded-lg text-emerald-300 font-semibold">
              Production-Style Architecture Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
