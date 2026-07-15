import { NavLink, Outlet, Link } from "react-router-dom";
import { LayoutDashboard, FileSearch, MessagesSquare, ScaleIcon, FileText, Settings } from "lucide-react";
import SignalStrip from "../components/SignalStrip";

const NAV = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/dashboard/score", label: "Score applicant", icon: FileText },
  { to: "/dashboard/documents", label: "Documents", icon: FileSearch },
  { to: "/dashboard/policy-assistant", label: "Policy assistant", icon: MessagesSquare },
  { to: "/dashboard/fairness", label: "Fairness audit", icon: ScaleIcon },
];

export default function DashboardLayout() {
  return (
    <div className="min-h-screen bg-paper flex">
      <aside className="w-64 shrink-0 bg-ink text-paper flex flex-col border-r border-line">
        <div className="h-16 flex items-center px-6 border-b border-line">
          <Link to="/" className="flex items-center gap-2.5">
            <SignalStrip size="small" className="h-4" />
            <span className="font-display text-lg">Ledgergate</span>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-6 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-card text-sm transition-colors ${
                  isActive
                    ? "bg-ink-2 text-paper"
                    : "text-ink-muted hover:text-paper hover:bg-ink-2/60"
                }`
              }
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-line">
          <NavLink
            to="/dashboard/settings"
            className="flex items-center gap-3 px-3 py-2.5 rounded-card text-sm text-ink-muted hover:text-paper transition-colors"
          >
            <Settings className="w-4 h-4" strokeWidth={1.75} />
            Settings
          </NavLink>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-line-light bg-white flex items-center justify-between px-8">
          <span className="font-mono text-xs text-slate uppercase tracking-wide">Workspace</span>
          <div className="w-8 h-8 rounded-full bg-ink text-paper flex items-center justify-center text-xs font-mono">
            SR
          </div>
        </header>
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
