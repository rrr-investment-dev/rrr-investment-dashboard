"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchTeamMembers,
  deleteTeamMember,
  toggleTeamMemberStatus,
  type TeamApi,
} from "@/http/api";
import {
  Loader2,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Globe,
  Github,
  Mail,
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Users,
  Search,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
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
import { useState, useMemo } from "react";

// ─── Platform config ────────────────────────────────────────────────────────────
const PLATFORM_CONFIG: Record<
  string,
  { icon: React.ElementType; label: string; color: string }
> = {
  linkedin: { icon: Linkedin, label: "LinkedIn", color: "hover:text-[#0077B5]" },
  twitter: { icon: Twitter, label: "Twitter", color: "hover:text-[#1DA1F2]" },
  instagram: { icon: Instagram, label: "Instagram", color: "hover:text-[#E1306C]" },
  facebook: { icon: Facebook, label: "Facebook", color: "hover:text-[#1877F2]" },
  github: { icon: Github, label: "GitHub", color: "hover:text-slate-900" },
  mail: { icon: Mail, label: "Email", color: "hover:text-emerald-600" },
};

// ─── Skeleton ──────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-card overflow-hidden animate-pulse shadow-sm">
      <div className="bg-slate-100 dark:bg-zinc-900 aspect-[3/4]" />
      <div className="p-4 space-y-2.5">
        <div className="h-4 bg-slate-100 dark:bg-zinc-900 rounded w-3/4" />
        <div className="h-3 bg-slate-100 dark:bg-zinc-900 rounded w-1/2" />
        <div className="h-5 bg-slate-100 dark:bg-zinc-900 rounded-full w-1/4 mt-1" />
        <div className="flex gap-2 pt-2">
          {[1, 2, 3].map((i) => <div key={i} className="h-7 w-7 bg-slate-100 dark:bg-zinc-900 rounded-full" />)}
        </div>
      </div>
    </div>
  );
}

// ─── Member Card ───────────────────────────────────────────────────────────────
interface MemberCardProps {
  member: TeamApi;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
  isStatusLoading: boolean;
}

