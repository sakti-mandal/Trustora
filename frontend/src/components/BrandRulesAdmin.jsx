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
  UploadCloud
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

  // Rules Category Filter
  const [categoryFilter, setCategoryFilter] = useState('All');

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

  const filteredRules =
    categoryFilter === 'All'
      ? rules
      : rules.filter((r) => r.rule_type === categoryFilter);

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'High':
        return 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Medium':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Low':
        return 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-navy-900 dark:text-white tracking-tight">
              Brand Governance & Admin Dashboard
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-50 dark:bg-brand-900/40 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-700">
              Admin Workspace
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure company information, upload suggestion/guideline PDFs, and manage approved facts, brand tone, preferred terms & prohibited terminology.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigate && (
            <button
              onClick={() => onNavigate('guidelines-hub')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4 text-brand-600 dark:text-brand-400" />
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
            className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-brand-500/20 active:scale-95 cursor-pointer"
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-base font-bold text-navy-900 dark:text-white">Company Information Configuration</h2>
          </div>
          {compSavedSuccess && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved to Database</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveCompany} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Industry Sector</label>
              <input
                type="text"
                value={compIndustry}
                onChange={(e) => setCompIndustry(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1 text-xs">
              Brand Mission & Communication Standards Overview
            </label>
            <textarea
              rows={3}
              value={compDesc}
              onChange={(e) => setCompDesc(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white font-medium leading-relaxed"
              placeholder="Describe the company's core mission, audience expectations, and communication principles..."
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSavingComp}
              className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 dark:bg-brand-600 hover:bg-brand-900 dark:hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingComp ? 'Saving...' : 'Save Company Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. RULE CREATION / EDITING MODAL / FORM */}
      {isAddingRule && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border-2 border-brand-500 dark:border-brand-600 shadow-md p-6 animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-navy-900 dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <span>{editingRuleId ? 'Edit Brand Rule' : 'Create New Brand Rule'}</span>
            </h3>
            <button
              onClick={() => {
                setIsAddingRule(false);
                setEditingRuleId(null);
              }}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Rule Category</label>
                <select
                  value={ruleForm.rule_type}
                  onChange={(e) => setRuleForm({ ...ruleForm, rule_type: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white font-medium"
                >
                  {ruleTypeOptions.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Violation Severity</label>
                <select
                  value={ruleForm.severity}
                  onChange={(e) => setRuleForm({ ...ruleForm, severity: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white font-medium"
                >
                  <option value="High">High (Strict Flagging & Review Required)</option>
                  <option value="Medium">Medium (Correction Strongly Recommended)</option>
                  <option value="Low">Low (Advisory Suggestion)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rule Definition / Description
              </label>
              <textarea
                rows={2}
                value={ruleForm.rule_description}
                onChange={(e) => setRuleForm({ ...ruleForm, rule_description: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white font-medium"
                placeholder="e.g., Do not use absolute guarantees like '100% results'. Brand tone must remain humble and factual."
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Specific Value or Target Term (Optional)
              </label>
              <input
                type="text"
                value={ruleForm.rule_value}
                onChange={(e) => setRuleForm({ ...ruleForm, rule_value: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white font-medium"
                placeholder="e.g., '100% guaranteed' or 'customer' (for preferred terms)"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setIsAddingRule(false);
                  setEditingRuleId(null);
                }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-xl font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveRule}
                className="flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold transition shadow-sm active:scale-95 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{editingRuleId ? 'Update Rule' : 'Save Rule'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. RULES LIST & MANAGEMENT */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-base font-bold text-navy-900 dark:text-white">Active Brand Governance Rules ({rules.length})</h2>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {['All', ...ruleTypeOptions].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-navy-900 dark:bg-brand-600 text-white shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Rules Table / Cards */}
        <div className="space-y-3">
          {filteredRules.length > 0 ? (
            filteredRules.map((rule) => (
              <div
                key={rule.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-navy-900 dark:text-white text-xs">
                      {rule.rule_type}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getSeverityBadge(
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
                      <span className="px-1.5 py-0.2 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">
                        {rule.rule_value}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleEditClick(rule)}
                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Edit Rule"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteRule(rule.id)}
                    className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                    title="Delete Rule"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              No rules found for category "{categoryFilter}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
