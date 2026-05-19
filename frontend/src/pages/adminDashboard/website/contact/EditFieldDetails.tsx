import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFormConfigs, updateFormConfig } from "@/http/api";
import type { FormConfigApi } from "@/http/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  Loader2,
  Settings2,
  Info,
  Plus,
  Trash2,
  ListPlus
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

const fieldSchema = z.object({
  label: z.string().min(1, "Label is required"),
  type: z.enum(["text", "email", "tel", "url", "textarea", "number", "select", "radio", "checkbox", "date", "time", "file"]),
  placeholder: z.string().optional(),
  required: z.boolean(),
  isActive: z.boolean(),
  options: z.array(z.object({
    label: z.string().min(1, "Option label is required"),
    value: z.string().min(1, "Option value is required"),
  })).optional(),
});

type FieldFormValues = z.infer<typeof fieldSchema>;

const EditFieldDetails = () => {
  const { fieldId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: configs, isLoading: isFetching } = useQuery<FormConfigApi[]>({
    queryKey: ["formConfigs"],
    queryFn: fetchFormConfigs,
  });

  const fieldData = configs?.find((f) => f._id === fieldId);

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    values: fieldData ? {
      label: fieldData.label,
      type: fieldData.type as any, // Cast to any to avoid strict type issues if backend has invalid types temporarily
      placeholder: fieldData.placeholder || "",
      required: fieldData.required,
      isActive: fieldData.isActive,
      options: fieldData.options && fieldData.options.length > 0 ? fieldData.options : [],
    } : undefined,
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const fieldType = form.watch("type");
  const isMultiOption = ["select", "radio", "checkbox"].includes(fieldType);

  // Sync options field array with type
  useEffect(() => {
    if (isMultiOption && fields.length === 0) {
      append({ label: "Option 1", value: "option_1" });
    }
  }, [isMultiOption, fields.length, append]);

  // Remove useEffect for form reset as we now use the 'values' prop in useForm

  const updateMutation = useMutation({
    mutationFn: (data: FieldFormValues) => updateFormConfig(fieldId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formConfigs"] });
      toast.success("Field configuration updated successfully");
      navigate("/dashboard/website/contact/config");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update field");
    },
  });

  const onSubmit = (data: FieldFormValues) => {
    const payload = { ...data };
    if (!isMultiOption) {
      delete payload.options;
    }
    updateMutation.mutate(payload);
  };

  if (isFetching) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!fieldData) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <p className="text-slate-500 font-medium">Field configuration not found.</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 pb-20 pt-6 px-4 sm:px-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-10 w-10 shrink-0 rounded-full bg-white dark:bg-zinc-950 shadow-sm border-slate-200 dark:border-zinc-800"
          >
            <ArrowLeft className="h-4 w-4 text-slate-600 dark:text-zinc-400" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 leading-tight">Edit Field</h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Update configuration for {fieldData.label}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <Card className="border-slate-200/60 dark:border-zinc-800 bg-card text-card-foreground shadow-sm rounded-xl overflow-hidden">
            <div className="border-b border-slate-100 dark:border-zinc-800 py-6 px-6 bg-slate-50/30 dark:bg-zinc-900/40">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 dark:bg-blue-950/40 p-2 rounded-lg">
                  <Settings2 className="h-5 w-5 text-blue-600 dark:text-blue-455" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">Field Configuration</h3>
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest">Modify your input field properties</p>
                </div>
              </div>
            </div>
            <CardContent className="p-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="label"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Field Label</FormLabel>
                          <FormControl>
                            <Input className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-blue-500 shadow-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Input Type</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                            <FormControl>
                              <SelectTrigger className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-blue-500 shadow-sm w-full">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-xl border-slate-150 dark:border-zinc-850 shadow-xl bg-popover text-popover-foreground">
                              <SelectItem value="text">Short Text</SelectItem>
                              <SelectItem value="email">Email Address</SelectItem>
                              <SelectItem value="tel">Phone Number</SelectItem>
                              <SelectItem value="url">Website URL</SelectItem>
                              <SelectItem value="textarea">Large Text</SelectItem>
                              <SelectItem value="number">Number</SelectItem>
                              <SelectItem value="date">Date Picker</SelectItem>
                              <SelectItem value="time">Time Picker</SelectItem>
                              <SelectItem value="file">File Upload</SelectItem>
                              <SelectItem value="select">Dropdown</SelectItem>
                              <SelectItem value="radio">Radio Group</SelectItem>
                              <SelectItem value="checkbox">Checkbox</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* 🛠️ Dynamic Options Section */}
                  {isMultiOption && (
                    <div className="space-y-4 p-5 rounded-2xl border border-blue-100 dark:border-blue-900/30 bg-blue-50/20 dark:bg-blue-950/10 animate-in slide-in-from-top-2 duration-300">
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-[10px] font-black text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                          <ListPlus className="h-3.5 w-3.5" />
                          Option Values
                        </FormLabel>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => append({ label: "", value: "" })}
                          className="h-8 text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 gap-1.5"
                        >
                          <Plus className="h-3 w-3" /> Add Option
                        </Button>
                      </div>

                      <div className="space-y-3">
                        {fields.map((item, index) => (
                          <div key={item.id} className="flex gap-3 items-start group">
                            <div className="flex-1">
                              <Input
                                placeholder="Label"
                                {...form.register(`options.${index}.label` as const)}
                                className="h-10 bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-blue-500 rounded-xl text-xs"
                              />
                            </div>
                            <div className="flex-1">
                              <Input
                                placeholder="Value"
                                {...form.register(`options.${index}.value` as const)}
                                className="h-10 bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 focus:ring-blue-500 rounded-xl text-xs font-mono"
                              />
                            </div>
                            {fields.length > 1 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className="h-10 w-10 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
                    <FormField
                      control={form.control}
                      name="placeholder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Placeholder Text</FormLabel>
                          <FormControl>
                            <Input className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-blue-500 shadow-sm" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex items-center gap-8 px-4 bg-slate-50 dark:bg-zinc-900/40 rounded-xl border border-slate-100 dark:border-zinc-800 h-11">
                      <FormField
                        control={form.control}
                        name="required"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="h-5 w-5 rounded-md data-[state=checked]:bg-blue-600 border-slate-300 dark:border-zinc-700"
                              />
                            </FormControl>
                            <label className="text-xs font-bold text-slate-600 dark:text-zinc-300 cursor-pointer">Required Field</label>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isActive"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="h-5 w-5 rounded-md data-[state=checked]:bg-emerald-600 border-slate-300 dark:border-zinc-700"
                              />
                            </FormControl>
                            <label className="text-xs font-bold text-slate-600 dark:text-zinc-300 cursor-pointer">Live on Website</label>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={updateMutation.isPending}
                      className="h-11 px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg dark:shadow-none shadow-blue-100 rounded-xl transition-all active:scale-95"
                    >
                      {updateMutation.isPending ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      Save Changes
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EditFieldDetails;