function MemberCard({ member, onView, onEdit, onDelete, onToggleStatus, isStatusLoading }: MemberCardProps) {
  return (
    <div className="group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">

      {/* ── Photo area ──────────────────────────────────── */}
      <div className="relative bg-muted overflow-hidden aspect-[3/4] max-h-56 flex items-end justify-center">
        <img
          src={`http://localhost:3000${member.image}?t=${new Date(member.updatedAt).getTime()}`}
          alt={member.name}
          className="h-full w-full object-contain object-bottom"
        />

        {/* Status badge — top right */}
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`inline-flex items-center gap-1 pl-1.5 pr-2.5 py-0.5 rounded-full text-[11px] font-semibold shadow-sm backdrop-blur-md ${member.isActive
              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 dark:border-emerald-500/30"
              : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 dark:border-amber-500/30"
              }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${member.isActive ? "bg-emerald-500" : "bg-amber-400"
                }`}
            />
            {member.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {/* Actions menu — top left, hidden until hover */}
        <div className="absolute top-3 left-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-7 w-7 rounded-full bg-background/90 dark:bg-card/90 shadow border border-border hover:bg-background"
              >
                <MoreVertical className="h-3.5 w-3.5 text-foreground/80" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44 rounded-xl shadow-xl border-border text-sm">
              <DropdownMenuItem
                onClick={() => onView(member._id)}
                className="flex items-center gap-2.5 py-2 cursor-pointer font-medium"
              >
                <Eye className="h-3.5 w-3.5 text-blue-500" />
                View Member
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onEdit(member._id)}
                className="flex items-center gap-2.5 py-2 cursor-pointer font-medium"
              >
                <Pencil className="h-3.5 w-3.5 text-blue-500" />
                Edit Member
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onToggleStatus(member._id, !member.isActive)}
                disabled={isStatusLoading}
                className="flex items-center gap-2.5 py-2 cursor-pointer font-medium"
              >
                {member.isActive ? (
                  <><EyeOff className="h-3.5 w-3.5 text-amber-500" /> Deactivate</>
                ) : (
                  <><Eye className="h-3.5 w-3.5 text-emerald-500" /> Activate</>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(member._id)}
                className="flex items-center gap-2.5 py-2 cursor-pointer font-medium text-red-500 focus:text-red-500 focus:bg-red-500/10"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Content area ────────────────────────────────── */}
      <div className="flex flex-col gap-3 p-4 pt-3.5">

        {/* Name + Designation */}
        <div className="space-y-0.5">
          <h3 className="text-[15px] font-bold text-foreground leading-snug line-clamp-1">
            {member.name}
          </h3>
          <p className="text-[13px] text-blue-600 dark:text-blue-400 font-medium leading-snug line-clamp-1">
            {member.designation}
          </p>
        </div>

        {/* Sector tags */}
        {member.sectorsCovered?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {member.sectorsCovered.slice(0, 3).map((sector, idx) => (
              <span
                key={idx}
                className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border"
              >
                {sector}
              </span>
            ))}
            {member.sectorsCovered.length > 3 && (
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-500 border border-blue-100 dark:border-blue-800/50">
                +{member.sectorsCovered.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Social icons row */}
        <div className="flex items-center gap-1.5">
          {/* Always show email icon as a mailto link placeholder */}
          <a
            href={`mailto:${member.name.toLowerCase().replace(/\s+/g, ".")}@company.com`}
            title="Email"
            className="h-7 w-7 inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-emerald-600 hover:bg-emerald-500/10 transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
          </a>

          {member.socialMedia?.map((social, idx) => {
            const cfg = PLATFORM_CONFIG[social.platform] ?? {
              icon: Globe,
              label: social.platform,
              color: "hover:text-blue-600",
            };
            const Icon = cfg.icon;
            return (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                title={cfg.label}
                className={`h-7 w-7 inline-flex items-center justify-center rounded-full text-muted-foreground ${cfg.color} hover:bg-muted transition-colors`}
              >
                <Icon className="h-3.5 w-3.5" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function TeamList() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");

  const { data: members, isLoading, isError } = useQuery<TeamApi[]>({
    queryKey: ["team-members"],
    queryFn: fetchTeamMembers,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success("Team member deleted successfully");
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete team member");
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleTeamMemberStatus(id, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      toast.success(data.message || "Status updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update status");
    },
  });

  const activeCount = useMemo(() => members?.filter((m) => m.isActive).length ?? 0, [members]);
  const inactiveCount = useMemo(() => members?.filter((m) => !m.isActive).length ?? 0, [members]);

  const filtered = useMemo(() => {
    if (!members) return [];
    return members.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.designation.toLowerCase().includes(q) ||
        m.sectorsCovered?.some((s) => s.toLowerCase().includes(q));
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" && m.isActive) ||
        (filterStatus === "inactive" && !m.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [members, search, filterStatus]);

  // ── States ────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-5 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-2xl bg-red-50 border border-red-100">
        <p className="text-red-500 font-semibold">Failed to load team members.</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["team-members"] })}
          className="border-red-200 text-red-600 hover:bg-red-100"
        >
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-1">

      {/* ── Toolbar ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">

        {/* Filter chips */}
        <div className="flex items-center gap-1.5 shrink-0">
          {(
            [
              { label: "All", value: members?.length ?? 0, key: "all", active: "bg-slate-800 dark:bg-zinc-800 text-white border-slate-800 dark:border-zinc-800", inactive: "bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-slate-400 dark:hover:border-zinc-700" },
              { label: "Active", value: activeCount, key: "active", active: "bg-emerald-600 dark:bg-emerald-500/90 text-white border-emerald-600 dark:border-emerald-500/90", inactive: "bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-emerald-300 dark:hover:border-emerald-500/40" },
              { label: "Inactive", value: inactiveCount, key: "inactive", active: "bg-amber-500 dark:bg-amber-500/90 text-white border-amber-500 dark:border-amber-500/90", inactive: "bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 border-slate-200 dark:border-zinc-800 hover:border-amber-300 dark:hover:border-amber-500/40" },
            ] as const
          ).map((chip) => (
            <button
              key={chip.key}
              onClick={() => setFilterStatus(chip.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 ${filterStatus === chip.key ? chip.active : chip.inactive
                }`}
            >
              {chip.label}
              <span
                className={`rounded-full px-1.5 py-px text-[10px] leading-none font-bold ${filterStatus === chip.key ? "bg-white/25" : "bg-slate-100 dark:bg-zinc-900 text-slate-550 dark:text-zinc-450"
                  }`}
              >
                {chip.value}
              </span>
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative flex-1 sm:max-w-[260px] ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search members…"
            className="pl-9 pr-9 h-9 text-sm bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 rounded-xl focus-visible:ring-1 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-500 focus-visible:border-blue-500 dark:focus-visible:border-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {filtered.map((member) => (
          <MemberCard
            key={member._id}
            member={member}
            onView={(id) => navigate(`${id}`)}
            onEdit={(id) => navigate(`edit/${id}`)}
            onDelete={(id) => setDeleteId(id)}
            onToggleStatus={(id, isActive) => statusMutation.mutate({ id, isActive })}
            isStatusLoading={statusMutation.isPending}
          />
        ))}

        {/* Empty state */}
        {filtered.length === 0 && (
          <div className="col-span-full py-20 text-center rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/60 dark:bg-zinc-950/20">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-slate-100 dark:bg-zinc-900 mb-4">
              <Users className="h-7 w-7 text-slate-400 dark:text-zinc-550" />
            </div>
            {search || filterStatus !== "all" ? (
              <>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No results found</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Try adjusting your search or filter.</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-zinc-900 text-xs"
                  onClick={() => { setSearch(""); setFilterStatus("all"); }}
                >
                  Clear filters
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No team members yet</h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">Add your first team member to get started.</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Delete Confirmation ───────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl border border-slate-150 dark:border-zinc-800 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold">Delete Team Member?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-zinc-400 leading-relaxed text-sm">
              This action cannot be undone. The member's profile and all associated data will be
              permanently removed from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-zinc-800 font-semibold text-sm">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              disabled={deleteMutation.isPending}
              className="bg-red-500 hover:bg-red-600 rounded-xl font-semibold gap-2 text-sm"
            >
              {deleteMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
