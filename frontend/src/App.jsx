import React, { useState, useEffect, useCallback } from 'react';
import { ShieldAlert } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import OverviewDashboard from './components/OverviewDashboard';
import BrandRulesAdmin from './components/BrandRulesAdmin';
import ContentCreator from './components/ContentCreator';
import ReviewQueue from './components/ReviewQueue';
import AuditHistory from './components/AuditHistory';
import SettingsModal from './components/SettingsModal';
import GuidelinePdfHub from './components/GuidelinePdfHub';
import LoginScreen from './components/LoginScreen';
import TeamDomainAdmin from './components/TeamDomainAdmin';
import {
  fetchHealth,
  fetchCompanies,
  loadDemoData,
  fetchDashboardStats,
  fetchBrandRules,
  fetchContentSubmissions,
  fetchComplianceScore,
  fetchGuidelines,
  fetchUsers
} from './api';

// Strict Role-Based Dashboard Access Permissions
const ROLE_ALLOWED_TABS = {
  'Admin': ['admin-dashboard', 'team-domain', 'guidelines-hub', 'history', 'overview', 'settings'],
  'Reviewer': ['reviewer-dashboard', 'guidelines-hub', 'history', 'overview', 'settings'],
  'Content Creator': ['creator-dashboard', 'guidelines-hub', 'history', 'overview', 'settings']
};

const getDefaultDashboard = (role) => {
  if (role === 'Admin') return 'admin-dashboard';
  if (role === 'Reviewer') return 'reviewer-dashboard';
  return 'creator-dashboard';
};

