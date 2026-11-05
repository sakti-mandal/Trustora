import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DemoBanner from './components/DemoBanner';
import OverviewDashboard from './components/OverviewDashboard';
import BrandGuidelines from './components/BrandGuidelines';
import ContentCreator from './components/ContentCreator';
import ReviewQueue from './components/ReviewQueue';
import AuditHistory from './components/AuditHistory';
import SettingsModal from './components/SettingsModal';
import {
  fetchHealth,
  fetchCompanies,
  loadDemoData,
  fetchDashboardStats,
  fetchGuidelines,
  fetchBrandRules,
  fetchContentSubmissions,
  analyzeContentSubmission,
  createContentSubmission
} from './api';

export default function App() {
  const [currentRole, setCurrentRole] = useState('Content Creator');
  const [activeTab, setActiveTab] = useState('overview');
  const [company, setCompany] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [guidelines, setGuidelines] = useState([]);
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

      const [gls, rls, subs, stats] = await Promise.all([
        fetchGuidelines(activeComp.id).catch(() => []),
        fetchBrandRules(activeComp.id).catch(() => []),
        fetchContentSubmissions(activeComp.id).catch(() => []),
        fetchDashboardStats(activeComp.id).catch(() => null)
      ]);

      setGuidelines(gls);
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

  // Handle Load Demo Data button
  const handleLoadDemo = async () => {
    setIsDemoLoading(true);
    try {
      await loadDemoData(company?.id || 1);
      await loadWorkspaceData();
      alert('NOVA TECH demo data reloaded successfully!');
    } catch (err) {
      alert('Failed to reload demo data');
    } finally {
      setIsDemoLoading(false);
    }
  };

  // Quick Test Flow for Judges
  const handleQuickTest = async () => {
    setCurrentRole('Content Creator');
    setActiveTab('content-review');

    // Find sample submission or create one
    let target = submissions.find((s) => s.title.includes('Cloud Launch'));
    if (!target) {
      target = await createContentSubmission({
        company_id: company?.id || 1,
        title: 'Q2 Cloud Launch Announcement - Global Campaign',
        content_type: 'Advertisement',
        original_content:
          'Buyers can get 100% guaranteed results with our revolutionary product. This is the best technology available in the world.',
        submitted_by: 2
      });
      await loadWorkspaceData();
    }
    setSelectedSubmissionId(target.id);
  };

  // Switch Role helper
  const handleRoleChange = (newRole) => {
    setCurrentRole(newRole);
    // Suggest tab based on role
    if (newRole === 'Admin' && activeTab === 'content-review') {
      setActiveTab('guidelines');
    } else if (newRole === 'Reviewer' && activeTab === 'guidelines') {
      setActiveTab('review-queue');
    } else if (newRole === 'Content Creator' && activeTab === 'review-queue') {
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
      />

      {/* Demo Banner */}
      <DemoBanner
        onQuickTest={handleQuickTest}
        onRoleChange={handleRoleChange}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          currentRole={currentRole}
          pendingCount={pendingCount}
          guidelineCount={guidelines.length}
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

            {activeTab === 'guidelines' && (
              <BrandGuidelines
                guidelines={guidelines}
                rules={rules}
                companyId={company?.id || 1}
                onRefresh={loadWorkspaceData}
                systemStatus={systemStatus}
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
                guidelinesCount={guidelines.length}
                rulesCount={rules.length}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
