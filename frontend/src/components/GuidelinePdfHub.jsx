import React, { useState, useEffect, useRef } from 'react';
import {
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  FileCheck,
  AlertCircle,
  Eye,
  Sparkles,
  Layers,
  Download,
  X,
  PlusCircle,
  HelpCircle
} from 'lucide-react';
import { fetchGuidelines, uploadGuidelineFile, deleteGuideline, createBrandRule } from '../api';

export default function GuidelinePdfHub({
  companyId = 1,
  currentRole = 'Admin',
  onRulesUpdated
}) {
  const [guidelines, setGuidelines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [previewText, setPreviewText] = useState(null);
  const [suggestedRules, setSuggestedRules] = useState([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [adoptedRuleIds, setAdoptedRuleIds] = useState(new Set());
  const fileInputRef = useRef(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchGuidelines(companyId);
      setGuidelines(data || []);
      if (data?.length > 0 && !selectedDoc) {
        setSelectedDoc(data[0]);
      }
    } catch (e) {
      console.error('Failed to load guidelines:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [companyId]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExts = ['.pdf', '.docx', '.doc', '.txt', '.md'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExts.includes(fileExt)) {
      setUploadError(`Unsupported file format. Please upload PDF, DOCX, or TXT.`);
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await uploadGuidelineFile(file, companyId);
      await loadData();
      setSelectedDoc(res);
      // Auto-extract candidate suggestions
      extractRulesFromText(res.extracted_text, res.document_name);
    } catch (err) {
      setUploadError(err.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document from the governance index?')) return;
    try {
      await deleteGuideline(id);
      await loadData();
      if (selectedDoc?.id === id) {
        setSelectedDoc(null);
        setSuggestedRules([]);
      }
    } catch (e) {
      alert('Failed to delete document');
    }
  };

  // Extract candidate suggestions / rules from text
  const extractRulesFromText = (text, docName) => {
    if (!text) return;
    setIsExtracting(true);
    const candidates = [];

    const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 15);

    // Look for tone, prohibited, facts, requirements patterns
    lines.forEach((line, idx) => {
      const lower = line.lower ? line.lower() : line.toLowerCase();
      if (
        lower.includes('tone') ||
        lower.includes('voice') ||
        lower.includes('style') ||
        lower.includes('professional') ||
        lower.includes('friendly')
      ) {
        candidates.push({
          id: `tone-${idx}`,
          category: 'brand_tone',
          label: 'Brand Tone Rule',
          text: line.length > 200 ? line.substring(0, 197) + '...' : line,
          source: docName
        });
      } else if (
        lower.includes('do not') ||
        lower.includes('never') ||
        lower.includes('prohibited') ||
        lower.includes('avoid') ||
        lower.includes('guarantee')
      ) {
        candidates.push({
          id: `prohibit-${idx}`,
          category: 'prohibited_terms',
          label: 'Prohibited Term / Practice',
          text: line.length > 200 ? line.substring(0, 197) + '...' : line,
          source: docName
        });
      } else if (
        lower.includes('uptime') ||
        lower.includes('sla') ||
        lower.includes('customers') ||
        lower.includes('founded') ||
        lower.includes('percent') ||
        lower.includes('%') ||
        lower.includes('certified')
      ) {
        candidates.push({
          id: `fact-${idx}`,
          category: 'approved_facts',
          label: 'Approved Company Fact',
          text: line.length > 200 ? line.substring(0, 197) + '...' : line,
          source: docName
        });
      }
    });

    // Pick top unique candidates
    const unique = candidates.slice(0, 6);
    setSuggestedRules(unique);
    setIsExtracting(false);
  };

  const handleAdoptRule = async (candidate) => {
    try {
      await createBrandRule({
        company_id: companyId,
        category: candidate.category,
        rule_text: candidate.text,
        severity: 'High'
      });
      setAdoptedRuleIds((prev) => new Set(prev).add(candidate.id));
      if (onRulesUpdated) onRulesUpdated();
      alert(`Adopted rule into active governance: "${candidate.label}"`);
    } catch (e) {
      alert('Failed to save rule');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-navy-900 dark:text-white tracking-tight">
              Suggestion & Guideline PDF Hub
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700">
              Universal Access
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Upload company brand guidelines, suggestion briefs, campaign reference PDFs, or style manuals. TRUSTORA extracts document text, division chunks, and candidate brand rules for automatic governance.
          </p>
        </div>

        {/* Upload Trigger Button */}
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,.docx,.doc,.txt,.md"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20 active:scale-95 transition cursor-pointer disabled:opacity-50"
          >
            <Upload className={`w-4 h-4 ${isUploading ? 'animate-bounce' : ''}`} />
            <span>{isUploading ? 'Extracting PDF Text...' : 'Upload Suggestion / Guideline PDF'}</span>
          </button>
        </div>
      </div>

      {uploadError && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Main Grid: Uploaded Documents vs Extracted Details */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Uploaded Documents List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Uploaded Documents ({guidelines.length})</span>
              </h2>
              <span className="text-[10px] text-slate-400 dark:text-slate-500">PDF, DOCX, TXT</span>
            </div>

            {/* Drag & Drop Quick Dropzone */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 dark:border-slate-700 hover:border-brand-500 dark:hover:border-brand-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-slate-800/40 group"
            >
              <Upload className="w-6 h-6 mx-auto text-slate-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition mb-1" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                Click or Drop PDF here to upload
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                Processed automatically into RAG governance index
              </p>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {guidelines.length > 0 ? (
                guidelines.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => {
                        setSelectedDoc(doc);
                        extractRulesFromText(doc.extracted_text, doc.document_name);
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-brand-50/70 dark:bg-brand-950/40 border-brand-300 dark:border-brand-800 shadow-2xs'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 dark:text-slate-100 truncate">
                            {doc.document_name}
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mt-0.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>Indexed ({doc.extracted_text ? Math.round(doc.extracted_text.length / 100) : 0} chunks)</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewText(doc.extracted_text);
                          }}
                          className="p-1.5 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="View extracted text"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc.id);
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Delete document"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                  No guideline documents uploaded yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Document Details & AI Rule Suggestions */}
        <div className="lg:col-span-7 space-y-4">
          {selectedDoc ? (
            <div className="space-y-4">
              {/* Document Overview Card */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Active Guideline Document
                    </span>
                    <h3 className="text-base font-extrabold text-navy-900 dark:text-white">
                      {selectedDoc.document_name}
                    </h3>
                  </div>

                  <button
                    onClick={() => setPreviewText(selectedDoc.extracted_text)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-semibold text-xs transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Extracted Content</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-1">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">
                    Governance Status: Fully Ingested & Active
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    All marketing copy submitted in the Content Creator workspace is automatically verified against the text in this document.
                  </p>
                </div>
              </div>

              {/* AI Extracted Rule Suggestions from PDF */}
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                    <h3 className="text-sm font-bold text-navy-900 dark:text-white">
                      Candidate Rules Extracted from this PDF
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    One-click add to system
                  </span>
                </div>

                <div className="space-y-2.5">
                  {suggestedRules.length > 0 ? (
                    suggestedRules.map((item) => {
                      const isAdopted = adoptedRuleIds.has(item.id);
                      return (
                        <div
                          key={item.id}
                          className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/60 flex items-start justify-between gap-3 text-xs"
                        >
                          <div className="space-y-1 min-w-0">
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700">
                              {item.label}
                            </span>
                            <p className="text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
                              "{item.text}"
                            </p>
                          </div>

                          <button
                            onClick={() => handleAdoptRule(item)}
                            disabled={isAdopted}
                            className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition active:scale-95 ${
                              isAdopted
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                                : 'bg-brand-600 hover:bg-brand-700 text-white cursor-pointer'
                            }`}
                          >
                            {isAdopted ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Adopted</span>
                              </>
                            ) : (
                              <>
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>Adopt Rule</span>
                              </>
                            )}
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 dark:text-slate-500">
                      {isExtracting
                        ? 'Extracting candidate rules from document...'
                        : 'No candidate rules extracted yet. Select a document above to inspect.'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center text-slate-400 dark:text-slate-500 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              Upload or select a suggestion/guideline PDF to view extracted content and rules.
            </div>
          )}
        </div>

      </div>

      {/* Extracted Text Modal */}
      {previewText && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 max-w-3xl w-full p-6 shadow-2xl flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-brand-600" />
                <span>Extracted Document Text</span>
              </h3>
              <button
                onClick={() => setPreviewText(null)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 font-mono text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed border border-slate-200 dark:border-slate-800">
              {previewText}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setPreviewText(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
