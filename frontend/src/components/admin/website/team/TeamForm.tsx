"use client";

import { useState, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTeamMember, updateTeamMember } from "@/http/api";
import type { TeamApi } from "@/http/api";
import { toast } from "sonner";
import ImageCropperDialog from "./ImageCropperDialog";

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
  User,
  Briefcase,
  Image as ImageIcon,
  Plus,
  Trash2,
  Globe,
  Settings,
  Lightbulb,
  Link as LinkIcon,
  X,
  Linkedin,
  Twitter,
  Instagram,
  Facebook,
  Calendar,
  Clock,
  Eye,
  Info
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
type TeamFormValues = {
  name: string;
  designation: string;
  sectorsCovered: string[];
  socialMedia: {
    platform: "linkedin" | "twitter" | "instagram" | "facebook";
    url: string;
  }[];
  image?: FileList;
};

type Props = {
  onSuccess?: () => void;
  initialData?: TeamApi;
};

const SOCIAL_PLATFORMS = [
  { id: "linkedin", label: "LinkedIn", icon: Linkedin, color: "text-blue-600" },
  { id: "twitter", label: "Twitter", icon: Twitter, color: "text-sky-500" },
  { id: "instagram", label: "Instagram", icon: Instagram, color: "text-pink-600" },
  { id: "facebook", label: "Facebook", icon: Facebook, color: "text-blue-700" },
];

