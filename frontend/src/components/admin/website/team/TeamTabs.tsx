"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus, Search, Filter } from "lucide-react";
import TeamList from "./TeamList";
import TeamForm from "./TeamForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import WebsiteModuleHeader from "../WebsiteModuleHeader";

export default function TeamTabs() {
  const [tab, setTab] = useState("list");

  const handleSuccess = () => {
    setTab("list");
  };

  const tabs = [
    { value: "list", label: "All Members", icon: Users },
    { value: "create", label: "Add Member", icon: UserPlus },
  ];

  return (
    <div className="pt-2">
      <Tabs value={tab} onValueChange={setTab}>
        <WebsiteModuleHeader
          tabs={tabs}
        />

        <TabsContent value="list" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <TeamList />
        </TabsContent>

        <TabsContent value="create" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
          <TeamForm onSuccess={handleSuccess} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
