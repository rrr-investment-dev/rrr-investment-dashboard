import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchPosts,
  fetchTeamMembers,
  fetchInquiries,
  fetchFormConfigs,
} from "@/http/api";
import {
  FileText,
  Users,
  Mail,
  Settings2,
  ArrowRight,
  TrendingUp,
  Clock,
  LayoutTemplate,
  Loader2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const colorMap: Record<string, { bg: string; text: string; darkBg: string; darkText: string; lightBg: string; darkLightBg: string }> = {
  blue: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    darkBg: "dark:bg-blue-950/20",
    darkText: "dark:text-blue-400",
    lightBg: "bg-blue-100",
    darkLightBg: "dark:bg-blue-950/30",
  },
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-600",
    darkBg: "dark:bg-emerald-950/20",
    darkText: "dark:text-emerald-400",
    lightBg: "bg-emerald-100",
    darkLightBg: "dark:bg-emerald-950/30",
  },
  rose: {
    bg: "bg-rose-50",
    text: "text-rose-600",
    darkBg: "dark:bg-rose-950/20",
    darkText: "dark:text-rose-400",
    lightBg: "bg-rose-100",
    darkLightBg: "dark:bg-rose-950/30",
  },
  indigo: {
    bg: "bg-indigo-50",
    text: "text-indigo-600",
    darkBg: "dark:bg-indigo-950/20",
    darkText: "dark:text-indigo-400",
    lightBg: "bg-indigo-100",
    darkLightBg: "dark:bg-indigo-950/30",
  },
};

const WebsiteOverview = () => {
  const navigate = useNavigate();

  // Parallel data fetching for metrics
  const { data: postsData, isLoading: isLoadingPosts } = useQuery({
    queryKey: ["posts", { page: 1, limit: 100 }],
    queryFn: () => fetchPosts({ page: 1, limit: 100 }),
  });

  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ["teamMembers"],
    queryFn: fetchTeamMembers,
  });

  const { data: inquiriesData, isLoading: isLoadingInquiries } = useQuery({
    queryKey: ["inquiries"],
    queryFn: () => fetchInquiries({ page: 1, limit: 5 }), // Only fetch recent 5 for overview
  });

  const { data: configsData, isLoading: isLoadingConfigs } = useQuery({
    queryKey: ["formConfigs"],
    queryFn: fetchFormConfigs,
  });

  const isLoading = isLoadingPosts || isLoadingTeam || isLoadingInquiries || isLoadingConfigs;

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  const activePostsCount = postsData?.posts?.filter((p: any) => p.status === "published").length || 0;
  const activeTeamCount = teamData?.filter((t: any) => t.isActive).length || 0;
  const unreadInquiriesCount = inquiriesData?.inquiries?.filter((i: any) => i.status === "unread").length || 0;
  const activeFieldsCount = configsData?.filter((c: any) => c.isActive).length || 0;
  const recentInquiries = inquiriesData?.inquiries || [];

  const statCards = [
    {
      title: "Active Posts",
      value: activePostsCount,
      icon: FileText,
      color: "blue",
      link: "/dashboard/website/posts",
      description: "Published articles",
    },
    {
      title: "Team Members",
      value: activeTeamCount,
      icon: Users,
      color: "emerald",
      link: "/dashboard/website/team",
      description: "Active profiles on site",
    },
    {
      title: "Unread Inquiries",
      value: unreadInquiriesCount,
      icon: Mail,
      color: "rose",
      link: "/dashboard/website/contact/inquiries",
      description: "Requires attention",
    },
    {
      title: "Active Fields",
      value: activeFieldsCount,
      icon: Settings2,
      color: "indigo",
      link: "/dashboard/website/contact/config",
      description: "Form configuration",
    },
  ];

  return (
    <div className="w-full space-y-8 pb-20 pt-6 px-4 sm:px-6 animate-in fade-in duration-500">
      {/* 🚀 Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
          <LayoutTemplate className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          Website Overview
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-2">
          Manage your public website content, team profiles, and form submissions.
        </p>
      </div>

      {/* 📊 Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          const colors = colorMap[stat.color] || colorMap.blue;
          return (
            <Card
              key={index}
              className="border border-slate-100/50 dark:border-zinc-800/80 shadow-xl shadow-slate-200/10 dark:shadow-none rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 bg-card group cursor-pointer"
              onClick={() => navigate(stat.link)}
            >
              <CardContent className="p-6 relative overflow-hidden">
                <div className={`absolute -right-6 -top-6 w-24 h-24 ${colors.bg} ${colors.darkBg} rounded-full group-hover:scale-150 transition-transform duration-500 opacity-50`} />
                <div className="relative z-10 flex justify-between items-start">
                  <div className="space-y-4">
                    <div className={`w-12 h-12 ${colors.lightBg} ${colors.darkLightBg} rounded-2xl flex items-center justify-center`}>
                      <Icon className={`h-6 w-6 ${colors.text} ${colors.darkText}`} />
                    </div>
                    <div>
                      <h3 className="text-3xl font-black text-slate-800 dark:text-slate-100">{stat.value}</h3>
                      <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-1">{stat.title}</p>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">{stat.description}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className={`${colors.text} ${colors.darkText} hover:bg-slate-100 dark:hover:bg-zinc-800 -mr-2`}>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 📋 Quick Actions & Recent Data */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border border-slate-100/50 dark:border-zinc-800/80 shadow-sm rounded-2xl overflow-hidden bg-card">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Quick Actions
              </h3>
            </div>
            <CardContent className="p-4 space-y-3">
              <Link to="/dashboard/website/posts" className="block p-4 rounded-xl border border-slate-100 dark:border-zinc-800/80 hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-2 rounded-lg shadow-sm">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Publish a Post</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Create new website content</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </Link>
              <Link to="/dashboard/website/team" className="block p-4 rounded-xl border border-slate-100 dark:border-zinc-800/80 hover:border-emerald-200 dark:hover:border-emerald-900/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-2 rounded-lg shadow-sm">
                      <Users className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Add Team Member</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Update company directory</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                </div>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Inquiries */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border border-slate-100/50 dark:border-zinc-800/80 shadow-sm rounded-2xl overflow-hidden h-full bg-card">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Clock className="h-5 w-5 text-rose-500" />
                Recent Inquiries
              </h3>
              <Link to="/dashboard/website/contact/inquiries" className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                View All
              </Link>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-zinc-800/80">
                {recentInquiries.length > 0 ? (
                  recentInquiries.map((inquiry: any) => {
                    const name = inquiry.responses?.fullName || inquiry.responses?.name || "Anonymous";
                    const isUnread = inquiry.status === "unread";
                    return (
                      <div key={inquiry._id} className="p-5 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`h-2.5 w-2.5 rounded-full ${isUnread ? 'bg-rose-500 animate-pulse' : 'bg-slate-300 dark:bg-zinc-700'}`} />
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{new Date(inquiry.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" className="h-8 text-xs font-bold bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 shadow-sm hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-600 dark:text-slate-300" onClick={() => navigate(`/dashboard/website/contact/inquiries/${inquiry._id}`)}>
                          Review
                        </Button>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-12 text-center">
                    <p className="text-slate-400 dark:text-slate-500 italic text-sm">No recent inquiries to show.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WebsiteOverview;
