import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import OverviewDashboard from './components/OverviewDashboard';
import BrandRulesAdmin from './components/BrandRulesAdmin';
import ContentCreator from './components/ContentCreator';
import ReviewQueue from './components/ReviewQueue';
import AuditHistory from './components/AuditHistory';
import SettingsModal from './components/SettingsModal';
import {
  fetchHealth,
  fetchCompanies,
  loadDemoData,
  fetchDashboardStats,
  fetchBrandRules,
  fetchContentSubmissions,
  fetchComplianceScore
} from './api';

export default function App() {
  const [currentRole, setCurrentRole] = useState('Content Creator');
  const [activeTab, setActiveTab] = useState('overview');
  const [company, setCompany] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [rules, setRules] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [complianceScoreData, setComplianceScoreData] = useState(null);
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

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

      const [rls, subs, stats] = await Promise.all([
        fetchBrandRules(activeComp.id).catch(() => []),
        fetchContentSubmissions(activeComp.id).catch(() => []),
        fetchDashboardStats(activeComp.id).catch(() => null)
      ]);

      setRules(rls);
      setSubmissions(subs);
      setDashboardStats(stats);

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

  // Switch Role helper
  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    if (newRole === 'Admin') {
      setActiveTab('brand-rules');
    } else if (newRole === 'Reviewer') {
      setActiveTab('review-queue');
    } else if (newRole === 'Content Creator') {
      setActiveTab('content-review');
    }
  };

  const pendingCount = submissions.filter((s) => s.status === 'Pending Review').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-600 selection:text-white w-full overflow-x-hidden">
      {/* Top Redesigned SaaS Navbar */}
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
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Content Viewport */}
        <main className="flex-1 min-w-0 w-full overflow-y-auto p-3.5 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto w-full min-w-0 space-y-6">
            {activeTab === 'overview' && (
              <OverviewDashboard
                stats={dashboardStats}
                onNavigate={setActiveTab}
                onSelectSubmission={setSelectedSubmissionId}
                onRoleChange={handleRoleChange}
              />
            )}

            {activeTab === 'brand-rules' && (
              <BrandRulesAdmin
                company={company}
                rules={rules}
                companyId={company?.id || 1}
                onRefresh={loadWorkspaceData}
              />
            )}

            {activeTab === 'content-review' && (
              <ContentCreator
                submissions={submissions}
                selectedSubmissionId={selectedSubmissionId}
                onSelectSubmission={setSelectedSubmissionId}
                companyId={company?.id || 1}
                onRefresh={loadWorkspaceData}
                onRoleChange={handleRoleChange}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'review-queue' && (
              <ReviewQueue
                submissions={submissions}
                selectedSubmissionId={selectedSubmissionId}
                onSelectSubmission={setSelectedSubmissionId}
                onRefresh={loadWorkspaceData}
                onNavigate={setActiveTab}
                onRoleChange={handleRoleChange}
              />
            )}

            {activeTab === 'history' && (
              <AuditHistory
                submissions={submissions}
                onSelectSubmission={setSelectedSubmissionId}
                onNavigate={setActiveTab}
              />
            )}

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
