import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Target, MessageSquare, LogOut } from "lucide-react";
import { StarMark } from "./StarMark";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/chat", label: "Chat", icon: MessageSquare },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen flex bg-canvas">
      <aside className="w-64 shrink-0 border-r border-border flex flex-col p-5">
        <div className="flex items-center gap-2 px-2 mb-8">
          <StarMark size={22} className="text-gold-400" />
          <span className="font-display font-semibold text-lg tracking-tight">NorthStar</span>
        </div>

        <nav className="flex-1 flex flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-star-500/15 text-star-400"
                    : "text-ink-muted hover:text-ink hover:bg-surface-raised"
                }`
              }
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-border pt-4 mt-4">
          <div className="px-2 mb-3">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-ink-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-ink-muted hover:text-ink hover:bg-surface-raised w-full transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
