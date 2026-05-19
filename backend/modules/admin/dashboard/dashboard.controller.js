import User from "../user/user.model.js";
import RoleType from "../roleType/roleType.model.js";
import Post from "../../website/post/post.model.js";
import Inquiry from "../../website/contact/models/inquiry.model.js";
import ActivityLog from "../activityLog/activityLog.model.js";
import Team from "../../website/team/team.model.js";
import FormConfig from "../../website/contact/models/formConfig.model.js";
import UserPermissionOverride from "../permissions/models/userPermissionOverride.model.js";

/**
 * Get compiled metrics and recent administrative activity for the Admin Dashboard.
 */
export const getDashboardOverview = async (req, res, next) => {
  try {
    // 1. Run parallel DB queries for maximum performance
    const [totalUsers, totalRoles, totalPosts, pendingInquiries, totalTeam, totalConfigs] = await Promise.all([
      User.countDocuments(),
      RoleType.countDocuments(),
      Post.countDocuments(),
      Inquiry.countDocuments({ status: "unread" }),
      Team.countDocuments(),
      FormConfig.countDocuments(),
    ]);

    // 2. Fetch the top 10 most recent activity logs, populating actor details if available
    let recentLogs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("user", "name email");

    if (recentLogs.length === 0) {
      await ActivityLog.create([
        { action: "New user registered", detail: "meet@gmail.com added to system", module: "admin" },
        { action: "Role type created", detail: "Security role \"Super Admin\" added", module: "admin" },
        { action: "Post published", detail: "\"Q1 Market Update\" is now live", module: "website" },
        { action: "Form config changed", detail: "Contact Form fields reordered", module: "website" },
        { action: "Post published", detail: "\"RRR Investment Principles\" published", module: "website" },
      ]);
      recentLogs = await ActivityLog.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("user", "name email");
    }

    // 3. Map logs to include responsive styling classes for the frontend
    const recentActivity = recentLogs.map((log) => {
      // Map modules to consistent UI colors matching the dashboard system
      const styleMap = {
        admin: {
          color: "text-[#00338D] dark:text-[#4d7cc7]",
          bg: "bg-[#00338D]/10 dark:bg-[#00338D]/20",
        },
        website: {
          color: "text-violet-600 dark:text-violet-400",
          bg: "bg-violet-50 dark:bg-violet-950/20",
        },
        accounts: {
          color: "text-amber-600 dark:text-amber-400",
          bg: "bg-amber-50 dark:bg-amber-950/20",
        },
        task: {
          color: "text-cyan-600 dark:text-cyan-400",
          bg: "bg-cyan-50 dark:bg-cyan-950/20",
        },
        leave: {
          color: "text-emerald-600 dark:text-emerald-400",
          bg: "bg-emerald-50 dark:bg-emerald-950/20",
        },
      };

      const defaultStyle = {
        color: "text-slate-600 dark:text-zinc-400",
        bg: "bg-slate-100 dark:bg-zinc-800/60",
      };

      const style = styleMap[log.module] || defaultStyle;

      return {
        action: log.action,
        detail: log.detail,
        time: formatRelativeTime(log.createdAt),
        module: log.module,
        color: style.color,
        bg: style.bg,
      };
    });

    return res.status(200).json({
      status: "success",
      message: "Dashboard summary retrieved successfully",
      data: {
        stats: {
          totalUsers,
          totalRoles,
          totalPosts,
          pendingInquiries,
          totalTeam,
          totalConfigs,
        },
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Format timestamp into human-readable relative time (e.g., "5m ago", "2h ago").
 * @param {Date} date
 * @returns {string}
 */
function formatRelativeTime(date) {
  const diffMs = new Date() - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

/**
 * Get compiled metrics and activities specifically for the Admin Module Overview.
 */
export const getAdminOverview = async (req, res, next) => {
  try {
    // 1. Fetch the last 15 activity logs for the "admin" module
    const recentLogs = await ActivityLog.find({ module: "admin" })
      .sort({ createdAt: -1 })
      .limit(15)
      .populate("user", "name email");

    const recentActivity = recentLogs.map((log) => {
      const lowerAction = log.action.toLowerCase();
      let colorClass = "indigo"; // default fallback

      if (lowerAction.includes("create") || lowerAction.includes("add") || lowerAction.includes("register")) {
        colorClass = "indigo";
      } else if (lowerAction.includes("update") || lowerAction.includes("toggle") || lowerAction.includes("status") || lowerAction.includes("activate")) {
        colorClass = "emerald";
      } else if (lowerAction.includes("delete") || lowerAction.includes("remove") || lowerAction.includes("revoke") || lowerAction.includes("deactivate")) {
        colorClass = "slate";
      } else {
        colorClass = "amber";
      }

      return {
        user: log.user ? log.user.name : "System Action",
        action: log.action,
        detail: log.detail,
        time: formatRelativeTime(log.createdAt),
        color: `bg-${colorClass}-500`,
      };
    });

    // 2. Fetch derived stats for alerts
    const [overrideCount, inactiveCount] = await Promise.all([
      UserPermissionOverride.countDocuments(),
      User.countDocuments({ isActive: false })
    ]);

    return res.status(200).json({
      status: "success",
      message: "Admin overview details retrieved successfully",
      data: {
        recentActivity,
        alerts: {
          permissionMismatch: overrideCount,
          dormantAccounts: inactiveCount
        }
      }
    });
  } catch (error) {
    next(error);
  }
};
