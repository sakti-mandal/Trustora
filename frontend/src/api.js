const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export async function fetchHealth() {
  const res = await fetch(`${API_BASE}/health`);
  return res.json();
}

export async function fetchCompanies() {
  const res = await fetch(`${API_BASE}/companies`);
  return res.json();
}

export async function loadDemoData(companyId = 1) {
  const res = await fetch(`${API_BASE}/companies/${companyId}/load-demo`, {
    method: 'POST'
  });
  return res.json();
}

export async function fetchDashboardStats(companyId = 1) {
  const res = await fetch(`${API_BASE}/dashboard/stats?company_id=${companyId}`);
  return res.json();
}

// Brand Guidelines
export async function fetchGuidelines(companyId = 1) {
  const res = await fetch(`${API_BASE}/guidelines?company_id=${companyId}`);
  return res.json();
}

export async function uploadGuidelineFile(file, companyId = 1) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('company_id', companyId.toString());

  const res = await fetch(`${API_BASE}/guidelines/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to upload guideline document');
  }
  return res.json();
}

export async function deleteGuideline(id) {
  const res = await fetch(`${API_BASE}/guidelines/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

// Brand Rules
export async function fetchBrandRules(companyId = 1) {
  const res = await fetch(`${API_BASE}/brand-rules?company_id=${companyId}`);
  return res.json();
}

export async function createBrandRule(rule) {
  const res = await fetch(`${API_BASE}/brand-rules`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule)
  });
  return res.json();
}

export async function updateBrandRule(id, updates) {
  const res = await fetch(`${API_BASE}/brand-rules/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function deleteBrandRule(id) {
  const res = await fetch(`${API_BASE}/brand-rules/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

// Content Submissions
export async function fetchContentSubmissions(companyId = 1, status = null) {
  let url = `${API_BASE}/content?company_id=${companyId}`;
  if (status) url += `&status=${encodeURIComponent(status)}`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchContentSubmission(id) {
  const res = await fetch(`${API_BASE}/content/${id}`);
  return res.json();
}

export async function createContentSubmission(submission) {
  const res = await fetch(`${API_BASE}/content/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(submission)
  });
  return res.json();
}

export async function updateContentSubmission(id, updates) {
  const res = await fetch(`${API_BASE}/content/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates)
  });
  return res.json();
}

export async function analyzeContentSubmission(id) {
  const res = await fetch(`${API_BASE}/content/${id}/analyze`, {
    method: 'POST'
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Analysis failed');
  }
  return res.json();
}

export async function submitForReview(id) {
  const res = await fetch(`${API_BASE}/content/${id}/submit-review`, {
    method: 'POST'
  });
  return res.json();
}

export async function approveContent(id, comment = '') {
  const res = await fetch(`${API_BASE}/content/${id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision: 'Approved', review_comment: comment })
  });
  return res.json();
}

export async function rejectContent(id, comment = '') {
  const res = await fetch(`${API_BASE}/content/${id}/reject`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision: 'Rejected', review_comment: comment })
  });
  return res.json();
}

export async function requestChanges(id, comment = '') {
  const res = await fetch(`${API_BASE}/content/${id}/request-changes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ decision: 'Changes Requested', review_comment: comment })
  });
  return res.json();
}

export async function fetchSubmissionHistory(id) {
  const res = await fetch(`${API_BASE}/content/${id}/history`);
  return res.json();
}
