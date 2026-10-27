import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, Images, Truck, Wrench, HelpCircle, Settings, Building2, MapPin, LayoutTemplate } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

const CARDS = [
  { to: "/admin/blog", label: "Blog posts", desc: "Write and publish articles", icon: FileText },
  {
    to: "/admin/images",
    label: "Site photos",
    desc: "Swap hero and marketing images",
    icon: Images,
  },
  { to: "/admin/fleet", label: "Fleet vehicles", desc: "Manage vans and trucks", icon: Truck },
  { to: "/admin/services", label: "Services", desc: "Edit service offerings", icon: Wrench },
  { to: "/admin/industries", label: "Industries", desc: "Edit industries served", icon: Building2 },
  { to: "/admin/locations", label: "Locations", desc: "Edit emirates and coverage", icon: MapPin },
  { to: "/admin/page-content", label: "Page content", desc: "Home & About marketing copy", icon: LayoutTemplate },
  { to: "/admin/faqs", label: "FAQs", desc: "Update Q&A", icon: HelpCircle },
  {
    to: "/admin/settings",
    label: "Site settings",
    desc: "Meta titles, contact info",
    icon: Settings,
  },
] as const;

function AdminHome() {
  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold text-navy">Welcome back</h1>
        <p className="text-muted-foreground mt-1">Manage your Matla Al Anwar website content from here.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.to}
              to={c.to}
              className="group rounded-2xl border border-border bg-card p-6 hover:shadow-elegant hover:border-primary/30 transition-all"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="font-semibold text-navy group-hover:text-primary">{c.label}</h2>
              <p className="text-sm text-muted-foreground mt-1">{c.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
