import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { StarMark } from "../components/StarMark";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <StarMark size={26} className="text-gold-400" animated />
          <span className="font-display font-semibold text-xl">NorthStar AI</span>
        </div>

        <div className="card shadow-glow">
          <h1 className="font-display text-xl font-semibold mb-1">Welcome back</h1>
          <p className="text-sm text-ink-muted mb-6">Sign in to keep your decisions aligned.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">Email</label>
              <input
                type="email"
                required
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-ink-muted mb-1.5 block">Password</label>
              <input
                type="password"
                required
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-danger">{error}</p>}

            <button type="submit" disabled={submitting} className="btn-primary mt-2 w-full">
              {submitting ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-ink-muted mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="text-star-400 hover:text-star-300 font-medium">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
