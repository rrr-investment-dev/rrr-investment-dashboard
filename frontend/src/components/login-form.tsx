// import { GalleryVerticalEnd } from "lucide-react";
// import logo from "@/assets/RRR 3d logo lg.png";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useRef } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/http/api";
import type { AxiosError } from "axios";

export function LoginForm({
  className,
  onOtpSent,
  ...props
}: React.ComponentProps<"div"> & {
  onOtpSent: (user: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: (data, userDetails) => {
      const user = userDetails as string;

      toast.success("OTP sent successfully!");
      onOtpSent(user);
    },

    onError: (error) => {
      const err = error as AxiosError;
      if (err.status === 404) {
        toast.error("User not found. Please check your identifier.");
        return;
      }
      toast.error("Failed to send OTP. Please try again.");
    },
  });

  const validate = (input: string | undefined): boolean => {
    if (!input) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^[6-9]\d{9}$/;
    return emailRegex.test(input) || mobileRegex.test(input);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = inputRef.current?.value;
    if (!validate(identifier)) {
      toast.error("Please enter a valid email or mobile number.");
      return;
    }
    mutation.mutate(identifier!);
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full bg-white/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800/100", className)} {...props}>
      <form onSubmit={handleLoginSubmit}>
        <FieldGroup className="gap-6">
          <div className="flex flex-col items-center gap-2 text-center mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent font-extrabold">RRR Investments</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Enter your credentials to access your dashboard</p>
          </div>
          <Field>
            <FieldLabel htmlFor="email" className="text-slate-500 dark:text-slate-300 text-xs font-semibold tracking-wide uppercase">Email / Mobile Number</FieldLabel>
            <Input
              id="email"
              ref={inputRef}
              placeholder="info@example.com / 9876543210"
              required
              className="bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 h-11 px-4 rounded-xl focus:border-blue-500/50 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-300 focus-visible:ring-0 focus-visible:border-blue-500/50"
            />
          </Field>
          <Field>
            <Button 
              type="submit" 
              className="w-full h-11 bg-[#00338D] hover:bg-[#002a75] text-white font-medium rounded-xl shadow-[0_4px_20px_rgba(0,51,141,0.25)] hover:shadow-[0_4px_25px_rgba(0,51,141,0.4)] active:scale-[0.98] transition-all duration-300 border-0 cursor-pointer"
            >
              Login
            </Button>
          </Field>
          
          <div className="relative flex items-center justify-center my-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800/80"></div>
            </div>
            <span className="relative px-3 text-xs uppercase bg-white dark:bg-[#090e1a] text-slate-400 dark:text-slate-500 font-semibold tracking-wider rounded-md">
              Or
            </span>
          </div>

          <Field className="grid gap-4">
            <Button 
              variant="outline" 
              type="button"
              className="w-full h-11 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-5">
                <path
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                  fill="currentColor"
                />
              </svg>
              Continue with Google
            </Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="text-slate-500 dark:text-slate-400 text-xs px-2 text-center mt-2 [&>a]:text-slate-600 dark:[&>a]:text-slate-400 [&>a]:hover:text-blue-600 dark:[&>a]:hover:text-blue-400 [&>a]:transition-colors [&>a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
