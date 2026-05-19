import { Fragment, useMemo } from "react";
import { useMatches, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchAllPermissions } from "@/http/api";
import { formatTitle } from "@/utils/menu-builder";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface RouteHandle {
  breadcrumb?: string;
  permissionKey?: string;
}

export function AppBreadcrumbs() {
  const matches = useMatches();

  const { data: allPermissions = [] } = useQuery({
    queryKey: ["permissionMasters"],
    queryFn: fetchAllPermissions,
  });

  const crumbs = useMemo(() => {
    const results: { label: string; href: string }[] = [];
    
    matches
      .filter((match) => (match.handle as RouteHandle)?.breadcrumb || (match.handle as RouteHandle)?.permissionKey)
      .forEach((match, index) => {
        const handle = match.handle as RouteHandle;
        const key = handle.permissionKey;
        let label = handle.breadcrumb || "";

        if (key && allPermissions.length > 0) {
          // Try to find the dynamic label from DB
          const perm = allPermissions.find((p: any) => p.key === key || p.key === `${key}.access` || p.key === `${key}.read`);
          
          if (perm) {
            let dynamicLabel = "";
            // Priority: SubMenu > Menu > Module
            if (perm.subMenu) dynamicLabel = perm.subMenu;
            else if (perm.menu) dynamicLabel = perm.menu;
            else if (perm.module) dynamicLabel = perm.module;

            // If we found a dynamic label, use it. 
            // BUT: If it's the same as the previous label (e.g. "User Type > User Type"), 
            // fallback to the descriptive handle.breadcrumb ("View Details").
            if (dynamicLabel) {
              const formattedDynamic = formatTitle(dynamicLabel);
              const prevCrumb = results[results.length - 1];
              
              if (prevCrumb && prevCrumb.label === formattedDynamic && handle.breadcrumb) {
                label = handle.breadcrumb;
              } else {
                label = dynamicLabel;
              }
            }
          }
        }

        results.push({
          label: formatTitle(label),
          href: match.pathname,
        });
      });

    return results;
  }, [matches, allPermissions]);

  if (crumbs.length === 0) return null;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <Fragment key={crumb.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.href}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
