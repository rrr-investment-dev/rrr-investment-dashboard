import { useEffect, useState } from "react";
import PermissionForm from "@/components/shared/PermissionForm"
import { fetchAllPermissions } from "@/http/api";
import { Skeleton } from "@/components/ui/skeleton";

const DefaultPermission = ({ initialPermissions, onDataChange }: { initialPermissions?: any, onDataChange?: (data: any) => void }) => {
    const [availablePermissions, setAvailablePermissions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadPermissions = async () => {
            try {
                const data = await fetchAllPermissions();
                setAvailablePermissions(data);
            } catch (error) {
                console.error("Failed to fetch permissions:", error);
            } finally {
                setLoading(false);
            }
        };
        loadPermissions();
    }, []);

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-[60px] w-full rounded-xl" />
                <Skeleton className="h-[60px] w-full rounded-xl" />
                <Skeleton className="h-[60px] w-full rounded-xl" />
            </div>
        );
    }

    return (
        <PermissionForm 
            initialPermissions={initialPermissions} 
            onDataChange={onDataChange} 
            availablePermissions={availablePermissions}
        />
    )
}

export default DefaultPermission