/* ---------------- Component ---------------- */
export default function TeamForm({ onSuccess, initialData }: Props) {
  const [preview, setPreview] = useState<string | null>(
    initialData?.image ? `http://localhost:3000${initialData.image}` : null
  );
  const [sectorInput, setSectorInput] = useState("");
  const queryClient = useQueryClient();

  // ── Cropper state ────────────────────────────────────
  const [cropperSrc, setCropperSrc] = useState<string | null>(null);
  const [cropperFileName, setCropperFileName] = useState("photo.jpg");
  const [cropperMime, setCropperMime] = useState("image/jpeg");
  const [showCropper, setShowCropper] = useState(false);
  const [croppedFile, setCroppedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TeamFormValues>({
    mode: "onChange",
    defaultValues: {
      name: initialData?.name || "",
      designation: initialData?.designation || "",
      sectorsCovered: initialData?.sectorsCovered || [],
      socialMedia: initialData?.socialMedia || [],
    },
  });

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { isSubmitting, isValid },
  } = form;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "socialMedia",
  });

  const mutation = useMutation({
    mutationFn: (formData: FormData) => {
      if (initialData) {
        return updateTeamMember(initialData._id, formData);
      }
      return createTeamMember(formData);
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      if (initialData) {
        queryClient.invalidateQueries({ queryKey: ["team-member", initialData._id] });
      }
      toast.success(data.message || `Team member ${initialData ? "updated" : "created"} successfully!`);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Something went wrong.");
    },
  });

  const onSubmit = (values: TeamFormValues) => {
    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("designation", values.designation);
    formData.append("sectorsCovered", JSON.stringify(values.sectorsCovered));
    formData.append("socialMedia", JSON.stringify(values.socialMedia));

    // Prefer the cropped file; fall back to raw FileList selection
    if (croppedFile) {
      formData.append("image", croppedFile);
    } else if (values.image && values.image.length > 0) {
      formData.append("image", values.image[0]);
    }

    mutation.mutate(formData);
  };

  const sectorsCovered = watch("sectorsCovered");

  // Open cropper from a raw File object
  const openCropperForFile = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setCropperSrc(objectUrl);
    setCropperFileName(file.name);
    setCropperMime(file.type || "image/jpeg");
    setShowCropper(true);
  };

  // Called when the user confirms a crop
  const handleCropDone = (file: File, previewUrl: string) => {
    setCroppedFile(file);
    setPreview(previewUrl);
    setShowCropper(false);
    if (cropperSrc) URL.revokeObjectURL(cropperSrc);
    setCropperSrc(null);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    if (cropperSrc) URL.revokeObjectURL(cropperSrc);
    setCropperSrc(null);
    // Reset file input so user can re-select the same file if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addSector = () => {
    if (sectorInput.trim()) {
      const currentSectors = getValues("sectorsCovered");
      if (!currentSectors.includes(sectorInput.trim())) {
        setValue("sectorsCovered", [...currentSectors, sectorInput.trim()], { shouldDirty: true });
      }
      setSectorInput("");
    }
  };

  const removeSector = (sector: string) => {
    const currentSectors = getValues("sectorsCovered");
    setValue("sectorsCovered", currentSectors.filter(s => s !== sector), { shouldDirty: true });
  };

  const isPublished = initialData?.isActive !== false;

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">

          {/* 📝 Left Side: Form Details */}
          <div className="space-y-6">
            <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-zinc-800 py-5 px-6 bg-slate-50/30 dark:bg-zinc-900/40">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-950/40 p-2 rounded-lg">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200">Member Profile</h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">Add or update team member information</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-8">
                {/* Name & Designation Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    control={control}
                    name="name"
                    rules={{ required: "Name is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                          Full Name <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John Doe"
                            className="h-10 bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="designation"
                    rules={{ required: "Designation is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                          Designation <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Principal Associate"
                            className="h-10 bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Sectors Covered */}
                <div className="space-y-4">
                  <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                    Sectors Covered
                  </FormLabel>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Infrastructure, Finance"
                      value={sectorInput}
                      onChange={(e) => setSectorInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          addSector();
                        }
                      }}
                      className="h-10 bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-all"
                    />
                    <Button type="button" onClick={addSector} variant="outline" className="h-10 px-4 border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sectorsCovered.map((sector, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1 bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-350 border-slate-200 dark:border-zinc-800 flex items-center gap-2 rounded-full">
                        {sector}
                        <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => removeSector(sector)} />
                      </Badge>
                    ))}
                    {sectorsCovered.length === 0 && (
                      <p className="text-[10px] text-slate-400 dark:text-zinc-500 italic">No sectors added yet</p>
                    )}
                  </div>
                </div>

                {/* Social Media Links */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider">
                      Social Media Profiles
                    </FormLabel>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => append({ platform: "linkedin", url: "" })}
                      className="h-8 text-[10px] font-bold text-blue-600 dark:text-blue-400 gap-1 hover:bg-blue-50 dark:hover:bg-zinc-800/50"
                    >
                      <Plus className="h-3 w-3" /> Add Profile
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {fields.map((field, index) => (
                      <div key={field.id} className="flex gap-3 items-start animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="w-[140px] shrink-0">
                          <FormField
                            control={control}
                            name={`socialMedia.${index}.platform`}
                            render={({ field }) => (
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <SelectTrigger className="h-10 bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                  {SOCIAL_PLATFORMS.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                      <div className="flex items-center gap-2">
                                        <p.icon className={`h-3.5 w-3.5 ${p.color}`} />
                                        <span className="text-xs">{p.label}</span>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        </div>
                        <div className="flex-1">
                          <FormField
                            control={control}
                            name={`socialMedia.${index}.url`}
                            render={({ field }) => (
                              <div className="relative">
                                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                                <Input
                                  placeholder="Profile URL"
                                  className="h-10 pl-9 bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 transition-all text-xs"
                                  {...field}
                                />
                              </div>
                            )}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          className="h-10 w-10 text-slate-400 dark:text-zinc-550 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {fields.length === 0 && (
                      <div className="py-8 bg-slate-50/50 dark:bg-zinc-900/30 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-slate-400 dark:text-zinc-550">
                        <Globe className="h-6 w-6 mb-2 opacity-50" />
                        <p className="text-[10px] font-medium">No social profiles added</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tip */}
                <div className="flex items-center gap-2 text-blue-500 dark:text-blue-400">
                  <Lightbulb className="h-4 w-4 shrink-0" />
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tip: Adding social profiles helps in building credibility and professional networking.</p>
                </div>

                {/* Footer Metadata */}
                {initialData && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-slate-100 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-lg">
                        <Calendar className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Created At</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{initialData ? new Date(initialData.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="bg-purple-50 dark:bg-purple-950/30 p-2 rounded-lg">
                        <Clock className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">Last Updated</p>
                        <p className="text-xs font-bold text-slate-700 dark:text-slate-300">{initialData ? new Date(initialData.updatedAt || initialData.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* 🖼️ Right Side: Sidebar */}
          <div className="space-y-6">
            {/* Member Image Card */}
            <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-zinc-800 py-4 px-6">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-950/40 p-1.5 rounded-md">
                    <ImageIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Profile Photo</h2>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium leading-none mt-1">Professional headshot recommended</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div
                  className="aspect-square bg-slate-50 dark:bg-zinc-950 rounded-lg overflow-hidden border-2 border-dashed border-slate-200 dark:border-zinc-800 relative group cursor-pointer hover:border-blue-400 dark:hover:border-blue-400/80 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 transition-all"
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('border-blue-500', 'bg-blue-50/50'); }}
                  onDragLeave={(e) => { e.preventDefault(); e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/50'); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/50');
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith("image/")) {
                      openCropperForFile(file);
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
                        <span className="text-white text-[10px] font-bold uppercase tracking-wider">Replace &amp; Crop</span>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-slate-400 dark:text-zinc-550 p-6 text-center">
                      <div className="bg-slate-100 dark:bg-zinc-900 p-3 rounded-full group-hover:bg-blue-100 dark:group-hover:bg-blue-950/50 group-hover:text-blue-500 transition-colors">
                        <Upload className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-650 dark:text-zinc-300">Click or drag photo</p>
                        <p className="text-[10px] mt-1">You can crop the image after selecting</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action buttons row */}
                {preview && (
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 text-[10px] font-bold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-zinc-800 gap-1.5 hover:bg-blue-50 dark:hover:bg-zinc-800/80"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Replace
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="flex-1 h-8 text-[10px] font-bold text-red-500 gap-1.5 hover:bg-red-50 dark:hover:bg-red-950/30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreview(null);
                        setCroppedFile(null);
                        form.setValue("image", undefined as any, { shouldValidate: true, shouldDirty: true });
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  id="memberImageUpload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) openCropperForFile(file);
                    // Reset so the same file can be re-selected
                    e.target.value = "";
                  }}
                />

                <Alert className="bg-amber-50/60 dark:bg-amber-950/10 border-amber-100 dark:border-amber-900/30 p-3 mt-4">
                  <Info className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <AlertDescription className="text-[10px] font-medium text-amber-700 dark:text-amber-400 leading-normal">
                    After selecting a photo, a crop tool will open so you can choose the best frame. The background will then be automatically removed.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Visibility Card */}
            <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-zinc-800 py-4 px-6 flex flex-row items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-950/40 p-1.5 rounded-md">
                  <Eye className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Status</h2>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 dark:text-zinc-350">Visibility</span>
                  <Badge className={`px-2 py-0.5 rounded-md font-bold text-[9px] uppercase tracking-wider ${isPublished ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50/80 dark:bg-emerald-500/10 dark:text-emerald-400 hover:dark:bg-emerald-500/20" : "bg-amber-50 text-amber-700 hover:bg-amber-50/80 dark:bg-amber-500/10 dark:text-amber-400 hover:dark:bg-amber-500/20"}`}>
                    {isPublished ? "ACTIVE" : "INACTIVE"}
                  </Badge>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-zinc-500 leading-relaxed">
                  Active members are visible on the public website. Status can be toggled from the list view.
                </p>
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
              initialData ? "Update Profile" : "Add Member"
            )}
          </Button>
        </div>
      </form>

      {/* ── Image Cropper Dialog ───────────────────────── */}
      {cropperSrc && (
        <ImageCropperDialog
          open={showCropper}
          imageSrc={cropperSrc}
          fileName={cropperFileName}
          mimeType={cropperMime}
          defaultAspect={4 / 5}
          onCropDone={handleCropDone}
          onCancel={handleCropCancel}
        />
      )}
    </Form>
  );
}
