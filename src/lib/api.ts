const API_BASE =
  import.meta.env.VITE_API_URL || "https://northstarai-backend-1.onrender.com/api/v1";
function getAccessToken(): string | null {
  return localStorage.getItem("ns_access_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("ns_access_token", access);
  localStorage.setItem("ns_refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("ns_access_token");
  localStorage.removeItem("ns_refresh_token");
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearTokens();
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || "Request failed");
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};

// --- Domain types mirroring backend Pydantic schemas ---

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "active" | "archived" | "completed";
  deadline: string | null;
  progress_percent: number;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  alignment_verdict: string | null;
  alignment_reason: string | null;
  alignment_alternative: string | null;
  created_at: string;
}

export interface ChatResponse {
  conversation_id: string;
  message_id: string;
  content: string;
  alignment: { verdict: string; reason: string; alternative: string | null };
  reflection_notes: string[];
}

export interface Recommendation {
  id: string;
  message: string;
  kind: string;
  is_dismissed: boolean;
  created_at: string;
}

export interface DashboardSummary {
  active_goals: number;
  average_progress: number;
  recent_conversations: { id: string; title: string; updated_at: string }[];
  recommendations: Recommendation[];
}

export interface TimelineEntry {
  id: string;
  event_type: string;
  detail: string;
  progress_percent: number | null;
  created_at: string;
}
