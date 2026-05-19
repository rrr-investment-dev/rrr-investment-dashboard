import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchFormConfigs,
  toggleFormConfigStatus,
  deleteFormConfig,
  reorderFormConfigs,
  createFormConfig
} from "@/http/api";
import type { FormConfigApi } from "@/http/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Loader2,
  Settings2,
  Info,
  FileText,
  Trash2,
  ListPlus,
  MousePointer2,
  Calendar
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import WebsiteModuleHeader from "@/components/admin/website/WebsiteModuleHeader";
import { DataTable } from "@/components/data-table/data-table";
import { getFormConfigColumns } from "@/components/data-table/formConfigColumns";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

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

const FormConfigMaster = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("list");

  // State for delete confirmation
  const [fieldToDelete, setFieldToDelete] = useState<FormConfigApi | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const form = useForm<FieldFormValues>({
    resolver: zodResolver(fieldSchema),
    defaultValues: {
      label: "",
      type: "text",
      placeholder: "",
      required: false,
      isActive: true,
      options: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options",
  });

  const fieldType = form.watch("type");
  const watchedValues = form.watch();
  const isMultiOption = ["select", "radio", "checkbox"].includes(fieldType);

  // Sync options field array with type
  useEffect(() => {
    if (isMultiOption && fields.length === 0) {
      append({ label: "Option 1", value: "option_1" });
    }
  }, [isMultiOption, fields.length, append]);

  const { data: configs, isLoading } = useQuery<FormConfigApi[]>({
    queryKey: ["formConfigs"],
    queryFn: fetchFormConfigs,
  });

  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [requiredFilter, setRequiredFilter] = useState<string>("all");

  const filteredConfigs = useMemo(() => {
    if (!configs) return [];
    return configs.filter(config => {
      const matchStatus = statusFilter === "all" || (statusFilter === "active" ? config.isActive : !config.isActive);
      const matchRequired = requiredFilter === "all" || (requiredFilter === "yes" ? config.required : !config.required);
      return matchStatus && matchRequired;
    });
  }, [configs, statusFilter, requiredFilter]);

  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      toggleFormConfigStatus(id, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formConfigs"] });
      toast.success("Status updated successfully");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFormConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formConfigs"] });
      toast.success("Field deleted successfully");
      setIsDeleteDialogOpen(false);
      setFieldToDelete(null);
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderFormConfigs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formConfigs"] });
      toast.success("Order updated successfully");
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: FieldFormValues) => {
      // Only include options if it's a multi-option type
      const payload = { ...data };
      if (!isMultiOption) {
        delete payload.options;
      }
      return createFormConfig(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["formConfigs"] });
      toast.success("Field created successfully");
      setTab("list");
      form.reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Something went wrong");
    },
  });

  const onSubmit = (data: FieldFormValues) => {
    createMutation.mutate(data);
  };

  const handleReorder = (newData: FormConfigApi[]) => {
    const orderedIds = newData.map(c => c._id);
    reorderMutation.mutate(orderedIds);
  };

  const onAction = (type: "view" | "edit" | "delete" | "toggleStatus", field: FormConfigApi) => {
    switch (type) {
      case "view":
        navigate(`/dashboard/website/contact/config/${field._id}`);
        break;
      case "edit":
        navigate(`/dashboard/website/contact/config/edit/${field._id}`);
        break;
      case "delete":
        setFieldToDelete(field);
        setIsDeleteDialogOpen(true);
        break;
      case "toggleStatus":
        toggleStatusMutation.mutate({ id: field._id, isActive: !field.isActive });
        break;
    }
  };

  const columns = getFormConfigColumns(onAction);

  const tabs = [
    { value: "list", label: "All Fields", icon: FileText },
    { value: "create", label: "Add New Field", icon: Plus },
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

        <div className={`grid grid-cols-1 ${tab === 'list' ? 'xl:grid-cols-[1fr_400px]' : ''} gap-6`}>
          <div className="space-y-6">
            <TabsContent value="list" className="mt-0 focus-visible:outline-none">
              <DataTable
                columns={columns}
                data={filteredConfigs}
                enableSearch={true}
                searchPlaceholder="Search fields..."
                enablePagination={true}
                onReorder={handleReorder}
                extraFilters={
                  <div className="flex flex-wrap items-center gap-2">
                    <Select value={requiredFilter} onValueChange={setRequiredFilter}>
                      <SelectTrigger className="w-[140px] bg-card border-border rounded-xl">
                        <SelectValue placeholder="Filter Required" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Required</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-[140px] bg-card border-border rounded-xl">
                        <SelectValue placeholder="Filter Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                }
              />
            </TabsContent>

            <TabsContent value="create" className="mt-0 focus-visible:outline-none">
              <Card className="border-slate-200/60 dark:border-zinc-800 bg-card text-card-foreground shadow-sm rounded-xl overflow-hidden">
                <div className="border-b border-slate-100 dark:border-zinc-800 py-6 px-6 bg-slate-50/30 dark:bg-zinc-900/40">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 dark:bg-blue-950/40 p-2 rounded-lg">
                      <Settings2 className="h-5 w-5 text-blue-600 dark:text-blue-455" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-none mb-1">Field Configuration</h3>
                      <p className="text-[11px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest">Define your input field properties</p>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="label"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[10px] font-black text-slate-400 dark:text-zinc-500 uppercase tracking-widest">Field Label</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Phone Number" className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-blue-500 shadow-sm" {...field} />
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
                                  <Input placeholder="e.g. Enter your mobile number..." className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:ring-blue-500 shadow-sm" {...field} />
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
                                  <label className="text-xs font-bold text-slate-600 dark:text-zinc-300 cursor-pointer">Show on Website</label>
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <Button type="submit" disabled={createMutation.isPending} className="h-11 px-8 font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg dark:shadow-none shadow-blue-100 rounded-xl transition-all active:scale-95">
                          {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Create Field
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* 🖼️ Right Side: Preview (Only shown on List tab) */}
          {tab === "list" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
              <Card className="border-slate-200/60 dark:border-zinc-800 bg-card text-card-foreground shadow-sm rounded-xl overflow-hidden sticky top-6">
                <div className="px-6 py-5 border-b border-slate-100 dark:border-zinc-800 flex items-center gap-3 bg-slate-50/30 dark:bg-zinc-900/40">
                  <div className="bg-blue-100 dark:bg-blue-950/40 p-1.5 rounded-md">
                    <Settings2 className="h-4 w-4 text-blue-600 dark:text-blue-450" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-none mb-1">Live Preview</h3>
                    <p className="text-[10px] text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-widest">Real-time appearance</p>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="bg-slate-50 dark:bg-zinc-950 rounded-2xl p-6 border border-slate-100 dark:border-zinc-850 space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">Send an Inquiry</h3>
                      <p className="text-xs text-slate-400 dark:text-zinc-500 font-medium">Fields updated in real-time</p>
                    </div>

                    <div className="space-y-5">
                      {/* 📋 Unified Field Renderer for Preview */}
                      {(() => {
                        const renderField = (field: any, isNew: boolean = false) => (
                          <div key={field._id || 'new-field'} className={`space-y-2 ${isNew ? 'p-3 rounded-xl border-2 border-dashed border-blue-200 dark:border-blue-900/30 bg-blue-50/30 dark:bg-blue-950/10 animate-in fade-in slide-in-from-right-4 duration-500' : ''}`}>
                            <div className="flex items-center justify-between">
                              <label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${isNew ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-zinc-400'}`}>
                                {field.label || (isNew ? "Untitled Field" : "")}
                                {field.required && <span className="text-rose-500 ml-0.5">*</span>}
                              </label>
                              {isNew && <span className="text-[8px] font-bold bg-blue-600 text-white px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Pending</span>}
                            </div>

                            {/* Render based on type */}
                            {field.type === 'textarea' ? (
                              <div className="w-full h-20 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-2.5 text-[11px] text-slate-400 dark:text-zinc-500">
                                {field.placeholder || "Message area..."}
                              </div>
                            ) : field.type === 'select' ? (
                              <div className="w-full h-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-2.5 text-[11px] text-slate-400 dark:text-zinc-500 flex items-center justify-between">
                                <span>{field.placeholder || "Select an option..."}</span>
                                <Settings2 className="h-3 w-3 text-slate-300 dark:text-zinc-700" />
                              </div>
                            ) : (field.type === 'radio' || field.type === 'checkbox') ? (
                              <div className="space-y-2 pl-1 pt-1">
                                {(field.options && field.options.length > 0) ? (
                                  field.options.map((opt: any, i: number) => (
                                    <div key={i} className="flex items-center gap-2.5">
                                      <div className={`h-4 w-4 rounded-${field.type === 'radio' ? 'full' : 'md'} border border-slate-300 dark:border-zinc-750 bg-white dark:bg-zinc-900`} />
                                      <span className="text-[11px] font-medium text-slate-600 dark:text-zinc-300">{opt.label || `Option ${i + 1}`}</span>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-[10px] text-slate-400 dark:text-zinc-500 italic">No options defined</p>
                                )}
                              </div>
                            ) : field.type === 'date' ? (
                              <div className="w-full h-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-2.5 text-[11px] text-slate-400 dark:text-zinc-500 flex items-center justify-between">
                                <span>Pick a date...</span>
                                <Calendar className="h-3.5 w-3.5 text-slate-300 dark:text-zinc-700" />
                              </div>
                            ) : (
                              <div className="w-full h-10 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 px-4 py-2.5 text-[11px] text-slate-400 dark:text-zinc-500">
                                {field.placeholder || `Enter ${field.label?.toLowerCase() || 'value'}...`}
                              </div>
                            )}
                          </div>
                        );

                        return (
                          <>
                            {configs?.filter(f => f.isActive).map(f => renderField(f))}
                          </>
                        );
                      })()}

                      {(!configs || configs.filter(f => f.isActive).length === 0) && (
                        <div className="py-12 text-center text-slate-300 dark:text-zinc-650 italic text-sm bg-white dark:bg-zinc-900 rounded-xl border-2 border-dashed border-slate-100 dark:border-zinc-800">
                          Form is empty
                        </div>
                      )}

                      <Button className="w-full bg-slate-900 dark:bg-zinc-800 text-white dark:text-zinc-100 hover:bg-slate-800 dark:hover:bg-zinc-700 h-11 rounded-xl text-sm font-bold shadow-lg dark:shadow-none shadow-slate-200 mt-2">
                        Submit Message
                      </Button>
                    </div>
                  </div>
                  <div className="mt-6 bg-blue-50/50 dark:bg-blue-950/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex gap-3">
                    <Info className="h-5 w-5 text-blue-500 dark:text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-blue-600 dark:text-blue-450 leading-relaxed font-medium">
                      This preview matches the layout of the public contact form on your website.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </Tabs>

      {/* 🗑️ Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="rounded-xl border border-slate-150 dark:border-zinc-800 shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Remove Field?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-zinc-400">
              Are you sure you want to delete "{fieldToDelete?.label}"? This will remove it from the public website immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="rounded-lg border-slate-200 dark:border-zinc-800">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => fieldToDelete && deleteMutation.mutate(fieldToDelete._id)}
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

export default FormConfigMaster;
