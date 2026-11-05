import React from 'react';
import {
  FileText,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  PlusCircle,
  FileCheck
} from 'lucide-react';

export default function OverviewDashboard({
  stats,
  onNavigate,
  onSelectSubmission,
  onRoleChange
}) {
  const statCards = [
    {
      title: 'Total Submissions',
      value: stats?.total_submissions ?? 0,
      icon: FileText,
      color: 'text-brand-600',
      bg: 'bg-brand-50 border-brand-200/60',
      description: 'Audited across all marketing campaigns'
    },
    {
      title: 'Approved Content',
      value: stats?.approved_content ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 border-emerald-200/60',
      description: 'Verified & approved for live publication'
    },
    {
      title: 'Pending Reviews',
      value: stats?.pending_reviews ?? 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 border-amber-200/60',
      description: 'Awaiting human governance approval'
    },
    {
      title: 'Flagged Content',
      value: stats?.flagged_content ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50 border-rose-200/60',
      description: 'Contains prohibited terms or unverified claims'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Pending Review':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Needs Changes':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Brand Governance Overview
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time compliance monitoring, guideline adherence, and human review pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onRoleChange('Content Creator');
              onNavigate('content-review');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold shadow-sm transition active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Submission</span>
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={i}
              className={`p-5 rounded-2xl border bg-white shadow-xs transition hover:shadow-md flex flex-col justify-between`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                  {card.value}
                </span>
                <p className="text-xs text-slate-500 mt-1 font-medium">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent Submissions & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions Table (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-navy-900">Recent Content Submissions</h2>
              <p className="text-xs text-slate-500">Live entries from the persistent database</p>
            </div>
            <button
              onClick={() => onNavigate('content-review')}
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats?.recent_submissions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-semibold text-[10px]">
                    <th className="pb-3 font-semibold">Title</th>
                    <th className="pb-3 font-semibold">Channel</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {stats.recent_submissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => {
                        onSelectSubmission(sub.id);
                        if (sub.status === 'Pending Review') {
                          onRoleChange('Reviewer');
                          onNavigate('review-queue');
                        } else {
                          onRoleChange('Content Creator');
                          onNavigate('content-review');
                        }
                      }}
                    >
                      <td className="py-3.5 font-medium text-slate-900 max-w-[200px] truncate">
                        {sub.title}
                      </td>
                      <td className="py-3.5 text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium text-[11px]">
                          {sub.content_type}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                            sub.status
                          )}`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3.5 text-right font-semibold text-brand-600 group-hover:underline">
                        Open &rarr;
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No submissions recorded yet.</p>
              <button
                onClick={() => {
                  onRoleChange('Content Creator');
                  onNavigate('content-review');
                }}
                className="mt-3 text-xs font-semibold text-brand-600 hover:underline"
              >
                Create your first content submission
              </button>
            </div>
          )}
        </div>

        {/* Live Audit Activity Feed (1 col) */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-navy-900">Audit & Decision Trail</h2>
              <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                Live DB
              </span>
            </div>

            <div className="space-y-4">
              {stats?.recent_activity?.length > 0 ? (
                stats.recent_activity.slice(0, 5).map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-brand-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        {act.action}: <span className="font-normal text-slate-600">{act.submission_title}</span>
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        by {act.performed_by}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic">No recent activity logged.</p>
              )}
            </div>
          </div>

          {/* Quick Flow Guide */}
          <div className="mt-6 pt-4 border-t border-slate-100 bg-slate-50/70 p-3.5 rounded-xl border border-slate-200/60">
            <div className="flex items-center gap-1.5 text-xs font-bold text-navy-900 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Brand Governance Loop</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Upload Guidelines &rarr; Submit Copy &rarr; AI RAG Audit &rarr; Suggested Fixes &rarr; Human Approval.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
