import { createBrowserRouter, redirect, Navigate } from "react-router-dom";
import Login from "@/pages/auth/Login";
import DashboardLayout from "@/layouts/DashboardLayout";
import {
  requireAuthLoader,
  redirectIfAuthenticated,
  rootRedirectLoader,
} from "./AuthLoaders";
import Dashboard from "@/pages/adminDashboard/Dashboard";
import Notifications from "@/pages/adminDashboard/Notifications";
import AdminOverview from "@/pages/adminDashboard/admin/AdminOverview";
import AdminUserRoleTypeMaster from "@/pages/adminDashboard/admin/role-types/AdminUserRoleTypeMaster";
import AdminUserMaster from "@/pages/adminDashboard/admin/users/AdminUserMaster";
import EditUserDetails from "@/pages/adminDashboard/admin/users/EditUserDetails";
import ViewUserDetails from "@/pages/adminDashboard/admin/users/ViewUserDetails";
import EditRoleTypeDetails from "@/pages/adminDashboard/admin/role-types/EditRoleTypeDetails";
import ViewRoleTypeDetails from "@/pages/adminDashboard/admin/role-types/ViewRoleTypeDetails";
import PostMaster from "@/pages/adminDashboard/website/posts/PostMaster";
import ViewPostDetails from "@/pages/adminDashboard/website/posts/ViewPostDetails";
import EditPostDetails from "@/pages/adminDashboard/website/posts/EditPostDetails";
import TeamMaster from "@/pages/adminDashboard/website/team/TeamMaster";
import EditTeamMember from "@/pages/adminDashboard/website/team/EditTeamMember";
import ViewTeamMember from "@/pages/adminDashboard/website/team/ViewTeamMember";
import FormConfigMaster from "@/pages/adminDashboard/website/contact/FormConfigMaster";
import EditFieldDetails from "@/pages/adminDashboard/website/contact/EditFieldDetails";
import ViewFieldDetails from "@/pages/adminDashboard/website/contact/ViewFieldDetails";
import InquiryMaster from "@/pages/adminDashboard/website/contact/InquiryMaster";
import ViewInquiryDetails from "@/pages/adminDashboard/website/contact/ViewInquiryDetails";
import WebsiteOverview from "@/pages/adminDashboard/website/WebsiteOverview";
import PermissionProtectedRoute from "@/auth/PermissionProtectedRoute";
// import { Breadcrumb } from "@/components/ui/breadcrumb";

