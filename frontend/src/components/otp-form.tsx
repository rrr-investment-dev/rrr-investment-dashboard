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
      toast.success("OTP resent successfully!");
      console.log("New OTP:", data.otp);
      toast.success("New OTP:", data.otp);
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleOTPSubmit}>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">OTP Verification</h1>
            <FieldDescription>
              We sent a 6-digit OTP to your email address or mobile number.
            </FieldDescription>
          </div>
          <Field>
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
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
              </InputOTPGroup>
              <InputOTPSeparator />
              <InputOTPGroup className="gap-2.5 *:data-[slot=input-otp-slot]:h-16 *:data-[slot=input-otp-slot]:w-12 *:data-[slot=input-otp-slot]:rounded-md *:data-[slot=input-otp-slot]:border *:data-[slot=input-otp-slot]:text-xl">
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
            <FieldDescription className="text-center">
              Didn't receive the code?{" "}
              <Countdown
                key={resendUntil}
                date={resendUntil}
                renderer={({ seconds, completed }) =>
                  completed ? (
                    <a href="#" onClick={handleResend}>
                      Resend
                    </a>
                  ) : (
                    <span>Resend in {seconds}s</span>
                  )
                }
              />
            </FieldDescription>
            <FieldDescription
              onClick={backToLogin}
              className="text-center hover:underline cursor-pointer"
            >
              Use a different Email or Mobile Number
            </FieldDescription>
          </Field>
          <Field>
            <Button type="submit">Verify</Button>
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
