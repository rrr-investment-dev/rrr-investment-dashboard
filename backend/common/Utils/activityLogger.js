import ActivityLog from "../../modules/admin/activityLog/activityLog.model.js";
import logger from "./logger.js";

/**
 * Log an administrative activity.
 * @param {Object} params
 * @param {string} params.action - Brief description of action (e.g. "User created")
 * @param {string} params.detail - Detailed description (e.g. "johndoe@example.com was registered")
 * @param {string} params.module - Module domain (admin, website, accounts, task, leave)
 * @param {string} [params.userId] - ID of the admin user performing the action
 * @param {string} [params.ipAddress] - Request IP address
 */
export const logActivity = async ({ action, detail, module, userId = null, ipAddress = "" }) => {
  try {
    await ActivityLog.create({
      action,
      detail,
      module,
      user: userId,
      ipAddress,
    });
  } catch (error) {
    logger.error(`Failed to record ActivityLog: ${error.message}`);
  }
};
