import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Send,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Copy,
  ChevronRight,
  ShieldAlert,
  ArrowRight,
  FileCheck,
  Check,
  Zap,
  Info,
  MessageSquare,
  AlertCircle,
  UploadCloud,
  FileText,
  Megaphone,
  Share2,
  BookOpen,
  ShoppingBag,
  Mail,
  Lightbulb
} from 'lucide-react';
import {
  createContentSubmission,
  updateContentSubmission,
  analyzeContentSubmission,
  submitForReview
} from '../api';
import ComplianceScoreCard from './ComplianceScoreCard';

export default function ContentCreator({
  submissions,
  selectedSubmissionId,
  onSelectSubmission,
  companyId,
  onRefresh,
  onRoleChange,
  onNavigate,
  scoreData
}) {
  const contentTypes = [
    { label: 'Advertisement', icon: Megaphone },
    { label: 'Social Media Post', icon: Share2 },
    { label: 'Blog', icon: BookOpen },
    { label: 'Product Description', icon: ShoppingBag },
    { label: 'Email', icon: Mail }
  ];

  const currentSubmission = submissions?.find((s) => s.id === selectedSubmissionId);

  const [title, setTitle] = useState('');
  const [contentType, setContentType] = useState('Advertisement');
  const [content, setContent] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('All');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  // Sync state when selected submission changes
  useEffect(() => {
    if (currentSubmission) {
      setTitle(currentSubmission.title || '');
      setContentType(currentSubmission.content_type || 'Advertisement');
      setContent(currentSubmission.revised_content || currentSubmission.original_content || '');
      setAnalysisResult({
        findings: currentSubmission.findings || []
      });
    } else {
      setTitle('');
      setContentType('Advertisement');
      setContent('');
      setAnalysisResult(null);
    }
  }, [selectedSubmissionId, currentSubmission]);

  // Load sample marketing copy with intentional rule violations
  const handleLoadSample = () => {
    setTitle('Q3 Enterprise Launch Campaign - Cloud Native');
    setContentType('Advertisement');
    setContent(
      "Our revolutionary enterprise platform is the best technology available in the world! " +
      "We offer 100% guaranteed results for all buyers with zero downtime risk. " +
      "Upgrade today to achieve unmatched growth immediately."
    );
    setAnalysisResult(null);
  };

  // Run AI Governance Analysis against Admin rules
  const handleAnalyze = async () => {
    if (!content.trim()) {
      alert('Please enter or paste some content before analyzing.');
      return;
    }

    setIsAnalyzing(true);
    try {
      let subId = selectedSubmissionId;
      if (!subId) {
        const created = await createContentSubmission({
          company_id: companyId,
          title: title || 'New Marketing Campaign Draft',
          content_type: contentType,
          original_content: content,
          submitted_by: 2
        });
        subId = created.id;
        onSelectSubmission(subId);
      } else {
        await updateContentSubmission(subId, {
          title: title,
          revised_content: content
        });
      }

      const res = await analyzeContentSubmission(subId);
      setAnalysisResult(res);
      await onRefresh(subId);
    } catch (err) {
      alert(err.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // One-click Apply Correction into editor
  const handleApplyCorrection = (problematicText, suggestedCorrection) => {
    if (!problematicText || !suggestedCorrection) return;
    const updated = content.replace(problematicText, suggestedCorrection);
    setContent(updated);
  };

  // Submit analysed copy to the Reviewer
  const handleSubmitToReviewer = async () => {
    if (!selectedSubmissionId) {
      alert('Please analyze and save your draft first');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await updateContentSubmission(selectedSubmissionId, {
        revised_content: content
      });
      await submitForReview(selectedSubmissionId);
      await onRefresh(selectedSubmissionId);
      alert('Content successfully submitted for review! It is now pending approval in the Human Review Gate.');
    } catch (err) {
      alert('Failed to submit for review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const categories = [
    'All',
    'Brand Tone Mismatch',
    'Prohibited Terminology',
    'Missing Required Terminology',
    'Unsupported or Unverified Claims',
    'Inconsistent Brand Information',
    'Grammar and Readability Suggestions'
  ];

  const findingsList = analysisResult?.findings || currentSubmission?.findings || [];
  const filteredFindings =
    activeCategoryFilter === 'All'
      ? findingsList
      : findingsList.filter((f) => f.issue_category === activeCategoryFilter);

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'High':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Medium':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    }
  };

  const latestDecision = currentSubmission?.decisions?.slice(-1)[0];
  const hasChangesRequested = currentSubmission?.status === 'Needs Changes';

  return (
    <div className="space-y-6">
      {/* Top Banner Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Content Studio & AI Auditor
            </h1>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80">
              Creator Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Craft marketing copy, audit brand tone & terminology against approved guidelines in real-time, apply 1-click suggested corrections, and request human review.
          </p>
        </div>

        {/* Quick Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigate && (
            <button
              onClick={() => onNavigate('guidelines-hub')}
              className="flex items-center gap-2 px-3.5 py-2 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
            >
              <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Upload Suggestion PDF</span>
            </button>
          )}

          <button
            onClick={handleLoadSample}
            className="flex items-center gap-2 px-3.5 py-2 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 rounded-2xl text-xs font-bold transition active:scale-95 cursor-pointer shadow-2xs"
            title="Load sample copy with intentional rule violations"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Load Sample Violations</span>
          </button>

          <button
            onClick={() => {
              onSelectSubmission(null);
              setTitle('');
              setContent('');
              setAnalysisResult(null);
            }}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition cursor-pointer shadow-2xs"
          >
            New Draft
          </button>
        </div>
      </div>

      {/* PROMINENT BRAND COMPLIANCE SCORE METER CARD */}
      <ComplianceScoreCard
        scoreData={scoreData}
        currentRole="Content Creator"
        onRefresh={() => onRefresh(selectedSubmissionId)}
      />

      {/* Reviewer Feedback Banner if Changes Requested */}
      {hasChangesRequested && latestDecision && (
        <div className="p-5 rounded-3xl bg-amber-50/90 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700/80 shadow-glow-amber/20 flex items-start gap-3.5 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-amber-950 dark:text-amber-200 text-sm">Reviewer Requested Changes</span>
              <span className="text-[10px] bg-amber-200/80 dark:bg-amber-800 text-amber-900 dark:text-amber-100 px-2 py-0.5 rounded-full font-bold">
                Action Required
              </span>
            </div>
            <p className="text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
              <strong>Reviewer Comment:</strong> "{latestDecision.review_comment}"
            </p>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 font-medium">
              Please revise the problematic copy in the editor below, re-run analysis, and resubmit to the Reviewer.
            </p>
          </div>
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Studio Copy Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 space-y-5">
            
            {/* Title & Channel Selector */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                  Content Title / Campaign Name
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q3 Enterprise Cloud Launch Announcement"
                  className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 dark:text-white transition"
                />
              </div>

              {/* Channel Selector Chips */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                  Target Marketing Channel
                </label>
                <div className="flex flex-wrap gap-2">
                  {contentTypes.map((t) => {
                    const Icon = t.icon;
                    const isSelected = contentType === t.label;
                    return (
                      <button
                        key={t.label}
                        type="button"
                        onClick={() => setContentType(t.label)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-glow-sm'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Copy Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px]">
                  Draft Marketing Copy / Body
                </label>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {content.length} characters | {content.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write or paste marketing copy here... You can also click 'Load Sample Violations' above to test the AI governance detection."
                className="w-full p-4 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono leading-relaxed resize-y text-slate-900 dark:text-white transition"
              />
            </div>

            {/* Editor Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                <span>
                  {currentSubmission?.status ? (
                    <span>
                      Status: <strong className="text-slate-900 dark:text-white font-bold">{currentSubmission.status}</strong>
                    </span>
                  ) : (
                    'Draft (Unsubmitted)'
                  )}
                </span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !content.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl text-xs font-extrabold shadow-glow-sm hover:shadow-glow-md active:scale-95 transition disabled:opacity-50 cursor-pointer"
                >
                  <Sparkles className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Auditing Against Rules...' : 'Analyse with AI'}</span>
                </button>

                <button
                  onClick={handleSubmitToReviewer}
                  disabled={isSubmittingReview || !selectedSubmissionId}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-emerald-600 hover:bg-slate-800 dark:hover:bg-emerald-700 text-white rounded-2xl text-xs font-extrabold shadow-sm active:scale-95 transition disabled:opacity-50 cursor-pointer"
                  title="Forward copy to Reviewer Queue"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit to Reviewer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Previous Submissions Drawer */}
          {submissions?.length > 0 && (
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-5">
              <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[10px] mb-2.5">
                Saved Campaign Submissions
              </p>
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {submissions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSubmission(s.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-bold border shrink-0 transition cursor-pointer ${
                      s.id === selectedSubmissionId
                        ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200 shadow-glow-sm'
                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {s.title} ({s.status})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Findings & Diagnostics (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <span>Governance Audit Findings</span>
                </h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                  Checked against Admin's rules & guideline PDFs
                </p>
              </div>
              <span className="text-xs font-black px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {findingsList.length} Issues
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto py-3 border-b border-slate-100 dark:border-slate-800 text-[10px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                    activeCategoryFilter === cat
                      ? 'bg-indigo-600 text-white shadow-glow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat === 'All' ? 'All Issues' : cat.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Findings Cards List */}
            <div className="mt-4 space-y-3.5 max-h-[560px] overflow-y-auto pr-1">
              {filteredFindings.length > 0 ? (
                filteredFindings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-850 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all text-xs space-y-3 shadow-2xs group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                        {finding.issue_category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                          finding.severity
                        )}`}
                      >
                        {finding.severity} Severity
                      </span>
                    </div>

                    {/* Problematic Snippet Highlight */}
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        Detected Problematic Text:
                      </p>
                      <div className="mt-1 p-2.5 bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-900 dark:text-rose-200 font-mono font-medium text-xs">
                        "{finding.problematic_text}"
                      </div>
                    </div>

                    {/* Explanation */}
                    <div className="flex items-start gap-1.5 text-slate-600 dark:text-slate-300 text-xs leading-relaxed">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{finding.explanation}</span>
                    </div>

                    {/* Citation to Admin's saved rule */}
                    {finding.guideline_reference && (
                      <div className="p-2.5 bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800 rounded-xl text-[11px] text-indigo-950 dark:text-indigo-200">
                        <span className="font-bold block text-[10px] uppercase text-indigo-700 dark:text-indigo-300">
                          Rule Citation:
                        </span>
                        {finding.guideline_reference}
                      </div>
                    )}

                    {/* Suggested Correction with 1-Click Apply */}
                    {finding.suggested_correction && (
                      <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/80 flex items-center justify-between gap-2">
                        <div className="truncate">
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                            Suggested Fix:
                          </span>
                          <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate block">
                            {finding.suggested_correction}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            handleApplyCorrection(
                              finding.problematic_text,
                              finding.suggested_correction
                            )
                          }
                          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-glow-emerald/30 active:scale-95 cursor-pointer"
                          title="Apply this suggested fix directly into the editor"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Apply Fix</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="py-14 text-center text-slate-400 dark:text-slate-500 text-xs space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-glow-emerald/30">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {content.trim() ? '100% Brand Compliant!' : 'Ready for AI Governance Audit'}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                    {content.trim()
                      ? 'No brand guideline violations detected in this draft.'
                      : 'Write your copy and click "Analyse with AI" to check compliance.'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
