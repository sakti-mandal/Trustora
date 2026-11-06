import React, { useState } from 'react';
import {
  Building2,
  SlidersHorizontal,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Shield,
  MessageSquare,
  Sparkles,
  FileCheck2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Info,
  FileText,
  UploadCloud,
  Layers,
  Search
} from 'lucide-react';
import { updateCompany, createBrandRule, updateBrandRule, deleteBrandRule } from '../api';
import ComplianceScoreCard from './ComplianceScoreCard';

export default function BrandRulesAdmin({
  company,
  rules,
  companyId,
  onRefresh,
  scoreData,
  onNavigate
}) {
  // Company Configuration State
  const [compName, setCompName] = useState(company?.company_name || 'NOVA TECH');
  const [compIndustry, setCompIndustry] = useState(company?.industry || 'Enterprise Cloud & AI Solutions');
  const [compDesc, setCompDesc] = useState(
    company?.description || 'NOVA TECH provides secure, enterprise-grade cloud intelligence and governance platforms for modern organizations.'
  );
  const [isSavingComp, setIsSavingComp] = useState(false);
  const [compSavedSuccess, setCompSavedSuccess] = useState(false);

  // Search & Filter
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Rule Form State
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState(null);
  const [ruleForm, setRuleForm] = useState({
    rule_type: 'Brand Tone',
    rule_description: '',
    rule_value: '',
    severity: 'High'
  });

  const ruleTypeOptions = [
    'Brand Tone',
    'Approved Fact',
    'Prohibited Term',
    'Preferred Term',
    'Communication Standard'
  ];

  // Save Company Information
  const handleSaveCompany = async (e) => {
    e.preventDefault();
    setIsSavingComp(true);
    setCompSavedSuccess(false);
    try {
      await updateCompany(companyId, {
        company_name: compName,
        industry: compIndustry,
        description: compDesc
      });
      setCompSavedSuccess(true);
      setTimeout(() => setCompSavedSuccess(false), 3000);
      await onRefresh();
    } catch (err) {
      alert('Failed to update company configuration');
    } finally {
      setIsSavingComp(false);
    }
  };

  // Save or Update Brand Rule
  const handleSaveRule = async () => {
    if (!ruleForm.rule_description.trim()) {
      alert('Please provide a rule description or text');
      return;
    }

    try {
      if (editingRuleId) {
        await updateBrandRule(editingRuleId, {
          rule_type: ruleForm.rule_type,
          rule_description: ruleForm.rule_description,
          rule_value: ruleForm.rule_value,
          severity: ruleForm.severity
        });
      } else {
        await createBrandRule({
          company_id: companyId,
          rule_type: ruleForm.rule_type,
          rule_description: ruleForm.rule_description,
          rule_value: ruleForm.rule_value,
          severity: ruleForm.severity
        });
      }
      setIsAddingRule(false);
      setEditingRuleId(null);
      setRuleForm({
        rule_type: 'Brand Tone',
        rule_description: '',
        rule_value: '',
        severity: 'High'
      });
      await onRefresh();
    } catch (err) {
      alert('Failed to save brand rule');
    }
  };

  // Delete Rule
  const handleDeleteRule = async (id) => {
    if (!window.confirm('Are you sure you want to delete this brand rule?')) return;
    try {
      await deleteBrandRule(id);
      await onRefresh();
    } catch (err) {
      alert('Failed to delete rule');
    }
  };

  // Edit existing rule
  const handleEditClick = (rule) => {
    setEditingRuleId(rule.id);
    setRuleForm({
      rule_type: rule.rule_type || 'Brand Tone',
      rule_description: rule.rule_description || '',
      rule_value: rule.rule_value || '',
      severity: rule.severity || 'High'
    });
    setIsAddingRule(true);
  };

  const filteredRules = rules.filter((r) => {
    const matchesCategory = categoryFilter === 'All' || r.rule_type === categoryFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      (r.rule_description && r.rule_description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (r.rule_value && r.rule_value.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'High':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Medium':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Low':
        return 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-6 sm:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Brand Governance & Admin Console
            </h1>
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/80 dark:border-indigo-800/80">
              Admin Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Configure company identity, define tone rules, approved facts, preferred and prohibited terms, and oversee organization-wide governance compliance.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {onNavigate && (
            <button
              onClick={() => onNavigate('guidelines-hub')}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100/90 dark:bg-slate-800/90 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold transition shadow-2xs active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Suggestion & PDF Hub</span>
            </button>
          )}

          <button
            onClick={() => {
              setEditingRuleId(null);
              setRuleForm({
                rule_type: 'Brand Tone',
                rule_description: '',
                rule_value: '',
                severity: 'High'
              });
              setIsAddingRule(true);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl text-xs font-extrabold transition shadow-glow-sm hover:shadow-glow-md active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand Rule</span>
          </button>
        </div>
      </div>

      {/* PROMINENT BRAND COMPLIANCE SCORE METER CARD (Admin Company Average) */}
      <ComplianceScoreCard
        scoreData={scoreData}
        currentRole="Admin"
        onRefresh={onRefresh}
      />

      {/* 1. COMPANY INFORMATION CONFIGURATION */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 sm:p-7">
        <div className="flex items-center justify-between mb-5 pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Organization Profile & Brand Identity</h2>
          </div>
          {compSavedSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved to Database</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveCompany} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">Company Name</label>
              <input
                type="text"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-semibold transition"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">Industry Sector</label>
              <input
                type="text"
                value={compIndustry}
                onChange={(e) => setCompIndustry(e.target.value)}
                className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-semibold transition"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
              Brand Mission & Communication Standards Overview
            </label>
            <textarea
              rows={3}
              value={compDesc}
              onChange={(e) => setCompDesc(e.target.value)}
              className="w-full p-4 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium leading-relaxed transition"
              placeholder="Describe the company's core mission, audience expectations, and communication principles..."
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSavingComp}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingComp ? 'Saving Profile...' : 'Save Organization Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. RULE CREATION / EDITING CARD */}
      {isAddingRule && (
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl border-2 border-indigo-500 dark:border-indigo-600 shadow-xl p-6 sm:p-7 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>{editingRuleId ? 'Edit Brand Rule' : 'Create New Brand Governance Rule'}</span>
            </h3>
            <button
              onClick={() => {
                setIsAddingRule(false);
                setEditingRuleId(null);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">Rule Category</label>
                <select
                  value={ruleForm.rule_type}
                  onChange={(e) => setRuleForm({ ...ruleForm, rule_type: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-semibold"
                >
                  {ruleTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">Violation Severity</label>
                <select
                  value={ruleForm.severity}
                  onChange={(e) => setRuleForm({ ...ruleForm, severity: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-semibold"
                >
                  <option value="High">High (Strict Flagging & Review Required)</option>
                  <option value="Medium">Medium (Correction Strongly Recommended)</option>
                  <option value="Low">Low (Advisory Suggestion)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                Rule Definition / Description
              </label>
              <textarea
                rows={2}
                value={ruleForm.rule_description}
                onChange={(e) => setRuleForm({ ...ruleForm, rule_description: e.target.value })}
                className="w-full p-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                placeholder="e.g., Do not use absolute guarantees like '100% results'. Brand tone must remain humble and factual."
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
                Specific Value or Target Term (Optional)
              </label>
              <input
                type="text"
                value={ruleForm.rule_value}
                onChange={(e) => setRuleForm({ ...ruleForm, rule_value: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white font-medium"
                placeholder="e.g., '100% guaranteed' or 'customer' (for preferred terms)"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingRule(false);
                  setEditingRuleId(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-extrabold transition shadow-glow-sm active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingRuleId ? 'Update Rule' : 'Save Rule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. RULES LIST & MANAGEMENT */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
              Active Brand Governance Rules ({filteredRules.length})
            </h2>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rules..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['All', ...ruleTypeOptions].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-indigo-600 text-white shadow-glow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Rules Table / Cards */}
        <div className="space-y-3">
          {filteredRules.length > 0 ? (
            filteredRules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900 dark:text-white text-xs">
                      {rule.rule_type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getSeverityBadge(
                        rule.severity
                      )}`}
                    >
                      {rule.severity} Severity
                    </span>
                  </div>

                  <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                    {rule.rule_description}
                  </p>

                  {rule.rule_value && (
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">Target Value:</span>
                      <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-bold">
                        {rule.rule_value}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleEditClick(rule)}
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Edit Rule"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-xs text-slate-400 dark:text-slate-500">
              No brand rules match your active filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
