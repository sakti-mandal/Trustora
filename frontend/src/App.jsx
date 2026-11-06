import React, { useState, useEffect, useCallback } from 'react';
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
import {
  fetchHealth,
  fetchCompanies,
  loadDemoData,
  fetchDashboardStats,
  fetchBrandRules,
  fetchContentSubmissions,
  fetchComplianceScore,
  fetchGuidelines
} from './api';

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
    if (role === 'Admin') return 'admin-dashboard';
    if (role === 'Reviewer') return 'reviewer-dashboard';
    return 'creator-dashboard';
  });

  const [company, setCompany] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [rules, setRules] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [guidelinesCount, setGuidelinesCount] = useState(0);
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

      const [rls, subs, stats, gList] = await Promise.all([
        fetchBrandRules(activeComp.id).catch(() => []),
        fetchContentSubmissions(activeComp.id).catch(() => []),
        fetchDashboardStats(activeComp.id).catch(() => null),
        fetchGuidelines(activeComp.id).catch(() => [])
      ]);

      setRules(rls);
      setSubmissions(subs);
      setDashboardStats(stats);
      setGuidelinesCount(gList?.length || 0);

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

  // Handle Login Success
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('trustora_user', JSON.stringify(user));
    } catch (e) {}

    const userRole = user.role || 'Content Creator';
    setCurrentRole(userRole);
    if (userRole === 'Admin') {
      setActiveTab('admin-dashboard');
    } else if (userRole === 'Reviewer') {
      setActiveTab('reviewer-dashboard');
    } else {
      setActiveTab('creator-dashboard');
    }
  };

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

  // Switch Role helper — immediately opens that persona's dedicated dashboard!
  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    if (currentUser) {
      const updated = { ...currentUser, role: newRole };
      setCurrentUser(updated);
      try {
        localStorage.setItem('trustora_user', JSON.stringify(updated));
      } catch (e) {}
    }
    if (newRole === 'Admin') {
      setActiveTab('admin-dashboard');
    } else if (newRole === 'Reviewer') {
      setActiveTab('reviewer-dashboard');
    } else if (newRole === 'Content Creator') {
      setActiveTab('creator-dashboard');
    }
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
        onNavigate={setActiveTab}
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
          onTabChange={setActiveTab}
          currentRole={currentRole}
          pendingCount={pendingCount}
          rulesCount={rules.length}
          guidelinesCount={guidelinesCount}
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 w-full overflow-y-auto p-4 sm:p-7 md:p-8 bg-slate-50/60 dark:bg-slate-950/60 bg-grid-pattern transition-colors duration-200">
          <div className="max-w-7xl mx-auto w-full min-w-0 space-y-6">
            
            {/* 1. ADMIN DEDICATED DASHBOARD */}
            {activeTab === 'admin-dashboard' && (
              <BrandRulesAdmin
                company={company}
                rules={rules}
                companyId={company?.id || 1}
                onRefresh={loadWorkspaceData}
                scoreData={complianceScoreData}
                onNavigate={setActiveTab}
              />
            )}

            {/* 2. CONTENT CREATOR DEDICATED DASHBOARD */}
            {activeTab === 'creator-dashboard' && (
              <ContentCreator
                submissions={submissions}
                selectedSubmissionId={selectedSubmissionId}
                onSelectSubmission={setSelectedSubmissionId}
                companyId={company?.id || 1}
                onRefresh={loadWorkspaceData}
                onRoleChange={handleRoleChange}
                onNavigate={setActiveTab}
                scoreData={complianceScoreData}
              />
            )}

            {/* 3. REVIEWER / APPROVER DEDICATED DASHBOARD */}
            {activeTab === 'reviewer-dashboard' && (
              <ReviewQueue
                submissions={submissions}
                selectedSubmissionId={selectedSubmissionId}
                onSelectSubmission={setSelectedSubmissionId}
                onRefresh={loadWorkspaceData}
                onNavigate={setActiveTab}
                onRoleChange={handleRoleChange}
                scoreData={complianceScoreData}
              />
            )}

            {/* 4. SUGGESTION & GUIDELINE PDF HUB (Everyone can upload & inspect) */}
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
                onNavigate={setActiveTab}
              />
            )}

            {/* 6. COMPANY OVERVIEW */}
            {activeTab === 'overview' && (
              <OverviewDashboard
                stats={dashboardStats}
                onNavigate={setActiveTab}
                onSelectSubmission={setSelectedSubmissionId}
                onRoleChange={handleRoleChange}
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
