import { useMemo, type ElementType } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus, 
  PlusCircle, 
  ShieldCheck, 
  Key, 
  AlertTriangle,
  ChevronRight,
  TrendingUp,
  LayoutGrid
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip 
} from "recharts";
import { motion } from "framer-motion";

import { fetchUsers, fetchAllRoles, fetchAdminOverview } from "@/http/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "../../../components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

// --- Types ---

interface StatCardProps {
  title: string;
  value: number;
  icon: ElementType;
  color: string;
  delay: number;
  badgeText: string;
  badgeColor?: string;
}

interface ActivityItemProps {
  user: string;
  action: string;
  detail: string;
  time: string;
  icon: ElementType;
  color: string;
}

interface UserData {
  isActive: boolean;
  role: string;
}

// --- Components ---

const colorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string; border: string }> = {
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    darkBg: "dark:bg-indigo-950/30",
    darkText: "dark:text-indigo-400",
    border: "from-indigo-400 to-indigo-600",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    darkBg: "dark:bg-emerald-950/30",
    darkText: "dark:text-emerald-400",
    border: "from-emerald-400 to-emerald-600",
  },
  slate: {
    bg: "bg-slate-50",
    text: "text-slate-600",
    darkBg: "dark:bg-slate-800/40",
    darkText: "dark:text-slate-400",
    border: "from-slate-400 to-slate-600",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-600",
    darkBg: "dark:bg-amber-950/30",
    darkText: "dark:text-amber-400",
    border: "from-amber-400 to-amber-600",
  },
};

const getIconColors = (colorClass: string) => {
  const name = colorClass.split("-")[1]; // blue, purple, rose, emerald, etc.
  return `text-${name}-600 dark:text-${name}-400 bg-${name}-500/10 dark:bg-${name}-500/20`;
};

const StatCard = ({ title, value, icon: Icon, color, delay, badgeText, badgeColor }: StatCardProps) => {
  const colorName = color.split('-')[1];
  const colors = colorMap[colorName] || colorMap.indigo;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className="overflow-hidden border border-slate-100/50 dark:border-zinc-800/80 shadow-sm hover:shadow-lg transition-all duration-300 bg-card group">
        <CardContent className="p-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${colors.bg} ${colors.darkBg} group-hover:scale-110 transition-transform duration-300`}>
                <Icon className={`w-6 h-6 ${colors.text} ${colors.darkText}`} />
              </div>
              <div className={`flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold border ${badgeColor}`}>
                {badgeText}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">{title}</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">{value}</h3>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">this month</span>
              </div>
            </div>
          </div>
          <div className={`h-1 w-full bg-gradient-to-r ${colors.border} opacity-20 group-hover:opacity-100 transition-opacity`} />
        </CardContent>
      </Card>
    </motion.div>
  );
};

const formatActionSentence = (user: string, action: string) => {
  const lower = action.toLowerCase();
  const actor = user === "System Action" || user === "System" ? "System" : user;
  
  if (lower.includes("created") || lower.includes("create")) {
    if (lower.includes("role")) return `${actor} created a new security role`;
    if (lower.includes("user")) return `${actor} registered a new user account`;
    return `${actor} created a new entry`;
  }
  if (lower.includes("updated") || lower.includes("update")) {
    if (lower.includes("role")) return `${actor} updated security role details`;
    if (lower.includes("user")) return `${actor} updated user account details`;
    return `${actor} updated the database record`;
  }
  if (lower.includes("deleted") || lower.includes("delete") || lower.includes("removed") || lower.includes("remove")) {
    if (lower.includes("role")) return `${actor} deleted a security role`;
    if (lower.includes("user")) return `${actor} deleted a user account`;
    return `${actor} deleted an entry`;
  }
  if (lower.includes("registered") || lower.includes("register")) {
    return `${actor} registered a new user account`;
  }
  if (lower.includes("toggled") || lower.includes("toggle") || lower.includes("status")) {
    return `${actor} changed the account active status`;
  }
  if (lower.includes("permissions") || lower.includes("override") || lower.includes("access")) {
    return `${actor} modified security access permissions`;
  }
  
  return `${actor} performed: ${action}`;
};

