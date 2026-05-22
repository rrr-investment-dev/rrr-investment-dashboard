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
    <div className="min-h-svh w-full bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex items-center justify-center relative overflow-hidden p-6 md:p-10 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-300">
      {/* Ambient background glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/10 blur-[120px] pointer-events-none animate-pulse-slow [animation-delay:4s]" />

      {/* Subtle grid pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in flex flex-col items-center">
        <div className="flex flex-col items-center gap-2 font-medium mb-6">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-white/80 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/80 shadow-md dark:shadow-[0_8px_30px_rgb(0,0,0,0.3)] backdrop-blur-xl hover:scale-105 hover:border-blue-500/30 hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all duration-500 ease-out cursor-pointer group">
            <img src={logo} alt="Company Logo" className="h-10 w-auto object-contain" />
          </div>
        </div>

        <div className="w-full animate-slide-up [animation-delay:200ms]">
          {!showOtpForm ? (
            <LoginForm onOtpSent={handleOtpSent} />
          ) : (
            <OTPForm user={user} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
