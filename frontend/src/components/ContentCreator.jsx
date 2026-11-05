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
  AlertCircle
} from 'lucide-react';
import {
  createContentSubmission,
  updateContentSubmission,
  analyzeContentSubmission,
  submitForReview
} from '../api';

export default function ContentCreator({
  submissions,
  selectedSubmissionId,
  onSelectSubmission,
  companyId,
  onRefresh,
  onRoleChange,
  onNavigate
}) {
  const contentTypes = [
    'Advertisement',
    'Social Media Post',
    'Blog',
    'Product Description',
    'Email'
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
      if (currentSubmission.findings) {
        setAnalysisResult({
          findings: currentSubmission.findings,
          total_issues: currentSubmission.findings.length,
          mode: 'Stored Analysis'
        });
      }
    } else {
      setTitle('');
      setContentType('Advertisement');
      setContent('');
      setAnalysisResult(null);
    }
  }, [selectedSubmissionId, currentSubmission]);

  // Load sample copy with intentional violations
  const handleLoadSample = () => {
    setTitle('Q2 Cloud Platform Launch Campaign');
    setContentType('Advertisement');
    setContent(
      'Buyers can get 100% guaranteed results with our revolutionary product. This is the best technology available in the world.'
    );
    setAnalysisResult(null);
  };

  // Run AI analysis against Admin's saved rules
  const handleAnalyze = async () => {
    if (!content.trim()) {
      alert('Please enter marketing copy to analyze');
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
      await onRefresh();
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
      await onRefresh();
      alert('Submission forwarded to the Reviewer! Switching to Reviewer Queue.');
      onRoleChange('Reviewer');
      onNavigate('review-queue');
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
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  // Latest Reviewer comment if changes requested or decision made
  const latestDecision = currentSubmission?.decisions?.slice(-1)[0];
  const hasChangesRequested = currentSubmission?.status === 'Needs Changes';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
              Marketing Content Creator & AI Auditor
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
              Content Creator
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Draft marketing copy, audit compliance against Admin's saved rules, apply suggested fixes, and submit to the Reviewer.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-semibold transition active:scale-95"
            title="Load sample copy with intentional rule violations"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Load Sample Violations</span>
          </button>

          <button
            onClick={() => {
              onSelectSubmission(null);
              setTitle('');
              setContent('');
              setAnalysisResult(null);
            }}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            New Draft
          </button>
        </div>
      </div>

      {/* Reviewer Feedback Callout (Connected Loop: Creator receives Reviewer's comments!) */}
      {hasChangesRequested && latestDecision && (
        <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 shadow-xs flex items-start gap-3 text-xs">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-amber-900 text-sm">Reviewer Requested Changes</span>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded font-semibold">
                Action Required
              </span>
            </div>
            <p className="text-amber-900 font-medium leading-relaxed">
              <strong>Reviewer Comment:</strong> "{latestDecision.review_comment}"
            </p>
            <p className="text-[11px] text-amber-800">
              Please revise the problematic copy in the editor below, re-run analysis, and resubmit to the Reviewer.
            </p>
          </div>
        </div>
      )}

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Draft Editor (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Content Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q2 Product Announcement"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Content Type
                </label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                >
                  {contentTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Marketing Copy / Body
                </label>
                <span className="text-[10px] text-slate-400 font-mono">
                  {content.length} chars | {content.split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                rows={9}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write or paste your marketing copy here..."
                className="w-full p-4 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono leading-relaxed resize-y"
              />
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Info className="w-4 h-4 text-brand-600 shrink-0" />
                <span>
                  {currentSubmission?.status ? (
                    <span>
                      Status: <strong className="text-slate-800">{currentSubmission.status}</strong>
                    </span>
                  ) : (
                    'Draft (Unsubmitted)'
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !content.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Auditing against Rules...' : 'Analyse with AI'}</span>
                </button>

                <button
                  onClick={handleSubmitToReviewer}
                  disabled={isSubmittingReview || !selectedSubmissionId}
                  className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-brand-900 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95 disabled:opacity-50"
                  title="Forward revised copy to Reviewer Queue"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit to Reviewer</span>
                </button>
              </div>
            </div>
          </div>

          {/* Previous Submissions Drawer */}
          {submissions?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4">
              <p className="text-xs font-bold text-slate-700 mb-2">Previous Content Submissions</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {submissions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSubmission(s.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border shrink-0 transition ${
                      s.id === selectedSubmissionId
                        ? 'border-brand-500 bg-brand-50 text-brand-900 font-bold'
                        : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {s.title} ({s.status})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Findings & Corrections Panel (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-navy-900 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-brand-600" />
                  <span>Governance Audit Findings</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Checked against Admin's saved rules
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                {findingsList.length} Issues Found
              </span>
            </div>

            {/* Category Filter Pills */}
            <div className="flex gap-1.5 overflow-x-auto py-3 border-b border-slate-100 text-[10px]">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategoryFilter(cat)}
                  className={`px-2 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                    activeCategoryFilter === cat
                      ? 'bg-navy-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'All' ? 'All Issues' : cat.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Findings List */}
            <div className="mt-4 space-y-3 max-h-[540px] overflow-y-auto pr-1">
              {filteredFindings.length > 0 ? (
                filteredFindings.map((finding, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-brand-300 transition-all text-xs space-y-2.5 shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-slate-900 text-[11px]">
                        {finding.issue_category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                          finding.severity
                        )}`}
                      >
                        {finding.severity}
                      </span>
                    </div>

                    {/* Problematic Snippet */}
                    <div>
                      <p className="text-[10px] font-semibold text-slate-400 uppercase">
                        Problematic Text:
                      </p>
                      <div className="mt-0.5 p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-900 font-mono font-medium text-[11px]">
                        "{finding.problematic_text}"
                      </div>
                    </div>

                    {/* Explanation */}
                    <p className="text-slate-600 text-xs leading-relaxed">
                      {finding.explanation}
                    </p>

                    {/* Citation to Admin's saved rule */}
                    {finding.guideline_reference && (
                      <div className="p-2 bg-brand-50/80 border border-brand-200/80 rounded-lg text-[11px] text-brand-900">
                        <span className="font-bold block text-[10px] uppercase text-brand-700">
                          Rule Citation:
                        </span>
                        {finding.guideline_reference}
                      </div>
                    )}

                    {/* Suggested Correction with 1-Click Apply */}
                    {finding.suggested_correction && (
                      <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between gap-2">
                        <div className="truncate">
                          <span className="text-[10px] font-bold text-emerald-700 uppercase block">
                            Suggested Fix:
                          </span>
                          <span className="font-semibold text-slate-800 text-[11px] truncate block">
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
                          className="shrink-0 flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition shadow-xs active:scale-95"
                          title="Apply this suggested fix into the editor"
                        >
                          <Check className="w-3 h-3" />
                          <span>Apply</span>
                        </button>
                      </div>
                    )}

                    {/* Verification Status */}
                    <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Verification Status:</span>
                      <span className="font-medium text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {finding.verification_status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-slate-700">No issues found in this category.</p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Click "Analyse with AI" above to audit your draft against saved brand rules.
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
