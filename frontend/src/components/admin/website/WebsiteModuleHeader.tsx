"use client";

import type { LucideIcon } from "lucide-react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WebsiteModuleHeaderProps {
  tabs: {
    value: string;
    label: string;
    icon?: LucideIcon;
  }[];
}

export default function WebsiteModuleHeader({
  tabs,
}: WebsiteModuleHeaderProps) {
  return (
    <div className="mb-6">

      {/* 📑 Premium Tabs Styling */}
      <div className="">
        <TabsList className="bg-transparent h-auto p-0 gap-8">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-[#00338D] dark:data-[state=active]:text-[#4d7cc7] data-[state=active]:border-b-2 data-[state=active]:border-b-[#00338D] dark:data-[state=active]:border-b-[#4d7cc7] border-0 rounded-none px-1 pb-3 text-sm font-bold text-muted-foreground hover:text-foreground transition-all gap-2"
            >
              {tab.icon && <tab.icon className="h-4 w-4" />}
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </div>
  );
}
