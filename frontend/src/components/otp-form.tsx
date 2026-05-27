// import { GalleryVerticalEnd } from "lucide-react"

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Countdown from "react-countdown";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login, verifyOTP } from "@/http/api";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useNavigate } from "react-router-dom";

type OTPFormProps = React.ComponentProps<"div"> & {};

export function OTPForm({
  className,
  user,
  ...props
}: OTPFormProps & { user?: string | null }) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  // eslint-disable-next-line react-hooks/purity
  const [resendUntil, setResendUntil] = useState(Date.now() + 60000);

  const resendOtpMutation = useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      console.log("Resend OTP Response:", data);
      toast.success("OTP resent successfully!");
      setResendUntil(Date.now() + 60000);
    },
  });

  const handleResend = (e: React.MouseEvent) => {
    e.preventDefault();
    resendOtpMutation.mutate(user!);
  };

  const backToLogin = () => {
    window.location.reload();
  };

  const mutation = useMutation({
    mutationFn: verifyOTP,
    onSuccess: () => {
      toast.success("Login successful!");
      setResendUntil(Date.now());
      navigate("/dashboard");
    },

    onError: (error) => {
      const err = error as AxiosError;
      console.log(err);
      toast.error("Failed to send OTP. Please try again.");
    },
  });

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(otp!);
  };

  return (
    <div className={cn("flex flex-col gap-6 w-full bg-white/80 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800/80 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-slate-300 dark:hover:border-slate-800/100", className)} {...props}>
      <form onSubmit={handleOTPSubmit}>
        <FieldGroup className="gap-6">
          <div className="flex flex-col items-center gap-2 text-center mb-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">OTP Verification</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              We sent a 6-digit OTP to your credentials.
            </p>
          </div>
          <Field className="flex flex-col items-center justify-center">
            <FieldLabel htmlFor="otp" className="sr-only">
              Verification OTP
            </FieldLabel>
            <InputOTP
              maxLength={6}
              id="otp"
              required
              inputMode="numeric"
              value={otp}
              onChange={(value) => {
                const numeric = value.replace(/\D/g, "");
                setOtp(numeric);
              }}
              containerClassName="gap-4"
            >
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-14 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:rounded-xl *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:border-slate-200 dark:*:data-[slot=input-otp-slot]:border-slate-800/80 *:data-[slot=input-otp-slot]:bg-white dark:*:data-[slot=input-otp-slot]:bg-slate-900/50 *:data-[slot=input-otp-slot]:text-slate-900 dark:*:data-[slot=input-otp-slot]:text-white *:data-[slot=input-otp-slot]:text-xl *:data-[slot=input-otp-slot]:font-bold *:data-[slot=input-otp-slot]:shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:*:data-[slot=input-otp-slot]:shadow-[0_4px_12px_rgba(0,0,0,0.1)] *:data-[slot=input-otp-slot]:transition-all *:data-[slot=input-otp-slot]:duration-300 *:data-[slot=input-otp-slot][data-active=true]:border-blue-600 dark:*:data-[slot=input-otp-slot][data-active=true]:border-blue-500/60 *:data-[slot=input-otp-slot][data-active=true]:ring-[3px] *:data-[slot=input-otp-slot][data-active=true]:ring-indigo-500/20 *:data-[slot=input-otp-slot][data-active=true]:z-10">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator className="text-slate-300 dark:text-slate-600" />
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-14 *:data-[slot=input-otp-slot]:w-11 *:data-[slot=input-otp-slot]:rounded-xl *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:border-slate-200 dark:*:data-[slot=input-otp-slot]:border-slate-800/80 *:data-[slot=input-otp-slot]:bg-white dark:*:data-[slot=input-otp-slot]:bg-slate-900/50 *:data-[slot=input-otp-slot]:text-slate-900 dark:*:data-[slot=input-otp-slot]:text-white *:data-[slot=input-otp-slot]:text-xl *:data-[slot=input-otp-slot]:font-bold *:data-[slot=input-otp-slot]:shadow-[0_2px_8px_rgba(0,0,0,0.05)] dark:*:data-[slot=input-otp-slot]:shadow-[0_4px_12px_rgba(0,0,0,0.1)] *:data-[slot=input-otp-slot]:transition-all *:data-[slot=input-otp-slot]:duration-300 *:data-[slot=input-otp-slot][data-active=true]:border-blue-600 dark:*:data-[slot=input-otp-slot][data-active=true]:border-blue-500/60 *:data-[slot=input-otp-slot][data-active=true]:ring-[3px] *:data-[slot=input-otp-slot][data-active=true]:ring-indigo-500/20 *:data-[slot=input-otp-slot][data-active=true]:z-10">
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <div className="w-full text-center mt-4 flex flex-col gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Didn't receive the code?{" "}
                <Countdown
                  key={resendUntil}
                  date={resendUntil}
                  renderer={({ seconds, completed }) =>
                    completed ? (
                      <a href="#" onClick={handleResend} className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium hover:underline">
                        Resend
                      </a>
                    ) : (
                      <span className="text-slate-400 dark:text-slate-500 font-medium">Resend in {seconds}s</span>
                    )
                  }
                />
              </p>
              <button
                type="button"
                onClick={backToLogin}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:underline cursor-pointer transition-colors bg-transparent border-0 outline-none mt-1"
              >
                Use a different Email or Mobile Number
              </button>
            </div>
          </Field>
          <Field>
            <Button
              type="submit"
              className="w-full h-11 bg-[#00338D] hover:bg-[#002a75] text-white font-medium rounded-xl shadow-[0_4px_20px_rgba(0,51,141,0.25)] hover:shadow-[0_4px_25px_rgba(0,51,141,0.4)] active:scale-[0.98] transition-all duration-300 border-0 cursor-pointer"
            >
              Verify
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
