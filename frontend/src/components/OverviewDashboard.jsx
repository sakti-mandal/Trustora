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
      color: 'text-brand-600 dark:text-brand-400',
      bg: 'bg-brand-50 dark:bg-brand-950/40 border-brand-200 dark:border-brand-800',
      description: 'Audited across all marketing campaigns'
    },
    {
      title: 'Approved Content',
      value: stats?.approved_content ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800',
      description: 'Verified & approved for live publication'
    },
    {
      title: 'Pending Reviews',
      value: stats?.pending_reviews ?? 0,
      icon: Clock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800',
      description: 'Awaiting human governance approval'
    },
    {
      title: 'Flagged Content',
      value: stats?.flagged_content ?? 0,
      icon: AlertTriangle,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800',
      description: 'Contains prohibited terms or unverified claims'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Pending Review':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Needs Changes':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Rejected':
        return 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-navy-900 dark:text-white tracking-tight">
            Brand Governance Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time compliance monitoring, guideline adherence, and human review pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              onRoleChange('Content Creator');
              onNavigate('creator-dashboard');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-500/20 transition active:scale-95 cursor-pointer"
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
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition hover:shadow-md flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.bg}`}>
                  <Icon className={`w-4 h-4 ${card.color}`} />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  {card.value}
                </span>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{card.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Grid: Recent Submissions & Live Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions Table (2 cols) */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-navy-900 dark:text-white">Recent Content Submissions</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Live entries from the persistent database</p>
            </div>
            <button
              onClick={() => onNavigate('creator-dashboard')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {stats?.recent_submissions?.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 uppercase font-semibold text-[10px]">
                    <th className="pb-3 font-semibold">Title</th>
                    <th className="pb-3 font-semibold">Channel</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {stats.recent_submissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group"
                    >
                      <td className="py-3 font-semibold text-slate-800 dark:text-slate-200 max-w-[200px] truncate">
                        {sub.title}
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{sub.content_type}</td>
                      <td className="py-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(
                            sub.status
                          )}`}
                        >
                          {sub.status}
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => {
                            onSelectSubmission(sub.id);
                            if (sub.status === 'Pending Review') {
                              onRoleChange('Reviewer');
                              onNavigate('reviewer-dashboard');
                            } else {
                              onRoleChange('Content Creator');
                              onNavigate('creator-dashboard');
                            }
                          }}
                          className="text-brand-600 dark:text-brand-400 font-bold hover:underline cursor-pointer"
                        >
                          Open &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-xs">
              No submissions found. Create your first draft in the Content Creator tab!
            </div>
          )}
        </div>

        {/* Live Governance Activity (1 col) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-navy-900 dark:text-white">Governance Activity</h2>
              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                Live Audit
              </span>
            </div>

            <div className="space-y-3.5">
              {stats?.recent_activity?.length > 0 ? (
                stats.recent_activity.map((act) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-brand-600 dark:bg-brand-400 mt-1.5 shrink-0" />
                    <div>
                      <p className="text-slate-800 dark:text-slate-200 font-medium leading-tight">
                        <strong>{act.action}</strong>: {act.submission_title}
                      </p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {act.created_at
                          ? new Date(act.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Recent'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500">No recent activity recorded.</p>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onNavigate('history')}
              className="w-full py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Full Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