const ActivityItem = ({ user, action, detail, time, icon: Icon, color }: ActivityItemProps) => {
  const iconColors = getIconColors(color);
  return (
    <div className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
      <div className={`mt-1 p-2 rounded-full shrink-0 ${iconColors}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-200">
            {formatActionSentence(user, action)}
          </p>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">{time}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{detail}</p>
      </div>
    </div>
  );
};

const AdminOverview = () => {
  // Fetch data
  const { data: users = [], isLoading: isLoadingUsers } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchAllRoles,
  });

  const { data: adminData, isLoading: isLoadingAdmin } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: fetchAdminOverview,
    staleTime: 0,
    refetchOnMount: "always",
  });

  // Derived Stats
  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter((u: UserData) => u.isActive).length;
    const inactive = total - active;
    
    return {
      total,
      active,
      inactive,
      totalRoles: roles.length
    };
  }, [users, roles]);

  // Chart Data
  const roleDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    users.forEach((u: UserData) => {
      const roleName = u.role || "Unassigned";
      counts[roleName] = (counts[roleName] || 0) + 1;
    });

    const colors = ["#4F46E5", "#818CF8", "#2DD4BF", "#F43F5E", "#F59E0B"];
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  }, [users]);



  if (isLoadingUsers || isLoadingRoles || isLoadingAdmin) {
    return (
      <div className="p-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Skeleton className="lg:col-span-5 h-[400px] rounded-2xl" />
          <Skeleton className="lg:col-span-7 h-[400px] rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50/50 dark:bg-zinc-950/30 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 border-none px-2 py-0 text-[10px] font-bold uppercase tracking-wider">
              Management Module
            </Badge>
            <span className="text-slate-300 dark:text-slate-700">/</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Access Control</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            User & Role <span className="text-indigo-600 dark:text-indigo-400">Overview</span>
          </h1>
          <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>{stats.total} Managed Users</span>
            </div>
            <div className="h-4 w-px bg-slate-200 dark:bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              <span>{stats.totalRoles} Security Roles</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative group min-w-[240px]">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Users className="w-4 h-4 text-slate-400 dark:text-slate-500 group-focus-within:text-indigo-500 dark:group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input 
              type="text" 
              placeholder="Search users or roles..." 
              className="w-full h-11 pl-10 pr-4 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-11 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 px-4 rounded-xl text-slate-600 dark:text-slate-300">
              <LayoutGrid className="w-4 h-4 mr-2 text-slate-400 dark:text-slate-500" />
              <span className="font-bold text-xs">Settings</span>
            </Button>
            <Button size="sm" className="h-11 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 shadow-md px-6 rounded-xl group">
              <PlusCircle className="w-4 h-4 mr-2" />
              <span className="font-bold text-xs text-white">Quick Add</span>
            </Button>
          </div>
        </div>
      </div>

      {/* --- Stat Cards (4-Card Layout) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.total} 
          icon={Users} 
          color="bg-indigo-500" 
          delay={0}
          badgeText="System"
          badgeColor="bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 border-indigo-100/50 dark:border-indigo-900/30"
        />
        <StatCard 
          title="Active Users" 
          value={stats.active} 
          icon={UserCheck} 
          color="bg-emerald-500" 
          delay={0.1}
          badgeText={stats.total > 0 ? `${Math.round((stats.active / stats.total) * 100)}% active` : "0% active"}
          badgeColor="bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-100/50 dark:border-emerald-900/30"
        />
        <StatCard 
          title="Inactive Users" 
          value={stats.inactive} 
          icon={UserX} 
          color="bg-slate-500" 
          delay={0.2}
          badgeText={stats.total > 0 ? `${Math.round((stats.inactive / stats.total) * 100)}% inactive` : "0% inactive"}
          badgeColor="bg-slate-100/50 dark:bg-zinc-800/20 text-slate-600 dark:text-zinc-400 border-slate-200/50 dark:border-zinc-700/30"
        />
        <StatCard 
          title="Total Roles" 
          value={stats.totalRoles} 
          icon={ShieldCheck} 
          color="bg-amber-500" 
          delay={0.3}
          badgeText="Authorized"
          badgeColor="bg-amber-50/50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 border-amber-100/50 dark:border-amber-900/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- Recent Activities --- */}
        <Card className="lg:col-span-5 border border-slate-100/50 dark:border-zinc-800/80 bg-card shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between py-5 px-6 border-b border-slate-100 dark:border-zinc-800/80">
            <CardTitle className="text-lg font-semibold">Recent User Activities</CardTitle>
            <Button variant="ghost" size="sm" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 font-medium">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            <ScrollArea className="h-[380px] px-6 py-4">
              <div className="space-y-6">
                {!adminData?.recentActivity || adminData.recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-400 dark:text-zinc-500">
                    No recent admin activities recorded yet.
                  </div>
                ) : (
                  adminData.recentActivity.map((item, index) => {
                    const lowerAction = item.action.toLowerCase();
                    let IconComponent = UserPlus;
                    if (lowerAction.includes("role")) {
                      IconComponent = ShieldCheck;
                    } else if (lowerAction.includes("permission") || lowerAction.includes("key")) {
                      IconComponent = Key;
                    } else if (lowerAction.includes("status") || lowerAction.includes("toggle") || lowerAction.includes("active") || lowerAction.includes("login")) {
                      IconComponent = UserCheck;
                    }
                    
                    return (
                      <ActivityItem 
                        key={index}
                        user={item.user} 
                        action={item.action} 
                        detail={item.detail} 
                        time={item.time} 
                        icon={IconComponent} 
                        color={item.color}
                      />
                    );
                  })
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* --- Role Distribution --- */}
        <Card className="lg:col-span-7 border border-slate-100/50 dark:border-zinc-800/80 bg-card shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="py-5 px-6 border-b border-slate-100 dark:border-zinc-800/80">
            <CardTitle className="text-lg font-semibold">Role Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-8 flex flex-col md:flex-row items-center justify-center gap-12 flex-1">
            <div className="w-64 h-64 relative min-h-0 min-w-0">
              <ResponsiveContainer width="99%" height="99%" minWidth={0} minHeight={0} debounce={1}>
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    dataKey="value"
                    stroke="none"
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: '12px', 
                      border: 'none', 
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)', 
                      backgroundColor: 'var(--card)', 
                      color: 'var(--card-foreground)' 
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black text-slate-800 dark:text-slate-100">{stats.total}</span>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Users</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-5 w-full max-w-sm">
              {roleDistribution.map((role, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-default">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: role.color }} />
                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">{role.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{role.value}</span>
                    <span className="text-[10px] font-bold text-slate-300 dark:text-slate-600 uppercase">Users</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* --- Quick Actions --- */}
        <Card className="border border-slate-100/50 dark:border-zinc-800/80 shadow-sm bg-card">
          <CardHeader className="py-5 px-6 border-b border-slate-100 dark:border-zinc-800/80">
            <CardTitle className="text-lg font-semibold">Administrative Actions</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Button className="h-16 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-2xl shadow-md hover:shadow-lg transition-all justify-start px-6" asChild>
                <a href="/dashboard/admin/userMgt/user">
                  <div className="p-2 rounded-lg bg-white/10 mr-4">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold">Create User</span>
                    <span className="text-[10px] opacity-70">Add new member</span>
                  </div>
                </a>
              </Button>
              <Button className="h-16 bg-indigo-500 hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400 text-white rounded-2xl shadow-md hover:shadow-lg transition-all justify-start px-6" asChild>
                <a href="/dashboard/admin/userMgt/roleType">
                  <div className="p-2 rounded-lg bg-white/10 mr-4">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="font-bold">Create Role</span>
                    <span className="text-[10px] opacity-70">Define permissions</span>
                  </div>
                </a>
              </Button>
              <Button variant="outline" className="h-16 border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/50 rounded-2xl justify-start px-6 group transition-all">
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 mr-4 group-hover:scale-110 transition-transform">
                  <Key className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex flex-col items-start text-left flex-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Manage Permissions</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Global access control</span>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 dark:text-slate-500" />
              </Button>
              <Button variant="outline" className="h-16 border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-zinc-800/50 rounded-2xl justify-start px-6 group transition-all">
                <div className="p-2 rounded-lg bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800 mr-4 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex flex-col items-start text-left flex-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">System Audit</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Review security logs</span>
                </div>
                <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 dark:text-slate-500" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* --- Critical Alerts --- */}
        <Card className="border border-slate-100/50 dark:border-zinc-800/80 shadow-sm bg-card">
          <CardHeader className="flex flex-row items-center justify-between py-5 px-6 border-b border-slate-100 dark:border-zinc-800/80">
            <CardTitle className="text-lg font-semibold">Critical Alerts</CardTitle>
            <Button variant="ghost" size="sm" className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 font-bold">
              View All
            </Button>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-amber-50/30 dark:bg-amber-950/10 border border-amber-100/50 dark:border-amber-900/30 group cursor-pointer hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-all">
              <div className="p-3 rounded-xl bg-amber-500 bg-opacity-10 dark:bg-opacity-20 group-hover:rotate-12 transition-transform">
                <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Permission Mismatch</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {adminData?.alerts?.permissionMismatch ?? 0} {adminData?.alerts?.permissionMismatch === 1 ? "user has" : "users have"} manually overridden roles
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-300 dark:text-amber-700 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors" />
            </div>
            <div className="flex items-center gap-5 p-5 rounded-2xl bg-rose-50/30 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/30 group cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all">
              <div className="p-3 rounded-xl bg-rose-500 bg-opacity-10 dark:bg-opacity-20 group-hover:rotate-12 transition-transform">
                <UserX className="w-6 h-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Dormant Accounts</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {adminData?.alerts?.dormantAccounts ?? 0} {adminData?.alerts?.dormantAccounts === 1 ? "account is" : "accounts are"} currently inactive
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-rose-300 dark:text-rose-700 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminOverview;
