"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

import { Textarea } from "@/components/ui/textarea";

import { Input } from "@/components/ui/input";

import { Card, CardHeader, CardContent } from "@/components/ui/card";

/* ---------------- Types ---------------- */
type RoleInfoValues = {
    roleName: string;
    roleDescription: string;
};

type Props = {
    setIsValid?: (valid: boolean) => void;
    initialData?: {
        roleName?: string;
        roleDescription?: string;
    };
    isEdit?: boolean;
    onDataChange?: (data: any) => void;
};

const RoleInfo = ({ setIsValid, initialData, isEdit, onDataChange }: Props) => {

    // const [preview, setPreview] = useState<string | null>(initialData?.roleName || null);

    const form = useForm<RoleInfoValues>({
        mode: "onChange",
        defaultValues: {
            roleName: initialData?.roleName || "",
            roleDescription: initialData?.roleDescription || "",
        },
    });

    const {
        control,
        watch,
        formState: { isValid },
    } = form;

    /* ---- inform stepper ---- */
    useEffect(() => {
        setIsValid?.(isValid);
    }, [isValid, setIsValid]);

    useEffect(() => {
        const subscription = watch((value) => {
            onDataChange?.(value);
        });
        return () => subscription.unsubscribe();
    }, [watch, onDataChange]);


    return (
        <Card className="max-w-[1100px] rounded-2xl border border-slate-200/60 dark:border-zinc-800 bg-card text-card-foreground shadow-sm">
            {/* ---------- Header ---------- */}
            <CardHeader className="pb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                    {isEdit ? "Role Info" : "Create New Role"}
                </h2>
                <p className="text-sm text-muted-foreground">
                    {isEdit
                        ? "Update role details"
                        : "Set up a role with a name and description to manage permissions."}
                </p>
            </CardHeader>

            {/* ---------- Content ---------- */}
            <CardContent>
                <Form {...form}>
                    {/* <form className="grid grid-cols-[1fr_auto_360px] gap-10"> */}
                    <form className="grid grid-cols-1 gap-6">
                        {/* ================= LEFT FORM ================= */}
                        <div className="space-y-6">
                            {/* Role Name */}
                            <FormField
                                control={control}
                                name="roleName"
                                rules={{ required: "Role name is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Enter role name" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={control}
                                name="roleDescription"
                                rules={{ required: "Role description is required" }}
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter role description"
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* ================= DIVIDER ================= */}
                        {/* <Separator orientation="vertical" /> */}

                        {/* ================= RIGHT ================= */}
                        {/* <div className="bg-muted rounded-xl p-4 h-fit sticky top-6">
                            <h3 className="font-semibold mb-2">Preview</h3>

                            <p className="font-medium">
                                {watch("roleName") || "Role Name"}
                            </p>

                            <p className="text-sm text-muted-foreground mt-2">
                                {watch("roleDescription") || "Role description will appear here"}
                            </p>
                        </div> */}
                    </form>
                </Form>
            </CardContent>
        </Card>
    )
}

export default RoleInfo