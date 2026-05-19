"use client";

import * as React from "react";

import { fetchAllPermissions } from "@/http/api";
import { buildDynamicSidebar, type PermissionNode } from "@/utils/menu-builder";

import Logo from "@/assets/RRR 3d logo lg.png";
import { NavMainModules } from "@/components/nav-main-modules";
// import { NavProjects } from "@/components/nav-projects";
import { NavUser } from "@/components/nav-user";
// import { TeamSwitcher } from "@/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import {
  IconDashboard,
  IconHelp,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import { NavMain } from "./nav-main";
import { NavSecondary } from "./nav-secondary";
import { useAuth } from "@/auth/AuthContext";

// This is sample data.
const data = {
  user: {
    name: "",
    email: "",
    avatar: "",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth();
  const [allPermissions, setAllPermissions] = React.useState<PermissionNode[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadPermissions = async () => {
      try {
        const perms = await fetchAllPermissions();
        if (Array.isArray(perms)) {
          setAllPermissions(perms);
        } else {
          console.warn("fetchAllPermissions returned non-array data:", perms);
          setAllPermissions([]);
        }
      } catch (error) {
        console.error("Failed to fetch permissions for sidebar:", error);
        setAllPermissions([]);
      } finally {
        setLoading(false);
      }
    };
    loadPermissions();
  }, []);

  // Build the dynamic menu items based on ALL permissions and USER permissions
  const dynamicModules = React.useMemo(() => {
    return buildDynamicSidebar(allPermissions, user?.permissions || []);
  }, [allPermissions, user?.permissions]);

  if (!user) return null;

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/dashboard" className="group-data-[collapsible=icon]:!justify-center">
                <img
                  src={Logo}
                  alt="Logo"
                  className="h-8 w-auto object-contain shrink-0"
                />
                <div className="grid flex-1 text-left text-sm leading-tight overflow-hidden group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">RRR Investments</span>
                  <span className="truncate text-xs">Admin Dashboard</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {!loading && <NavMainModules items={dynamicModules} />}
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
