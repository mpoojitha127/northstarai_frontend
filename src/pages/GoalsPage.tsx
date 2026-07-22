import { FormEvent, useEffect, useState } from "react";
import { Plus, Calendar, Archive, Trash2, X, Clock } from "lucide-react";
import { api, Goal, TimelineEntry } from "../lib/api";

const PRIORITY_COLOR: Record<string, string> = {
  low: "text-ink-muted bg-surface-raised",
  medium: "text-star-400 bg-star-500/10",
  high: "text-warn bg-warn/10",
  critical: "text-danger bg-danger/10",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [timelineGoal, setTimelineGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await api.get<Goal[]>("/goals?status_filter=active");
    setGoals(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function archiveGoal(id: string) {
    await api.post(`/goals/${id}/archive`);
    load();
  }

  async function deleteGoal(id: string) {
    if (!confirm("Delete this goal permanently? This cannot be undone.")) return;
    await api.delete(`/goals/${id}`);
    load();
  }

  async function updateProgress(goal: Goal, value: number) {
    await api.patch(`/goals/${goal.id}`, { progress_percent: value });
    load();
  }

  return (
    <div className="max-w-5xl mx-auto px-8 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-semibold mb-1">Goals</h1>
          <p className="text-ink-muted">The long-term targets NorthStar measures every request against.</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          New goal
        </button>
      </div>

      {loading ? (
        <p className="text-ink-muted">Loading…</p>
      ) : goals.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-ink-muted mb-4">No active goals yet. Create one to activate the alignment engine.</p>
          <button className="btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} />
            Create your first goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => (
            <div key={goal.id} className="card">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display font-semibold">{goal.title}</h3>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${PRIORITY_COLOR[goal.priority]}`}>
                  {goal.priority}
                </span>
              </div>
              {goal.description && <p className="text-sm text-ink-muted mb-3">{goal.description}</p>}

              <div className="flex items-center gap-1.5 text-xs text-ink-muted mb-3">
                <Calendar size={13} />
                {goal.deadline ? new Date(goal.deadline).toLocaleDateString() : "No deadline"}
                <span className="mx-1">·</span>
                {goal.category}
              </div>

              <div className="mb-1 flex items-center justify-between text-xs text-ink-muted">
                <span>Progress</span>
                <span>{goal.progress_percent}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={goal.progress_percent}
                onChange={(e) => updateProgress(goal, Number(e.target.value))}
                className="w-full accent-star-500 mb-4"
              />

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setTimelineGoal(goal)}
                  className="flex items-center gap-1 text-star-400 hover:text-star-300 font-medium"
                >
                  <Clock size={13} />
                  Timeline
                </button>
                <span className="flex-1" />
                <button
                  onClick={() => archiveGoal(goal.id)}
                  className="flex items-center gap-1 text-ink-muted hover:text-ink"
                >
                  <Archive size={13} />
                  Archive
                </button>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="flex items-center gap-1 text-ink-muted hover:text-danger"
                >
                  <Trash2 size={13} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <GoalFormModal onClose={() => setShowForm(false)} onCreated={load} />}
      {timelineGoal && <TimelineModal goal={timelineGoal} onClose={() => setTimelineGoal(null)} />}
    </div>
  );
}

function GoalFormModal({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [priority, setPriority] = useState("medium");
  const [deadline, setDeadline] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post("/goals", {
        title,
        description,
        category,
        priority,
        deadline: deadline || null,
      });
      onCreated();
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
      <div className="card w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">New goal</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-ink-muted mb-1.5 block">Title</label>
            <input required className="input-field" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="text-xs font-medium text-ink-muted mb-1.5 block">Description</label>
            <textarea
              className="input-field min-h-[80px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">Category</label>
              <input className="input-field" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">Priority</label>
              <select className="input-field" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-ink-muted mb-1.5 block">Deadline</label>
            <input
              type="date"
              className="input-field"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary mt-2">
            {submitting ? "Creating…" : "Create goal"}
          </button>
        </form>
      </div>
    </div>
  );
}

const EVENT_LABEL: Record<string, string> = {
  created: "Goal created",
  decision: "Decision",
  warning: "Warning",
  task_done: "Task completed",
  progress: "Progress updated",
};

function TimelineModal({ goal, onClose }: { goal: Goal; onClose: () => void }) {
  const [entries, setEntries] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<TimelineEntry[]>(`/goals/${goal.id}/timeline`).then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, [goal.id]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center px-4 z-50">
      <div className="card w-full max-w-lg max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold">{goal.title} — Timeline</h2>
          <button onClick={onClose} className="text-ink-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-ink-muted">Loading…</p>
        ) : entries.length === 0 ? (
          <p className="text-sm text-ink-muted">No timeline events yet.</p>
        ) : (
          <ol className="relative border-l border-border pl-5 flex flex-col gap-5">
            {entries.map((entry) => (
              <li key={entry.id} className="relative">
                <span className="absolute -left-[25px] top-1 w-2.5 h-2.5 rounded-full bg-gold-400" />
                <p className="text-xs font-medium text-star-400">{EVENT_LABEL[entry.event_type] ?? entry.event_type}</p>
                <p className="text-sm mt-0.5">{entry.detail}</p>
                <p className="text-xs text-ink-muted mt-1">{new Date(entry.created_at).toLocaleString()}</p>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
