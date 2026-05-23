const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const getHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// --- Auth ---
export async function login(credentials: any) {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });
  return res.json();
}

// --- Global APIs ---
export async function globalSearch(q: string) {
  const res = await fetch(`${API_BASE_URL}/global/search?q=${q}`, { headers: getHeaders() });
  return res.json();
}

export async function generateReferralMessage(alumniName: string, company: string) {
  const res = await fetch(`${API_BASE_URL}/global/ai/referral-message`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ alumniName, company })
  });
  return res.json();
}

// --- Student APIs ---
export async function fetchStudentDashboard() {
  const res = await fetch(`${API_BASE_URL}/student/profile`, { headers: getHeaders() });
  return res.json();
}

export const fetchStudentProfile = fetchStudentDashboard;

export async function fetchStudentReferrals() {
  const res = await fetch(`${API_BASE_URL}/student/referrals`, { headers: getHeaders() });
  return res.json();
}

export async function fetchAllJobs() {
  const res = await fetch(`${API_BASE_URL}/jobs`, { headers: getHeaders() });
  return res.json();
}

export async function applyToJob(jobId: number) {
  const res = await fetch(`${API_BASE_URL}/applications/apply`, { 
    method: 'POST', 
    headers: getHeaders(),
    body: JSON.stringify({ jobId })
  });
  return res.json();
}

export async function fetchAvailableWebinars() {
  const res = await fetch(`${API_BASE_URL}/student/webinars`, { headers: getHeaders() });
  return res.json();
}

export async function registerForWebinar(webinarId: number) {
  const res = await fetch(`${API_BASE_URL}/webinars/${webinarId}/register`, { method: 'POST', headers: getHeaders() });
  return res.json();
}

export async function fetchStudentNotifications() {
  const res = await fetch(`${API_BASE_URL}/notifications`, { headers: getHeaders() });
  return res.json();
}

export async function markNotificationsAsRead() {
  const res = await fetch(`${API_BASE_URL}/notifications/read`, { method: 'POST', headers: getHeaders() });
  return res.json();
}

export async function fetchStudentApplications() {
  const res = await fetch(`${API_BASE_URL}/applications/my`, { headers: getHeaders() });
  return res.json();
}

export async function fetchStudentPlacements() {
  const res = await fetch(`${API_BASE_URL}/student/placements`, { headers: getHeaders() });
  return res.json();
}

