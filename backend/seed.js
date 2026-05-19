import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load models
import RoleType from "./modules/admin/roleType/roleType.model.js";
import User from "./modules/admin/user/user.model.js";
import Permission from "./modules/admin/permissions/models/permission.model.js";
import RolePermission from "./modules/admin/permissions/models/rolePermission.model.js";

// Load env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

if (!process.env.DB_STRING || !process.env.DB_PASSWORD) {
  console.error("❌ Missing DB_STRING or DB_PASSWORD in .env file!");
  process.exit(1);
}
const MONGO_URI = process.env.DB_STRING.replace("<db_password>", process.env.DB_PASSWORD);

const systemPermissions = [
  // --- Admin Module Permissions ---
  {
    key: "admin.userManagement.userType.read",
    module: "admin",
    menu: "User Management",
    subMenu: "Role Types",
    action: "read",
    label: "Read Role Types",
    description: "Ability to view security role configurations."
  },
  {
    key: "admin.userManagement.userType.create",
    module: "admin",
    menu: "User Management",
    subMenu: "Role Types",
    action: "create",
    label: "Create Role Types",
    description: "Ability to register new security role configurations."
  },
  {
    key: "admin.userManagement.userType.update",
    module: "admin",
    menu: "User Management",
    subMenu: "Role Types",
    action: "update",
    label: "Update Role Types",
    description: "Ability to modify existing security roles."
  },
  {
    key: "admin.userManagement.userType.delete",
    module: "admin",
    menu: "User Management",
    subMenu: "Role Types",
    action: "delete",
    label: "Delete Role Types",
    description: "Ability to delete security role configurations."
  },
  {
    key: "admin.userManagement.users.read",
    module: "admin",
    menu: "User Management",
    subMenu: "Users",
    action: "read",
    label: "Read Users",
    description: "Ability to view active user directories."
  },
  {
    key: "admin.userManagement.users.create",
    module: "admin",
    menu: "User Management",
    subMenu: "Users",
    action: "create",
    label: "Create Users",
    description: "Ability to register new platform users."
  },
  {
    key: "admin.userManagement.users.update",
    module: "admin",
    menu: "User Management",
    subMenu: "Users",
    action: "update",
    label: "Update Users",
    description: "Ability to modify user details and statuses."
  },
  {
    key: "admin.userManagement.users.delete",
    module: "admin",
    menu: "User Management",
    subMenu: "Users",
    action: "delete",
    label: "Delete Users",
    description: "Ability to terminate user accounts."
  },
  {
    key: "admin.userPermissionOverride.read",
    module: "admin",
    menu: "User Management",
    subMenu: "Overrides",
    action: "read",
    label: "Read Permission Overrides",
    description: "Ability to view user-specific permission overrides."
  },
  {
    key: "admin.userPermissionOverride.create",
    module: "admin",
    menu: "User Management",
    subMenu: "Overrides",
    action: "create",
    label: "Create Permission Overrides",
    description: "Ability to grant or revoke specific custom permissions."
  },
  {
    key: "admin.userPermissionOverride.update",
    module: "admin",
    menu: "User Management",
    subMenu: "Overrides",
    action: "update",
    label: "Update Permission Overrides",
    description: "Ability to modify existing permission overrides."
  },
  {
    key: "admin.userPermissionOverride.delete",
    module: "admin",
    menu: "User Management",
    subMenu: "Overrides",
    action: "delete",
    label: "Delete Permission Overrides",
    description: "Ability to reset custom user overrides."
  },
  {
    key: "admin.rolePermission.read",
    module: "admin",
    menu: "User Management",
    subMenu: "Role Mappings",
    action: "read",
    label: "Read Role Mappings",
    description: "Ability to view active role-permission mappings."
  },
  {
    key: "admin.rolePermission.create",
    module: "admin",
    menu: "User Management",
    subMenu: "Role Mappings",
    action: "create",
    label: "Create Role Mappings",
    description: "Ability to map permission lists to roles."
  },
  {
    key: "admin.rolePermission.update",
    module: "admin",
    menu: "User Management",
    subMenu: "Role Mappings",
    action: "update",
    label: "Update Role Mappings",
    description: "Ability to modify assigned permissions of roles."
  },
  {
    key: "admin.rolePermission.delete",
    module: "admin",
    menu: "User Management",
    subMenu: "Role Mappings",
    action: "delete",
    label: "Delete Role Mappings",
    description: "Ability to delete role-permission associations."
  },

  // --- Website Module Team Permissions ---
  {
    key: "website.team.create",
    module: "website",
    menu: "Website",
    subMenu: "Team",
    action: "create",
    label: "Create Team Members",
    description: "Ability to add profiles to the public website directory."
  },
  {
    key: "website.team.read",
    module: "website",
    menu: "Website",
    subMenu: "Team",
    action: "read",
    label: "Read Team Members",
    description: "Ability to view the company directory catalog."
  },
  {
    key: "website.team.update",
    module: "website",
    menu: "Website",
    subMenu: "Team",
    action: "update",
    label: "Update Team Members",
    description: "Ability to modify profiles or directory status."
  },
  {
    key: "website.team.delete",
    module: "website",
    menu: "Website",
    subMenu: "Team",
    action: "delete",
    label: "Delete Team Members",
    description: "Ability to remove team members from the site."
  },

  // --- Website Module Posts/Articles Permissions ---
  {
    key: "website.posts.create",
    module: "website",
    menu: "Website",
    subMenu: "Posts",
    action: "create",
    label: "Create Posts",
    description: "Ability to draft and publish public blog articles."
  },
  {
    key: "website.posts.read",
    module: "website",
    menu: "Website",
    subMenu: "Posts",
    action: "read",
    label: "Read Posts",
    description: "Ability to view and read draft or published articles."
  },
  {
    key: "website.posts.update",
    module: "website",
    menu: "Website",
    subMenu: "Posts",
    action: "update",
    label: "Update Posts",
    description: "Ability to edit existing articles or change publication statuses."
  },
  {
    key: "website.posts.delete",
    module: "website",
    menu: "Website",
    subMenu: "Posts",
    action: "delete",
    label: "Delete Posts",
    description: "Ability to delete published or drafted articles."
  },

  // --- Website Module Form Config Permissions ---
  {
    key: "website.contact.config.create",
    module: "website",
    menu: "Contact",
    subMenu: "Form Config",
    action: "create",
    label: "Create Form Fields",
    description: "Ability to add custom dynamic inquiry field inputs."
  },
  {
    key: "website.contact.config.read",
    module: "website",
    menu: "Contact",
    subMenu: "Form Config",
    action: "read",
    label: "Read Form Fields",
    description: "Ability to view dynamic fields configurator."
  },
  {
    key: "website.contact.config.update",
    module: "website",
    menu: "Contact",
    subMenu: "Form Config",
    action: "update",
    label: "Update Form Fields",
    description: "Ability to reorder or configure custom fields."
  },
  {
    key: "website.contact.config.delete",
    module: "website",
    menu: "Contact",
    subMenu: "Form Config",
    action: "delete",
    label: "Delete Form Fields",
    description: "Ability to permanently remove dynamic field inputs."
  },

  // --- Website Module Inquiries Permissions ---
  {
    key: "website.contact.inquiry.read",
    module: "website",
    menu: "Contact",
    subMenu: "Inquiries",
    action: "read",
    label: "Read Inquiries",
    description: "Ability to read and check customer messages."
  },
  {
    key: "website.contact.inquiry.update",
    module: "website",
    menu: "Contact",
    subMenu: "Inquiries",
    action: "update",
    label: "Update Inquiries",
    description: "Ability to flag inquiries as read or unread."
  },
  {
    key: "website.contact.inquiry.delete",
    module: "website",
    menu: "Contact",
    subMenu: "Inquiries",
    action: "delete",
    label: "Delete Inquiries",
    description: "Ability to permanently purge contact inquiries."
  }
];

