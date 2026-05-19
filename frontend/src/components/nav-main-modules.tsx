import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";

// Type for unlimited nesting
type NavItem = {
  title: string;
  url?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: NavItem[]; // children (can be infinite nesting)
};

const getSafeUrl = (url?: string) => {
  if (!url || url === "#") return "#";
  return url.startsWith("/") ? url : `/${url}`;
};

export function NavMainModules({ items }: { items: NavItem[] }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Modules</SidebarGroupLabel>
      <SidebarMenu>
        <RecursiveItems items={items} level={0} />
      </SidebarMenu>
    </SidebarGroup>
  );
}

function RecursiveItems({ items, level }: { items: NavItem[]; level: number }) {
  return (
    <>
      {items.map((item) => {
        const hasChildren = Array.isArray(item.items) && item.items.length > 0;
        const navUrl = getSafeUrl(item.url);

        if (level === 0) {
          return (
            <SidebarMenuItem key={item.title}>
              {hasChildren ? (
                <Collapsible
                  asChild
                  defaultOpen={item.isActive}
                  className="group/collapsible"
                >
                  <div className="space-y-1">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip={item.title} className="text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/50 dark:hover:bg-zinc-900/50 transition-colors font-medium">
                        {item.icon && <item.icon className="h-4 w-4 text-slate-500 dark:text-zinc-400" />}
                        <span className="font-semibold text-sm">{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90 text-slate-400 dark:text-zinc-500 h-4 w-4" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <SidebarMenuSub className="ml-4 border-l border-[#00338D]/30 dark:border-[#4d7cc7]/30 pl-2 space-y-1">
                        <RecursiveItems items={item.items!} level={level + 1} />
                      </SidebarMenuSub>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              ) : (
                // Level 0 leaf — render NavLink directly, no Shadcn wrapper
                <NavLink
                  to={navUrl}
                  end
                  className={({ isActive }) =>
                    `transition-all font-medium flex items-center gap-2 px-3 py-2 rounded-lg w-full ${
                      isActive
                        ? "text-[#00338D] dark:text-[#4d7cc7] bg-[#00338D]/10 dark:bg-[#00338D]/20 font-bold"
                        : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100/50 dark:hover:bg-zinc-900/50"
                    }`
                  }
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.title}</span>
                </NavLink>
              )}
            </SidebarMenuItem>
          );
        }

        // Level 1 and 2+
        return (
          <Collapsible
            key={item.title}
            defaultOpen={item.isActive}
            className={`group/collapsible-sub-${level} cursor-pointer space-y-0.5`}
          >
            <SidebarMenuSubItem className="relative">
              {hasChildren ? (
                <>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuSubButton className="flex w-full items-center text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100/50 dark:hover:bg-zinc-900/50 transition-colors py-1.5 px-3 rounded-lg">
                      <span className="font-semibold text-xs">{item.title}</span>
                      <ChevronRight className={`ml-auto transition-transform duration-200 group-data-[state=open]/collapsible-sub-${level}:rotate-90 text-slate-400 dark:text-zinc-500 h-3.5 w-3.5`} />
                    </SidebarMenuSubButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="mt-0.5">
                    <SidebarMenuSub className="ml-2 border-l border-[#00338D]/30 dark:border-[#4d7cc7]/30 pl-2 space-y-1">
                      <RecursiveItems items={item.items!} level={level + 1} />
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </>
              ) : (
                // Leaf — render NavLink directly, no Shadcn wrapper injecting bg
                item.url ? (
                  <NavLink
                    to={getSafeUrl(item.url)}
                    end
                    className={({ isActive }) => `
                      flex items-center w-full py-1.5 px-3 transition-all relative rounded-lg font-medium text-[13px]
                      ${isActive
                        ? "text-[#00338D] dark:text-[#4d7cc7] bg-[#00338D]/10 dark:bg-[#00338D]/20 font-bold"
                        : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 hover:bg-slate-100/50 dark:hover:bg-zinc-900/40"}
                    `}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-[-9px] top-1 bottom-1 w-[2.5px] bg-[#00338D] dark:bg-[#4d7cc7] rounded-r-md z-10" />
                        )}
                        <span>{item.title}</span>
                      </>
                    )}
                  </NavLink>
                ) : (
                  <div className="flex items-center w-full py-1.5 px-3 text-slate-400 dark:text-zinc-500 cursor-default font-medium text-[13px]">
                    <span>{item.title}</span>
                  </div>
                )
              )}
            </SidebarMenuSubItem>
          </Collapsible>
        );
      })}
    </>
  );
}
