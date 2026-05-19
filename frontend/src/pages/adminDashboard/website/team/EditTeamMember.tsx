import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTeamMemberById } from "@/http/api";
import { Loader2, ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import TeamForm from "@/components/admin/website/team/TeamForm";

const EditTeamMember = () => {
  const { memberId } = useParams();
  const navigate = useNavigate();

  const handleBack = () => navigate("/dashboard/website/team");

  const { data: member, isLoading, isError } = useQuery({
    queryKey: ["team-member", memberId],
    queryFn: () => fetchTeamMemberById(memberId!),
    enabled: !!memberId,
    staleTime: 0,
  });

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center w-full">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (isError || !member) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4 w-full">
        <p className="text-red-500 font-medium">Failed to load team member details.</p>
        <Button onClick={handleBack} variant="outline" className="rounded-xl font-bold">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-10 pt-6 px-4 sm:px-6 animate-in fade-in duration-500">
      {/* Header */}
      <header className="flex flex-row items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={handleBack}
          className="h-10 w-10 shrink-0 rounded-full bg-card shadow-sm hover:bg-muted border-border"
        >
          <ArrowLeft className="h-4 w-4 text-foreground/80" />
        </Button>
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
            Edit Team Member
          </h1>
          <p className="text-sm font-medium text-muted-foreground">
            Update profile information for <span className="text-blue-600 dark:text-blue-400 font-bold">{member.name}</span>.
          </p>
        </div>
      </header>

      <div className="mt-8">
        <TeamForm
          initialData={member}
          onSuccess={handleBack}
        />
      </div>
    </div>
  );
};

export default EditTeamMember;
