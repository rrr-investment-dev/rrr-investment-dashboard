import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  fetchApplications,
  fetchCareers,
  updateApplicationStatus,
  deleteApplication,
  type JobApplicationApi,
  type CareerApi,
  BACKEND_URL,
} from "@/http/api";
import {
  User,
  Search,
  Download,
  Trash2,
  Loader2,
  Filter,
  Eye,
  Building,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function ApplicationsListPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedJobId, setSelectedJobId] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Fetch all applications
  const { data: allApplications = [], isLoading: isAppsLoading } = useQuery<JobApplicationApi[]>({
    queryKey: ["global-applications"],
    queryFn: () => fetchApplications(),
    staleTime: 0,
  });

  // Fetch all careers (for dropdown filter)
  const { data: careers = [] } = useQuery<CareerApi[]>({
    queryKey: ["job-openings"],
    queryFn: fetchCareers,
  });

  // Reset page when filtering
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedJobId, selectedStatus]);

  // Update application status
  const statusMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: string }) =>
      updateApplicationStatus(appId, status),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["global-applications"] });
      toast.success(res.message || "Candidate review status updated!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to update review status.");
    },
  });

  // Delete application
  const deleteMutation = useMutation({
    mutationFn: deleteApplication,
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["global-applications"] });
      toast.success(res.message || "Application deleted successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Failed to delete application.");
    },
  });

  // Filter application list
  const filteredApps = allApplications.filter((app) => {
    // 1. Search term match
    const term = search.toLowerCase();
    const matchesSearch =
      app.name.toLowerCase().includes(term) ||
      app.email.toLowerCase().includes(term) ||
      app.phone.toLowerCase().includes(term);

    // 2. Job filter match
    const careerObj = typeof app.careerId === "object" ? app.careerId : null;
    const careerIdStr = careerObj ? careerObj._id : app.careerId;
    const matchesJob = selectedJobId === "all" || careerIdStr === selectedJobId;

    // 3. Status filter match
    const matchesStatus = selectedStatus === "all" || app.status === selectedStatus;

    return matchesSearch && matchesJob && matchesStatus;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
  const paginatedApps = filteredApps.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50/50 dark:bg-zinc-950/30 min-h-screen">
      {/* ── Header ── */}
      <div className="space-y-1">
        <div className="flex items-center gap-2 mb-1">
          <User className="w-4 h-4 text-[#00338D] dark:text-[#4d7cc7]" />
          <span className="text-xs font-bold text-[#00338D] dark:text-[#4d7cc7] uppercase tracking-widest">
            Applications Hub
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
          Candidate Applications
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review details, resumes, and change selection status of candidates.
        </p>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
        {/* Search */}
        <div className="flex items-center gap-3 max-w-md flex-1 bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-xl px-3.5 py-2 shadow-xs focus-within:border-[#00338D]/50 focus-within:ring-1 focus-within:ring-[#00338D]/25 dark:focus-within:border-[#4d7cc7]/50 dark:focus-within:ring-[#4d7cc7]/25 transition-all">
          <Search className="w-4.5 h-4.5 text-slate-400 dark:text-zinc-550 shrink-0" />
          <input
            placeholder="Search candidates by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 h-6"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Job Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <Select value={selectedJobId} onValueChange={setSelectedJobId}>
              <SelectTrigger className="h-9 w-44 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold rounded-lg focus:ring-0">
                <SelectValue placeholder="Filter by Job" />
              </SelectTrigger>
              <SelectContent className="border-border text-xs">
                <SelectItem value="all">All Jobs</SelectItem>
                {careers.map((job) => (
                  <SelectItem key={job._id} value={job._id}>
                    {job.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-9 w-32 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold rounded-lg focus:ring-0">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="border-border text-xs">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reviewed">Reviewed</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* ── Table List ── */}
      <Card className="border border-slate-200/60 dark:border-zinc-850 shadow-sm bg-card overflow-hidden rounded-2xl">
        <CardContent className="p-0">
          {isAppsLoading ? (
            <div className="flex py-20 justify-center">
              <Loader2 className="w-8 h-8 text-[#00338D] animate-spin" />
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="text-center py-20 text-slate-400 italic text-xs font-semibold space-y-3">
              <div className="mx-auto w-10 h-10 rounded-full bg-slate-100 dark:bg-zinc-900 flex items-center justify-center text-slate-350">
                <User className="w-5 h-5" />
              </div>
              <p>No candidate applications found matching the criteria.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-zinc-850 text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase bg-slate-50/30 dark:bg-zinc-900/40">
                    <th className="py-3 px-6">Candidate</th>
                    <th className="py-3 px-6">Position Applied</th>
                    <th className="py-3 px-6">Resume</th>
                    <th className="py-3 px-6">Applied Date</th>
                    <th className="py-3 px-6">Review Status</th>
                    <th className="py-3 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-zinc-850">
                  {paginatedApps.map((app) => {
                    const job = typeof app.careerId === "object" ? app.careerId : null;
                    return (
                      <tr
                        key={app._id}
                        className="hover:bg-slate-50/50 dark:hover:bg-zinc-900/20 transition-colors"
                      >
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8.5 h-8.5 rounded-full bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-[#00338D] dark:text-[#4d7cc7] font-black text-xs uppercase">
                              {app.name.charAt(0)}
                            </div>
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-800 dark:text-slate-200 text-[14px]">
                                {app.name}
                              </span>
                              <div className="flex items-center gap-3 text-[11px] text-slate-400 dark:text-zinc-500 font-semibold">
                                <span className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" /> {app.email}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" /> {app.phone}
                                </span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4.5 px-6">
                          {job ? (
                            <div className="space-y-0.5">
                              <span className="font-bold text-slate-700 dark:text-zinc-300 text-[13px]">
                                {job.title}
                              </span>
                              <div className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-zinc-500 font-semibold">
                                <Building className="w-3 h-3" /> {job.department}
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 dark:text-zinc-650 italic">
                              Unknown role
                            </span>
                          )}
                        </td>
                        <td className="py-4.5 px-6">
                          <a
                            href={
                              app.resume.startsWith("http")
                                ? app.resume
                                : `${BACKEND_URL}${app.resume}`
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-250/70 dark:border-zinc-800 text-xs font-bold text-[#00338D] dark:text-[#4d7cc7] hover:bg-slate-50 dark:hover:bg-zinc-850 transition-colors shadow-xs"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Resume
                          </a>
                        </td>
                        <td className="py-4.5 px-6 text-xs text-slate-500 dark:text-zinc-500 font-semibold">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {new Date(app.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="py-4.5 px-6">
                          <Select
                            value={app.status}
                            onValueChange={(val) =>
                              statusMutation.mutate({ appId: app._id, status: val })
                            }
                          >
                            <SelectTrigger className="h-8 w-28 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs font-bold rounded-lg focus:ring-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="border-border text-xs">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="reviewed">Reviewed</SelectItem>
                              <SelectItem value="shortlisted">Shortlisted</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="py-4.5 px-6 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/dashboard/website/careers/applications/${app._id}`)}
                              className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-zinc-850"
                              title="View cover letter / details"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                if (
                                  confirm("Are you sure you want to delete this application?")
                                ) {
                                  deleteMutation.mutate(app._id);
                                }
                              }}
                              className="h-8 w-8 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            {filteredApps.length > 0 && (
              <div className="flex justify-end px-6 py-4 border-t border-slate-100 dark:border-zinc-850 bg-slate-50/20 dark:bg-zinc-900/10 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Rows per page selector */}
                  <div className="flex items-center gap-2.5">
                    <span>Rows per page</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="h-8 w-16 bg-white dark:bg-zinc-900 border border-slate-250 dark:border-zinc-800 rounded-lg text-xs font-bold text-slate-700 dark:text-zinc-200 outline-none px-2 cursor-pointer focus:border-[#00338D]/50 focus:ring-1 focus:ring-[#00338D]/25 dark:focus:border-[#4d7cc7]/50 dark:focus:ring-[#4d7cc7]/25 transition-all"
                    >
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                    </select>
                  </div>

                  {/* Page Info */}
                  <div>
                    Page {currentPage} of {totalPages || 1}
                  </div>

                  {/* Navigation buttons */}
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(1)}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-zinc-800 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-500 dark:text-zinc-400"
                      title="First page"
                    >
                      <ChevronsLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-zinc-800 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-500 dark:text-zinc-400"
                      title="Previous page"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || totalPages <= 1}
                      className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-zinc-800 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-500 dark:text-zinc-400"
                      title="Next page"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(totalPages || 1)}
                      disabled={currentPage === totalPages || totalPages <= 1}
                      className="h-8 w-8 p-0 rounded-lg border-slate-200 dark:border-zinc-800 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-zinc-850 text-slate-500 dark:text-zinc-400"
                      title="Last page"
                    >
                      <ChevronsRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
