"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost, updatePost } from "@/http/api";
import type { PostApi } from "@/http/api";
import { toast } from "sonner";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Upload,
  Loader2,
  Link as LinkIcon,
  Globe,
  Image as ImageIcon,
  Info,
  Download,
  Trash2,
  ChevronDown,
  Eye,
  Calendar,
  User,
  Clock,
  Settings,
  Lightbulb
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Alert, AlertDescription } from "@/components/ui/alert";

/* ---------------- Types ---------------- */
type PostFormValues = {
  title: string;
  subTitle?: string;
  description?: string;
  link: string;
  platform: "linkedin" | "instagram" | "facebook" | "twitter" | "other";
  image?: FileList;
};

type Props = {
  onSuccess?: () => void;
  initialData?: PostApi;
};

/* ---------------- Component ---------------- */
export default function PostForm({ onSuccess, initialData }: Props) {
  const [preview, setPreview] = useState<string | null>(
    initialData?.image ? `http://localhost:3000${initialData.image}` : null
  );
  const queryClient = useQueryClient();

  const form = useForm<PostFormValues>({
    mode: "onChange",
    defaultValues: {
      title: initialData?.title || "",
      subTitle: initialData?.subTitle || "",
      description: initialData?.description || "",
      link: initialData?.link || "",
      platform: initialData?.platform || "linkedin",
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    formState: { isSubmitting, isValid },
  } = form;

  const mutation = useMutation({
    mutationFn: (formData: FormData) => {
      if (initialData) {
        return updatePost(initialData._id, formData);
      }
      return createPost(formData);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      if (initialData) {
        queryClient.invalidateQueries({ queryKey: ["post", initialData._id] });
      }
      toast.success(data.message || `Post ${initialData ? "updated" : "created"} successfully!`);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    },
  });

  const onSubmit = (values: PostFormValues) => {
    const formData = new FormData();
    formData.append("title", values.title);
    if (values.subTitle) formData.append("subTitle", values.subTitle);
    if (values.description) formData.append("description", values.description);
    formData.append("link", values.link);
    formData.append("platform", values.platform);

    if (values.image && values.image.length > 0) {
      formData.append("image", values.image[0]);
    }

    mutation.mutate(formData);
  };

  const titleValue = watch("title") || "";
  const descriptionValue = watch("description") || "";
  const image = watch("image");

  useEffect(() => {
    if (image && image.length > 0) {
      const url = URL.createObjectURL(image[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  const isPublished = initialData?.status?.toLowerCase() === "published";

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">

          {/* 📝 Left Side: Form Details */}
          <div className="space-y-6">
            <Card className="rounded-xl border-slate-200/60 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-card text-card-foreground">
              <CardHeader className="border-b border-slate-100 dark:border-zinc-800 py-5 px-6 bg-slate-50/30 dark:bg-zinc-900/40">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-950/40 p-2 rounded-lg">
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200">Post Details</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Share updates and news across social media platforms</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                {/* Title & Subtitle Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={control}
                    name="title"
                    rules={{ required: "Title is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                          Post Title <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="Enter post title"
                              className="h-10 bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-all pr-16"
                              {...field}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                              {titleValue.length} / 200
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="subTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider">
                          Subtitle (Optional)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="A brief hook"
                              className="h-10 bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-all pr-16"
                              {...field}
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                              {field.value?.length || 0} / 200
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Platform & Link Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={control}
                    name="platform"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                          Platform <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="w-full h-10 bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-all">
                              <SelectValue placeholder="Select platform" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent position="popper">
                            <SelectItem value="linkedin">LinkedIn</SelectItem>
                            <SelectItem value="instagram">Instagram</SelectItem>
                            <SelectItem value="facebook">Facebook</SelectItem>
                            <SelectItem value="twitter">Twitter</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="link"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider">
                          External Link (Optional)
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-zinc-500" />
                            <Input
                              placeholder="https://example.com"
                              className="h-10 pl-10 bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description with Character Count */}
                <FormField
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                        Description <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <div className="relative border border-slate-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-white dark:bg-zinc-950">
                          {/* Mock Toolbar */}
                          <div className="flex items-center gap-4 px-4 py-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/50">
                            <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
                              <span className="text-xs font-bold mr-2">Normal</span>
                              <ChevronDown className="h-3 w-3" />
                            </div>
                            <Separator orientation="vertical" className="h-4 bg-slate-200 dark:bg-zinc-800" />
                            <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
                              <span className="font-bold text-xs">B</span>
                              <span className="italic text-xs">I</span>
                              <span className="underline text-xs">U</span>
                              <span className="line-through text-xs">S</span>
                            </div>
                            <Separator orientation="vertical" className="h-4 bg-slate-200 dark:bg-zinc-800" />
                            <div className="flex items-center gap-3 text-slate-400 dark:text-zinc-600">
                              <ImageIcon className="h-4 w-4" />
                              <LinkIcon className="h-4 w-4" />
                            </div>
                          </div>
                          <Textarea
                            placeholder="Start writing..."
                            className="min-h-[160px] border-none focus-visible:ring-0 resize-none px-4 py-4 dark:bg-zinc-950"
                            {...field}
                          />
                          <div className="px-4 py-2 bg-slate-50/30 dark:bg-zinc-900/40 border-t border-slate-50 dark:border-zinc-900 flex justify-end">
                            <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500">
                              {descriptionValue.length} / 2,200
                            </span>
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
                  <Lightbulb className="h-4 w-4 shrink-0" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tip: A clear and engaging description helps your post perform better.</p>
                </div>

                {/* Advanced Settings Accordion */}
                <Accordion type="single" collapsible className="w-full border-t border-slate-100 dark:border-zinc-800 pt-4">
                  <AccordionItem value="advanced" className="border-none">
                    <AccordionTrigger className="hover:no-underline py-4 px-0">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800">
                          <Settings className="h-4 w-4 text-slate-600 dark:text-zinc-400" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">Advanced Settings</p>
                          <p className="text-[10px] font-medium text-slate-400 dark:text-zinc-500">Schedule, tags, UTM parameters and more</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pt-4 text-slate-400 dark:text-zinc-500 italic text-center py-10 bg-slate-50/50 dark:bg-zinc-900/30 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800">
                      Advanced settings coming soon
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {/* Footer Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg">
                      <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Created At</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{initialData ? new Date(initialData.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }) : '-'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-slate-50 dark:bg-zinc-800 p-2 rounded-lg">
                      <User className="h-4 w-4 text-slate-500 dark:text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Created By</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{initialData?.user?.name || 'Meet'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-purple-50 dark:bg-purple-950/30 p-2 rounded-lg">
                      <Clock className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Last Updated</p>
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{initialData ? new Date(initialData.updatedAt || initialData.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }) : '-'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 🖼️ Right Side: Sidebar */}
          <div className="space-y-6">
            {/* Post Image Card */}
            <Card className="rounded-xl border-slate-200/60 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-card text-card-foreground">
              <CardHeader className="border-b border-slate-100 dark:border-zinc-800 py-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-950/40 p-1.5 rounded-md">
                    <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Post Image</h2>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium leading-none mt-1">Click or drag to update</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div
                  className="aspect-[4/3] bg-slate-50 dark:bg-zinc-950 rounded-lg overflow-hidden border-2 border-dashed border-slate-200 dark:border-zinc-800 relative group cursor-pointer hover:border-blue-400 dark:hover:border-blue-400/80 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-all"
                  onClick={() => document.getElementById("postImageUpload")?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-50/50'); }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/50'); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/50');
                    const files = e.dataTransfer.files;
                    if (files && files.length > 0) {
                      form.setValue("image", files, { shouldValidate: true, shouldDirty: true });
                    }
                  }}
                >
                  {preview ? (
                    <>
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                           <Upload className="h-5 w-5 text-white" />
                        </div>
                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">Replace Image</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-zinc-550 p-6 text-center">
                      <div className="bg-slate-100 dark:bg-zinc-900 p-3 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-950/50 group-hover:text-blue-500 transition-colors">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-650 dark:text-zinc-300">Click or drag image</p>
                        <p className="text-[10px] mt-1">Supports JPG, PNG, WEBP</p>
                      </div>
                    </div>
                  )}
                </div>

                {preview && (
                  <div className="flex items-center justify-center">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-[10px] font-bold text-red-500 gap-2 hover:bg-red-50 dark:hover:bg-red-950/30 w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        form.setValue("image", undefined as any, { shouldValidate: true, shouldDirty: true });
                        const input = document.getElementById("postImageUpload") as HTMLInputElement;
                        if (input) input.value = "";
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove current image
                    </Button>
                  </div>
                )}
                <input
                  id="postImageUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const files = e.target.files;
                    if (files && files.length > 0) {
                      form.setValue("image", files, { shouldValidate: true, shouldDirty: true });
                    }
                  }}
                />
              </CardContent>
            </Card>

            {/* Visibility Card */}
            <Card className="rounded-xl border-slate-200/60 dark:border-zinc-800 shadow-sm overflow-hidden bg-white dark:bg-card text-card-foreground">
              <CardHeader className="py-4 px-6 border-b border-slate-100 dark:border-zinc-800 flex flex-row items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-950/40 p-1.5 rounded-md">
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Visibility</h2>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {!initialData && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    By default, new posts are set to <span className="text-emerald-500 font-bold">Published</span>.
                    You can change the status from the list view once created.
                  </p>
                )}

                {initialData && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-350">Current Status</span>
                      <Badge className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 dark:bg-emerald-500/10 dark:text-emerald-400 hover:dark:bg-emerald-500/20`}>
                        {initialData?.status?.toUpperCase() || "PUBLISHED"}
                      </Badge>
                    </div>

                    <Alert className="bg-blue-50/50 dark:bg-blue-950/10 border-blue-100 dark:border-blue-900/30">
                      <Info className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      <AlertDescription className="text-[10px] font-semibold text-blue-650 dark:text-blue-450">
                        Changing visibility here is not allowed. <br />
                        Please change the status from the post list view.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Form Actions Footer */}
        <div className="flex items-center justify-end gap-4 pt-6 mt-10">
          <Button
            type="button"
            variant="outline"
            className="px-8 h-10 rounded-lg font-bold text-slate-600 dark:text-zinc-300 border-slate-200 dark:border-zinc-800"
            onClick={() => onSuccess?.()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={!isValid || isSubmitting || mutation.isPending}
            className="px-8 h-10 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
          >
            {mutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              initialData ? "Update Post" : "Create Post"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
