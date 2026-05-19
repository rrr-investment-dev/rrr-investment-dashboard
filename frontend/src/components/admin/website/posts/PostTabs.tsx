import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PostsList from "./PostsList";
import PostForm from "./PostForm";
import { useAuth } from "@/auth/AuthContext";
import { can } from "@/auth/can";

import { Globe, Plus, FileText } from "lucide-react";
import WebsiteModuleHeader from "../WebsiteModuleHeader";

const PostTabs = () => {
  const [tab, setTab] = useState("list");
  const { user } = useAuth();

  const canCreatePost = can(user, "website.posts.create");

  const handleSuccess = () => {
    setTab("list");
  };

  const tabs = [
    { value: "list", label: "All Posts", icon: FileText },
    ...(canCreatePost ? [{ value: "create", label: "Add Post", icon: Plus }] : []),
  ];

  return (
    <div className="pt-2">
      <Tabs value={tab} onValueChange={setTab}>
        <WebsiteModuleHeader
          tabs={tabs}
        />

        <TabsContent value="list" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <PostsList />
        </TabsContent>

        {canCreatePost && (
          <TabsContent value="create" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <PostForm onSuccess={handleSuccess} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default PostTabs;
