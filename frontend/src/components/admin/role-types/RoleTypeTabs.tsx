import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import RoleTypeList from "./RoleTypeList";
import RoleTypeStepper from "./RoleTypeFormStepper/RoleTypeStepper";
import { can } from "@/auth/can";
import { useAuth } from "@/auth/AuthContext";
import { Shield, ShieldPlus } from "lucide-react";

const RoleTypeTabs = () => {
  const [tab, setTab] = useState("list");
  const { user } = useAuth();

  const canCreateRole = can(user, "admin.userManagement.userType.create");
  // const canViewRole = can(user, "admin.userManagement.userType.read");
  return (
    <>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-transparent h-auto p-0 gap-8 mb-4">
          <TabsTrigger 
            value="list"
            className="data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#00338D] dark:data-[state=active]:text-[#4d7cc7] data-[state=active]:border-b-2 data-[state=active]:border-b-[#00338D] dark:data-[state=active]:border-b-[#4d7cc7] border-0 rounded-none px-1 pb-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-all gap-2"
          >
            <Shield className="h-4 w-4" />
            All Role Types
          </TabsTrigger>
          {canCreateRole && (
            <TabsTrigger 
              value="create"
              className="data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#00338D] dark:data-[state=active]:text-[#4d7cc7] data-[state=active]:border-b-2 data-[state=active]:border-b-[#00338D] dark:data-[state=active]:border-b-[#4d7cc7] border-0 rounded-none px-1 pb-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-all gap-2"
            >
              <ShieldPlus className="h-4 w-4" />
              Add Role
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <RoleTypeList />
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <RoleTypeStepper onSuccess={() => setTab("list")} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default RoleTypeTabs;
