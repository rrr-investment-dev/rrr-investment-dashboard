import { useMemo } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import UserStepper from "@/components/admin/users/UserFormStepper/UserStepper";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchUserWithPermissionById } from "@/http/api";

const EditUserDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { userId } = useParams();
  const handleBack = () => navigate("/dashboard/admin/userMgt/user");

  // Fetch the full user details (including permissions) from the API
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserWithPermissionById(userId!),
    enabled: !!userId,
    // Ensure we always hit the network for fresh data
    staleTime: 0,
    gcTime: 0,
  });

  const initialData = useMemo(() => {
    if (!user) return null;

    return {
      id: user?._id || (user as any)?.id,
      usrId: user?.usr_id || (user as any)?.usrId || "",
      fullName: user?.name || "",
      email: user?.email || "",
      mobile: String(user?.mobile || (user as any)?.mobile || "").replace(/\D/g, ""),
      role: typeof user?.role === 'object' ? user?.role?._id : ((user as any)?.roleId || user?.role || ""),
      roleName: typeof user?.role === 'object' ? (user?.role?.displayRoleName || user?.role?.name) : (user?.role || ""),
      designation: user?.designation || "",
      imageUrl: (user as any)?.image || (user as any)?.imageUrl || "",
      permissions: Array.isArray(user?.permissions) ? user.permissions : [],
    };
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user && !isLoading) {
    return (
      <div className="flex h-[300px] flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-center px-4">Failed to load user details. Please check your connection or login again.</p>
        <Button onClick={handleBack} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 px-4 pb-10 pt-6 sm:px-6">
      <header className="flex flex-row items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 shrink-0 rounded-full"
          onClick={handleBack}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Edit User{user?.name ? `: ${user.name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            Update personal details and system permissions.
          </p>
        </div>
      </header>

      {initialData && (
        <UserStepper
          key={`${user?._id || userId}_${!!user?.permissions}`}
          initialData={initialData}
          isEdit={true}
          onSuccess={handleBack}
        />
      )}
    </div>
  );
};

export default EditUserDetails;

