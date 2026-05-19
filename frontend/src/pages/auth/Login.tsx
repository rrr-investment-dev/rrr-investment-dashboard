import { LoginForm } from "@/components/login-form";
import { OTPForm } from "@/components/otp-form";
import { useState } from "react";
import logo from "@/assets/RRR 3d logo lg.png";
// import { OTPForm } from "@/components/otp-form";

const Login = () => {
  const [showOtpForm, setShowOtpForm] = useState(false);
  const [user, setUser] = useState<string | null>(null);

  const handleOtpSent = (user: string) => {
    setUser(user);
    // console.log(user);

    setShowOtpForm(true);
  };

  return (
    <>
      <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm">
          <a
            href="#"
            className="flex flex-col items-center gap-2 font-medium mb-8"
          >
            <div className="flex size-8 items-center justify-center rounded-md">
              <img src={logo} alt="Company Logo" className="size-14" />
            </div>
          </a>
          {!showOtpForm ? (
            <LoginForm onOtpSent={handleOtpSent} />
          ) : (
            <OTPForm user={user} />
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