async function seed() {
  try {
    console.log("Connecting to MongoDB Database...");
    await mongoose.connect(MONGO_URI);
    console.log("Successfully connected to DB.");

    // 1. Seed Permissions
    console.log("Seeding PermissionMaster collection...");
    const seededPermissions = [];
    for (const p of systemPermissions) {
      const doc = await Permission.findOneAndUpdate(
        { key: p.key },
        { $set: p },
        { upsert: true, new: true }
      );
      seededPermissions.push(doc);
    }
    console.log(`Successfully seeded ${seededPermissions.length} PermissionMaster keys.`);

    // 2. Create Super Admin RoleType
    console.log("Seeding Super Admin RoleType...");
    const superAdminRole = await RoleType.findOneAndUpdate(
      { roleType: "superadmin" },
      {
        $set: {
          roleType: "superadmin",
          role_id: "ROLE_001",
          displayRoleName: "Super Admin",
          description: "Absolute control over all resources",
          isActive: true
        }
      },
      { upsert: true, new: true }
    );
    console.log(`Super Admin RoleType settled: ID = ${superAdminRole._id}`);

    // 3. Map All Permissions to Super Admin Role
    console.log("Mapping all permissions to Super Admin role in RolePermissionMaster...");
    const permissionIds = seededPermissions.map((p) => p._id);
    await RolePermission.findOneAndUpdate(
      { roleTypeId: superAdminRole._id },
      {
        $set: {
          roleTypeId: superAdminRole._id,
          permissionIds: permissionIds
        }
      },
      { upsert: true }
    );
    console.log("RolePermissionMaster mappings successfully saved.");

    // 4. Seed First Super Admin User
    console.log("Seeding initial Super Admin User...");
    const superAdminUser = await User.findOneAndUpdate(
      { email: "superadmin@rrr.com" },
      {
        $set: {
          name: "Super Admin",
          designation: "System Director",
          mobile: "9999999999",
          email: "superadmin@rrr.com",
          role: superAdminRole._id,
          isActive: true,
          usr_id: "USR_001"
        }
      },
      { upsert: true, new: true }
    );
    console.log("--------------------------------------------------");
    console.log("✨ SEEDING COMPLETE SUCCESSFULLY! ✨");
    console.log(`User Name  : ${superAdminUser.name}`);
    console.log(`Email      : ${superAdminUser.email}`);
    console.log(`Mobile     : ${superAdminUser.mobile}`);
    console.log(`Role       : Super Admin (ROLE_001)`);
    console.log("--------------------------------------------------");
    console.log("💡 HOW TO LOG IN:");
    console.log("1. Go to the dashboard login page.");
    console.log("2. Type email: 'superadmin@rrr.com' or mobile: '9999999999'.");
    console.log("3. The backend console will log a generated 6-digit OTP code.");
    console.log("4. Copy that OTP, enter it in the browser UI, and hit verify!");
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

seed();
