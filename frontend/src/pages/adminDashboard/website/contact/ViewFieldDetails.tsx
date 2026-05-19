import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchFormConfigs } from "@/http/api";
import type { FormConfigApi } from "@/http/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit2,
  Loader2,
  Settings2,
  Info,
  Calendar,
  LayoutGrid,
  Type,
  CheckCircle2,
  XCircle
} from "lucide-react";

const ViewFieldDetails = () => {
  const { fieldId } = useParams();
  const navigate = useNavigate();

  const { data: configs, isLoading: isFetching } = useQuery<FormConfigApi[]>({
    queryKey: ["formConfigs"],
    queryFn: fetchFormConfigs,
  });

  const fieldData = configs?.find((f) => f._id === fieldId);

  if (isFetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!fieldData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-slate-500 font-medium">Field configuration not found.</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 pt-6 px-4 sm:px-6 animate-in fade-in duration-500">
      {/* 🚀 Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/dashboard/website/contact/config")}
            className="h-10 w-10 shrink-0 rounded-full bg-white dark:bg-zinc-950 shadow-sm border-slate-200 dark:border-zinc-800"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-zinc-400" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">Field Details</h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Detailed overview of {fieldData.label}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="outline"
            className={`px-3 py-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 border-none shadow-none ${fieldData.isActive 
              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" 
              : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
              }`}
          >
            {fieldData.isActive ? "ACTIVE" : "HIDDEN"}
            <div className={`h-2 w-2 rounded-full ${fieldData.isActive ? "bg-emerald-600" : "bg-amber-600"}`} />
          </Badge>

          <Button
            className="h-10 rounded-lg gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            onClick={() => navigate(`/dashboard/website/contact/config/edit/${fieldId}`)}
          >
            <Edit2 className="h-4 w-4" />
            Edit Configuration
          </Button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* 📝 Main Info */}
        <div className="space-y-6">
          <Card className="border-slate-200/60 dark:border-zinc-800 bg-card text-card-foreground shadow-sm rounded-xl overflow-hidden">
            <div className="bg-slate-50/50 dark:bg-zinc-900/40 border-b border-slate-100 dark:border-zinc-800 px-6 py-4 flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-950/40 p-1.5 rounded-md">
                <LayoutGrid className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">General Information</h3>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Display Label</p>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{fieldData.label}</h2>
              </div>

              <Separator className="bg-slate-100 dark:bg-zinc-800" />

              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Placeholder Text</p>
                <p className="text-slate-600 dark:text-zinc-300 font-medium">{fieldData.placeholder || "No placeholder text defined."}</p>
              </div>

              <Separator className="bg-slate-100 dark:bg-zinc-800" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
                <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-950/50 p-2 rounded-full text-blue-600 dark:text-blue-400">
                    <Type className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase leading-none mb-1">Input Type</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-300 capitalize">{fieldData.type}</p>
                  </div>
                </div>

                <div className="bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/30 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="bg-purple-100 dark:bg-purple-950/50 p-2 rounded-full text-purple-600 dark:text-purple-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase leading-none mb-1">Created At</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">
                      {new Date(fieldData.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric"
                      })}
                    </p>
                  </div>
                </div>

                <div className="bg-amber-50/50 dark:bg-amber-950/10 border border-amber-100 dark:border-amber-900/30 rounded-xl px-4 py-3 flex items-center gap-3">
                  <div className="bg-amber-100 dark:bg-amber-950/50 p-2 rounded-full text-amber-600 dark:text-amber-400">
                    <Settings2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase leading-none mb-1">Position</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-zinc-300">Index #{fieldData.order + 1}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Validation Settings */}
          <Card className="border-slate-200/60 dark:border-zinc-800 bg-card text-card-foreground shadow-sm rounded-xl overflow-hidden">
            <div className="bg-slate-50/50 dark:bg-zinc-900/40 border-b border-slate-100 dark:border-zinc-800 px-6 py-4 flex items-center gap-3">
              <div className="bg-emerald-100 dark:bg-emerald-950/40 p-1.5 rounded-md">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Behavior & Validation</h3>
            </div>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-8">
                <div className="flex items-center gap-3">
                  {fieldData.required ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-slate-300 dark:text-zinc-700" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Mandatory Field</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">User must fill this to submit the form</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {fieldData.isActive ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-slate-300 dark:text-zinc-700" />
                  )}
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-zinc-200">Visible to Public</p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Currently rendered on the contact form</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="bg-blue-50/50 dark:bg-blue-950/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
            <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-600 dark:text-blue-455 leading-relaxed font-medium">
              Internal ID: <span className="font-mono text-[10px] bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded border border-blue-100 dark:border-blue-900/30 text-slate-700 dark:text-zinc-300 ml-1">{fieldData._id}</span>. 
              This metadata is used to map responses in the inquiry database.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewFieldDetails;
