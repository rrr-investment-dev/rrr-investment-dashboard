import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchTeamMemberById } from "@/http/api";
import {
   Loader2,
   ArrowLeft,
   User,
   Calendar,
   Briefcase,
   CheckCircle2,
   XCircle,
   Globe,
   Linkedin,
   Twitter,
   Instagram,
   Facebook,
   Image as ImageIcon,
   Mail,
   Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const PLATFORM_ICONS: Record<string, React.ElementType> = {
   linkedin: Linkedin,
   twitter: Twitter,
   instagram: Instagram,
   facebook: Facebook,
};

const ViewTeamMember = () => {
   const { memberId } = useParams();
   const navigate = useNavigate();

   const { data: member, isLoading, isError } = useQuery({
      queryKey: ["team-member", memberId],
      queryFn: () => fetchTeamMemberById(memberId!),
      enabled: !!memberId,
   });

   if (isLoading) {
      return (
         <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      );
   }

   if (isError || !member) {
      return (
         <div className="flex flex-col items-center justify-center h-[400px] gap-4">
            <p className="text-red-500 font-medium">Failed to load member details.</p>
            <Button onClick={() => navigate("/dashboard/website/team")} variant="outline">
               Go Back
            </Button>
         </div>
      );
   }

   return (
      <div className="w-full space-y-6 pb-20 pt-6 px-4 sm:px-6">
         {/* 🚀 Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate("/dashboard/website/team")}
                  className="h-10 w-10 shrink-0 rounded-full bg-white dark:bg-zinc-950 shadow-sm border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-900"
               >
                  <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-zinc-300" />
               </Button>
               <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-200 leading-tight">Member Details</h1>
                  <p className="text-sm text-slate-500 dark:text-zinc-400">View team member profile information</p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <Badge
                  variant="outline"
                  className={`px-3 py-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 border-none shadow-none ${member.isActive
                     ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 dark:bg-emerald-500/10 dark:text-emerald-400 hover:dark:bg-emerald-500/20"
                     : "bg-amber-50 text-amber-700 hover:bg-amber-50/80 dark:bg-amber-500/10 dark:text-amber-400 hover:dark:bg-amber-500/20"
                     }`}
               >
                  {member.isActive ? "ACTIVE" : "INACTIVE"}
                  <div className={`h-2 w-2 rounded-full ${member.isActive ? "bg-emerald-600 dark:bg-emerald-500" : "bg-amber-600 dark:bg-amber-500"}`} />
               </Badge>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
            {/* 📝 Left Side: Main Content */}
            <div className="space-y-6">
               {/* Profile Information */}
               <Card className="border-slate-200/60 dark:border-zinc-800 bg-card text-card-foreground shadow-sm rounded-xl overflow-hidden">
                  <div className="bg-slate-50/50 dark:bg-zinc-900/40 border-b border-slate-100 dark:border-zinc-800 px-6 py-4 flex items-center gap-3">
                     <div className="bg-blue-100 dark:bg-blue-950/40 p-1.5 rounded-md">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                     </div>
                     <h3 className="font-bold text-slate-800 dark:text-slate-200">Profile Information</h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-400 uppercase tracking-widest">Name</p>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{member.name}</h2>
                     </div>

                     <Separator className="bg-slate-100 dark:bg-zinc-850" />

                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-400 uppercase tracking-widest">Designation</p>
                        <p className="text-slate-600 dark:text-zinc-300 font-medium">{member.designation}</p>
                     </div>

                     <Separator className="bg-slate-100 dark:bg-zinc-850" />

                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-400 uppercase tracking-widest">Sectors Covered</p>
                        {member.sectorsCovered && member.sectorsCovered.length > 0 ? (
                           <div className="flex flex-wrap gap-2 pt-1">
                              {member.sectorsCovered.map((sector: string, index: number) => (
                                 <Badge key={index} variant="secondary" className="bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700 border-none">
                                    {sector}
                                 </Badge>
                              ))}
                           </div>
                        ) : (
                           <p className="text-slate-600 dark:text-zinc-400 font-medium">None specified.</p>
                        )}
                     </div>

                     <div className="flex flex-wrap gap-4 pt-2">
                        <div className="bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/30 rounded-xl px-4 py-3 flex items-center gap-3 min-w-[140px]">
                           <div className="bg-purple-100 dark:bg-purple-950/50 p-2 rounded-full text-purple-600 dark:text-purple-400">
                              <Calendar className="h-4 w-4" />
                           </div>
                           <div>
                              <p className="text-[10px] text-slate-400 dark:text-zinc-400 font-bold uppercase leading-none mb-1">Joined Date</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                 {new Date(member.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                 })}
                              </p>
                           </div>
                        </div>

                        <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl px-4 py-3 flex items-center gap-3 min-w-[140px]">
                           <div className="bg-blue-100 dark:bg-blue-950/50 p-2 rounded-full text-blue-600 dark:text-blue-400">
                              <Briefcase className="h-4 w-4" />
                           </div>
                           <div>
                              <p className="text-[10px] text-slate-400 dark:text-zinc-400 font-bold uppercase leading-none mb-1">Status</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                 {member.isActive ? "Active Member" : "Inactive Member"}
                              </p>
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Social Media */}
               <Card className="border-slate-200/60 dark:border-zinc-800 bg-card text-card-foreground shadow-sm rounded-xl overflow-hidden">
                  <div className="bg-slate-50/50 dark:bg-zinc-900/40 border-b border-slate-100 dark:border-zinc-800 px-6 py-4 flex items-center gap-3">
                     <div className="bg-blue-100 dark:bg-blue-950/40 p-1.5 rounded-md">
                        <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                     </div>
                     <h3 className="font-bold text-slate-800 dark:text-slate-200">Social Media Profiles</h3>
                  </div>
                  <CardContent className="p-6">
                     {member.socialMedia && member.socialMedia.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {member.socialMedia.map((social: any, index: number) => {
                              const Icon = PLATFORM_ICONS[social.platform] || Globe;
                              return (
                                 <a
                                    key={index}
                                    href={social.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 dark:border-zinc-850 hover:bg-slate-50 dark:hover:bg-zinc-900 transition-colors group"
                                 >
                                    <div className="p-2 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-colors">
                                       <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                       <p className="text-sm font-semibold text-slate-700 dark:text-zinc-200 capitalize mb-0.5">{social.platform}</p>
                                       <p className="text-xs text-slate-500 dark:text-zinc-400 truncate">{social.url}</p>
                                    </div>
                                 </a>
                              );
                           })}
                        </div>
                     ) : (
                        <p className="text-slate-500 dark:text-zinc-500 text-sm text-center py-4">No social media profiles added.</p>
                     )}
                  </CardContent>
               </Card>
            </div>

            {/* 🖼️ Right Side: Sidebar */}
            <div className="space-y-6">
               {/* Profile Image */}
               <Card className="border-slate-200/60 dark:border-zinc-800 bg-card text-card-foreground shadow-sm rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded-md">
                           <ImageIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Profile Photo</h3>
                     </div>
                     {member.image && (
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300" asChild>
                           <a href={`http://localhost:3000${member.image}?t=${new Date(member.updatedAt).getTime()}`} download target="_blank" rel="noopener noreferrer" title="Download Image">
                              <Download className="h-4 w-4" />
                           </a>
                        </Button>
                     )}
                  </div>
                  <CardContent className="p-4 pt-6 space-y-4">
                     <div className="aspect-[3/4] rounded-lg overflow-hidden bg-[#f0f2f5] dark:bg-zinc-950 border border-slate-100 dark:border-zinc-850 group relative flex items-end justify-center">
                        {member.image ? (
                           <img
                              src={`http://localhost:3000${member.image}?t=${new Date(member.updatedAt).getTime()}`}
                              alt={member.name}
                              className="w-full h-full object-contain object-bottom"
                           />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-zinc-650">
                              <ImageIcon className="h-12 w-12 opacity-20" />
                           </div>
                        )}
                     </div>
                  </CardContent>
               </Card>
            </div>
         </div>
      </div>
   );
};

export default ViewTeamMember;
