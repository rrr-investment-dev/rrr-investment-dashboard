import { useState, useEffect, useCallback } from "react";
import { ReusableStepper } from "@/components/ReusableStepper";
import UserInfo from "./Forms/UserInfo";
import Permission from "./Forms/Permission";
import Review from "./Forms/Review";
import { toast } from "sonner";
import { parsePermissions, serializePermissions } from "@/utils/permissionUtils";
import { fetchRoleTypeById, fetchAllPermissions, createUser, updateUser } from "@/http/api";
import { useAuth } from "@/auth/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface UserStepperProps {
  initialData?: any;
  isEdit?: boolean;
  onSuccess?: () => void;
}

const UserStepper = ({ initialData, isEdit = false, onSuccess }: UserStepperProps) => {
  const [userData, setUserData] = useState({
    usrId: initialData?.usrId || "",
    fullName: initialData?.fullName || "",
    email: initialData?.email || "",
    mobile: initialData?.mobile || "",
    role: initialData?.roleId || (typeof initialData?.role === 'string' && !initialData.role.includes(' ') ? initialData.role : ""),
    roleName: initialData?.roleName || "",
    designation: initialData?.designation || "",
    imageUrl: initialData?.imageUrl || "",
    image: undefined as any,
  });

  const queryClient = useQueryClient();

  // Fetch all permissions so we can convert freely between IDs and Keys
  const { data: allPerms = [], refetch: fetchAllPerms } = useQuery({
    queryKey: ["allPermissions"],
    queryFn: fetchAllPermissions,
  });

  const [permissions, setPermissions] = useState({});
  const [isUserInfoValid, setIsUserInfoValid] = useState(isEdit);
  const [defaultRolePermsIds, setDefaultRolePermsIds] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Unified Initialization Logic
  useEffect(() => {
    if (allPerms.length > 0 && !isInitialized) {
      const rawList = Array.isArray(initialData?.permissions)
        ? initialData.permissions
        : (Array.isArray(initialData?.permissionIds) ? initialData.permissionIds : []);

      const keys = rawList.map((p: any) => {
        // 1. If it's a string containing a dot, it's already a functional key
        if (typeof p === 'string' && p.includes('.')) return p;

        // 2. If it's an object that already has a key, use it
        if (p?.key && typeof p.key === 'string') return p.key;

        // 3. Otherwise, try to resolve the ID to a key using the master list
        const id = String(typeof p === 'string' ? p : (p?._id || p?.id || ""));
        const match = allPerms.find((ap: any) => String(ap._id || ap.id) === id);
        return match?.key || id;
      }).filter((k: any) => typeof k === 'string' && k.includes('.'));

      setPermissions(parsePermissions(keys));
      setIsInitialized(true);
    }
  }, [allPerms, initialData, isInitialized]);

  // Use a unified "role" key to share cache with Role Details pages
  useQuery({
    queryKey: ["role", userData.role],
    queryFn: () => fetchRoleTypeById(userData.role),
    enabled: !!userData.role,
    staleTime: 1000 * 60 * 10,
  });

  const handleFetchRolePermissions = async () => {
    if (!userData.role) return;
    try {
      // 1. Refresh global permissions list if missing (honors staleTime)
      if (allPerms.length === 0) await fetchAllPerms();

      // 2. Fetch role permissions using unified ["role"] key
      // This will skip the network call if the role was already viewed in Role Mgt!
      const data = await queryClient.fetchQuery({
        queryKey: ["role", userData.role],
        queryFn: () => fetchRoleTypeById(userData.role),
      });

      console.log("Permissions Data (from Cache or API):", data.permissions);

      const rawPerms = Array.isArray(data.permissions) ? data.permissions : [];

      // Store the exact baseline IDs of the role for delta calculation
      const baselineIds = rawPerms.map((p: any) => typeof p === 'string' ? p : (p?._id || p?.id)).filter(Boolean);
      setDefaultRolePermsIds(baselineIds);

      // ONLY overwrite permissions if it's a new user or the role has changed
      const roleChanged = isEdit && userData.role !== initialData?.role;
      if (!isEdit || roleChanged) {
        const permKeys = rawPerms.map((p: any) => {
          const id = typeof p === 'string' ? p : (p?._id || p?.id);
          const key = (p as any)?.key;
          if (key && typeof key === 'string') return key;
          const matchedPerm = allPerms.find((ap: any) => (ap.id || ap._id) === id);
          return matchedPerm?.key || id;
        }).filter((k): k is string => typeof k === 'string');

        setPermissions(parsePermissions(permKeys));
      }

    } catch (error) {
      console.error("Failed to fetch role permissions", error);
    }
  };

  const handleUserDataChange = useCallback((data: any) => {
    setUserData((prev) => ({ ...prev, ...data }));
  }, []);

  const handlePermissionsChange = useCallback((data: any) => {
    setPermissions(data);
  }, []);

  const { user: currentUser, refreshUser } = useAuth();

  const createMutation = useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      toast.success("User created successfully");
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create user");
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateUser(id, data),
    onSuccess: async (_, variables) => {
      toast.success("User updated successfully");

      // Refresh both the list and the specific user's details
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["user", variables.id] });

      // If updating self, refresh permissions context
      if (variables.id === currentUser?._id) {
        await refreshUser();
      }

      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update user");
    }
  });

  const handleSubmit = () => {
    // Flatten selected UI nested checkboxes to an array of action Keys
    const permissionStringArray = serializePermissions(permissions);

    // Map final keys back to their backend Object IDs
    const finalIds = permissionStringArray.map((key: string) => {
      const match = allPerms.find((ap: any) => ap.key === key);
      const id = match ? (match._id || match.id) : null;
      return id ? String(id) : null;
    }).filter((id): id is string => id !== null);

    // Normalize baseline IDs to strings
    const baselineIds = defaultRolePermsIds.map(id => String(id));

    // Calculate Granted vs Revoked
    const grantedPermissions = finalIds.filter(id => !baselineIds.includes(id));
    const revokedPermissions = baselineIds.filter(id => !finalIds.includes(id));

    // Construct exact required payload
    const finalPayload = {
      usr_id: userData.usrId,
      name: userData.fullName,
      designation: userData.designation,
      mobile: userData.mobile,
      email: userData.email,
      role: userData.role,
      grantedPermissions,
      revokedPermissions
    };

    if (isEdit && initialData?.id) {
      updateMutation.mutate({ id: initialData.id, data: finalPayload });
    } else {
      createMutation.mutate(finalPayload);
    }
  };

  return (
    <>
      <ReusableStepper
        steps={[
          {
            label: "User Info",
            isValid: isUserInfoValid,
            onNext: handleFetchRolePermissions,
            content: <UserInfo
              initialData={userData}
              isEdit={isEdit}
              setIsValid={setIsUserInfoValid}
              onDataChange={handleUserDataChange}
            />,
          },
          {
            label: "Permissions",
            optional: true,
            content: <Permission
              initialPermissions={permissions}
              onDataChange={handlePermissionsChange}
            />,
          },
          {
            label: "Review",
            content: (
              <Review
                userInfo={{
                  usrId: userData.usrId,
                  fullName: userData.fullName,
                  email: userData.email,
                  mobile: userData.mobile,
                  role: userData.role,
                  roleName: userData.roleName,
                  designation: userData.designation,
                  image: userData.image && userData.image.length > 0
                    ? URL.createObjectURL(userData.image[0])
                    : userData.imageUrl,
                }}
                permissions={permissions}
                goToStep={() => { }}
                isEdit={isEdit}
              />
            ),
          },
        ]}
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default UserStepper;


