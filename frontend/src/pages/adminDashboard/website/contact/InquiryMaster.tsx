import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchInquiries, updateInquiryStatus, deleteInquiry } from "@/http/api";
import type { InquiryApi } from "@/http/api";
import { Loader2, Mail } from "lucide-react";
import { toast } from "sonner";
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
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import WebsiteModuleHeader from "@/components/admin/website/WebsiteModuleHeader";
import { DataTable } from "@/components/data-table/data-table";
import { getInquiryColumns } from "@/components/data-table/inquiryColumns";

const InquiryMaster = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("list");

  const [inquiryToDelete, setInquiryToDelete] = useState<InquiryApi | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: response, isLoading } = useQuery({
    queryKey: ["inquiries"],
    queryFn: () => fetchInquiries(),
  });

  const inquiries = response?.inquiries || [];

  const filteredInquiries = useMemo(() => {
    if (statusFilter === "all") return inquiries;
    return inquiries.filter((inquiry: InquiryApi) => inquiry.status === statusFilter);
  }, [inquiries, statusFilter]);

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: "read" | "unread" }) =>
      updateInquiryStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toast.success("Inquiry status updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInquiry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inquiries"] });
      toast.success("Inquiry deleted successfully");
      setIsDeleteDialogOpen(false);
      setInquiryToDelete(null);
    },
  });

  const onAction = (type: "view" | "edit" | "delete" | "toggleStatus", field: InquiryApi) => {
    switch (type) {
      case "view":
        navigate(`/dashboard/website/contact/inquiries/${field._id}`);
        break;
      case "delete":
        setInquiryToDelete(field);
        setIsDeleteDialogOpen(true);
        break;
      case "toggleStatus":
        toggleStatusMutation.mutate({
          id: field._id,
          status: field.status === "unread" ? "read" : "unread",
        });
        break;
    }
  };

  const columns = getInquiryColumns(onAction);

  const tabs = [
    { value: "list", label: "All Inquiries", icon: Mail },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 pt-6 px-4 sm:px-6 animate-in fade-in duration-500">
      <Tabs value={tab} onValueChange={setTab}>
        <WebsiteModuleHeader tabs={tabs} />

        <div className="space-y-6">
          <TabsContent value="list" className="mt-0 focus-visible:outline-none">
            <DataTable
              columns={columns}
              data={filteredInquiries}
              enableSearch={true}
              searchPlaceholder="Search inquiries..."
              enablePagination={true}
              extraFilters={
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px] bg-card border-border rounded-xl">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>
              }
            />
          </TabsContent>
        </div>
      </Tabs>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl border-none shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900">Delete Inquiry?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500">
              Are you sure you want to delete this inquiry? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => inquiryToDelete && deleteMutation.mutate(inquiryToDelete._id)}
              className="bg-rose-600 text-white hover:bg-rose-700 rounded-lg"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default InquiryMaster;
