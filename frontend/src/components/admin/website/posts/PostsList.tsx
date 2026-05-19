import { DataTable } from "@/components/data-table/data-table";
import { postColumns } from "@/components/data-table/postColumns";
import type { PostApi } from "@/http/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { fetchPosts, deletePost, togglePostStatus } from "@/http/api";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";

type ActionType = "view" | "edit" | "delete" | "restore" | "toggleStatus";

interface PostsListProps {}

const PostsList = ({}: PostsListProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [actionType, setActionType] = useState<ActionType | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostApi | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["posts"],
    queryFn: () => fetchPosts(),
  });

  const filteredData = useMemo(() => {
    const posts = data?.posts || [];
    if (statusFilter === "all") return posts;
    return posts.filter((post: PostApi) => post.status?.toLowerCase() === statusFilter);
  }, [data, statusFilter]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success(`Post deleted successfully.`);
      setOpen(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete post.");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => togglePostStatus(id, status),
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success(data.message || "Status updated successfully.");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update status.");
    },
  });

  const handleRowAction = (type: ActionType, post: PostApi) => {
    setSelectedPost(post);
    setActionType(type);

    if (type === "view") {
      navigate(`/dashboard/website/posts/${post._id}`);
      return;
    }

    if (type === "edit") {
      navigate(`/dashboard/website/posts/edit/${post._id}`);
      return;
    }

    if (type === "delete") {
      setOpen(true);
      return;
    }

    if (type === "toggleStatus") {
      const newStatus = post.status?.toLowerCase() === "published" ? "unpublished" : "published";
      toggleMutation.mutate({ id: post._id, status: newStatus });
      return;
    }
  };

  const handleConfirmAction = () => {
    if (actionType === "delete" && selectedPost) {
      deleteMutation.mutate(selectedPost._id);
    }
  };

  return (
    <>
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="animate-spin h-8 w-8 text-primary" />
        </div>
      ) : isError ? (
        <div className="text-red-500 p-4 border border-red-200 rounded bg-red-50">
          Failed to load posts. Please try again later.
        </div>
      ) : (
        <DataTable
          columns={postColumns(handleRowAction)}
          data={filteredData}
          enableSearch={true}
          enablePagination={true}
          searchPlaceholder="Search Posts..."
          extraFilters={
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] bg-card border-border rounded-xl">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="unpublished">Unpublished</SelectItem>
              </SelectContent>
            </Select>
          }
        />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Delete Post
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <b>{selectedPost?.title}</b>? This action cannot be undone and the post will be removed from the website.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="sm:justify-end gap-2 mt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmAction}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Confirm Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PostsList;
