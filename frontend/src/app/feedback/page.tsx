"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ArrowLeft, CheckCircle2, AlertCircle } from "lucide-react";
import { getMe, isAuthenticated } from "@/lib/auth";

export default function FeedbackPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [love, setLove] = useState("");
  const [improved, setImproved] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    // Check if user is logged in
    if (!isAuthenticated()) {
      router.replace("/signin?redirect=/feedback");
      return;
    }

    // Fetch user profile to prefill email
    getMe().then((user) => {
      if (user && user.email) {
        setEmail(user.email);
      }
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Email is required.");
      setStatus("error");
      return;
    }
    
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, love, improved }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to send feedback");
      }

      setStatus("success");
    } catch (error: any) {
      setErrorMsg(error.message || "An unexpected error occurred.");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-screen bg-black orb-bg flex items-center justify-center px-4 py-20 sm:py-24">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle at 25% 25%, rgba(37,99,235,0.10) 0%, transparent 50%), " +
            "radial-gradient(circle at 75% 75%, rgba(16,185,129,0.06) 0%, transparent 50%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#E5E7EB] mb-2 sm:mb-3">
            We Value Your Feedback
          </h1>
          <p className="text-sm sm:text-base text-[#9CA3AF]">
            Help us improve Denoise X by sharing your thoughts
          </p>
        </div>

        <div
          className="rounded-3xl p-6 sm:p-8 md:p-10"
          style={{
            background: "rgba(10,10,10,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow:
              "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(16,185,129,0.1)",
          }}
        >
          <AnimatePresence mode="wait">
            {status === "success" ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-16 gap-4 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white">Thank You!</h2>
                <p className="text-[#9CA3AF] max-w-sm">
                  Your feedback has been sent directly to the development team. We appreciate your input!
                </p>
                <Link href="/">
                  <button className="mt-6 flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Home
                  </button>
                </Link>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-6"
              >
                {/* Email Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full bg-[#111111] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm text-[#6B7280] cursor-not-allowed"
                  />
                </div>

                {/* Love Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                    What did you love about Denoise X?
                  </label>
                  <textarea
                    value={love}
                    onChange={(e) => setLove(e.target.value)}
                    placeholder="Tell us what features you liked, what worked well for you..."
                    rows={4}
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm text-[#E5E7EB] placeholder-[#4B5563] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 transition-all duration-200 resize-none"
                  />
                </div>

                {/* Improve Field */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                    What would you like to see improved?
                  </label>
                  <textarea
                    value={improved}
                    onChange={(e) => setImproved(e.target.value)}
                    placeholder="Share your suggestions, constructive criticism, or features you'd like to see..."
                    rows={4}
                    className="w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm text-[#E5E7EB] placeholder-[#4B5563] focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/30 transition-all duration-200 resize-none"
                  />
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                  {status === "error" && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="flex items-start gap-3 rounded-xl border border-red-800/40 bg-red-950/20 px-4 py-3"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-300">{errorMsg}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="mt-2 h-12 w-full rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-white transition-all duration-200"
                  style={{
                    background: "linear-gradient(135deg, #059669, #10B981)",
                    boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                  }}
                >
                  {status === "loading" ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Feedback
                    </>
                  )}
                </button>

                <div className="text-center mt-2">
                  <Link href="/">
                    <button type="button" className="text-sm font-medium text-[#10B981] hover:text-[#34D399] transition-colors">
                      Back to Home
                    </button>
                  </Link>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
