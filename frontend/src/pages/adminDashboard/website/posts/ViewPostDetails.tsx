import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchPostById } from "@/http/api";
import {
   Loader2,
   ArrowLeft,
   ExternalLink,
   Globe,
   Calendar,
   User,
   FileText,
   Mail,
   Copy,
   Download,
   Maximize2,
   Edit2,
   Copy as DuplicateIcon,
   Eye,
   Share2,
   Trash2,
   History,
   CheckCircle2,
   ChevronRight,
   ChevronDown,
   Info,
   Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

const ViewPostDetails = () => {
   const { postId } = useParams();
   const navigate = useNavigate();

   const { data: post, isLoading, isError } = useQuery({
      queryKey: ["post", postId],
      queryFn: () => fetchPostById(postId!),
      enabled: !!postId,
   });

   const handleCopyEmail = (email: string) => {
      navigator.clipboard.writeText(email);
      toast.success("Email copied to clipboard");
   };

   if (isLoading) {
      return (
         <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
         </div>
      );
   }

   if (isError || !post) {
      return (
         <div className="flex flex-col items-center justify-center h-[400px] gap-4">
            <p className="text-red-500 font-medium">Failed to load post details.</p>
            <Button onClick={() => navigate(-1)} variant="outline">
               Go Back
            </Button>
         </div>
      );
   }

   const isPublished = post.status?.toLowerCase() === "published";

   return (
      <div className="w-full space-y-6 pb-20 pt-6 px-4 sm:px-6">
         {/* 🚀 Header */}
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
               <Button
                  variant="outline"
                  size="icon"
                  onClick={() => navigate("/dashboard/website/posts")}
                  className="h-10 w-10 shrink-0 rounded-full bg-white dark:bg-zinc-900 shadow-sm border-slate-200 dark:border-zinc-800"
               >
                  <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-zinc-400" />
               </Button>
               <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">Post Details</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">View and preview website content</p>
               </div>
            </div>

            <div className="flex items-center gap-3">
               <Badge
                  variant="outline"
                  className={`px-3 py-3 rounded-lg font-bold text-[10px] uppercase tracking-wider flex items-center gap-2 border-none shadow-none ${isPublished
                     ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 dark:bg-emerald-500/10 dark:text-emerald-400 hover:dark:bg-emerald-500/20"
                     : "bg-amber-50 text-amber-700 hover:bg-amber-50/80 dark:bg-amber-500/10 dark:text-amber-400 hover:dark:bg-amber-500/20"
                     }`}
               >
                  {post.status.toUpperCase()}
                  <div className={`h-2 w-2 rounded-full ${isPublished ? "bg-emerald-600" : "bg-amber-600"}`} />
               </Badge>

               <Button variant="outline" className="h-10 rounded-lg gap-2 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800/80 shadow-sm" asChild>
                  <a href={post.link} target="_blank" rel="noopener noreferrer">
                     <ExternalLink className="h-4 w-4" />
                     Visit Original
                  </a>
               </Button>
            </div>
         </div>

         <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6">
            {/* 📝 Left Side: Main Content */}
            <div className="space-y-6">
               {/* Content Information */}
               <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
                  <div className="bg-slate-50/50 dark:bg-zinc-900/40 border-b border-slate-100 dark:border-zinc-800 px-6 py-4 flex items-center gap-3">
                     <div className="bg-blue-50 dark:bg-blue-950/40 p-1.5 rounded-md">
                        <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                     </div>
                     <h3 className="font-bold text-slate-800 dark:text-slate-200">Content Information</h3>
                  </div>
                  <CardContent className="p-6 space-y-6">
                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Title</p>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{post.title}</h2>
                     </div>

                     <Separator className="bg-slate-100 dark:bg-zinc-800" />

                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Subtitle</p>
                        <p className="text-slate-600 dark:text-slate-300 font-medium">{post.subTitle || "No subtitle provided."}</p>
                     </div>

                     <Separator className="bg-slate-100 dark:bg-zinc-800" />

                     <div className="space-y-1">
                        <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Description</p>
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{post.description || "No description provided."}</p>
                     </div>

                     <div className="flex flex-wrap gap-4 pt-2">
                        <div className="bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl px-4 py-3 flex items-center gap-3 min-w-[140px]">
                           <div className="bg-blue-100 dark:bg-blue-950/40 p-2 rounded-full text-blue-600 dark:text-blue-400">
                              <Globe className="h-4 w-4" />
                           </div>
                           <div>
                              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase leading-none mb-1">Platform</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 capitalize">{post.platform}</p>
                           </div>
                        </div>

                        <div className="bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-900/30 rounded-xl px-4 py-3 flex items-center gap-3 min-w-[140px]">
                           <div className="bg-purple-100 dark:bg-purple-950/40 p-2 rounded-full text-purple-600 dark:text-purple-400">
                              <Calendar className="h-4 w-4" />
                           </div>
                           <div>
                              <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase leading-none mb-1">Created At</p>
                              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                 {new Date(post.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric"
                                 })}
                              </p>
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>

               {/* Author Card */}
               <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
                  <CardContent className="p-4 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-2.5 rounded-lg">
                           <User className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                        </div>
                        <div>
                           <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest">Created By</p>
                           <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{post.user?.name || "Meet"}</p>
                        </div>
                     </div>
                     <div className="flex items-center gap-4 text-right">
                        <div>
                           <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest">Email</p>
                           <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">{post.user?.email || "meet@gmail.com"}</p>
                              <Button
                                 variant="ghost"
                                 size="icon"
                                 className="h-7 w-7 text-slate-400 dark:text-zinc-500 hover:text-primary dark:hover:text-primary"
                                 onClick={() => handleCopyEmail(post.user?.email || "meet@gmail.com")}
                              >
                                 <Copy className="h-3.5 w-3.5" />
                              </Button>
                           </div>
                        </div>
                     </div>
                  </CardContent>
               </Card>
            </div>

            {/* 🖼️ Right Side: Sidebar */}
            <div className="space-y-6">
               {/* Thumbnail Preview */}
               <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 dark:border-zinc-800 flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="bg-blue-50 dark:bg-blue-950/30 p-1.5 rounded-md">
                           <ImageIcon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                        </div>
                        <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Post Image</h3>
                     </div>
                     <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-zinc-500">
                           <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 dark:text-zinc-500">
                           <Maximize2 className="h-4 w-4" />
                        </Button>
                     </div>
                  </div>
                  <CardContent className="p-4 pt-6 space-y-4">
                     <div className="aspect-[4/3] rounded-lg overflow-hidden bg-slate-50 dark:bg-zinc-950 border border-slate-100 dark:border-zinc-800 group relative">
                        {post.image ? (
                           <img
                              src={`http://localhost:3000${post.image}?t=${new Date(post.updatedAt || post.createdAt).getTime()}`}
                              alt={post.title}
                              className="w-full h-full object-cover"
                           />
                        ) : (
                           <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-zinc-700">
                              <ImageIcon className="h-12 w-12 opacity-20" />
                           </div>
                        )}
                     </div>

                     <div className="bg-blue-50/50 dark:bg-blue-950/15 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
                        <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-blue-600 dark:text-blue-400 leading-relaxed font-medium">
                           This thumbnail is displayed in the website's post gallery and platform feeds.
                        </p>
                     </div>
                  </CardContent>
               </Card>

               {/* Quick Actions */}
               {/* <Card className="border-slate-100 shadow-sm rounded-xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-2">
                     <div className="text-blue-500 font-bold">⚡</div>
                     <h3 className="font-bold text-slate-800 text-sm">Quick Actions</h3>
                  </div>
                  <CardContent className="p-2">
                     <div className="space-y-1">
                        <ActionButton icon={<DuplicateIcon />} label="Duplicate post" />
                        <ActionButton icon={<Eye />} label="View on website" asLink href={post.link} />
                        <ActionButton icon={<Share2 />} label="Share post" />
                        <Separator className="my-2 bg-slate-50" />
                        <ActionButton icon={<Trash2 />} label="Delete post" variant="destructive" />
                     </div>
                  </CardContent>
               </Card> */}
            </div>
         </div>
      </div>
   );
};

export default ViewPostDetails;

/* ---------------- UI Helper Components ---------------- */

const ActionButton = ({
   icon,
   label,
   onClick,
   variant = "default",
   asLink = false,
   href = "#"
}: {
   icon: React.ReactNode,
   label: string,
   onClick?: () => void,
   variant?: "default" | "destructive",
   asLink?: boolean,
   href?: string
}) => {
   const Component = asLink ? 'a' : 'button';
   const props = asLink ? { href, target: "_blank", rel: "noopener noreferrer" } : { onClick };

   return (
      <Component
         {...props as any}
         className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-all group text-left ${variant === "destructive" ? "text-red-500 hover:bg-red-50" : "text-slate-600"}`}
      >
         <div className="flex items-center gap-3">
            <div className={`h-4 w-4 ${variant === "destructive" ? "text-red-500" : "text-slate-400 group-hover:text-slate-600"}`}>
               {icon}
            </div>
            <span className="text-sm font-bold">{label}</span>
         </div>
         <ChevronRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Component>
   );
};