export async function reportPlacement(data: any) {
  const res = await fetch(`${API_BASE_URL}/student/placements`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function searchAlumni(q: string = '', company: string = '', role: string = '', page: number = 1, limit: number = 12) {
  const res = await fetch(`${API_BASE_URL}/student/alumni?q=${q}&company=${company}&role=${role}&page=${page}&limit=${limit}`, { headers: getHeaders() });
  return res.json();
}

// --- Alumni Search (for Students) ---

export async function requestReferral(alumniId: number) {
  const res = await fetch(`${API_BASE_URL}/referrals`, { 
    method: 'POST', 
    headers: getHeaders(),
    body: JSON.stringify({ alumniId })
  });
  return res.json();
}

export async function fetchRecommendations() {
  const res = await fetch(`${API_BASE_URL}/recommendations`, { headers: getHeaders() });
  return res.json();
}

export async function fetchResumeData() {
  const res = await fetch(`${API_BASE_URL}/resume/data`, { headers: getHeaders() });
  return res.json();
}

export async function requestMentorship(data: any) {
  const res = await fetch(`${API_BASE_URL}/mentorship/request`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchAlumniSlots(alumniId: number) {
  const res = await fetch(`${API_BASE_URL}/mentorship/slots/${alumniId}`, { headers: getHeaders() });
  return res.json();
}

export async function fetchOwnSlots() {
  const res = await fetch(`${API_BASE_URL}/mentorship/my-slots`, { headers: getHeaders() });
  return res.json();
}

export async function addMentorshipSlot(data: any) {
  const res = await fetch(`${API_BASE_URL}/mentorship/slots`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteMentorshipSlot(id: number) {
  const res = await fetch(`${API_BASE_URL}/mentorship/slots/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
}

export async function fetchMentorshipRequests() {
  const res = await fetch(`${API_BASE_URL}/mentorship/requests`, { headers: getHeaders() });
  return res.json();
}

export async function fetchStudentMentorshipRequests() {
  const res = await fetch(`${API_BASE_URL}/mentorship/my-requests`, { headers: getHeaders() });
  return res.json();
}

export async function updateMentorshipRequest(id: number, status: string, additionalData: any = {}) {
  const res = await fetch(`${API_BASE_URL}/mentorship/requests/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status, ...additionalData })
  });
  return res.json();
}

export async function submitMentorshipFeedback(id: number, rating: number, review: string) {
  const res = await fetch(`${API_BASE_URL}/mentorship/feedback/${id}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ rating, review })
  });
  return res.json();
}

export async function fetchMentorshipAnalytics() {
  const res = await fetch(`${API_BASE_URL}/mentorship/analytics`, { headers: getHeaders() });
  return res.json();
}

export async function updateAlumniExpertise(expertise: string[]) {
  const res = await fetch(`${API_BASE_URL}/mentorship/expertise`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ expertise })
  });
  return res.json();
}

export async function uploadResumeFile(file: File) {
  const formData = new FormData();
  formData.append('resume', file);
  
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const res = await fetch(`${API_BASE_URL}/profile/resume`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  return res.json();
}

export async function analyzeResume(data: any) {
  const res = await fetch(`${API_BASE_URL}/resume/analyze`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchResumeHistory() {
  const res = await fetch(`${API_BASE_URL}/resume/history`, { headers: getHeaders() });
  return res.json();
}

// --- Roadmap APIs ---
export async function fetchRoadmaps() {
  const res = await fetch(`${API_BASE_URL}/roadmap`, { headers: getHeaders() });
  return res.json();
}

export async function createRoadmap(title: string) {
  const res = await fetch(`${API_BASE_URL}/roadmap`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title })
  });
  return res.json();
}

export async function updateRoadmapStep(data: any) {
  const res = await fetch(`${API_BASE_URL}/roadmap/step`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

// --- AI Assistant & Insights ---
export async function fetchDashboardInsights() {
  const res = await fetch(`${API_BASE_URL}/ai/insights`, { headers: getHeaders() });
  return res.json();
}

export async function sendChatMessage(message: string, chatHistory: any[] = []) {
  const res = await fetch(`${API_BASE_URL}/ai/chat`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ message, chatHistory })
  });
  return res.json();
}

// --- Tracker APIs ---
export async function fetchPlacementReadiness() {
  const res = await fetch(`${API_BASE_URL}/tracker/readiness`, { headers: getHeaders() });
  return res.json();
}

export async function reanalyzeReadiness() {
  const res = await fetch(`${API_BASE_URL}/tracker/analyze`, { method: 'POST', headers: getHeaders() });
  return res.json();
}

// --- Alumni APIs ---
export async function fetchAlumniReferrals() {
  const res = await fetch(`${API_BASE_URL}/alumni/referrals`, { headers: getHeaders() });
  return res.json();
}

export async function fetchAlumniPlacements() {
  const res = await fetch(`${API_BASE_URL}/alumni/placements`, { headers: getHeaders() });
  return res.json();
}

export async function updateReferralStatus(id: number, status: string) {
  const res = await fetch(`${API_BASE_URL}/referrals/${id}`, { 
    method: 'PATCH', 
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function updateApplicationStatus(id: number, status: string) {
  const res = await fetch(`${API_BASE_URL}/applications/${id}/status`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status })
  });
  return res.json();
}

export async function fetchAlumniJobs() {
  const res = await fetch(`${API_BASE_URL}/jobs/alumni`, { headers: getHeaders() });
  return res.json();
}

export async function postJob(jobData: any) {
  const res = await fetch(`${API_BASE_URL}/jobs`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(jobData)
  });
  return res.json();
}

export async function deleteJob(id: number) {
  const res = await fetch(`${API_BASE_URL}/jobs/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
}

export async function fetchAlumniWebinars() {
  const res = await fetch(`${API_BASE_URL}/alumni/webinars`, { headers: getHeaders() });
  return res.json();
}

export async function createWebinar(data: any) {
  const res = await fetch(`${API_BASE_URL}/webinars`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchAlumniProfile() {
  const res = await fetch(`${API_BASE_URL}/alumni/profile`, { headers: getHeaders() });
  return res.json();
}

export async function updateAlumniProfile(data: any) {
  const res = await fetch(`${API_BASE_URL}/alumni/profile`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

// --- College Admin APIs ---
export async function fetchCollegeAnalytics() {
  const res = await fetch(`${API_BASE_URL}/college/analytics`, { headers: getHeaders() });
  return res.json();
}

export async function fetchCollegeStudents() {
  const res = await fetch(`${API_BASE_URL}/college/students`, { headers: getHeaders() });
  return res.json();
}

export const fetchStudents = fetchCollegeStudents;

export async function deleteStudent(id: number) {
  const res = await fetch(`${API_BASE_URL}/college/students/${id}`, { method: 'DELETE', headers: getHeaders() });
  return res.json();
}

export async function fetchCollegeAlumni() {
  const res = await fetch(`${API_BASE_URL}/college/alumni`, { headers: getHeaders() });
  return res.json();
}

// Alias for backward compatibility if needed, but unique
export const fetchAlumni = fetchCollegeAlumni;

export async function verifyAlumni(id: number) {
  const res = await fetch(`${API_BASE_URL}/college/alumni/${id}/verify`, { method: 'POST', headers: getHeaders() });
  return res.json();
}

export async function fetchPendingVerifications() {
  const res = await fetch(`${API_BASE_URL}/college/verifications/pending`, { headers: getHeaders() });
  return res.json();
}

export async function approveUser(userId: number) {
  const res = await fetch(`${API_BASE_URL}/college/verifications/approve/${userId}`, {
    method: 'POST',
    headers: getHeaders()
  });
  return res.json();
}

export async function rejectUser(userId: number, reason: string) {
  const res = await fetch(`${API_BASE_URL}/college/verifications/reject/${userId}`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ reason })
  });
  return res.json();
}

export async function fetchCollegeAnnouncements() {
  const res = await fetch(`${API_BASE_URL}/college/announcements`, { headers: getHeaders() });
  return res.json();
}

export const fetchAnnouncements = fetchCollegeAnnouncements;

export async function createAnnouncement(data: any) {
  const res = await fetch(`${API_BASE_URL}/college/announcements`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateAnnouncement(id: number, data: any) {
  const res = await fetch(`${API_BASE_URL}/college/announcements/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteAnnouncement(id: number) {
  const res = await fetch(`${API_BASE_URL}/college/announcements/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
}

export async function togglePinAnnouncement(id: number) {
  const res = await fetch(`${API_BASE_URL}/college/announcements/${id}/pin`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  return res.json();
}

export async function fetchAnnouncementAnalytics() {
  const res = await fetch(`${API_BASE_URL}/college/announcements/analytics`, { headers: getHeaders() });
  return res.json();
}

// --- Shared Announcement APIs (Student/Alumni) ---
export async function fetchMyAnnouncements(role: string) {
  const endpoint = role === 'STUDENT' ? 'student' : 'alumni';
  const res = await fetch(`${API_BASE_URL}/${endpoint}/announcements`, { headers: getHeaders() });
  return res.json();
}

export async function markAnnouncementAsRead(id: number, role: string) {
  const endpoint = role === 'STUDENT' ? 'student' : 'alumni';
  const res = await fetch(`${API_BASE_URL}/${endpoint}/announcements/${id}/read`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  return res.json();
}

export async function fetchCollegePlacements() {
  const res = await fetch(`${API_BASE_URL}/college/placements`, { headers: getHeaders() });
  return res.json();
}

export async function fetchCollegePlacementStats() {
  const res = await fetch(`${API_BASE_URL}/college/placements/stats`, { headers: getHeaders() });
  return res.json();
}

export const fetchPlacements = fetchCollegePlacements;

export async function createPlacement(data: any) {
  const res = await fetch(`${API_BASE_URL}/college/placements`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchCollegeWebinars() {
  const res = await fetch(`${API_BASE_URL}/college/webinars`, { headers: getHeaders() });
  return res.json();
}

export const fetchWebinars = fetchCollegeWebinars;

export async function fetchCollegeReferrals() {
  const res = await fetch(`${API_BASE_URL}/college/referrals`, { headers: getHeaders() });
  return res.json();
}

// --- Super Admin APIs ---
export async function fetchAdminOverview() {
  const res = await fetch(`${API_BASE_URL}/admin/analytics/overview`, { headers: getHeaders() });
  return res.json();
}

export async function fetchAdminPlacements() {
  const res = await fetch(`${API_BASE_URL}/admin/placements`, { headers: getHeaders() });
  return res.json();
}

export async function fetchAdminPlacementStats() {
  const res = await fetch(`${API_BASE_URL}/admin/placements/stats`, { headers: getHeaders() });
  return res.json();
}

export const fetchAdminStats = fetchAdminOverview;

export async function fetchColleges() {
  const res = await fetch(`${API_BASE_URL}/admin/colleges`, { headers: getHeaders() });
  return res.json();
}

export async function fetchCollegeById(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/colleges/${id}`, { headers: getHeaders() });
  return res.json();
}

export async function createCollege(data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/colleges`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateCollege(id: number, data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/colleges/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteCollege(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/colleges/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
}

export async function toggleCollegeStatus(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/colleges/${id}/toggle-status`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  return res.json();
}

// --- Departments ---
export async function fetchDepartments() {
  const res = await fetch(`${API_BASE_URL}/admin/departments`, { headers: getHeaders() });
  return res.json();
}

export async function createDepartment(data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/departments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateDepartment(id: number, data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/departments/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteDepartment(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/departments/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
}

export async function toggleDepartmentStatus(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/departments/${id}/toggle-status`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API_BASE_URL}/admin/users`, { headers: getHeaders() });
  return res.json();
}

export async function createUser(data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/users`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateUser(id: number, data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deleteUser(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
}

export async function toggleUserStatus(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}/toggle-status`, {
    method: 'PATCH',
    headers: getHeaders()
  });
  return res.json();
}

export async function fetchUserFullProfile(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/users/${id}/profile`, { headers: getHeaders() });
  return res.json();
}

export async function fetchSubscriptions() {
  const res = await fetch(`${API_BASE_URL}/admin/subscriptions`, { headers: getHeaders() });
  return res.json();
}

export async function updateCollegeSubscription(id: number, data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/subscriptions/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchSubscriptionAnalytics() {
  const res = await fetch(`${API_BASE_URL}/admin/subscriptions/analytics`, { headers: getHeaders() });
  return res.json();
}

export async function fetchPlans() {
  const res = await fetch(`${API_BASE_URL}/admin/plans`, { headers: getHeaders() });
  return res.json();
}

export async function createPlan(data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/plans`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updatePlan(id: number, data: any) {
  const res = await fetch(`${API_BASE_URL}/admin/plans/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function deletePlan(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/plans/${id}`, {
    method: 'DELETE',
    headers: getHeaders()
  });
  return res.json();
}

export async function fetchFeatures() {
  const res = await fetch(`${API_BASE_URL}/admin/features`, { headers: getHeaders() });
  return res.json();
}

export async function toggleFeature(id: number) {
  const res = await fetch(`${API_BASE_URL}/admin/features/${id}/toggle`, {
    method: 'POST',
    headers: getHeaders()
  });
  return res.json();
}

export async function fetchSystemHealth() {
  const res = await fetch(`${API_BASE_URL}/admin/system/health`, { headers: getHeaders() });
  return res.json();
}

export async function fetchAuditLogs() {
  const res = await fetch(`${API_BASE_URL}/admin/audit-logs`, { headers: getHeaders() });
  return res.json();
}

// --- Gamification & Leaderboard ---
export async function fetchGamification() {
  const res = await fetch(`${API_BASE_URL}/gamification`, { headers: getHeaders() });
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(`${API_BASE_URL}/leaderboard`, { headers: getHeaders() });
  return res.json();
}

// --- Messaging ---
export async function fetchMessages(otherUserId: number) {
  const res = await fetch(`${API_BASE_URL}/messages/${otherUserId}`, { headers: getHeaders() });
  return res.json();
}

export async function sendMessage(receiverId: number, content: string) {
  const res = await fetch(`${API_BASE_URL}/messages`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ receiverId, content })
  });
  return res.json();
}

// --- Shared Services ---
export async function fetchNotifications() {
  const res = await fetch(`${API_BASE_URL}/notifications`, { headers: getHeaders() });
  return res.json();
}

// --- Utilities ---
export function getFileUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `http://localhost:5000/${url}`;
}

