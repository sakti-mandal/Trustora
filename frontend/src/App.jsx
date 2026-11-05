import React, { useState, useEffect } from 'react';
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
  fetchContentSubmissions
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
  const [isDemoLoading, setIsDemoLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load all initial data from persistent backend
  const loadWorkspaceData = async () => {
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
      if (subs?.length > 0 && !selectedSubmissionId) {
        setSelectedSubmissionId(subs[0].id);
      }
    } catch (err) {
      console.error('Error loading workspace data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
  }, []);

  // Handle Reload / Reset Demo Data button
  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    try {
      await loadDemoData(company?.id || 1);
      await loadWorkspaceData();
    } catch (err) {
      alert('Failed to reload workspace data');
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
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-brand-600 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        company={company}
        systemStatus={systemStatus}
        onLoadDemo={handleLoadDemo}
        isDemoLoading={isDemoLoading}
        onNavigate={setActiveTab}
        onSelectSubmission={setSelectedSubmissionId}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentRole={currentRole}
          pendingCount={pendingCount}
          rulesCount={rules.length}
        />

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
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
