import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, FileText, Images, Tag, Wrench, HelpCircle, Settings, LogOut, ExternalLink, Building2, MapPin, LayoutTemplate } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/admin/blog", label: "Blog posts", icon: FileText },
  { to: "/admin/images", label: "Site photos", icon: Images },
  { to: "/admin/fleet", label: "Prices", icon: Tag },
  { to: "/admin/services", label: "Services", icon: Wrench },
  { to: "/admin/industries", label: "Industries", icon: Building2 },
  { to: "/admin/locations", label: "Locations", icon: MapPin },
  { to: "/admin/page-content", label: "Page content", icon: LayoutTemplate },
  { to: "/admin/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/admin/settings", label: "Site settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const qc = useQueryClient();

  async function handleSignOut() {
    await qc.cancelQueries();
    qc.clear();
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/auth", replace: true });
  }

  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card min-h-screen flex flex-col">
      <div className="p-5 border-b border-border">
        <Link to="/admin" className="flex items-center gap-2">
          <img src="/logo.png" alt="" width={36} height={36} className="h-9 w-9 object-contain" />
          <div>
            <div className="font-display font-bold text-sm text-navy leading-tight">Matla Al Anwar</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Admin</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => {
          const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/70 hover:text-foreground hover:bg-accent"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-1">
        <Link
          to="/"
          target="_blank"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-accent"
        >
          <ExternalLink className="h-4 w-4" />
          View site
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