export const AppRouter = createBrowserRouter([
  // { path: "/", loader: () => redirect("/login") },
  {
    path: "/",
    loader: rootRedirectLoader, // decides login vs dashboard
  },
  // { path: "/", element: <Navigate to="/dashboard" replace /> },

  { path: "/login", element: <Login />, loader: redirectIfAuthenticated },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    loader: requireAuthLoader,
    handle: { breadcrumb: "Dashboard" },
    children: [
      {
        index: true,
        element: <Dashboard />,
        handle: { breadcrumb: "Overview" },
      },
      {
        path: "notifications",
        element: <Notifications />,
        handle: { breadcrumb: "Notifications" },
      },
      {
        path: "admin",
        handle: { breadcrumb: "Admin" },
        children: [
          {
            index: true,
            element: (
              <PermissionProtectedRoute permission="admin.access">
                <AdminOverview />
              </PermissionProtectedRoute>
            ),
            handle: { breadcrumb: "Overview", permissionKey: "admin.overview.read" },
          },
          {
            path: "userMgt",
            handle: { breadcrumb: "User Management" },
            children: [
              {
                path: "roleType",
                element: (
                  <PermissionProtectedRoute permission="admin.userManagement.userType.read">
                    <AdminUserRoleTypeMaster />
                  </PermissionProtectedRoute>
                ),
                handle: { breadcrumb: "Role Type Master", permissionKey: "admin.userManagement.userType" },
                children: [
                  {
                    path: ":roleTypeId",
                    element: (
                      <PermissionProtectedRoute permission="admin.userManagement.userType.read">
                        <ViewRoleTypeDetails />
                      </PermissionProtectedRoute>
                    ),
                    handle: { breadcrumb: "View Role Type", permissionKey: "admin.userManagement.userType" },
                  },
                  {
                    path: ":roleTypeId/edit",
                    element: (
                      <PermissionProtectedRoute permission="admin.userManagement.userType.update">
                        <EditRoleTypeDetails />
                      </PermissionProtectedRoute>
                    ),
                    handle: { breadcrumb: "Edit Role Type", permissionKey: "admin.userManagement.userType" },
                  },
                ],
              },
              {
                path: "user",
                element: (
                  <PermissionProtectedRoute permission="admin.userManagement.users.read">
                    <AdminUserMaster />
                  </PermissionProtectedRoute>
                ),
                handle: { breadcrumb: "User", permissionKey: "admin.userManagement.users" },
                children: [
                  {
                    path: ":userId",
                    element: (
                      <PermissionProtectedRoute permission="admin.userManagement.users.read">
                        <ViewUserDetails />
                      </PermissionProtectedRoute>
                    ),
                    handle: { breadcrumb: "View User", permissionKey: "admin.userManagement.users" },
                  },
                  {
                    path: ":userId/edit",
                    element: (
                      <PermissionProtectedRoute permission="admin.userManagement.users.update">
                        <EditUserDetails />
                      </PermissionProtectedRoute>
                    ),
                    handle: { breadcrumb: "Edit User", permissionKey: "admin.userManagement.users" },
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "website",
        handle: { breadcrumb: "Website Management" },
        children: [
          {
            index: true,
            element: <Navigate to="overview" replace />,
          },
          {
            path: "overview",
            element: (
              <PermissionProtectedRoute permission="website.overview.read">
                <WebsiteOverview />
              </PermissionProtectedRoute>
            ),
            handle: { breadcrumb: "Overview", permissionKey: "website.overview.read" },
          },
          {
            path: "posts",
            element: (
              <PermissionProtectedRoute permission="website.posts.read">
                <PostMaster />
              </PermissionProtectedRoute>
            ),
            handle: { breadcrumb: "Posts", permissionKey: "website.posts" },
            children: [
              {
                path: ":postId",
                element: (
                  <PermissionProtectedRoute permission="website.posts.read">
                    <ViewPostDetails />
                  </PermissionProtectedRoute>
                ),
                handle: { breadcrumb: "View Details", permissionKey: "website.posts" },
              },
              {
                path: "edit/:postId",
                element: (
                  <PermissionProtectedRoute permission="website.posts.update">
                    <EditPostDetails />
                  </PermissionProtectedRoute>
                ),
                handle: { breadcrumb: "Edit Post", permissionKey: "website.posts" },
              },
            ],
          },
          {
            path: "team",
            element: (
              <PermissionProtectedRoute permission="website.team.read">
                <TeamMaster />
              </PermissionProtectedRoute>
            ),
            handle: { breadcrumb: "Team", permissionKey: "website.team" },
            children: [
              {
                path: ":memberId",
                element: (
                  <PermissionProtectedRoute permission="website.team.read">
                    <ViewTeamMember />
                  </PermissionProtectedRoute>
                ),
                handle: { breadcrumb: "View Member", permissionKey: "website.team" },
              },
              {
                path: "edit/:memberId",
                element: (
                  <PermissionProtectedRoute permission="website.team.update">
                    <EditTeamMember />
                  </PermissionProtectedRoute>
                ),
                handle: { breadcrumb: "Edit Member", permissionKey: "website.team" },
              },
            ],
          },
          {
            path: "contact",
            handle: { breadcrumb: "Contact Management" },
            children: [
              {
                path: "config",
                children: [
                  {
                    index: true,
                    element: (
                      <PermissionProtectedRoute permission="website.contact.config.read">
                        <FormConfigMaster />
                      </PermissionProtectedRoute>
                    ),
                    handle: { breadcrumb: "Field List", permissionKey: "website.contact.config" },
                  },
                  {
                    path: ":fieldId",
                    element: (
                      <PermissionProtectedRoute permission="website.contact.config.read">
                        <ViewFieldDetails />
                      </PermissionProtectedRoute>
                    ),
                    handle: { breadcrumb: "View Field", permissionKey: "website.contact.config" },
                  },
                  {
                    path: "edit/:fieldId",
                    element: (
                      <PermissionProtectedRoute permission="website.contact.config.update">
                        <EditFieldDetails />
                      </PermissionProtectedRoute>
                    ),
                    handle: { breadcrumb: "Edit Field", permissionKey: "website.contact.config" },
                  },
                ],
                handle: { breadcrumb: "Form Configuration", permissionKey: "website.contact.config" },
              },
              {
                path: "inquiries",
                children: [
                  {
                    index: true,
                    element: (
                      <PermissionProtectedRoute permission="website.contact.inquiry.read">
                        <InquiryMaster />
                      </PermissionProtectedRoute>
                    ),
                    handle: { breadcrumb: "Inquiries List", permissionKey: "website.contact.inquiry" },
                  },
                  {
                    path: ":inquiryId",
                    element: (
                      <PermissionProtectedRoute permission="website.contact.inquiry.read">
                        <ViewInquiryDetails />
                      </PermissionProtectedRoute>
                    ),
                    handle: { breadcrumb: "View Inquiry", permissionKey: "website.contact.inquiry" },
                  },
                ],
                handle: { breadcrumb: "Inquiries", permissionKey: "website.contact.inquiry" },
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    loader: () => redirect("/login"),
  },
]);
