"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap,
  AtSign,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Brain,
} from "lucide-react";
import { signIn, saveToken } from "@/lib/auth";

const inputClass =
  "w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm text-[#E5E7EB] placeholder-[#4B5563] " +
  "focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/30 transition-all duration-200";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/denoise";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Enter your email address.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }
    setLoading(true);
    try {
      const res = await signIn({ email: email.trim(), password });
      saveToken(res.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("denoisex_name", res.user.full_name);
      }
      setSuccess(true);
      setTimeout(() => router.push(redirectTo), 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign in failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black orb-bg flex items-center justify-center px-4 py-24">
      {/* Atmospheric blur */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle at 25% 25%, rgba(37,99,235,0.10) 0%, transparent 50%), " +
            "radial-gradient(circle at 75% 75%, rgba(34,211,238,0.06) 0%, transparent 50%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div
          className="rounded-3xl p-6 sm:p-8 md:p-10"
          style={{
            background: "rgba(10,10,10,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(37,99,235,0.1)",
          }}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8 w-fit group">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
              style={{
                background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
              }}
            >
              <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-[#E5E7EB]">
              Denoise<span className="text-gradient"> X</span>
            </span>
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="pill-badge mb-4 w-fit">
              <Brain className="w-3 h-3" />
              Welcome back
            </div>
            <h1 className="text-2xl font-extrabold text-[#E5E7EB] leading-tight">
              Sign In to Denoise X
            </h1>
            <p className="text-sm text-[#6B7280] mt-1.5">
              Use your email address to sign in.
            </p>
          </div>

          {/* Success state */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4 py-10"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                </div>
                <p className="font-bold text-emerald-300">Signed In!</p>
                <p className="text-sm text-[#6B7280]">Redirecting…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="signin-email"
                  className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5"
                >
                  <AtSign className="w-3 h-3" />
                  Email
                </label>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <input
                    id="signin-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@college.edu"
                    className={inputClass}
                  />
                </motion.div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label
                  htmlFor="signin-password"
                  className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Lock className="w-3 h-3" />
                  Password
                </label>
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="relative"
                >
                  <input
                    id="signin-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Your password"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF] transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </motion.div>
              </div>

              {/* Error banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 rounded-xl border border-red-800/40 bg-red-950/20 px-4 py-3"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-red-300">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit */}
              <motion.button
                id="signin-submit"
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-purple h-12 w-full rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-1"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Signing in…
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </motion.button>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-center text-sm text-[#6B7280]"
              >
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-[#22D3EE] hover:text-white font-semibold transition-colors"
                >
                  Create one — it&apos;s free
                </Link>
              </motion.p>

              <p className="text-center text-[10px] text-[#374151] mt-1">
                ⚕️ Denoise X is for educational use only — not a diagnostic
                replacement.
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#2563EB] border-t-transparent animate-spin" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
