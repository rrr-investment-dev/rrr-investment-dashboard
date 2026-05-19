import { useState, useMemo, useCallback } from "react";
import { ReusableStepper } from "@/components/ReusableStepper";
import RoleInfo from "./Forms/RoleInfo";
import DefaultPermission from "./Forms/DefaultPermission";
import Review from "./Forms/Review";
import { toast } from "sonner";
import { parsePermissions, serializePermissions } from "@/utils/permissionUtils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoleTypeWithPermissions, updateRoleTypeWithPermissions } from "@/http/api";


interface RoleTypeStepperProps {
    initialRoleData?: any;
    isEdit?: boolean;
    onSuccess?: () => void;
}

const RoleTypeStepper = ({ initialRoleData, isEdit = false, onSuccess }: RoleTypeStepperProps) => {
    const [roleData, setRoleData] = useState({
        roleName: initialRoleData?.roleTypeId?.roleType || initialRoleData?.roleName || "",
        roleDescription: initialRoleData?.description || initialRoleData?.roleDescription || "",
    });

    // Normalize permissions to an array of keys (if object, extract .key)
    const rawPermissionsList = useMemo(() => {
        return Array.isArray(initialRoleData?.permissions)
            ? initialRoleData.permissions
            : (Array.isArray(initialRoleData?.permissionIds) ? initialRoleData.permissionIds : []);
    }, [initialRoleData?.permissions, initialRoleData?.permissionIds]);

    const initialPerms = useMemo(() => {
        const keys = rawPermissionsList.map((p: any) => (p?.key ? p.key : p));
        return parsePermissions(keys);
    }, [rawPermissionsList]);

    const [permissions, setPermissions] = useState(initialPerms);
    const [isRoleInfoValid, setIsRoleInfoValid] = useState(isEdit);

    const queryClient = useQueryClient();

    const createMutation = useMutation({
        mutationFn: createRoleTypeWithPermissions,
        onSuccess: () => {
            toast.success("Role created successfully");
            queryClient.invalidateQueries({ queryKey: ["roleTypes"] });
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to create role");
        }
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => updateRoleTypeWithPermissions(id, data),
        onSuccess: (_, variables) => {
            toast.success("Role updated successfully");
            // Refresh both the list and the specific role's details
            queryClient.invalidateQueries({ queryKey: ["roleTypes"] });
            queryClient.invalidateQueries({ queryKey: ["role", variables.id] });
            onSuccess?.();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to update role");
        }
    });

    const handleRoleDataChange = useCallback((data: any) => {
        setRoleData({
            roleName: data.roleName || "",
            roleDescription: data.roleDescription || ""
        });
    }, []);

    const handlePermissionsChange = useCallback((data: any) => {
        setPermissions(data);
    }, []);

    const handleSubmit = () => {
        // Convert UI nested object back to API string array
        const permissionStringArray = serializePermissions(permissions);

        const payload = {
            roleName: roleData.roleName,
            roleDescription: roleData.roleDescription,
            permissions: permissionStringArray,
        };

        console.log("Final payload being sent to backend:", payload);

        if (isEdit && initialRoleData?.id) {
            updateMutation.mutate({ id: initialRoleData.id, data: payload });
        } else {
            createMutation.mutate(payload);
        }
    };

    return (
        <ReusableStepper
            steps={[
                {
                    label: "Role Info",
                    isValid: isRoleInfoValid,
                    content: <RoleInfo
                        initialData={roleData}
                        isEdit={isEdit}
                        setIsValid={setIsRoleInfoValid}
                        onDataChange={handleRoleDataChange}
                    />,
                },
                {
                    label: "Default Permissions",
                    optional: true,
                    content: <DefaultPermission
                        initialPermissions={permissions}
                        onDataChange={handlePermissionsChange}
                    />,
                },
                {
                    label: "Review",
                    content: (
                        <Review
                            roleInfo={roleData}
                            permissions={permissions}
                            goToStep={() => { }}
                            setIsValid={(valid) => console.log("Review is valid: ", valid)}
                            isEdit={isEdit}
                        />
                    ),
                },
            ]}
            onSubmit={handleSubmit}
        />
    );
};

export default RoleTypeStepper;
