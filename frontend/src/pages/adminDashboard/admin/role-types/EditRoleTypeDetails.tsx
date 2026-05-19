import { useLocation, useNavigate, useParams } from "react-router-dom";
import RoleTypeStepper from "@/components/admin/role-types/RoleTypeFormStepper/RoleTypeStepper";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchRoleTypeById } from "@/http/api";

const EditRoleTypeDetails = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { roleTypeId } = useParams();
    const roleFromState = (state as any)?.role;

    const { data: roleDetails, isLoading, isError } = useQuery({
        queryKey: ["role", roleTypeId],
        queryFn: () => fetchRoleTypeById(roleTypeId!),
        enabled: !!roleTypeId,
        initialData: roleFromState,
    });

    if (isLoading && !roleDetails) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500">Failed to load role details.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate("/dashboard/admin/userMgt/roleType")}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="w-full space-y-6 px-4 pb-10 pt-6 sm:px-6">
            <header className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
                <div className="flex flex-row items-center gap-4">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-10 w-10 shrink-0 rounded-full bg-white shadow-sm"
                        onClick={() => navigate("/dashboard/admin/userMgt/roleType")}
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">
                            Edit Role{roleDetails?.roleName ? `: ${roleDetails.roleName}` : ""}
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Update role name, description, and its default permissions.
                        </p>
                    </div>
                </div>
            </header>

            <RoleTypeStepper 
                initialRoleData={roleDetails} 
                isEdit={true} 
                onSuccess={() => navigate("/dashboard/admin/userMgt/roleType")} 
            />
        </div>
    );
};

export default EditRoleTypeDetails;