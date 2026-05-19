import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import UsersList from "./UsersList";
import UserStepper from "./UserFormStepper/UserStepper";
import { Users, UserPlus } from "lucide-react";

import { useAuth } from "@/auth/AuthContext";
import { can } from "@/auth/can";

const UserTabs = () => {
  const [tab, setTab] = useState("list");
  const { user } = useAuth();
  const canCreateUser = can(user, "admin.userManagement.users.create");

  return (
    <>
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-transparent h-auto p-0 gap-8 mb-4">
          <TabsTrigger 
            value="list"
            className="data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#00338D] dark:data-[state=active]:text-[#4d7cc7] data-[state=active]:border-b-2 data-[state=active]:border-b-[#00338D] dark:data-[state=active]:border-b-[#4d7cc7] border-0 rounded-none px-1 pb-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-all gap-2"
          >
            <Users className="h-4 w-4" />
            All Users
          </TabsTrigger>
          {canCreateUser && (
            <TabsTrigger 
              value="create"
              className="data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#00338D] dark:data-[state=active]:text-[#4d7cc7] data-[state=active]:border-b-2 data-[state=active]:border-b-[#00338D] dark:data-[state=active]:border-b-[#4d7cc7] border-0 rounded-none px-1 pb-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-all gap-2"
            >
              <UserPlus className="h-4 w-4" />
              Add User
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="list" className="mt-4">
          <UsersList />
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <UserStepper onSuccess={() => setTab("list")} />
        </TabsContent>
      </Tabs>
    </>
  );
};

export default UserTabs;
