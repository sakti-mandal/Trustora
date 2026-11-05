import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  Plus,
  Edit2,
  Check,
  X,
  Eye,
  Shield,
  AlertOctagon,
  Sparkles,
  BookOpen,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { uploadGuidelineFile, deleteGuideline, createBrandRule, updateBrandRule, deleteBrandRule } from '../api';

export default function BrandGuidelines({
  guidelines,
  rules,
  companyId,
  onRefresh,
  systemStatus
}) {
  const [activeTab, setActiveTab] = useState('rules'); // 'rules' | 'documents'
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Rule creation modal / inline state
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [newRule, setNewRule] = useState({
    rule_type: 'Prohibited Term',
    rule_description: '',
    rule_value: '',
    severity: 'High'
  });

  const ruleTypeOptions = [
    'Prohibited Term',
    'Preferred Term',
    'Brand Tone',
    'Approved Fact',
    'Communication Standard'
  ];

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError('');
    try {
      await uploadGuidelineFile(file, companyId);
      await onRefresh();
    } catch (err) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteGuideline = async (id) => {
    if (!window.confirm('Are you sure you want to delete this guideline document?')) return;
    try {
      await deleteGuideline(id);
      if (selectedDoc?.id === id) setSelectedDoc(null);
      await onRefresh();
    } catch (err) {
      alert('Failed to delete guideline');
    }
  };

  const handleSaveRule = async () => {
    if (!newRule.rule_description.trim()) {
      alert('Rule description is required');
      return;
    }
    try {
      if (editingRuleId) {
        await updateBrandRule(editingRuleId, newRule);
      } else {
        await createBrandRule({ ...newRule, company_id: companyId });
      }
      setIsAddingRule(false);
      setEditingRuleId(null);
      setNewRule({
        rule_type: 'Prohibited Term',
        rule_description: '',
        rule_value: '',
        severity: 'High'
      });
      await onRefresh();
    } catch (err) {
      alert('Failed to save rule');
    }
  };

  const handleEditRule = (rule) => {
    setNewRule({
      rule_type: rule.rule_type,
      rule_description: rule.rule_description,
      rule_value: rule.rule_value || '',
      severity: rule.severity || 'Medium'
    });
    setEditingRuleId(rule.id);
    setIsAddingRule(true);
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Delete this brand rule?')) return;
    try {
      await deleteBrandRule(id);
      await onRefresh();
    } catch (err) {
      alert('Failed to delete rule');
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
              Brand Guidelines & Rules Engine
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
              Admin Workspace
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage company guidelines, approved facts, prohibited terminology, and tone guardrails.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeTab === 'rules'
                ? 'bg-white text-navy-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Brand Rules ({rules?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeTab === 'documents'
                ? 'bg-white text-navy-900 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Guidelines Documents ({guidelines?.length || 0})
          </button>
        </div>
      </div>

      {/* TAB 1: BRAND RULES */}
      {activeTab === 'rules' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-navy-900">Configured Brand Governance Rules</h2>
              <p className="text-xs text-slate-500">
                Deterministic rules checked alongside RAG vector retrieval.
              </p>
            </div>
            {!isAddingRule && (
              <button
                onClick={() => {
                  setEditingRuleId(null);
                  setNewRule({
                    rule_type: 'Prohibited Term',
                    rule_description: '',
                    rule_value: '',
                    severity: 'High'
                  });
                  setIsAddingRule(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-navy-900 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Rule</span>
              </button>
            )}
          </div>

          {/* Add / Edit Rule Form */}
          {isAddingRule && (
            <div className="bg-slate-50 border border-slate-300 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                <h3 className="text-sm font-bold text-slate-900">
                  {editingRuleId ? 'Edit Brand Rule' : 'Add New Brand Rule'}
                </h3>
                <button
                  onClick={() => setIsAddingRule(false)}
                  className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Rule Category</label>
                  <select
                    value={newRule.rule_type}
                    onChange={(e) => setNewRule({ ...newRule, rule_type: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {ruleTypeOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Rule Value / Target Term(s)
                  </label>
                  <input
                    type="text"
                    value={newRule.rule_value}
                    onChange={(e) => setNewRule({ ...newRule, rule_value: e.target.value })}
                    placeholder="e.g. 100% guaranteed results, or buyer -> customer"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Use comma to separate terms or 'old -&gt; new' for terminology replacements
                  </span>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Violation Severity</label>
                  <select
                    value={newRule.severity}
                    onChange={(e) => setNewRule({ ...newRule, severity: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="High">High (Legal / Critical Violation)</option>
                    <option value="Medium">Medium (Brand Standard Mismatch)</option>
                    <option value="Low">Low (Stylistic / Suggestion)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-xs">
                  Rule Description & Policy Context
                </label>
                <textarea
                  rows={2}
                  value={newRule.rule_description}
                  onChange={(e) => setNewRule({ ...newRule, rule_description: e.target.value })}
                  placeholder="e.g. Do not use the phrase '100% guaranteed results'. Absolute guarantees are legally prohibited."
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setIsAddingRule(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveRule}
                  className="px-4 py-1.5 text-xs font-bold text-white bg-navy-900 hover:bg-brand-900 rounded-xl transition shadow-xs"
                >
                  Save Rule
                </button>
              </div>
            </div>
          )}

          {/* Rules List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {rules?.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {rules.map((r) => (
                  <div
                    key={r.id}
                    className="p-4 hover:bg-slate-50/60 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1 max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-navy-900 text-sm">
                          {r.rule_type}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
                            r.severity
                          )}`}
                        >
                          {r.severity}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{r.rule_description}</p>
                      {r.rule_value && (
                        <p className="text-slate-500 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded inline-block">
                          Target: {r.rule_value}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        onClick={() => handleEditRule(r)}
                        className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                        title="Edit rule"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteRule(r.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                        title="Delete rule"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                No brand rules configured yet. Click "Add Rule" to get started.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GUIDELINES DOCUMENTS */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Upload Dropzone */}
          <div className="bg-white border-2 border-dashed border-slate-300 hover:border-brand-500 transition-colors rounded-2xl p-8 text-center">
            <UploadCloud className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-800">
              Upload Approved Brand Guidelines Document
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Supports <strong>PDF</strong> and <strong>DOCX</strong>. The document will be extracted,
              chunked, and indexed for semantic vector retrieval via RAG.
            </p>

            <label className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-navy-900 hover:bg-brand-900 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition active:scale-95">
              <span>{isUploading ? 'Extracting & Indexing...' : 'Select PDF or DOCX File'}</span>
              <input
                type="file"
                accept=".pdf,.docx,.doc,.txt,.md"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="hidden"
              />
            </label>

            {uploadError && (
              <p className="mt-3 text-xs text-rose-600 font-semibold">{uploadError}</p>
            )}
          </div>

          {/* Uploaded Documents List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <h3 className="text-sm font-bold text-navy-900 mb-3">
                Uploaded Guideline Files ({guidelines?.length || 0})
              </h3>
              <div className="space-y-2">
                {guidelines?.map((doc) => {
                  const isSelected = selectedDoc?.id === doc.id;
                  return (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition flex items-center justify-between ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/70 shadow-xs font-semibold'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                        <span className="truncate text-slate-800">{doc.document_name}</span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteGuideline(doc.id);
                        }}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Delete Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Extracted Text & Chunk Preview */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              {selectedDoc || guidelines?.[0] ? (
                (() => {
                  const currentDoc = selectedDoc || guidelines[0];
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">
                            {currentDoc.document_name}
                          </h4>
                          <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                            Indexed in RAG Vector Store
                          </span>
                        </div>
                        <span className="text-xs text-slate-400">
                          Uploaded: {new Date(currentDoc.upload_date).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="text-xs">
                        <label className="font-semibold text-slate-700 block mb-1">
                          Extracted Guideline Text (Source of Truth for AI Verification):
                        </label>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-[11px] leading-relaxed text-slate-700 max-h-96 overflow-y-auto whitespace-pre-wrap">
                          {currentDoc.extracted_text || 'No text extracted.'}
                        </div>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  Select an uploaded document to inspect extracted text and RAG chunks.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
