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
      console.log(data.otp);

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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleLoginSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-8 text-center">
            <h1 className="text-xl font-bold">Welcome to RRR Investments.</h1>
          </div>
          <Field>
            <FieldLabel htmlFor="email">Email / Mobile Number</FieldLabel>
            <Input
              id="email"
              ref={inputRef}
              placeholder="info@example.com / 9876543210"
              required
            />
          </Field>
          <Field>
            <Button type="submit">Login</Button>
          </Field>
          <FieldSeparator>Or</FieldSeparator>
          <Field className="grid gap-4">
            <Button variant="outline" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
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
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  );
}
