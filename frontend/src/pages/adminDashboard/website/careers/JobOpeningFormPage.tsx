import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import {
  createCareer,
  updateCareer,
  fetchCareerById,
  type CareerApi,
} from "@/http/api";
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
import {
  Briefcase,
  Loader2,
  ArrowLeft,
  Plus,
  X,
  Building,
  MapPin,
  Clock,
  GraduationCap,
  FileText,
  Bookmark,
  Award,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

type JobFormValues = {
  title: string;
  department: string;
  location: string;
  jobType: "Full-time" | "Part-time" | "Contract" | "Internship";
  experience: string;
  education: string;
  description: string;
  requirements: string[];
  benefits: string[];
};

export default function JobOpeningFormPage() {
  const navigate = useNavigate();
  const { careerId } = useParams();
  const queryClient = useQueryClient();
  const isEditMode = !!careerId;

  const [reqInput, setReqInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");

  const form = useForm<JobFormValues>({
    mode: "onChange",
    defaultValues: {
      title: "",
      department: "",
      location: "",
      jobType: "Full-time",
      experience: "",
      education: "",
      description: "",
      requirements: [],
      benefits: [],
    },
  });

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { isSubmitting, isValid },
  } = form;

  // Fetch job openings details (only in Edit mode)
  const { data: jobDetails, isLoading: isJobLoading } = useQuery<CareerApi>({
    queryKey: ["job-detail", careerId],
    queryFn: () => fetchCareerById(careerId!),
    enabled: isEditMode,
  });

  // Populate form with existing details
  useEffect(() => {
    if (jobDetails) {
      reset({
        title: jobDetails.title,
        department: jobDetails.department,
        location: jobDetails.location,
        jobType: jobDetails.jobType,
        experience: jobDetails.experience,
        education: jobDetails.education || "",
        description: jobDetails.description,
        requirements: jobDetails.requirements || [],
        benefits: jobDetails.benefits || [],
      });
    }
  }, [jobDetails, reset]);

  const mutation = useMutation({
    mutationFn: (values: JobFormValues) => {
      if (isEditMode && careerId) {
        return updateCareer(careerId, values);
      }
      return createCareer(values);
    },
    onSuccess: (res: any) => {
      queryClient.invalidateQueries({ queryKey: ["job-openings"] });
      if (isEditMode) {
        queryClient.invalidateQueries({ queryKey: ["job-detail", careerId] });
      }
      toast.success(
        res.message || `Job opening ${isEditMode ? "updated" : "created"} successfully!`
      );
      navigate("/dashboard/website/careers/jobs");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Something went wrong.");
    },
  });

  const onSubmit = (values: JobFormValues) => {
    mutation.mutate(values);
  };

  const watchRequirements = watch("requirements");
  const watchBenefits = watch("benefits");

  const addRequirement = () => {
    if (reqInput.trim()) {
      const current = getValues("requirements");
      if (!current.includes(reqInput.trim())) {
        setValue("requirements", [...current, reqInput.trim()], { shouldDirty: true });
      }
      setReqInput("");
    }
  };

  const removeRequirement = (item: string) => {
    const current = getValues("requirements");
    setValue(
      "requirements",
      current.filter((i) => i !== item),
      { shouldDirty: true }
    );
  };

  const addBenefit = () => {
    if (benefitInput.trim()) {
      const current = getValues("benefits");
      if (!current.includes(benefitInput.trim())) {
        setValue("benefits", [...current, benefitInput.trim()], { shouldDirty: true });
      }
      setBenefitInput("");
    }
  };

  const removeBenefit = (item: string) => {
    const current = getValues("benefits");
    setValue(
      "benefits",
      current.filter((i) => i !== item),
      { shouldDirty: true }
    );
  };

  if (isEditMode && isJobLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50/50 dark:bg-zinc-950/30">
        <Loader2 className="w-8 h-8 text-[#00338D] animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8 bg-slate-50/50 dark:bg-zinc-950/30 min-h-screen">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={() => navigate("/dashboard/website/careers/jobs")}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-[#00338D] dark:text-[#4d7cc7] uppercase tracking-widest">
              Careers Management
            </span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            {isEditMode ? "Edit Job Opening" : "Create Job Opening"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Define role descriptions, requirements, and benefits for candidates.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 pb-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 📝 Form Details */}
            <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="border-b border-slate-100 dark:border-zinc-800 py-5 px-6 bg-slate-50/30 dark:bg-zinc-900/40">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 dark:bg-blue-950/40 p-2 rounded-lg">
                    <Briefcase className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-slate-200">
                      Role Information
                    </h2>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Provide primary information about the role
                    </p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-6">
                {/* Job Title & Department */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="title"
                    rules={{ required: "Job title is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                          Job Title <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center bg-slate-50/50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:border-[#00338D]/50 focus-within:ring-1 focus-within:ring-[#00338D]/25 dark:focus-within:border-[#4d7cc7]/50 dark:focus-within:ring-[#4d7cc7]/25 transition-all">
                            <input
                              placeholder="e.g. Senior Frontend Developer"
                              className="w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 h-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="department"
                    rules={{ required: "Department is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                          Department <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 max-w-full bg-slate-50/50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:border-[#00338D]/50 focus-within:ring-1 focus-within:ring-[#00338D]/25 dark:focus-within:border-[#4d7cc7]/50 dark:focus-within:ring-[#4d7cc7]/25 transition-all">
                            <Building className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                              placeholder="e.g. Engineering"
                              className="w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 h-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Location & Job Type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="location"
                    rules={{ required: "Location is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                          Location <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 max-w-full bg-slate-50/50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:border-[#00338D]/50 focus-within:ring-1 focus-within:ring-[#00338D]/25 dark:focus-within:border-[#4d7cc7]/50 dark:focus-within:ring-[#4d7cc7]/25 transition-all">
                            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                              placeholder="e.g. Mumbai (Remote)"
                              className="w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 h-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="jobType"
                    rules={{ required: "Job type is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                          Job Type <span className="text-red-500">*</span>
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full h-10 bg-slate-50/50 dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:bg-white dark:focus:bg-zinc-900 focus:border-[#00338D]/50 focus:ring-1 focus:ring-[#00338D]/25 dark:focus:border-[#4d7cc7]/50 dark:focus:ring-[#4d7cc7]/25 transition-all">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-border">
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Internship">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Experience & Education */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={control}
                    name="experience"
                    rules={{ required: "Experience level is required" }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                          Experience <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 max-w-full bg-slate-50/50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:border-[#00338D]/50 focus-within:ring-1 focus-within:ring-[#00338D]/25 dark:focus-within:border-[#4d7cc7]/50 dark:focus-within:ring-[#4d7cc7]/25 transition-all">
                            <GraduationCap className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                              placeholder="e.g. 3-5 Years"
                              className="w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 h-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={control}
                    name="education"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                          Education / Qualification
                        </FormLabel>
                        <FormControl>
                          <div className="flex items-center gap-2 max-w-full bg-slate-50/50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:border-[#00338D]/50 focus-within:ring-1 focus-within:ring-[#00338D]/25 dark:focus-within:border-[#4d7cc7]/50 dark:focus-within:ring-[#4d7cc7]/25 transition-all">
                            <Award className="w-4 h-4 text-slate-400 shrink-0" />
                            <input
                              placeholder="e.g. CA, CFA Level 1 or 2"
                              className="w-full bg-transparent border-none outline-none text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 h-10"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={control}
                  name="description"
                  rules={{ required: "Job description is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-700 dark:text-zinc-400 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
                        Job Description <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <textarea
                          placeholder="Provide details about the role, day-to-day responsibilities, and team structure..."
                          className="w-full min-h-[160px] p-4 bg-slate-50/50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg outline-none text-sm text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 leading-relaxed focus:bg-white dark:focus:bg-zinc-900 focus:border-[#00338D]/50 focus:ring-1 focus:ring-[#00338D]/25 dark:focus:border-[#4d7cc7]/50 dark:focus:ring-[#4d7cc7]/25 transition-all resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Requirements & Benefits Tag Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Requirements */}
              <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl">
                <CardHeader className="border-b border-slate-100 dark:border-zinc-800 py-4 px-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                    <FileText className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                    Job Requirements
                  </h3>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center bg-slate-50/50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:border-[#00338D]/50 focus-within:ring-1 focus-within:ring-[#00338D]/25 dark:focus-within:border-[#4d7cc7]/50 dark:focus-within:ring-[#4d7cc7]/25 transition-all">
                      <input
                        placeholder="Add required skill (e.g. React.js)"
                        value={reqInput}
                        onChange={(e) => setReqInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addRequirement();
                          }
                        }}
                        className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 h-9"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={addRequirement}
                      size="icon"
                      className="h-9 w-9 bg-[#00338D] text-white hover:bg-[#00338D]/90 rounded-xl cursor-pointer shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {watchRequirements.length === 0 ? (
                      <span className="text-xs text-slate-400 dark:text-zinc-500 italic">
                        No requirements added yet.
                      </span>
                    ) : (
                      watchRequirements.map((req, index) => (
                        <Badge
                          key={index}
                          className="bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-zinc-300 font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-zinc-750"
                        >
                          <span>{req}</span>
                          <button
                            type="button"
                            onClick={() => removeRequirement(req)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Benefits */}
              <Card className="bg-card text-card-foreground border-slate-200/60 dark:border-zinc-800 shadow-sm rounded-xl">
                <CardHeader className="border-b border-slate-100 dark:border-zinc-800 py-4 px-6">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                    <Bookmark className="h-4.5 w-4.5 text-blue-600 dark:text-blue-400" />
                    Perks & Benefits
                  </h3>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-2">
                    <div className="flex-1 flex items-center bg-slate-50/50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 rounded-lg px-3 focus-within:bg-white dark:focus-within:bg-zinc-900 focus-within:border-[#00338D]/50 focus-within:ring-1 focus-within:ring-[#00338D]/25 dark:focus-within:border-[#4d7cc7]/50 dark:focus-within:ring-[#4d7cc7]/25 transition-all">
                      <input
                        placeholder="Add benefit (e.g. Health Insurance)"
                        value={benefitInput}
                        onChange={(e) => setBenefitInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addBenefit();
                          }
                        }}
                        className="w-full bg-transparent border-none outline-none text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 dark:placeholder-zinc-500 h-9"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={addBenefit}
                      size="icon"
                      className="h-9 w-9 bg-[#00338D] text-white hover:bg-[#00338D]/90 rounded-xl cursor-pointer shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {watchBenefits.length === 0 ? (
                      <span className="text-xs text-slate-400 dark:text-zinc-500 italic">
                        No benefits added yet.
                      </span>
                    ) : (
                      watchBenefits.map((benefit, index) => (
                        <Badge
                          key={index}
                          className="bg-slate-100 hover:bg-slate-200/80 dark:bg-zinc-800 dark:hover:bg-zinc-700/80 text-slate-700 dark:text-zinc-300 font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1.5 border border-slate-200 dark:border-zinc-750"
                        >
                          <span>{benefit}</span>
                          <button
                            type="button"
                            onClick={() => removeBenefit(benefit)}
                            className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 💾 Bottom Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200/60 dark:border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/dashboard/website/careers/jobs")}
                className="h-10 px-6 rounded-xl border border-slate-200 dark:border-zinc-800 hover:bg-slate-50 dark:hover:bg-zinc-850 font-bold text-xs cursor-pointer text-slate-600 dark:text-zinc-400 transition-colors"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !isValid}
                className="h-10 px-6 rounded-xl bg-[#00338D] text-white hover:bg-[#00338D]/90 font-bold text-xs gap-2 cursor-pointer shadow-md transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Opening"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
