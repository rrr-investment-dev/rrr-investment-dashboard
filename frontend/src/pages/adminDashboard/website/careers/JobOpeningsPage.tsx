import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  fetchCareers,
  deleteCareer,
  toggleCareerStatus,
  type CareerApi,
} from "@/http/api";
import {
  Briefcase,
  MapPin,
  Clock,
  Plus,
  Search,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Building,
  GraduationCap,
  Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

export default function JobOpeningsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch job openings
  const { data: careers = [], isLoading } = useQuery<CareerApi[]>({
    queryKey: ["job-openings"],
    queryFn: fetchCareers,
  });

  // Toggle active/inactive status
  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleCareerStatus(id, isActive),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["job-openings"] });
      toast.success(res.message || "Status updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update status.");
    },
  });

  // Delete opening
  const deleteMutation = useMutation({
    mutationFn: deleteCareer,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["job-openings"] });
      toast.success(res.message || "Job opening deleted successfully!");
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete opening.");
    },
  });

  // Filter listings
  const filteredCareers = careers.filter((job) => {
    const term = search.toLowerCase();
    return (
      job.title.toLowerCase().includes(term) ||
      job.department.toLowerCase().includes(term) ||
      job.location.toLowerCase().includes(term)
    );
  });

  const handleDeleteConfirm = () => {
    if (deleteId) {
      deleteMutation.mutate(deleteId);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50/50 dark:bg-zinc-950/30 min-h-screen">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <Briefcase className="w-4 h-4 text-[#00338D] dark:text-[#4d7cc7]" />
            <span className="text-xs font-bold text-[#00338D] dark:text-[#4d7cc7] uppercase tracking-widest">
              Careers Hub
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Job Openings
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create, publish, and manage job opening postings for your website.
          </p>
        </div>

        <Button
          onClick={() => navigate("/dashboard/website/careers/jobs/create")}
          className="rounded-xl bg-[#00338D] hover:bg-[#00338D]/90 text-white font-bold text-xs cursor-pointer shadow-md self-start sm:self-auto gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Job Opening
        </Button>
      </div>

      {/* ── Search bar ── */}
      <div className="flex items-center gap-3 max-w-md bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-xl px-3.5 py-2 shadow-xs focus-within:border-[#00338D]/50 focus-within:ring-1 focus-within:ring-[#00338D]/25 dark:focus-within:border-[#4d7cc7]/50 dark:focus-within:ring-[#4d7cc7]/25 transition-all">
        <Search className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-550 shrink-0" />
        <input
          placeholder="Search jobs by title, department, or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 h-6"
        />
      </div>

      {/* ── Content Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-card h-48 animate-pulse shadow-sm"
            />
          ))}
        </div>
      ) : filteredCareers.length === 0 ? (
        <Card className="border border-slate-150 dark:border-zinc-800/80 shadow-sm bg-card text-center py-16 px-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-400 mb-4">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-black text-slate-700 dark:text-slate-300">
            No job openings found
          </h3>
          <p className="text-xs text-slate-400 dark:text-zinc-500 max-w-xs mx-auto mt-1">
            Try adjusting your search criteria or create a new job opening.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCareers.map((job) => (
            <Card
              key={job._id}
              className="group relative border border-slate-200/60 dark:border-zinc-850 bg-card hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden rounded-2xl"
            >
              <CardContent className="p-6 space-y-4">
                {/* Header: Status and Menu */}
                <div className="flex items-center justify-between">
                  <Badge
                    variant="secondary"
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      job.isActive
                        ? "bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-900/50"
                        : "bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-250 dark:border-amber-900/50"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                        job.isActive ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    {job.isActive ? "Active" : "Inactive"}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full border border-slate-200/50 dark:border-zinc-800 bg-transparent text-slate-500 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-zinc-100 transition-colors"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-44 rounded-xl shadow-xl border-border text-sm"
                    >
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(`/dashboard/website/careers/jobs/${job._id}`)
                        }
                        className="flex items-center gap-2.5 py-2 cursor-pointer font-medium"
                      >
                        <Eye className="h-3.5 w-3.5 text-blue-500" />
                        View Open Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          navigate(
                            `/dashboard/website/careers/jobs/edit/${job._id}`
                          )
                        }
                        className="flex items-center gap-2.5 py-2 cursor-pointer font-medium"
                      >
                        <Pencil className="h-3.5 w-3.5 text-blue-500" />
                        Edit Job
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() =>
                          toggleMutation.mutate({
                            id: job._id,
                            isActive: !job.isActive,
                          })
                        }
                        className="flex items-center gap-2.5 py-2 cursor-pointer font-medium"
                      >
                        {job.isActive ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5 text-amber-500" />
                            Deactivate
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 text-emerald-500" />
                            Activate
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteId(job._id)}
                        className="flex items-center gap-2.5 py-2 cursor-pointer font-medium text-red-500 focus:text-red-500 focus:bg-red-500/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Job Title and Dept */}
                <div className="space-y-1">
                  <h3 className="text-base font-black text-slate-800 dark:text-slate-200 line-clamp-1">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400 font-medium">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.department}</span>
                  </div>
                </div>

                {/* Info Badges */}
                <div className="grid grid-cols-2 gap-y-2 pt-2 text-[11px] font-bold text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.jobType}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>Exp: {job.experience}</span>
                  </div>
                  {job.education && (
                    <div className="flex items-center gap-1.5 truncate" title={job.education}>
                      <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{job.education}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ── Delete Confirmation dialog ── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-xl max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-bold text-slate-900 dark:text-slate-100">
              Delete Job Opening?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500">
              Are you sure you want to permanently delete this job offering?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 gap-2">
            <AlertDialogCancel className="rounded-xl text-xs font-bold border-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="rounded-xl text-xs font-bold bg-red-600 hover:bg-red-750 text-white cursor-pointer"
            >
              Delete Job
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
