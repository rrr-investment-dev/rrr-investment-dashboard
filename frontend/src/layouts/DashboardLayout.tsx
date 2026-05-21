// import Dashboard from "@/pages/adminDashboard/Dashboard";
import { AppSidebar } from "@/components/app-sidebar";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
// import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/auth/AuthContext";
import { Outlet, useLocation, Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { AppBreadcrumbs } from "@/components/app-breadcrumbs";
import { useEffect, useState } from "react";

import { ModeToggle } from "@/components/mode-toggle";

const DashboardLayout = () => {
  const { refreshUser } = useAuth();
  const location = useLocation();

  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    // Refresh user data (permissions, status) on every navigation
    refreshUser();
  }, [location.pathname, refreshUser]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center justify-between transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 border-b border-border bg-background/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
              />
              <AppBreadcrumbs />
            </div>

            <div className="flex items-center gap-4 px-6">
              <div className="hidden md:flex flex-col items-end">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Current System Time</span>
                <div className="flex items-center gap-2 text-foreground/80">
                  <span className="text-xs font-bold tabular-nums bg-muted px-2 py-0.5 rounded-md">{formattedDate}</span>
                  <span className="text-xs font-black tabular-nums text-[#00338D] dark:text-[#4d7cc7] bg-[#00338D]/10 dark:bg-[#4d7cc7]/20 px-2 py-0.5 rounded-md border border-[#00338D]/20 dark:border-[#4d7cc7]/30">
                    {formattedTime}
                  </span>
                </div>
              </div>
              <Separator orientation="vertical" className="h-8 mx-2 hidden md:block" />
              <Link 
                to="/dashboard/notifications" 
                className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-xl transition-all cursor-pointer mr-1 group"
                title="View Notifications"
              >
                <Bell className="size-5 transition-transform group-hover:rotate-12 duration-200" />
                <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-rose-500 ring-2 ring-slate-50 dark:ring-zinc-950 animate-pulse"></span>
              </Link>
              <ModeToggle />
            </div>
          </header>
          <main className="flex flex-1 flex-col p-4">
            <Outlet />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default DashboardLayout;