export default function App() {
  // Session Authentication State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('trustora_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    if (currentUser?.role) return currentUser.role;
    return 'Content Creator';
  });

  const [activeTab, setActiveTab] = useState(() => {
    const role = currentUser?.role || 'Content Creator';
    return getDefaultDashboard(role);
  });

  const [company, setCompany] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [rules, setRules] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [guidelinesCount, setGuidelinesCount] = useState(0);
  const [usersCount, setUsersCount] = useState(0);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [complianceScoreData, setComplianceScoreData] = useState(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Dark Mode Theme Management
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('trustora_theme') || 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('trustora_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Load compliance score for active role & submission
  const loadComplianceScore = useCallback(async (comp, role, subId) => {
    const compId = comp?.id || 1;
    try {
      const score = await fetchComplianceScore(compId, role, subId);
      setComplianceScoreData(score);
    } catch (e) {
      console.error('Failed to load compliance score:', e);
    }
  }, []);

  // Load all initial workspace data from backend
  const loadWorkspaceData = useCallback(async (forcedSubId) => {
    try {
      const [health, comps] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchCompanies().catch(() => [])
      ]);

      setSystemStatus(health);
      const activeComp = comps?.[0] || { id: 1, company_name: 'NOVA TECH' };
      setCompany(activeComp);

      const [rls, subs, stats, gList, uList] = await Promise.all([
        fetchBrandRules(activeComp.id).catch(() => []),
        fetchContentSubmissions(activeComp.id).catch(() => []),
        fetchDashboardStats(activeComp.id).catch(() => null),
        fetchGuidelines(activeComp.id).catch(() => []),
        fetchUsers(activeComp.id).catch(() => [])
      ]);

      setRules(rls);
      setSubmissions(subs);
      setDashboardStats(stats);
      setGuidelinesCount(gList?.length || 0);
      setUsersCount(uList?.length || 0);

      let targetSubId = (typeof forcedSubId === 'number' ? forcedSubId : null) || selectedSubmissionId;
      if (subs?.length > 0 && !targetSubId) {
        targetSubId = subs[0].id;
        setSelectedSubmissionId(targetSubId);
      }

      // Load Brand Compliance Score
      await loadComplianceScore(activeComp, currentRole, targetSubId);
    } catch (err) {
      console.error('Error loading workspace data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubmissionId, currentRole, loadComplianceScore]);

  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  // Whenever role or selected submission changes, update the navbar score meter
  useEffect(() => {
    if (company) {
      loadComplianceScore(company, currentRole, selectedSubmissionId);
    }
  }, [currentRole, selectedSubmissionId, company, loadComplianceScore]);

  // Handle Login Success — activates the session and locks to that role's dedicated dashboard
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('trustora_user', JSON.stringify(user));
    } catch (e) {}

    const userRole = user.role || 'Content Creator';
    setCurrentRole(userRole);
    setActiveTab(getDefaultDashboard(userRole));
  };

  // Safe tab change guard: users can only navigate to tabs allowed for their role
  const handleTabChange = (targetTab) => {
    const roleKey = currentRole || currentUser?.role || 'Content Creator';
    const allowed = ROLE_ALLOWED_TABS[roleKey] || ROLE_ALLOWED_TABS['Content Creator'];
    if (allowed.includes(targetTab)) {
      setActiveTab(targetTab);
    } else {
      console.warn(`Access denied to '${targetTab}' for role '${roleKey}'. Returning to dedicated dashboard.`);
      setActiveTab(getDefaultDashboard(roleKey));
    }
  };

  // Enforce role isolation: if activeTab is not allowed for current role, redirect immediately
  useEffect(() => {
    const roleKey = currentRole || currentUser?.role || 'Content Creator';
    const allowed = ROLE_ALLOWED_TABS[roleKey] || ROLE_ALLOWED_TABS['Content Creator'];
    if (!allowed.includes(activeTab)) {
      setActiveTab(getDefaultDashboard(roleKey));
    }
  }, [currentRole, currentUser, activeTab]);

  // Handle Logout
  const handleLogout = () => {
    try {
      localStorage.removeItem('trustora_user');
    } catch (e) {}
    setCurrentUser(null);
  };

  // Handle Reset Demo Data button
  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    try {
      await loadDemoData(company?.id || 1);
      await loadWorkspaceData();
    } catch (err) {
      alert('Failed to reset workspace data');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Switch Role helper — only accessible if explicitly invoked
  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    if (currentUser) {
      const updated = { ...currentUser, role: newRole };
      setCurrentUser(updated);
      try {
        localStorage.setItem('trustora_user', JSON.stringify(updated));
      } catch (e) {}
    }
    setActiveTab(getDefaultDashboard(newRole));
  };

  // If user is not logged in, show the Login Portal
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  const pendingCount = submissions.filter((s) => s.status === 'Pending Review').length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white w-full overflow-x-hidden transition-colors duration-200">
      {/* Top SaaS Navbar with Interactive Score Meter & Theme Switch */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        company={company}
        systemStatus={systemStatus}
        onLoadDemo={handleLoadDemo}
        isDemoLoading={isDemoLoading}
        onNavigate={handleTabChange}
        onSelectSubmission={setSelectedSubmissionId}
        scoreData={complianceScoreData}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        isMobileSidebarOpen={isMobileSidebarOpen}
        theme={theme}
        onToggleTheme={toggleTheme}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex w-full relative">
        {/* Sidebar (Desktop Persistent & Mobile Drawer) */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          currentRole={currentRole}
          pendingCount={pendingCount}
          rulesCount={rules.length}
          guidelinesCount={guidelinesCount}
          usersCount={usersCount}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 w-full overflow-y-auto p-4 sm:p-7 md:p-8 bg-slate-50/60 dark:bg-slate-950/60 bg-grid-pattern transition-colors duration-200">
          <div className="max-w-7xl mx-auto w-full min-w-0 space-y-6">
            
            {/* Access Guard for Unauthorized Dashboard Attempts */}
            {!ROLE_ALLOWED_TABS[currentRole]?.includes(activeTab) && (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-rose-200 dark:border-rose-900 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-3 border border-rose-200 dark:border-rose-800">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">Role Access Restricted</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                  You are logged in as <strong>{currentRole}</strong>. You are only permitted to access your dedicated dashboard.
                </p>
                <button
                  onClick={() => handleTabChange(getDefaultDashboard(currentRole))}
                  className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-sm"
                >
                  Return to Dedicated Dashboard
                </button>
              </div>
            )}

            {/* 1. ADMIN DEDICATED DASHBOARD (Governance & Rules Admin) */}
            {activeTab === 'admin-dashboard' && currentRole === 'Admin' && (
              <BrandRulesAdmin
                company={company}
                rules={rules}
                companyId={company?.id || 1}
                onRefresh={loadWorkspaceData}
                scoreData={complianceScoreData}
                onNavigate={handleTabChange}
              />
            )}

            {/* 1b. TEAM & DOMAIN ACCOUNTS (ADMIN ONLY PROVISIONING) */}
            {activeTab === 'team-domain' && currentRole === 'Admin' && (
              <TeamDomainAdmin
                company={company}
                companyId={company?.id || 1}
                onRefreshWorkspace={loadWorkspaceData}
              />
            )}

            {/* 2. CONTENT CREATOR DEDICATED DASHBOARD (Content Studio) */}
            {activeTab === 'creator-dashboard' && (currentRole === 'Content Creator' || currentRole === 'Creator') && (
              <ContentCreator
                submissions={submissions}
                selectedSubmissionId={selectedSubmissionId}
                onSelectSubmission={setSelectedSubmissionId}
                companyId={company?.id || 1}
                onRefresh={loadWorkspaceData}
                onNavigate={handleTabChange}
                scoreData={complianceScoreData}
              />
            )}

            {/* 3. REVIEWER / APPROVER DEDICATED DASHBOARD (Human Review Gate) */}
            {activeTab === 'reviewer-dashboard' && (currentRole === 'Reviewer' || currentRole === 'Approver') && (
              <ReviewQueue
                submissions={submissions}
                selectedSubmissionId={selectedSubmissionId}
                onSelectSubmission={setSelectedSubmissionId}
                onRefresh={loadWorkspaceData}
                onNavigate={handleTabChange}
                scoreData={complianceScoreData}
              />
            )}

            {/* 4. SUGGESTION & GUIDELINE PDF HUB (Shared resource) */}
            {activeTab === 'guidelines-hub' && (
              <GuidelinePdfHub
                companyId={company?.id || 1}
                currentRole={currentRole}
                onRulesUpdated={loadWorkspaceData}
              />
            )}

            {/* 5. AUDIT HISTORY & DECISION TRAIL */}
            {activeTab === 'history' && (
              <AuditHistory
                submissions={submissions}
                onSelectSubmission={setSelectedSubmissionId}
                onNavigate={handleTabChange}
                currentRole={currentRole}
              />
            )}

            {/* 6. COMPANY OVERVIEW */}
            {activeTab === 'overview' && (
              <OverviewDashboard
                stats={dashboardStats}
                onNavigate={handleTabChange}
                onSelectSubmission={setSelectedSubmissionId}
                currentRole={currentRole}
              />
            )}

            {/* 7. SYSTEM SETTINGS */}
            {activeTab === 'settings' && (
              <SettingsModal
                systemStatus={systemStatus}
                company={company}
                rulesCount={rules.length}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
