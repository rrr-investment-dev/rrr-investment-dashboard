"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { fetchAllRoles } from "@/http/api";

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

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

import { Separator } from "@/components/ui/separator";
import { Upload } from "lucide-react";

/* ---------------- Types ---------------- */
type UserInfoValues = {
  fullName: string;
  email: string;
  mobile: string;
  role: string;
  roleName: string;
  designation: string;
  image?: FileList;
};

type Props = {
  setIsValid?: (valid: boolean) => void;
  initialData?: {
    fullName?: string;
    email?: string;
    mobile?: string;
    role?: string;
    roleName?: string;
    designation?: string;
    imageUrl?: string;
  };
  isEdit?: boolean;
  onDataChange?: (data: any) => void;
};

/* ---------------- Component ---------------- */
export default function UserInfoForm({ setIsValid, initialData, isEdit, onDataChange }: Props) {
  const [preview, setPreview] = useState<string | null>(initialData?.imageUrl || null);

  const { data: roles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["allRoles"],
    queryFn: fetchAllRoles,
  });

  const form = useForm<UserInfoValues>({
    mode: "onChange",
    defaultValues: {
      fullName: initialData?.fullName || "",
      email: initialData?.email || "",
      mobile: initialData?.mobile || "",
      role: initialData?.role || "",
      roleName: initialData?.roleName || "",
      designation: initialData?.designation || "",
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

  /* ---- image preview ---- */
  // eslint-disable-next-line react-hooks/incompatible-library
  const image = watch("image");
  useEffect(() => {
    if (image && image.length > 0) {
      const url = URL.createObjectURL(image[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [image]);

  return (
    <Card className="max-w-[1100px] rounded-2xl border border-slate-200/60 dark:border-zinc-800 bg-card text-card-foreground shadow-sm">
      {/* ---------- Header ---------- */}
      <CardHeader className="pb-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {isEdit ? "User Info" : "New User"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update personal and user details"
            : "Enter user details to create account"}
        </p>
      </CardHeader>

      {/* ---------- Content ---------- */}
      <CardContent>
        <Form {...form}>
          <form className="grid grid-cols-[1fr_auto_360px] gap-10">
            {/* ================= LEFT FORM ================= */}
            <div className="space-y-6">
              {/* Full Name */}
              <FormField
                control={control}
                name="fullName"
                rules={{ required: "Full name is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: "Enter valid email",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input placeholder="user@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mobile */}
              <FormField
                control={control}
                name="mobile"
                rules={{
                  required: "Mobile number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Enter 10 digit mobile number",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                      <Input
                        inputMode="numeric"
                        placeholder="10 digit number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(
                            e.target.value.replace(/\D/g, "").slice(0, 10)
                          )
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Role */}
              <FormField
                control={control}
                name="role"
                rules={{ required: "Role is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        const selectedRole = roles.find((r: any) => r._id === val);
                        form.setValue("roleName", selectedRole?.displayRoleName || selectedRole?.roleType || "");
                      }}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {isLoadingRoles ? (
                          <SelectItem value="loading" disabled>
                            Loading roles...
                          </SelectItem>
                        ) : (
                          roles
                            .filter((role: any) => role.isActive || role.id === field.value)
                            .map((role: any) => {
                              const isCurrentRole = role.id === field.value;
                              const isDisabled = !role.isActive && !isCurrentRole;
                              
                              return (
                                <SelectItem 
                                  key={role.id} 
                                  value={role.id} 
                                  disabled={isDisabled}
                                >
                                  {role.roleName} {!role.isActive && "(Inactive)"}
                                </SelectItem>
                              );
                            })
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Designation */}
              <FormField
                control={control}
                name="designation"
                rules={{ required: "Designation is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Designation</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Software Engineer" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* ================= DIVIDER ================= */}
            <Separator orientation="vertical" />

            {/* ================= RIGHT IMAGE ================= */}
            <div className="flex flex-col items-center justify-center gap-6">
              <Avatar className="h-56 w-56 border shadow-sm">
                <AvatarImage src={preview ?? undefined} />
                <AvatarFallback className="text-3xl">U</AvatarFallback>
              </Avatar>

              <FormField
                control={control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          className="gap-2 rounded-full px-6"
                          onClick={() =>
                            document.getElementById("imageUpload")?.click()
                          }
                        >
                          <Upload className="h-4 w-4" />
                          Upload Photo
                        </Button>

                        <input
                          id="imageUpload"
                          type="file"
                          hidden
                          accept="image/*"
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                      </>
                    </FormControl>
                  </FormItem>
                )}
              />

              <p className="text-xs text-muted-foreground">
                Recommended image size: 1:1 square, 200×200px
              </p>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
