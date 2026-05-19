import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchInquiryById } from "@/http/api";
import { Loader2, ArrowLeft, Mail, Clock, ShieldCheck, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";


const ViewInquiryDetails = () => {
  const { inquiryId } = useParams();
  const navigate = useNavigate();

  const { data: inquiry, isLoading } = useQuery({
    queryKey: ["inquiry", inquiryId],
    queryFn: () => fetchInquiryById(inquiryId!),
    enabled: !!inquiryId,
  });

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div className="flex h-96 items-center justify-center">
        <p className="text-slate-500 font-medium">Inquiry not found</p>
      </div>
    );
  }

  const responses = inquiry.responses || {};

  return (
    <div className="w-full space-y-6 pb-20 pt-6 px-4 sm:px-6 animate-in fade-in duration-500">
      {/* 🚀 Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-950 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-zinc-900">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard/website/contact/inquiries")}
            className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              Inquiry Details
            </h1>
            <p className="text-sm font-bold text-slate-400 dark:text-zinc-500 mt-1 uppercase tracking-wider">
              Submitted on {new Date(inquiry.createdAt).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge
            className={`px-3 py-1 text-xs font-bold uppercase rounded-lg border-none shadow-none ${
              inquiry.status === "unread"
                ? "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400"
                : "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-450"
            }`}
          >
            {inquiry.status === "unread" ? (
              <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> Unread</span>
            ) : (
              <span className="flex items-center gap-1.5"><MailOpen className="h-3 w-3" /> Read</span>
            )}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-6">
          <Card className="border-slate-200/60 dark:border-zinc-800 bg-card text-card-foreground shadow-sm rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Submitted Responses</h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                Form Data
              </p>
            </div>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-zinc-800">
                {Object.entries(responses).map(([key, value]) => (
                  <div key={key} className="p-6 flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 hover:bg-slate-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                    <div className="sm:w-1/3 shrink-0">
                      <span className="text-xs font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </span>
                    </div>
                    <div className="sm:w-2/3">
                      {Array.isArray(value) ? (
                        <div className="flex flex-wrap gap-2">
                          {value.map((v, i) => (
                            <Badge key={i} variant="secondary" className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 border-none rounded-lg">
                              {String(v)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm font-medium text-slate-800 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">
                          {String(value) || "-"}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
                
                {Object.keys(responses).length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-slate-400 italic text-sm">No responses found for this inquiry.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card className="border-slate-200/60 dark:border-zinc-800 bg-card text-card-foreground shadow-sm rounded-2xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/40">
              <h3 className="font-bold text-slate-800 dark:text-slate-200">Metadata</h3>
              <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                System Information
              </p>
            </div>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-50 dark:bg-blue-950/40 p-2.5 rounded-xl">
                  <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Date & Time</p>
                  <p className="text-sm font-bold text-slate-800 dark:text-zinc-300 mt-0.5">
                    {new Date(inquiry.createdAt).toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl">
                  <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="w-full">
                  <p className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Inquiry ID</p>
                  <p className="text-sm font-mono font-medium text-slate-800 dark:text-zinc-300 mt-0.5 bg-slate-50 dark:bg-zinc-950 px-2 py-1 rounded-md border border-slate-100 dark:border-zinc-800 break-all">
                    {inquiry._id}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ViewInquiryDetails;
