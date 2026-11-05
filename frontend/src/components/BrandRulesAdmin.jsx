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
  Info
} from 'lucide-react';
import { updateCompany, createBrandRule, updateBrandRule, deleteBrandRule } from '../api';

export default function BrandRulesAdmin({
  company,
  rules,
  companyId,
  onRefresh
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
      alert('Rule description is required');
      return;
    }
    try {
      if (editingRuleId) {
        await updateBrandRule(editingRuleId, ruleForm);
      } else {
        await createBrandRule({ ...ruleForm, company_id: companyId });
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

  const handleEditRule = (rule) => {
    setRuleForm({
      rule_type: rule.rule_type,
      rule_description: rule.rule_description,
      rule_value: rule.rule_value || '',
      severity: rule.severity || 'Medium'
    });
    setEditingRuleId(rule.id);
    setIsAddingRule(true);
  };

  const handleDeleteRule = async (id) => {
    if (!window.confirm('Delete this brand governance rule?')) return;
    try {
      await deleteBrandRule(id);
      await onRefresh();
    } catch (err) {
      alert('Failed to delete rule');
    }
  };

  const filterTabs = [
    'All',
    'Brand Tone',
    'Approved Fact',
    'Prohibited Term',
    'Preferred Term',
    'Communication Standard'
  ];

  const filteredRules =
    categoryFilter === 'All'
      ? rules || []
      : (rules || []).filter((r) => r.rule_type.toLowerCase() === categoryFilter.toLowerCase());

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
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-navy-900 tracking-tight">
              Brand Governance & Admin Console
            </h1>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-brand-50 text-brand-700 border border-brand-200">
              Admin Workspace
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure company information, approved facts, brand tone, preferred/prohibited terminology, and governance rules.
          </p>
        </div>

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
          className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-brand-900 text-white rounded-xl text-xs font-bold transition shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brand Rule</span>
        </button>
      </div>

      {/* 1. COMPANY INFORMATION CONFIGURATION */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-brand-600" />
            <h2 className="text-base font-bold text-navy-900">Company Information Configuration</h2>
          </div>
          {compSavedSuccess && (
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved to Database</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSaveCompany} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Company Name</label>
              <input
                type="text"
                value={compName}
                onChange={(e) => setCompName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Industry Sector</label>
              <input
                type="text"
                value={compIndustry}
                onChange={(e) => setCompIndustry(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">
              Brand Mission & Communication Standards Overview
            </label>
            <textarea
              rows={3}
              value={compDesc}
              onChange={(e) => setCompDesc(e.target.value)}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium leading-relaxed"
              placeholder="Describe the company's core mission, audience expectations, and communication principles..."
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={isSavingComp}
              className="flex items-center gap-1.5 px-4 py-2 bg-navy-900 hover:bg-brand-900 text-white rounded-xl text-xs font-bold transition shadow-xs active:scale-95 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSavingComp ? 'Saving...' : 'Save Company Profile'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. ADD / EDIT RULE MODAL */}
      {isAddingRule && (
        <div className="bg-slate-50 border-2 border-brand-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="text-sm font-bold text-navy-900">
              {editingRuleId ? 'Edit Brand Governance Rule' : 'Create New Brand Governance Rule'}
            </h3>
            <button
              onClick={() => setIsAddingRule(false)}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Rule Category</label>
              <select
                value={ruleForm.rule_type}
                onChange={(e) => setRuleForm({ ...ruleForm, rule_type: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
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
                Target Terms / Value(s)
              </label>
              <input
                type="text"
                value={ruleForm.rule_value}
                onChange={(e) => setRuleForm({ ...ruleForm, rule_value: e.target.value })}
                placeholder="e.g. 100% guaranteed results, or buyer -> customer"
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Comma-separated terms, or 'old -&gt; new' for terminology replacements
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Violation Severity</label>
              <select
                value={ruleForm.severity}
                onChange={(e) => setRuleForm({ ...ruleForm, severity: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
              >
                <option value="High">High (Critical / Legal Violation)</option>
                <option value="Medium">Medium (Brand Standard Mismatch)</option>
                <option value="Low">Low (Stylistic Recommendation)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1 text-xs">
              Rule Policy Description & Guideline Reference
            </label>
            <textarea
              rows={2}
              value={ruleForm.rule_description}
              onChange={(e) => setRuleForm({ ...ruleForm, rule_description: e.target.value })}
              placeholder="e.g. Brand tone must be professional, simple, and trustworthy. Avoid exaggerated promotional claims."
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
            <button
              onClick={() => setIsAddingRule(false)}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveRule}
              className="px-4 py-1.5 text-xs font-bold text-white bg-navy-900 hover:bg-brand-900 rounded-xl transition shadow-xs"
            >
              Save Rule to Database
            </button>
          </div>
        </div>
      )}

      {/* 3. BRAND RULES LIST */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-navy-900">
              Active Brand Rules ({rules?.length || 0})
            </h2>
            <p className="text-xs text-slate-500">
              All rules are persistent in the company database and shared in real-time across Creator and Reviewer.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1 text-xs font-semibold">
            {filterTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setCategoryFilter(tab)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                  categoryFilter === tab
                    ? 'bg-navy-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Rules Grid */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {filteredRules.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredRules.map((r) => (
                <div
                  key={r.id}
                  className="p-4 hover:bg-slate-50/70 transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1.5 max-w-3xl">
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

                    <p className="text-slate-700 leading-relaxed font-medium">
                      {r.rule_description}
                    </p>

                    {r.rule_value && (
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-600">Configured Value:</span>
                        <code className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-mono">
                          {r.rule_value}
                        </code>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleEditRule(r)}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                      title="Edit rule"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteRule(r.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                      title="Delete rule"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 text-xs">
              <SlidersHorizontal className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-slate-600">No brand rules in category "{categoryFilter}".</p>
              <button
                onClick={() => {
                  setRuleForm({
                    rule_type: categoryFilter === 'All' ? 'Brand Tone' : categoryFilter,
                    rule_description: '',
                    rule_value: '',
                    severity: 'High'
                  });
                  setIsAddingRule(true);
                }}
                className="mt-2 text-brand-600 font-bold hover:underline"
              >
                + Add a rule now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

