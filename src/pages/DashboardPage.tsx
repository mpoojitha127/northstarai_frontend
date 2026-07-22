import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Target, TrendingUp, MessageSquare, Sparkles, X } from "lucide-react";
import { api, DashboardSummary } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await api.get<DashboardSummary>("/dashboard");
    setSummary(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function dismiss(id: string) {
    await api.post(`/recommendations/${id}/dismiss`);
    load();
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <h1 className="font-display text-2xl font-semibold mb-1">
        Welcome back{user ? `, ${user.full_name.split(" ")[0]}` : ""}
      </h1>
      <p className="text-ink-muted mb-8">Here's where your goals stand today.</p>

      {loading || !summary ? (
        <p className="text-ink-muted">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard icon={Target} label="Active goals" value={summary.active_goals} />
            <StatCard icon={TrendingUp} label="Avg. progress" value={`${summary.average_progress}%`} />
            <StatCard icon={MessageSquare} label="Recent conversations" value={summary.recent_conversations.length} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section>
              <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
                <Sparkles size={18} className="text-gold-400" />
                Recommendations
              </h2>
              <div className="flex flex-col gap-3">
                {summary.recommendations.length === 0 && (
                  <p className="text-sm text-ink-muted card">
                    No proactive suggestions right now — you're on track.
                  </p>
                )}
                {summary.recommendations.map((rec) => (
                  <div key={rec.id} className="card flex items-start justify-between gap-3">
                    <p className="text-sm">{rec.message}</p>
                    <button
                      onClick={() => dismiss(rec.id)}
                      className="text-ink-muted hover:text-ink shrink-0"
                      aria-label="Dismiss"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-display text-lg font-semibold mb-3">Recent conversations</h2>
              <div className="flex flex-col gap-3">
                {summary.recent_conversations.length === 0 && (
                  <p className="text-sm text-ink-muted card">
                    No conversations yet.{" "}
                    <Link to="/chat" className="text-star-400 font-medium">
                      Start one
                    </Link>
                    .
                  </p>
                )}
                {summary.recent_conversations.map((c) => (
                  <Link key={c.id} to={`/chat?conversation=${c.id}`} className="card block hover:border-star-500/50 transition-colors">
                    <p className="text-sm font-medium truncate">{c.title}</p>
                    <p className="text-xs text-ink-muted mt-1">
                      {new Date(c.updated_at).toLocaleString()}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Target;
  label: string;
  value: string | number;
}) {
  return (
    <div className="card">
      <Icon size={18} className="text-star-400 mb-3" />
      <p className="text-2xl font-display font-semibold">{value}</p>
      <p className="text-sm text-ink-muted">{label}</p>
    </div>
  );
}
