import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCareerById,
  fetchApplicationsForJob,
  type CareerApi,
  type JobApplicationApi,
  BACKEND_URL,
} from "@/http/api";
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  Clock,
  GraduationCap,
  Building,
  User,
  Download,
  Loader2,
  Award,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default function JobOpeningDetailPage() {
  const { careerId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch job opening details
  const { data: job, isLoading: isJobLoading } = useQuery<CareerApi>({
    queryKey: ["job-detail", careerId],
    queryFn: () => fetchCareerById(careerId!),
    enabled: !!careerId,
  });

  // Fetch applications for this job
  const { data: applications = [], isLoading: isAppsLoading } = useQuery<JobApplicationApi[]>({
    queryKey: ["job-applications", careerId],
    queryFn: () => fetchApplicationsForJob(careerId!),
    enabled: !!careerId,
    staleTime: 0,
  });


  if (isJobLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50/50 dark:bg-zinc-950/30">
        <Loader2 className="w-8 h-8 text-[#00338D] animate-spin" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="p-6 text-center">
        <h3 className="text-sm font-bold text-red-500">Job opening not found</h3>
        <Button onClick={() => navigate("/dashboard/website/careers/jobs")} className="mt-4">
          Back to Listings
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50/50 dark:bg-zinc-950/30 min-h-screen">
      {/* ── Header ── */}
      <div className="flex items-center gap-4 bg-white dark:bg-zinc-900 border border-slate-200/60 dark:border-zinc-800/80 rounded-2xl p-5 shadow-sm">
        <button
          onClick={() => navigate("/dashboard/website/careers/jobs")}
          className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-950 dark:hover:text-slate-100 bg-white dark:bg-zinc-950 hover:bg-slate-50 dark:hover:bg-zinc-900 hover:shadow-xs transition-all cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4.5 h-4.5" />
        </button>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#00338D] dark:text-[#4d7cc7] uppercase tracking-wider">
              Careers Detail
            </span>
            <Badge
              variant="secondary"
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${job.isActive
                  ? "bg-emerald-100/80 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/40"
                  : "bg-amber-100/80 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-250 dark:border-amber-900/40"
                }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full mr-1.5 ${job.isActive ? "bg-emerald-500" : "bg-amber-500"}`} />
              {job.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {job.title}
          </h1>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-semibold">
            <Building className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-500" />
            <span>{job.department}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* 📋 Left Side: Job Specs */}
        <div className="xl:col-span-4 space-y-6">
          <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="py-5 px-6 border-b border-slate-100 dark:border-zinc-800">
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Job Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-3.5 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">Location:</span>
                  <span className="ml-auto text-slate-500">{job.location}</span>
                </div>
                <Separator className="bg-slate-100 dark:bg-zinc-800" />
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">Job Type:</span>
                  <span className="ml-auto text-slate-500">{job.jobType}</span>
                </div>
                <Separator className="bg-slate-100 dark:bg-zinc-800" />
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold text-slate-700 dark:text-zinc-300">Experience:</span>
                  <span className="ml-auto text-slate-500">{job.experience}</span>
                </div>
                {job.education && (
                  <>
                    <Separator className="bg-slate-100 dark:bg-zinc-800" />
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-700 dark:text-zinc-300">Education:</span>
                      <span className="ml-auto text-slate-500">{job.education}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Requirements & Benefits list */}
          <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="py-5 px-6 border-b border-slate-100 dark:border-zinc-800">
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-3">
              {job.requirements?.length > 0 ? (
                <ul className="list-disc list-inside text-xs text-slate-600 dark:text-zinc-400 space-y-1.5 leading-relaxed font-semibold">
                  {job.requirements.map((req, idx) => (
                    <li key={idx}>{req}</li>
                  ))}
                </ul>
              ) : (
                <span className="text-xs text-slate-400 italic">No specific requirements listed.</span>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 👥 Right Side: Description & Applications Table */}
        <div className="xl:col-span-8 space-y-6">
          <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="py-5 px-6 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-900/20">
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Description
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <p className="text-sm leading-relaxed text-slate-600 dark:text-zinc-300 whitespace-pre-wrap font-medium">
                {job.description}
              </p>
            </CardContent>
          </Card>

          {/* Applications list */}
          <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="py-5 px-6 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/20 dark:bg-zinc-900/20">
              <CardTitle className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Candidate Applications ({applications.length})
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Candidates who submitted their profile for this job opening.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isAppsLoading ? (
                <div className="flex py-10 justify-center">
                  <Loader2 className="w-6 h-6 text-[#00338D] animate-spin" />
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-12 text-slate-400 italic text-xs font-semibold">
                  No applications received yet for this role.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-zinc-850 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase bg-slate-50/30 dark:bg-zinc-900/40">
                        <th className="py-3 px-5">Candidate</th>
                        <th className="py-3 px-5">Contact Details</th>
                        <th className="py-3 px-5">Resume</th>
                        <th className="py-3 px-5">Applied Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                      {applications.map((app) => (
                        <tr key={app._id} className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-[#00338D] dark:text-[#4d7cc7] font-bold text-xs uppercase">
                                <User className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {app.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-5 space-y-0.5 text-xs font-semibold text-slate-600 dark:text-zinc-400">
                            <div>{app.email}</div>
                            <div className="text-slate-400">{app.phone}</div>
                          </td>
                          <td className="py-4 px-5">
                            <a
                              href={app.resume.startsWith("http") ? app.resume : `${BACKEND_URL}${app.resume}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs font-bold text-[#00338D] dark:text-[#4d7cc7] hover:bg-slate-50 dark:hover:bg-zinc-850 transition-colors"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Resume
                            </a>
                          </td>
                          <td className="py-4 px-5 text-xs text-slate-500 dark:text-zinc-500 font-semibold">
                            {new Date(app.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
