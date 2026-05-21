import { useMemo } from "react";
import {
  Users,
  ShieldCheck,
  FileText,
  UserSquare2,
  Mail,
  Settings2,
  LayoutDashboard,
  BookOpen,
  Wallet,
  ClipboardList,
  CalendarDays,
  ArrowUpRight,
  Globe,
  Bell,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/auth/AuthContext";
import { fetchDashboardOverview } from "@/http/api";

// --- Module cards (static configuration) ---
const modules = [
  {
    title: "Admin",
    description: "Manage system users, security roles, and access permissions.",
    icon: ShieldCheck,
    href: "/dashboard/admin",
    color: "#00338D",
    bg: "from-[#00338D]/10 to-[#00338D]/5 dark:from-[#00338D]/20 dark:to-[#00338D]/10",
    border: "border-[#00338D]/20 dark:border-[#4d7cc7]/20",
    text: "text-[#00338D] dark:text-[#4d7cc7]",
    badges: ["Users", "Role Types"],
  },
  {
    title: "Website",
    description: "Manage public content, team profiles, and contact inquiries.",
    icon: Globe,
    href: "/dashboard/website/overview",
    color: "#7c3aed",
    bg: "from-violet-50 to-violet-50/30 dark:from-violet-950/20 dark:to-violet-950/10",
    border: "border-violet-200/50 dark:border-violet-800/30",
    text: "text-violet-600 dark:text-violet-400",
    badges: ["Posts", "Team", "Inquiries", "Config"],
  },
  {
    title: "Accounts",
    description: "Financial accounts, billing, and transaction records.",
    icon: Wallet,
    href: "/dashboard/accounts",
    color: "#d97706",
    bg: "from-amber-50 to-amber-50/30 dark:from-amber-950/20 dark:to-amber-950/10",
    border: "border-amber-200/50 dark:border-amber-800/30",
    text: "text-amber-600 dark:text-amber-400",
    badges: ["Transactions", "Reports"],
  },
  {
    title: "Task Management",
    description: "Track internal tasks, assignments, and project progress.",
    icon: ClipboardList,
    href: "/dashboard/task",
    color: "#0891b2",
    bg: "from-cyan-50 to-cyan-50/30 dark:from-cyan-950/20 dark:to-cyan-950/10",
    border: "border-cyan-200/50 dark:border-cyan-800/30",
    text: "text-cyan-600 dark:text-cyan-400",
    badges: ["Tasks", "Projects"],
  },
  {
    title: "Leave Management",
    description: "Employee leave requests, approvals, and attendance records.",
    icon: CalendarDays,
    href: "/dashboard/leave",
    color: "#16a34a",
    bg: "from-emerald-50 to-emerald-50/30 dark:from-emerald-950/20 dark:to-emerald-950/10",
    border: "border-emerald-200/50 dark:border-emerald-800/30",
    text: "text-emerald-600 dark:text-emerald-400",
    badges: ["Leave", "Attendance"],
  },
];

// Helper to select the most appropriate icon dynamically
const getActivityIcon = (action: string, module: string) => {
  const lowerAction = action.toLowerCase();
  if (lowerAction.includes("user")) return Users;
  if (lowerAction.includes("post")) return FileText;
  if (lowerAction.includes("inquiry")) return Mail;
  if (lowerAction.includes("team")) return UserSquare2;
  if (lowerAction.includes("role")) return ShieldCheck;
  if (lowerAction.includes("form") || lowerAction.includes("config")) return Settings2;

  const moduleMap: Record<string, React.ElementType> = {
    admin: ShieldCheck,
    website: Globe,
    accounts: Wallet,
    task: ClipboardList,
    leave: CalendarDays,
  };
  return moduleMap[module] || Settings2;
};

const Dashboard = () => {
  const { user } = useAuth();

  // 1. Fetch live metrics & activities via React Query
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-overview"],
    queryFn: fetchDashboardOverview,
    staleTime: 0, // Mark data as instantly stale so it always refetches on mount
    refetchOnMount: "always", // Force query refetch when component mounts
    refetchOnWindowFocus: true, // Keep refetch on window focus
  });

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  const statsData = data?.stats;

  // 2. Map backend counts to display metrics dynamically
  const systemStats = useMemo(() => {
    return [
      {
        title: "Managed Users",
        value: statsData?.totalUsers ?? 0,
        sub: "System accounts",
        icon: Users,
        color: "#00338D",
        bg: "bg-[#00338D]/10 dark:bg-[#00338D]/20",
        text: "text-[#00338D] dark:text-[#4d7cc7]",
        delay: 0,
        hoverShadow: "hover:shadow-[0_12px_25px_-5px_rgba(0,51,141,0.12)] dark:hover:shadow-[0_12px_25px_-5px_rgba(0,51,141,0.22)]",
        hoverBorder: "hover:border-[#00338D]/30 dark:hover:border-[#00338D]/50",
        hoverArrow: "group-hover:text-[#00338D] dark:group-hover:text-[#4d7cc7]",
      },
      {
        title: "Security Roles",
        value: statsData?.totalRoles ?? 0,
        sub: "Permission groups",
        icon: ShieldCheck,
        color: "#16a34a",
        bg: "bg-emerald-50 dark:bg-emerald-950/20",
        text: "text-emerald-600 dark:text-emerald-400",
        delay: 0.08,
        hoverShadow: "hover:shadow-[0_12px_25px_-5px_rgba(22,163,74,0.12)] dark:hover:shadow-[0_12px_25px_-5px_rgba(22,163,74,0.22)]",
        hoverBorder: "hover:border-emerald-500/30 dark:hover:border-emerald-500/50",
        hoverArrow: "group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
      },
      {
        title: "Published Posts",
        value: statsData?.totalPosts ?? 0,
        sub: "Blog & news articles",
        icon: FileText,
        color: "#d97706",
        bg: "bg-amber-50 dark:bg-amber-950/20",
        text: "text-amber-600 dark:text-amber-400",
        delay: 0.16,
        hoverShadow: "hover:shadow-[0_12px_25px_-5px_rgba(217,119,6,0.12)] dark:hover:shadow-[0_12px_25px_-5px_rgba(217,119,6,0.22)]",
        hoverBorder: "hover:border-amber-500/30 dark:hover:border-amber-500/50",
        hoverArrow: "group-hover:text-amber-600 dark:group-hover:text-amber-400",
      },
      {
        title: "Pending Inquiries",
        value: statsData?.pendingInquiries ?? 0,
        sub: "Unread contact messages",
        icon: Mail,
        color: "#dc2626",
        bg: "bg-rose-50 dark:bg-rose-950/20",
        text: "text-rose-600 dark:text-rose-400",
        delay: 0.24,
        hoverShadow: "hover:shadow-[0_12px_25px_-5px_rgba(220,38,38,0.12)] dark:hover:shadow-[0_12px_25px_-5px_rgba(220,38,38,0.22)]",
        hoverBorder: "hover:border-rose-500/30 dark:hover:border-rose-500/50",
        hoverArrow: "group-hover:text-rose-600 dark:group-hover:text-rose-400",
      },
    ];
  }, [statsData]);

  // 3. Website Quick links populated dynamically
  const websiteQuickLinks = useMemo(() => {
    return [
      { label: "Posts", href: "/dashboard/website/posts", icon: BookOpen, count: statsData?.totalPosts ?? 0 },
      { label: "Team Members", href: "/dashboard/website/team", icon: UserSquare2, count: statsData?.totalTeam ?? 0 },
      { label: "Inquiries", href: "/dashboard/website/contact/inquiries", icon: Bell, count: statsData?.pendingInquiries ?? 0, alert: (statsData?.pendingInquiries ?? 0) > 0 },
      { label: "Form Config", href: "/dashboard/website/contact/config", icon: Settings2, count: statsData?.totalConfigs ?? 0 },
    ];
  }, [statsData]);

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50/50 dark:bg-zinc-950/30 min-h-screen">

      {/* ── Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="w-4 h-4 text-[#00338D] dark:text-[#4d7cc7]" />
            <span className="text-xs font-bold text-[#00338D] dark:text-[#4d7cc7] uppercase tracking-widest">Dashboard Overview</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {greeting},{" "}
            <span className="text-[#00338D] dark:text-[#4d7cc7]">
              {user?.name?.split(" ")[0] || "Admin"}!
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Here's a snapshot of your{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-300">RRR Investments</span>{" "}
            admin system.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/dashboard/admin"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00338D] text-white text-xs font-bold hover:bg-[#00338D]/90 transition-colors shadow-md"
          >
            <Users className="w-3.5 h-3.5" />
            Manage Users
          </Link>
          <Link
            to="/dashboard/website/contact/inquiries"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors shadow-sm"
          >
            <Bell className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
            View Inquiries
          </Link>
        </div>
      </div>

      {/* ── System Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {systemStats.map((stat, i) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: stat.delay }}
          >
            <Card className={`border border-slate-100/60 dark:border-zinc-800/80 shadow-sm bg-card overflow-hidden group transition-all duration-300 hover:-translate-y-1.5 ${stat.hoverShadow} ${stat.hoverBorder}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`p-2 rounded-xl ${stat.bg} group-hover:scale-105 transition-transform duration-300`}>
                    <stat.icon className={`w-4 h-4 ${stat.text}`} />
                  </div>
                  <ArrowUpRight className={`w-3.5 h-3.5 text-slate-300 dark:text-zinc-600 ${stat.hoverArrow} transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5`} />
                </div>
                {isLoading ? (
                  <div className="h-8 w-16 bg-slate-200/85 dark:bg-zinc-800/85 animate-pulse rounded mb-0.5" />
                ) : (
                  <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{stat.value}</h3>
                )}
                <p className="text-xs font-bold text-slate-400 dark:text-zinc-400 uppercase tracking-wider mt-0.5">{stat.title}</p>
                <p className="text-xs text-slate-500 dark:text-zinc-300 mt-1 font-medium">{stat.sub}</p>
              </CardContent>
              <div
                className="h-0.5 w-full origin-left scale-x-75 group-hover:scale-x-100 opacity-20 dark:opacity-30 group-hover:opacity-100 transition-all duration-300"
                style={{ backgroundColor: stat.color }}
              />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* ── Module Hub ── */}
      <div>
        <h2 className="text-xs font-black text-slate-400 dark:text-zinc-400 uppercase tracking-widest mb-4">System Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {modules.map((mod, i) => (
            <motion.div
              key={mod.title}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.07 }}
            >
              <Link to={mod.href}>
                <Card className={`border ${mod.border} bg-gradient-to-br ${mod.bg} shadow-sm hover:shadow-md transition-all duration-200 group cursor-pointer h-full`}>
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${mod.bg.split(" ")[0]} group-hover:scale-110 transition-transform duration-300`}
                      style={{ backgroundColor: `${mod.color}15` }}>
                      <mod.icon className={`w-4.5 h-4.5 ${mod.text}`} style={{ width: 18, height: 18 }} />
                    </div>
                    <h3 className={`text-sm font-black ${mod.text} mb-1`}>{mod.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-300 leading-relaxed flex-1 mb-3">{mod.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {mod.badges.map((b) => (
                        <span key={b} className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-white/60 dark:bg-zinc-900/60 text-slate-500 dark:text-zinc-400 border border-slate-100 dark:border-zinc-800">
                          {b}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── Bottom: Activity + Quick Links ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Recent Activity */}
        <Card className="lg:col-span-8 border border-slate-100/60 dark:border-zinc-800/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between py-5 px-6 border-b border-slate-100 dark:border-zinc-800/80">
            <div>
              <CardTitle className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide">Recent Activity</CardTitle>
              <CardDescription className="text-xs text-slate-400 dark:text-zinc-400 mt-0.5">Latest admin actions across all modules</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-[480px] overflow-y-auto scrollbar-thin">
            <div className="divide-y divide-slate-50 dark:divide-zinc-800/60">
              {isLoading ? (
                // Shimmer Activity Loading skeletons
                Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="flex items-start gap-4 px-6 py-4 animate-pulse">
                    <div className="h-8 w-8 bg-slate-200 dark:bg-zinc-800 rounded-xl mt-0.5 shrink-0" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 bg-slate-200 dark:bg-zinc-800 rounded w-1/4" />
                      <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-1/2" />
                    </div>
                    <div className="h-3 bg-slate-200 dark:bg-zinc-800 rounded w-10 mt-1" />
                  </div>
                ))
              ) : !data?.recentActivity || data.recentActivity.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-400 dark:text-zinc-500">
                  No activity logs recorded yet.
                </div>
              ) : (
                data.recentActivity.map((item, i) => {
                  const IconComponent = getActivityIcon(item.action, item.module);
                  return (
                    <div key={i} className="flex items-start gap-4 px-6 py-4 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                      <div className={`mt-0.5 p-2 rounded-xl ${item.bg} shrink-0`}>
                        <IconComponent className={`w-3.5 h-3.5 ${item.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{item.action}</p>
                        <p className="text-xs text-slate-400 dark:text-zinc-400 mt-0.5 truncate">{item.detail}</p>
                      </div>
                      <span className="text-xs font-semibold text-slate-400 dark:text-zinc-400 shrink-0 mt-0.5">{item.time}</span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {/* Website Quick Links */}
        <Card className="lg:col-span-4 border border-slate-100/60 dark:border-zinc-800/80 shadow-sm bg-card">
          <CardHeader className="py-5 px-6 border-b border-slate-100 dark:border-zinc-800/80">
            <CardTitle className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Globe className="w-4 h-4 text-violet-500" />
              Website Module
            </CardTitle>
            <CardDescription className="text-xs text-slate-400 dark:text-zinc-400 mt-0.5">Quick access to content management</CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-2">
            {websiteQuickLinks.map((link, i) => (
              <Link
                key={i}
                to={link.href}
                className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50/70 dark:bg-zinc-900/50 hover:bg-violet-50/50 dark:hover:bg-violet-950/20 border border-transparent hover:border-violet-200/50 dark:hover:border-violet-800/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-800 shadow-sm">
                    <link.icon className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300 group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors">{link.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {isLoading ? (
                    <div className="h-5 w-8 bg-slate-200/80 dark:bg-zinc-800/80 animate-pulse rounded-md" />
                  ) : (
                    <Badge
                      variant="secondary"
                      className={`text-[10px] font-bold px-2 py-0.5 ${link.alert ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-none animate-pulse" : "bg-white dark:bg-zinc-800 text-slate-400 dark:text-zinc-500 border border-slate-100 dark:border-zinc-700"}`}
                    >
                      {link.count}
                    </Badge>
                  )}
                  <ChevronRight className="w-3 h-3 text-slate-300 dark:text-zinc-600 group-hover:text-violet-500 transition-colors" />
                </div>
              </Link>
            ))}

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
              <Link
                to="/dashboard/website/overview"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-xs font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-colors"
              >
                View Website Overview
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
};

export default Dashboard;
