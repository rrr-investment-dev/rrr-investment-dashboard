"use client";

import PermissionForm from "@/components/shared/PermissionForm"
import { fetchAllPermissions } from "@/http/api";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

type Props = {
  setIsValid?: (valid: boolean) => void;
  initialPermissions?: any;
  onDataChange?: (data: any) => void;
};

export default function UserPermissionWrapper({ setIsValid, initialPermissions, onDataChange }: Props) {
  // Fetch all possible permissions to build the UI structure (Module > Menu > Actions)
  const { data: availablePermissions = [], isLoading: loadingPermissions } = useQuery({
    queryKey: ["allPermissions"],
    queryFn: fetchAllPermissions,
  });

  if (loadingPermissions) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[100px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  return (
    <PermissionForm
      setIsValid={setIsValid}
      initialPermissions={initialPermissions} // Use the prop passed down by UserStepper
      onDataChange={onDataChange}
      availablePermissions={availablePermissions} // Dynamically built Accordions from the API!
    />
  )
}
