import React, { useState } from 'react';
import {
  ShieldCheck,
  Shield,
  PenTool,
  CheckCircle2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  Sun,
  Moon,
  AlertCircle,
  Building2,
  Check
} from 'lucide-react';
import { loginUser } from '../api';

export default function LoginScreen({ onLoginSuccess, theme, onToggleTheme }) {
  const [selectedRole, setSelectedRole] = useState('Content Creator');
  const [email, setEmail] = useState('creator@novatech.io');
  const [password, setPassword] = useState('trustora123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const roles = [
    {
      id: 'Admin',
      label: 'Admin',
      sublabel: 'Governance & Rules',
      desc: 'Define brand tone, rules, facts & company standards',
      icon: Shield,
      demoEmail: 'admin@novatech.io',
      demoName: 'Sarah Chen'
    },
    {
      id: 'Content Creator',
      label: 'Creator',
      sublabel: 'Content Studio',
      desc: 'Draft marketing copy & run real-time AI compliance audits',
      icon: PenTool,
      demoEmail: 'creator@novatech.io',
      demoName: 'Marcus Rodriguez'
    },
    {
      id: 'Reviewer',
      label: 'Approver',
      sublabel: 'Human Review Gate',
      desc: 'Inspect submissions, request changes & approve copy',
      icon: CheckCircle2,
      demoEmail: 'reviewer@novatech.io',
      demoName: 'Elena Rostova'
    }
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setErrorMessage('');
    const found = roles.find((r) => r.id === roleId);
    if (found) {
      setEmail(found.demoEmail);
      setPassword('trustora123');
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please enter your email address');
      return;
    }
    if (!password.trim()) {
      setErrorMessage('Please enter your password');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await loginUser(email, password, selectedRole);
      onLoginSuccess(res.user);
    } catch (err) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoLogin = async (roleObj) => {
    setSelectedRole(roleObj.id);
    setEmail(roleObj.demoEmail);
    setPassword('trustora123');
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await loginUser(roleObj.demoEmail, 'trustora123', roleObj.id);
      onLoginSuccess(res.user);
    } catch (err) {
      setErrorMessage(err.message || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 bg-grid-pattern relative overflow-hidden transition-colors duration-200">
      
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-indigo-500/15 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

      {/* Top Bar with Brand & Theme Toggle */}
      <div className="absolute top-5 right-5 sm:top-7 sm:right-7 flex items-center gap-2">
        {onToggleTheme && (
          <button
            onClick={onToggleTheme}
            className="p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-sm cursor-pointer"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        )}
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-lg bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-200/90 dark:border-slate-800/90 p-7 sm:p-9 shadow-2xl space-y-7 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-400 flex items-center justify-center text-white mx-auto shadow-glow-sm">
            <ShieldCheck className="w-7 h-7 stroke-[2.3]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            TRUSTORA
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium max-w-xs mx-auto">
            AI-Powered Brand Governance Platform
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 mt-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Workspace: <strong>NOVA TECH</strong></span>
          </div>
        </div>

        {/* Step 1: Select Role */}
        <div className="space-y-2.5">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-[10px]">
            1. Select Your Role / Account Type
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {roles.map((r) => {
              const Icon = r.icon;
              const isSelected = selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => handleRoleSelect(r.id)}
                  className={`relative p-3.5 rounded-2xl border text-center transition-all duration-200 cursor-pointer flex flex-col items-center gap-1.5 ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/90 dark:bg-indigo-950/60 shadow-glow-sm ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-200/80 dark:bg-slate-700/80 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-xs font-black block leading-tight ${
                      isSelected
                        ? 'text-indigo-900 dark:text-white'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {r.label}
                  </span>
                  <span className="text-[9px] text-slate-400 dark:text-slate-500 font-medium leading-none truncate max-w-full">
                    {r.sublabel}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-[10px] -mb-1">
            2. Enter Email ID & Password
          </label>

          {errorMessage && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@novatech.io"
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 dark:text-white transition"
                required
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <span className="text-[10px] text-slate-400">Default: trustora123</span>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 dark:text-white transition"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-700 hover:to-blue-700 text-white rounded-2xl text-xs sm:text-sm font-extrabold shadow-glow-sm hover:shadow-glow-md active:scale-98 transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In as {selectedRole}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Click Demo Logins for Hackathon Evaluators */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>One-Click Demo Profiles</span>
            </span>
            <span>No typing required</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => handleQuickDemoLogin(r)}
                className="px-2.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 border border-slate-200 dark:border-slate-700 text-left transition text-xs cursor-pointer group"
              >
                <span className="font-bold text-slate-800 dark:text-slate-200 block truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 text-[11px]">
                  {r.demoName}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-500 block truncate font-mono">
                  {r.label}
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Trust Footer */}
      <div className="mt-6 text-center text-xs text-slate-400 dark:text-slate-500 font-medium">
        Trust, Before It Goes Live. &copy; 2026 TRUSTORA Brand Governance
      </div>
    </div>
  );
}

