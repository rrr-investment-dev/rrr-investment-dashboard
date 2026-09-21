// Pre-register all Mongoose models to prevent MissingSchemaError on serverless invocations
import "../modules/admin/roleType/roleType.model.js";
import "../modules/admin/user/user.model.js";
import "../modules/admin/auth/otp.model.js";
import "../modules/admin/auth/refreshToken.model.js";
import "../modules/admin/permissions/models/permission.model.js";
import "../modules/admin/permissions/models/rolePermission.model.js";
import "../modules/admin/permissions/models/userPermissionOverride.model.js";
import "../modules/admin/activityLog/activityLog.model.js";
import "../modules/website/post/post.model.js";
import "../modules/website/team/team.model.js";
import "../modules/website/contact/models/formConfig.model.js";
import "../modules/website/contact/models/inquiry.model.js";
import "../modules/website/careers/careers.model.js";
import "../modules/website/careers/jobApplication.model.js";
