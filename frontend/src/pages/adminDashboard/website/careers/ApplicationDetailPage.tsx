import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchApplicationById,
  updateApplicationStatus,
  deleteApplication,
  type JobApplicationApi,
  BACKEND_URL,
} from "@/http/api";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Building,
  MapPin,
  Download,
  Trash2,
  Loader2,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

export default function ApplicationDetailPage() {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch application details
  const { data: app, isLoading } = useQuery<JobApplicationApi>({
    queryKey: ["application-detail", applicationId],
    queryFn: () => fetchApplicationById(applicationId!),
    enabled: !!applicationId,
  });

  // Update status mutation
  const statusMutation = useMutation({
    mutationFn: (status: string) => updateApplicationStatus(applicationId!, status),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["application-detail", applicationId] });
      queryClient.invalidateQueries({ queryKey: ["global-applications"] });
      toast.success(res.message || "Candidate review status updated!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update review status.");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => deleteApplication(applicationId!),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["global-applications"] });
      toast.success(res.message || "Application deleted successfully!");
      navigate("/dashboard/website/careers/applications");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete application.");
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50/50 dark:bg-zinc-950/30">
        <Loader2 className="w-8 h-8 text-[#00338D] animate-spin" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-sm font-bold text-red-500">Application not found</h3>
        <Button
          onClick={() => navigate("/dashboard/website/careers/applications")}
          className="mt-4"
        >
          Back to Applications
        </Button>
      </div>
    );
  }

  const job = typeof app.careerId === "object" ? app.careerId : null;

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50/50 dark:bg-zinc-950/30 min-h-screen">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
        <button
          onClick={() => navigate("/dashboard/website/careers/applications")}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-950 dark:hover:text-slate-100 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:shadow-xs transition-all cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-[#00338D] dark:text-[#4d7cc7] uppercase tracking-wider">
            Application Review
          </span>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {app.name}
          </h1>
          <p className="text-xs text-slate-400 font-semibold">
            Submitted on{" "}
            {new Date(app.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* 📋 Left Side: Candidate Information */}
        <div className="space-y-6">
          <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="py-5 px-6 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-900/20">
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-[#00338D] dark:text-[#4d7cc7]" />
                Candidate Profile
              </h2>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm font-semibold">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wide">
                    Email Address
                  </span>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                    <Mail className="w-4 h-4 text-slate-400" />
                    <span>{app.email}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wide">
                    Phone Number
                  </span>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{app.phone}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wide">
                    Submission Date
                  </span>
                  <div className="flex items-center gap-2 text-slate-700 dark:text-zinc-300">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>
                      {new Date(app.createdAt).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <Separator className="bg-slate-100 dark:bg-zinc-800" />

              {/* Position Info */}
              <div className="space-y-1.5 text-sm">
                <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wide">
                  Applied Position
                </span>
                {job ? (
                  <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-zinc-900/30 border border-slate-100 dark:border-zinc-850">
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-[#00338D] dark:text-[#4d7cc7]">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-slate-800 dark:text-slate-200">
                        {job.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-zinc-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5" />
                          {job.department}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {job.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Unknown job opening.</span>
                )}
              </div>

              <Separator className="bg-slate-100 dark:bg-zinc-800" />

              {/* Cover Letter */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Cover Letter / Message
                </span>
                <div className="p-5 rounded-xl border border-slate-200/60 dark:border-zinc-850 bg-slate-50/20 dark:bg-zinc-900/20 text-sm leading-relaxed text-slate-600 dark:text-zinc-300 font-medium whitespace-pre-wrap">
                  {app.coverLetter || (
                    <span className="text-slate-400 italic">
                      No cover letter or message submitted by candidate.
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 💾 Right Side: Selection Status & Actions */}
        <div className="space-y-6">
          <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl">
            <CardHeader className="py-5 px-6 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Review Status
              </h3>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <Select
                value={app.status}
                onValueChange={(val) => statusMutation.mutate(val)}
              >
                <SelectTrigger className="h-10 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold rounded-xl focus:ring-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-border text-xs">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="reviewed">Reviewed</SelectItem>
                  <SelectItem value="shortlisted">Shortlisted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Resume Actions */}
          <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl">
            <CardHeader className="py-5 px-6 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Candidate Resume
              </h3>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <a
                href={app.resume.startsWith("http") ? app.resume : `${BACKEND_URL}${app.resume}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 h-10 rounded-xl bg-[#00338D] text-white hover:bg-[#00338D]/90 font-bold text-xs cursor-pointer shadow-md transition-colors"
              >
                <Download className="w-4.5 h-4.5" />
                Download Resume File
              </a>
              <Button
                variant="outline"
                onClick={() => {
                  if (confirm("Are you sure you want to permanently delete this application?")) {
                    deleteMutation.mutate();
                  }
                }}
                className="w-full h-10 rounded-xl border-slate-250 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 font-bold text-xs cursor-pointer transition-colors gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Profile
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
