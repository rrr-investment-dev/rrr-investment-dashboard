import React, { useState, useMemo } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Mail,
  Shield,
  Info,
  UserPlus,
  ExternalLink,
  Settings,
  ArrowLeft,
  RefreshCw,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Categories structure
type NotificationCategory = "system" | "security" | "inquiry";

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  category: NotificationCategory;
  isRead: boolean;
  link?: string;
  linkText?: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "New Website Inquiry",
    detail: "Received a new inquiry from John Doe regarding 'Portfolio Management Services'.",
    time: "5 mins ago",
    category: "inquiry",
    isRead: false,
    link: "/dashboard/website/contact/inquiries",
    linkText: "View Inquiry",
  },
  {
    id: "notif-2",
    title: "New User Registered",
    detail: "User 'meet.sudra77@gmail.com' successfully registered in the system.",
    time: "42 mins ago",
    category: "security",
    isRead: false,
    link: "/dashboard/admin/userMgt/user",
    linkText: "Manage Users",
  },
  {
    id: "notif-3",
    title: "System Update Complete",
    detail: "Dashboard backend successfully updated to Version 1.2.4 without downtime.",
    time: "2 hours ago",
    category: "system",
    isRead: true,
  },
  {
    id: "notif-4",
    title: "Failed Login Alert",
    detail: "Multiple failed login attempts detected from IP 192.168.1.120. Account locked temporarily.",
    time: "5 hours ago",
    category: "security",
    isRead: false,
  },
  {
    id: "notif-5",
    title: "Database Backup Success",
    detail: "Automatic nightly backup of transaction logs and configurations completed successfully.",
    time: "14 hours ago",
    category: "system",
    isRead: true,
  },
  {
    id: "notif-6",
    title: "Inquiry Feedbacks Required",
    detail: "Website feedback inquiry form received positive response from client 'Alice Smith'.",
    time: "1 day ago",
    category: "inquiry",
    isRead: true,
    link: "/dashboard/website/contact/inquiries",
    linkText: "Check inquiries",
  },
];

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<"all" | "unread" | NotificationCategory>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Notification Preference Settings States
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [securityAlerts, setSecurityAlerts] = useState(true);
  const [inquiryAlerts, setInquiryAlerts] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(false);

  // Tabs structure
  const tabs = [
    { id: "all", label: "All" },
    { id: "unread", label: "Unread" },
    { id: "system", label: "System" },
    { id: "security", label: "Security" },
    { id: "inquiry", label: "Inquiries" },
  ];

  // Counters
  const counts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      system: notifications.filter((n) => n.category === "system").length,
      security: notifications.filter((n) => n.category === "security").length,
      inquiry: notifications.filter((n) => n.category === "inquiry").length,
    };
  }, [notifications]);

  // Filtered Notifications List
  const filteredNotifications = useMemo(() => {
    switch (activeTab) {
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "all":
        return notifications;
      default:
        return notifications.filter((n) => n.category === activeTab);
    }
  }, [notifications, activeTab]);

  // Actions
  const handleMarkAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    toast.success("Notification marked as read");
  };

  const handleToggleReadStatus = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: !n.isRead } : n))
    );
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.success("Notification deleted");
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    toast.success("All notifications marked as read");
  };

  const handleClearAll = () => {
    setNotifications([]);
    toast.success("All notifications cleared");
  };

  const handleResetData = () => {
    setNotifications(INITIAL_NOTIFICATIONS);
    setExpandedId(null);
    toast.info("Notification data reset");
  };

  const getCategoryStyles = (category: NotificationCategory) => {
    switch (category) {
      case "security":
        return {
          icon: Shield,
          color: "text-rose-500",
          bg: "bg-rose-500/10 dark:bg-rose-500/20",
          border: "border-rose-500/20",
        };
      case "inquiry":
        return {
          icon: Mail,
          color: "text-violet-500",
          bg: "bg-violet-500/10 dark:bg-violet-500/20",
          border: "border-violet-500/20",
        };
      case "system":
        return {
          icon: Info,
          color: "text-blue-500",
          bg: "bg-blue-500/10 dark:bg-blue-500/20",
          border: "border-blue-500/20",
        };
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50/50 dark:bg-zinc-950/30 min-h-screen">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => navigate(-1)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-[#00338D] dark:text-[#4d7cc7] uppercase tracking-widest">
              Account Hub
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            System Notifications
            {counts.unread > 0 && (
              <Badge className="bg-rose-500 hover:bg-rose-600 text-white font-black px-2 py-0.5 rounded-full text-xs">
                {counts.unread} New
              </Badge>
            )}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View security alerts, system logs, and contact message notifications.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {notifications.length > 0 ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={counts.unread === 0}
                className="rounded-xl border-slate-200 dark:border-zinc-800 text-xs font-bold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5 mr-1" />
                Mark all read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearAll}
                className="rounded-xl border-slate-200 dark:border-rose-950/30 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:border-rose-200 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" />
                Clear all
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
              className="rounded-xl border-slate-200 dark:border-zinc-800 text-xs font-bold text-[#00338D] dark:text-[#4d7cc7] hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Reset dummy data
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── Tabs & Notification List ── */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tab buttons */}
          <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-zinc-800 pb-px overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const count = counts[tab.id as keyof typeof counts];
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as typeof activeTab);
                    setExpandedId(null);
                  }}
                  className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? "border-[#00338D] dark:border-[#4d7cc7] text-[#00338D] dark:text-[#4d7cc7]"
                      : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  }`}
                >
                  {tab.label}
                  {count > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-[#00338D]/10 dark:bg-[#4d7cc7]/20 text-[#00338D] dark:text-[#4d7cc7]"
                          : "bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-500"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* List items */}
          <Card className="border border-slate-100/60 dark:border-zinc-800/80 shadow-sm bg-card overflow-hidden">
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
                <AnimatePresence mode="popLayout">
                  {filteredNotifications.length === 0 ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-16 px-4 space-y-4"
                    >
                      <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-300 dark:text-zinc-700">
                        <Bell className="w-6 h-6" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">
                          All caught up!
                        </h3>
                        <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-[280px] mx-auto">
                          No notifications found in {activeTab === "all" ? "this vault" : `"${activeTab}" tab`}.
                        </p>
                      </div>
                      {notifications.length === 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResetData}
                          className="mt-2 rounded-xl border-slate-200 dark:border-zinc-800 text-xs font-bold text-[#00338D] dark:text-[#4d7cc7] hover:bg-slate-50 dark:hover:bg-zinc-800 cursor-pointer"
                        >
                          Restore defaults
                        </Button>
                      )}
                    </motion.div>
                  ) : (
                    filteredNotifications.map((notif) => {
                      const { icon: CategoryIcon, color: iconColor, bg: iconBg } = getCategoryStyles(notif.category);
                      const isExpanded = expandedId === notif.id;

                      return (
                        <motion.div
                          key={notif.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setExpandedId(isExpanded ? null : notif.id)}
                          className={`flex items-start gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer relative group ${
                            !notif.isRead ? "bg-[#00338D]/[0.01] dark:bg-[#4d7cc7]/[0.01]" : ""
                          }`}
                        >
                          {/* Unread indicator bar */}
                          {!notif.isRead && (
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#00338D] dark:bg-[#4d7cc7]" />
                          )}

                          {/* Icon */}
                          <div className={`p-2.5 rounded-xl ${iconBg} shrink-0 mt-0.5`}>
                            <CategoryIcon className={`w-4.5 h-4.5 ${iconColor}`} />
                          </div>

                          {/* Text Detail */}
                          <div className="flex-1 min-w-0 space-y-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm ${!notif.isRead ? "font-bold text-slate-800 dark:text-slate-100" : "font-semibold text-slate-600 dark:text-slate-400"}`}>
                                {notif.title}
                              </h4>
                              {!notif.isRead && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#00338D] dark:bg-[#4d7cc7]" />
                              )}
                            </div>
                            
                            <p className={`text-xs leading-relaxed ${isExpanded ? "text-slate-600 dark:text-slate-300" : "text-slate-500 dark:text-zinc-500 line-clamp-1"}`}>
                              {notif.detail}
                            </p>

                            {/* Relative time + links */}
                            <div className="flex items-center gap-3 pt-1 text-[11px] font-bold text-slate-400 dark:text-zinc-500">
                              <span>{notif.time}</span>
                              {notif.link && isExpanded && (
                                <Link
                                  to={notif.link}
                                  onClick={(e) => e.stopPropagation()}
                                  className="text-[#00338D] dark:text-[#4d7cc7] hover:underline flex items-center gap-0.5"
                                >
                                  {notif.linkText || "View details"}
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </Link>
                              )}
                            </div>

                            {/* Additional Actions inside expanded card */}
                            {isExpanded && (
                              <div className="flex items-center gap-2 pt-3" onClick={(e) => e.stopPropagation()}>
                                {!notif.isRead ? (
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                                    className="h-7 text-[10px] rounded-lg cursor-pointer bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 transition-colors"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Mark as read
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => handleToggleReadStatus(notif.id, e)}
                                    className="h-7 text-[10px] rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                  >
                                    <Eye className="w-3 h-3 mr-1" />
                                    Mark unread
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => handleDelete(notif.id, e)}
                                  className="h-7 text-[10px] rounded-lg cursor-pointer text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            )}
                          </div>

                          {/* Quick hover toolbar (hidden on mobile, visible on desktop hover) */}
                          <div className="hidden md:flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-all ml-4 pointer-events-auto shrink-0" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={(e) => handleToggleReadStatus(notif.id, e)}
                              className={`p-1.5 rounded-lg border border-slate-100 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-zinc-850 hover:shadow-xs transition-all ${
                                notif.isRead ? "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" : "text-[#00338D] dark:text-[#4d7cc7]"
                              }`}
                              title={notif.isRead ? "Mark unread" : "Mark as read"}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(notif.id, e)}
                              className="p-1.5 rounded-lg border border-slate-100 dark:border-zinc-800/80 text-slate-400 hover:text-rose-500 hover:border-rose-100 dark:hover:border-rose-950/20 hover:bg-white dark:hover:bg-zinc-850 hover:shadow-xs transition-all"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Settings Panel Sidebar ── */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border border-slate-100/60 dark:border-zinc-800/80 shadow-sm bg-card">
            <CardHeader className="py-5 px-6 border-b border-slate-100 dark:border-zinc-800/80">
              <CardTitle className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#00338D] dark:text-[#4d7cc7]" />
                Preferences
              </CardTitle>
              <CardDescription className="text-xs text-slate-400 dark:text-zinc-500 mt-0.5 font-bold">
                Configure your routing channels
              </CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="space-y-4">
                {/* Switch Item 1: Email notifications */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Alerts</label>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-normal">Send summaries to registered email address</p>
                  </div>
                  <button
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      emailAlerts ? "bg-[#00338D] dark:bg-[#4d7cc7]" : "bg-slate-200 dark:bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        emailAlerts ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch Item 2: Security alerts */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Security Logs</label>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-normal">Alert on user locks, failures, and updates</p>
                  </div>
                  <button
                    onClick={() => setSecurityAlerts(!securityAlerts)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      securityAlerts ? "bg-[#00338D] dark:bg-[#4d7cc7]" : "bg-slate-200 dark:bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        securityAlerts ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch Item 3: Inquiry submissions */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Contact Forms</label>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-normal">Notify immediately on website form inquiries</p>
                  </div>
                  <button
                    onClick={() => setInquiryAlerts(!inquiryAlerts)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      inquiryAlerts ? "bg-[#00338D] dark:bg-[#4d7cc7]" : "bg-slate-200 dark:bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        inquiryAlerts ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Switch Item 4: System maintenance */}
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">System Logs</label>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 leading-normal">Logs for routine database and bundle updates</p>
                  </div>
                  <button
                    onClick={() => setSystemAlerts(!systemAlerts)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      systemAlerts ? "bg-[#00338D] dark:bg-[#4d7cc7]" : "bg-slate-200 dark:bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                        systemAlerts ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-zinc-800 text-[10px] text-slate-400 dark:text-zinc-500 leading-relaxed font-semibold">
                * Toggles are simulated and saved automatically to client dashboard configuration state.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
