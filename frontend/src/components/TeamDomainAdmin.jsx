import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  KeyRound,
  Shield,
  PenTool,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  Sparkles,
  Globe,
  RefreshCw,
  Search,
  AlertTriangle,
  Lock,
  Mail,
  UserCheck
} from 'lucide-react';
import { fetchUsers, createTeamUser, updateTeamUser, deleteTeamUser, updateCompany } from '../api';

export default function TeamDomainAdmin({
  company,
  companyId = 1,
  onRefreshWorkspace,
  onSwitchUser
}) {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Domain Configuration State
  const defaultDomain = company?.email_domain || 'novatech.io';
  const [domainInput, setDomainInput] = useState(defaultDomain);
  const [isSavingDomain, setIsSavingDomain] = useState(false);
  const [domainSaved, setDomainSaved] = useState(false);

  // Form State for Provisioning
  const [fullName, setFullName] = useState('');
  const [emailPrefix, setEmailPrefix] = useState('');
  const [selectedRole, setSelectedRole] = useState('Content Creator');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Recently Created Credentials Banner
  const [recentCredential, setRecentCredential] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  // Edit / Password Reset Modal State
  const [editingUser, setEditingUser] = useState(null);
  const [editRole, setEditRole] = useState('Content Creator');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  // Load team members
  const loadUsers = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const data = await fetchUsers(companyId);
      setUsers(data || []);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to load team users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [companyId]);

  useEffect(() => {
    if (company?.email_domain) {
      setDomainInput(company.email_domain);
    }
  }, [company?.email_domain]);

  // Generate random strong password
  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    let pass = 'Nova#';
    for (let i = 0; i < 5; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    pass += '!2026';
    return pass;
  };

  const handleGeneratePassword = () => {
    const p = generateSecurePassword();
    setPassword(p);
    setShowPassword(true);
  };

  // Save Organization Domain
  const handleSaveDomain = async (e) => {
    e.preventDefault();
    if (!domainInput.trim()) return;
    setIsSavingDomain(true);
    setErrorMsg('');
    try {
      const cleanDomain = domainInput.trim().replace(/^@/, '').toLowerCase();
      await updateCompany(companyId, { email_domain: cleanDomain });
      setDomainSaved(true);
      setTimeout(() => setDomainSaved(false), 3000);
      if (onRefreshWorkspace) await onRefreshWorkspace();
    } catch (err) {
      setErrorMsg('Failed to update company domain');
    } finally {
      setIsSavingDomain(false);
    }
  };

  // Full email preview
  const currentDomain = domainInput.trim().replace(/^@/, '').toLowerCase() || 'novatech.io';
  const computedEmail = emailPrefix.includes('@')
    ? emailPrefix.trim().toLowerCase()
    : `${emailPrefix.trim().toLowerCase()}@${currentDomain}`;

  // Provision New Account
  const handleProvisionUser = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Please enter the team member full name');
      return;
    }
    if (!emailPrefix.trim()) {
      setErrorMsg('Please enter an email prefix or full domain email address');
      return;
    }
    const finalPassword = password.trim() || 'trustora123';

    setIsSubmitting(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const created = await createTeamUser({
        company_id: companyId,
        full_name: fullName.trim(),
        email: computedEmail,
        role: selectedRole,
        password: finalPassword
      });

      setRecentCredential({
        name: created.full_name,
        email: created.email,
        role: created.role,
        password: finalPassword
      });

      setSuccessMsg(`Account for ${created.full_name} (${created.email}) created successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);

      // Reset form
      setFullName('');
      setEmailPrefix('');
      setPassword('');
      setShowPassword(false);

      await loadUsers();
      if (onRefreshWorkspace) await onRefreshWorkspace();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to create user account');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copy credentials to clipboard
  const handleCopyCredentials = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  // Delete User
  const handleDeleteUser = async (userId, userRole, userName) => {
    if (!window.confirm(`Are you sure you want to revoke account access for "${userName}"?`)) {
      return;
    }
    try {
      await deleteTeamUser(userId);
      setSuccessMsg(`User "${userName}" has been removed.`);
      setTimeout(() => setSuccessMsg(''), 3000);
      await loadUsers();
      if (onRefreshWorkspace) await onRefreshWorkspace();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove user');
    }
  };

  // Update User Role or Reset Password
  const handleSaveUserUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsUpdatingUser(true);
    try {
      const payload = { role: editRole };
      if (newPassword.trim()) {
        payload.password = newPassword.trim();
      }
      await updateTeamUser(editingUser.id, payload);
      setSuccessMsg(`Credentials updated for ${editingUser.full_name}`);
      setTimeout(() => setSuccessMsg(''), 3000);
      setEditingUser(null);
      setNewPassword('');
      await loadUsers();
      if (onRefreshWorkspace) await onRefreshWorkspace();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update user');
    } finally {
      setIsUpdatingUser(false);
    }
  };

  // Filtered Users List
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole =
      roleFilter === 'All' ||
      (roleFilter === 'Creator' && u.role === 'Content Creator') ||
      (roleFilter === 'Reviewer' && u.role === 'Reviewer') ||
      (roleFilter === 'Admin' && u.role === 'Admin');
    return matchesSearch && matchesRole;
  });

  const creatorCount = users.filter((u) => u.role === 'Content Creator').length;
  const reviewerCount = users.filter((u) => u.role === 'Reviewer').length;
  const adminCount = users.filter((u) => u.role === 'Admin').length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0 border border-violet-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Team & Organization Domain Accounts
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-100 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                  Admin Governance
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
                Create and manage organization domain IDs (e.g. <span className="font-mono text-violet-600 dark:text-violet-400 font-medium">user@{currentDomain}</span>) and passwords for your Content Creators and Reviewers. Provisioned users can log in immediately from the Login Portal.
              </p>
            </div>
          </div>

          <button
            onClick={loadUsers}
            disabled={isLoading}
            className="self-start md:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Roster
          </button>
        </div>

        {/* Global Notifications */}
        {errorMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs sm:text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
      </div>

      {/* Domain Settings & Stats Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Domain Configuration */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              <Globe className="w-4 h-4 text-violet-500" />
              Organization Domain
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Primary Email Domain ID
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              New team member accounts will automatically append this domain suffix.
            </p>

            <form onSubmit={handleSaveDomain} className="mt-4 space-y-3">
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 font-mono text-sm">
                  @
                </span>
                <input
                  type="text"
                  value={domainInput}
                  onChange={(e) => setDomainInput(e.target.value)}
                  placeholder="e.g. yourcompany.com"
                  className="w-full pl-8 pr-3 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isSavingDomain}
                className="w-full inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-colors"
              >
                {domainSaved ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Domain Saved!
                  </>
                ) : (
                  <>
                    <Globe className="w-3.5 h-3.5" /> Update Domain ID
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Company: <strong className="text-slate-700 dark:text-slate-200">{company?.company_name || 'NOVA TECH'}</strong></span>
            <span className="font-mono text-violet-600 dark:text-violet-400 font-medium">@{currentDomain}</span>
          </div>
        </div>

        {/* Roster Metrics */}
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Total Members
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                {users.length}
              </span>
              <Users className="w-6 h-6 text-slate-300 dark:text-slate-700" />
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Domain Verified</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              Creators
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                {creatorCount}
              </span>
              <PenTool className="w-6 h-6 text-blue-200 dark:text-blue-900/60" />
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Content Authors</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Reviewers
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
                {reviewerCount}
              </span>
              <Clock className="w-6 h-6 text-amber-200 dark:text-amber-900/60" />
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Approvers</span>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
              Admins
            </span>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold text-violet-600 dark:text-violet-400">
                {adminCount}
              </span>
              <Shield className="w-6 h-6 text-violet-200 dark:text-violet-900/60" />
            </div>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Governance Leads</span>
          </div>
        </div>
      </div>

      {/* Recently Created Credentials Card (High-Impact Feedback) */}
      {recentCredential && (
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950/40 dark:to-indigo-950/40 border-2 border-violet-400/50 dark:border-violet-600/60 rounded-2xl p-5 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold bg-violet-600 text-white">
                <Sparkles className="w-3.5 h-3.5" />
                New Credentials Issued!
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Account Ready for {recentCredential.name}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Share these login details with your team member. They can log in immediately from the Login Portal.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() =>
                  handleCopyCredentials(
                    `TRUSTORA LOGIN CREDENTIALS\nName: ${recentCredential.name}\nRole: ${recentCredential.role}\nEmail: ${recentCredential.email}\nPassword: ${recentCredential.password}\nPortal URL: http://127.0.0.1:8000`,
                    'recent'
                  )
                }
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-xs transition-colors"
              >
                {copiedId === 'recent' ? (
                  <>
                    <Check className="w-3.5 h-3.5" /> Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Copy Full Credentials
                  </>
                )}
              </button>
              <button
                onClick={() => setRecentCredential(null)}
                className="p-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Credentials Display Badges */}
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-violet-200 dark:border-violet-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Role</span>
              <div className="font-semibold text-sm text-slate-900 dark:text-white mt-0.5">
                {recentCredential.role}
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-violet-200 dark:border-violet-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Domain Email ID</span>
              <div className="font-mono text-sm font-semibold text-violet-600 dark:text-violet-400 mt-0.5 select-all">
                {recentCredential.email}
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-violet-200 dark:border-violet-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Issued Password</span>
              <div className="font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5 select-all">
                {recentCredential.password}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Provision Account Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-xs">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-9 h-9 rounded-xl bg-violet-600/10 dark:bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Provision New Team Member
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Admin has the power to create domain IDs, choose roles, and generate secure passwords.
            </p>
          </div>
        </div>

        <form onSubmit={handleProvisionUser} className="space-y-6">
          {/* Step 1: Select Role */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              1. Select Member Role
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Content Creator Card */}
              <button
                type="button"
                onClick={() => setSelectedRole('Content Creator')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedRole === 'Content Creator'
                    ? 'border-blue-600 bg-blue-50/60 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <PenTool className="w-4 h-4" />
                  </div>
                  {selectedRole === 'Content Creator' && (
                    <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="font-bold text-sm">Content Creator</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Writes copy, runs AI compliance checks, and submits for approval.
                </p>
              </button>

              {/* Reviewer / Approver Card */}
              <button
                type="button"
                onClick={() => setSelectedRole('Reviewer')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedRole === 'Reviewer'
                    ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center">
                    <Clock className="w-4 h-4" />
                  </div>
                  {selectedRole === 'Reviewer' && (
                    <CheckCircle2 className="w-5 h-5 text-amber-500" />
                  )}
                </div>
                <div className="font-bold text-sm">Reviewer / Approver</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Inspects AI findings, requests edits, and gives final publishing approval.
                </p>
              </button>

              {/* Admin Card */}
              <button
                type="button"
                onClick={() => setSelectedRole('Admin')}
                className={`p-4 rounded-xl border-2 text-left transition-all ${
                  selectedRole === 'Admin'
                    ? 'border-violet-600 bg-violet-50/60 dark:bg-violet-950/40 text-violet-900 dark:text-violet-100 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center">
                    <Shield className="w-4 h-4" />
                  </div>
                  {selectedRole === 'Admin' && (
                    <CheckCircle2 className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                  )}
                </div>
                <div className="font-bold text-sm">Administrator</div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Configures brand guidelines, rules, tone, and provisions team accounts.
                </p>
              </button>
            </div>
          </div>

          {/* Step 2: Name and Domain Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Team Member Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Rachel Adams"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Organiser Domain ID (Username / Email)
              </label>
              <div className="flex rounded-xl shadow-xs overflow-hidden border border-slate-200 dark:border-slate-700">
                <input
                  type="text"
                  required
                  value={emailPrefix}
                  onChange={(e) => setEmailPrefix(e.target.value)}
                  placeholder="e.g. rachel.adams"
                  className="flex-1 px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none"
                />
                {!emailPrefix.includes('@') && (
                  <span className="inline-flex items-center px-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-xs font-medium border-l border-slate-200 dark:border-slate-700">
                    @{currentDomain}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Final login ID: <span className="font-mono text-violet-600 dark:text-violet-400 font-medium">{computedEmail || `...@${currentDomain}`}</span>
              </p>
            </div>
          </div>

          {/* Step 3: Password Configuration */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Account Password
              </label>
              <button
                type="button"
                onClick={handleGeneratePassword}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 dark:text-violet-400 hover:text-violet-700"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Generate Secure Password
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank for default (trustora123) or type custom password"
                className="w-full pl-3.5 pr-20 py-2.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              If left blank, the default password is <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-slate-600 dark:text-slate-300">trustora123</code>.
            </p>
          </div>

          {/* Submit Action */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Provisioning Credentials...
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" /> Issue & Save Credentials
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Team Roster / Existing Domain Accounts Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Active Organization Accounts
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredUsers.length} of {users.length}
            </span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search member or email..."
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              />
            </div>

            {/* Role Filter */}
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-2.5 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">All Roles</option>
              <option value="Creator">Creators</option>
              <option value="Reviewer">Reviewers</option>
              <option value="Admin">Admins</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-violet-500" />
            <p className="text-xs">Loading team accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              No matching accounts found
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Try adjusting your search query or provision a new member above.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4 sm:px-6 font-semibold">User & Domain ID</th>
                  <th className="py-3 px-4 font-semibold">Assigned Role</th>
                  <th className="py-3 px-4 font-semibold">Credentials Status</th>
                  <th className="py-3 px-4 font-semibold">Created Date</th>
                  <th className="py-3 px-4 sm:px-6 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredUsers.map((u) => {
                  const isCreator = u.role === 'Content Creator';
                  const isReviewer = u.role === 'Reviewer';
                  const isAdmin = u.role === 'Admin';

                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Domain Email */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCreator
                                ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                                : isReviewer
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-violet-100 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300'
                            }`}
                          >
                            {u.full_name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase()
                              .slice(0, 2) || 'U'}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {u.full_name}
                            </div>
                            <div className="font-mono text-xs text-slate-500 dark:text-slate-400 select-all">
                              {u.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4">
                        {isCreator && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <PenTool className="w-3 h-3" />
                            Content Creator
                          </span>
                        )}
                        {isReviewer && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="w-3 h-3" />
                            Reviewer / Approver
                          </span>
                        )}
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-950/60 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800">
                            <Shield className="w-3 h-3" />
                            Administrator
                          </span>
                        )}
                      </td>

                      {/* Password Status */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Password Active
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="py-3.5 px-4 text-xs text-slate-400">
                        {u.created_at
                          ? new Date(u.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })
                          : 'System Seed'}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Copy Login ID */}
                          <button
                            onClick={() =>
                              handleCopyCredentials(
                                `Email: ${u.email} | Role: ${u.role}`,
                                `u-${u.id}`
                              )
                            }
                            title="Copy Login Email"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            {copiedId === `u-${u.id}` ? (
                              <Check className="w-4 h-4 text-emerald-500" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          {/* Edit / Reset Password */}
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setEditRole(u.role);
                              setNewPassword('');
                            }}
                            title="Edit Role or Reset Password"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Account */}
                          <button
                            onClick={() => handleDeleteUser(u.id, u.role, u.full_name)}
                            title="Revoke Account"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Role & Reset Password Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-violet-600/10 text-violet-600 flex items-center justify-center">
                  <Edit2 className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">
                  Manage Credentials
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update role or reset password for <strong className="text-slate-800 dark:text-slate-200">{editingUser.full_name}</strong> ({editingUser.email}).
            </p>

            <form onSubmit={handleSaveUserUpdate} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="Content Creator">Content Creator</option>
                  <option value="Reviewer">Reviewer / Approver</option>
                  <option value="Admin">Administrator</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Reset Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setNewPassword(generateSecurePassword())}
                    className="text-[11px] font-semibold text-violet-600 dark:text-violet-400"
                  >
                    Generate
                  </button>
                </div>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Leave blank to keep existing password"
                  className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingUser}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-violet-600 hover:bg-violet-700 text-white"
                >
                  {isUpdatingUser ? 'Saving...' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

