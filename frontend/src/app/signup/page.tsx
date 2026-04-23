"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import {
  GraduationCap,
  Stethoscope,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Building2,
  ChevronDown,
  ArrowRight,
  Zap,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { signUp, saveToken, PROFESSIONAL_ROLE_LABELS } from "@/lib/auth";

/* ============================================
   PROFESSIONAL ROLE OPTIONS
   ============================================ */
const ROLE_OPTIONS = Object.entries(PROFESSIONAL_ROLE_LABELS).map(
  ([value, label]) => ({ value, label })
);

/* ============================================
   SMALL FIELD WRAPPER
   ============================================ */
function Field({
  label,
  icon: Icon,
  error,
  children,
}: {
  label: string;
  icon: LucideIcon;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider flex items-center gap-1.5">
        <Icon className="w-3 h-3" />
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass =
  "w-full bg-[#0a0a0a] border border-[#1a1a1a] rounded-xl px-4 py-3 text-sm text-[#E5E7EB] placeholder-[#4B5563] " +
  "focus:outline-none focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/30 transition-all duration-200";

/* ============================================
   SIGNUP PAGE
   ============================================ */
export default function SignUpPage() {
  const router = useRouter();

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Profile type toggle
  const [profileType, setProfileType] = useState<"student" | "professional">("student");
  const [collegeName, setCollegeName] = useState("");
  const [professionalRole, setProfessionalRole] = useState("");

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  /* ---- Validation ---- */
  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (fullName.trim().length < 2) errors.fullName = "Enter your full name (min 2 characters).";
    if (!email.includes("@")) errors.email = "Enter a valid email.";
    if (password.length < 8) errors.password = "Minimum 8 characters.";
    if (password !== confirmPassword) errors.confirm = "Passwords do not match.";
    if (profileType === "student" && !collegeName.trim())
      errors.college = "Please enter your institution name.";
    if (profileType === "professional" && !professionalRole)
      errors.role = "Please select your role.";
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  /* ---- Submit ---- */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = {
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        profile_type:
          profileType === "student" ? "student" : professionalRole,
        college_name: profileType === "student" ? collegeName.trim() : undefined,
        professional_role:
          profileType === "professional" ? professionalRole : undefined,
      };
      const res = await signUp(payload);
      saveToken(res.token);
      if (typeof window !== "undefined") {
        localStorage.setItem("denoisex_name", res.user.full_name);
      }
      setSuccess(true);
      setTimeout(() => router.push("/denoise"), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black orb-bg flex items-center justify-center px-4 py-24">
      {/* Atmospheric blobs */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(37,99,235,0.10) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 80%, rgba(34,211,238,0.07) 0%, transparent 50%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-lg"
      >
        {/* Card */}
        <div
          className="rounded-3xl p-6 sm:p-8 md:p-10"
          style={{
            background: "rgba(10,10,10,0.92)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255,255,255,0.07)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(37,99,235,0.1)",
          }}
        >
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="flex items-center gap-2 mb-6 w-fit">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, #2563EB, #1d4ed8)" }}
              >
                <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
              </div>
              <span className="font-bold text-[#E5E7EB]">
                Denoise<span className="text-gradient"> X</span>
              </span>
            </Link>

            <div className="pill-badge mb-4 w-fit">
              <GraduationCap className="w-3 h-3" />
              Create your account
            </div>
            <h1 className="text-2xl font-extrabold text-[#E5E7EB] leading-tight">
              Join Denoise X
            </h1>
            <p className="text-sm text-[#6B7280] mt-1.5">
              Built for medical students & junior clinicians.
            </p>
          </div>

          {/* Success overlay */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center gap-4 py-12"
              >
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="font-bold text-emerald-300 text-lg">Account Created!</p>
                <p className="text-sm text-[#6B7280]">Redirecting you to Denoise X…</p>
              </motion.div>
            )}
          </AnimatePresence>

          {!success && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">

              {/* Full Name */}
              <Field label="Full Name" icon={User} error={fieldErrors.fullName}>
                <input
                  id="signup-fullname"
                  type="text"
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Manish Jaiswal"
                  className={`${inputClass} ${fieldErrors.fullName ? "border-red-500/60" : ""}`}
                />
              </Field>

              {/* Email */}
              <Field label="Email" icon={Mail} error={fieldErrors.email}>
                <input
                  id="signup-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@college.edu"
                  className={`${inputClass} ${fieldErrors.email ? "border-red-500/60" : ""}`}
                />
              </Field>

              {/* Password row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Password" icon={Lock} error={fieldErrors.password}>
                  <div className="relative">
                    <input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className={`${inputClass} pr-10 ${fieldErrors.password ? "border-red-500/60" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>

                <Field label="Confirm Password" icon={Lock} error={fieldErrors.confirm}>
                  <div className="relative">
                    <input
                      id="signup-confirm"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat password"
                      className={`${inputClass} pr-10 ${fieldErrors.confirm ? "border-red-500/60" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#9CA3AF]"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </Field>
              </div>

              {/* ── Profile Type Toggle ── */}
              <div className="flex flex-col gap-3">
                <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider">
                  I am a…
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {/* Student option */}
                  <button
                    type="button"
                    id="profile-student"
                    onClick={() => setProfileType("student")}
                    className={`flex flex-col items-center gap-2.5 rounded-2xl p-4 border transition-all duration-200 ${profileType === "student"
                        ? "border-[#2563EB] bg-[#1a2744]/60"
                        : "border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#2563EB]/40"
                      }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${profileType === "student"
                          ? "bg-[#2563EB]"
                          : "bg-[#1a1a1a]"
                        }`}
                    >
                      <GraduationCap
                        className={`w-5 h-5 ${profileType === "student" ? "text-white" : "text-[#6B7280]"}`}
                      />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${profileType === "student" ? "text-white" : "text-[#9CA3AF]"}`}>
                        Medical Student
                      </p>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">MBBS / BDS / Nursing</p>
                    </div>
                    {profileType === "student" && (
                      <div className="w-4 h-4 rounded-full bg-[#2563EB] flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </button>

                  {/* Professional option */}
                  <button
                    type="button"
                    id="profile-professional"
                    onClick={() => setProfileType("professional")}
                    className={`flex flex-col items-center gap-2.5 rounded-2xl p-4 border transition-all duration-200 ${profileType === "professional"
                        ? "border-[#22D3EE] bg-[#0a1f2a]/60"
                        : "border-[#1a1a1a] bg-[#0a0a0a] hover:border-[#22D3EE]/40"
                      }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${profileType === "professional"
                          ? "bg-[#22D3EE]"
                          : "bg-[#1a1a1a]"
                        }`}
                    >
                      <Stethoscope
                        className={`w-5 h-5 ${profileType === "professional" ? "text-black" : "text-[#6B7280]"}`}
                      />
                    </div>
                    <div className="text-center">
                      <p className={`text-sm font-semibold ${profileType === "professional" ? "text-white" : "text-[#9CA3AF]"}`}>
                        Medical Professional
                      </p>
                      <p className="text-[10px] text-[#6B7280] mt-0.5">Resident / Junior Doctor</p>
                    </div>
                    {profileType === "professional" && (
                      <div className="w-4 h-4 rounded-full bg-[#22D3EE] flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-black" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Conditional field based on type */}
                <AnimatePresence mode="wait">
                  {profileType === "student" ? (
                    <motion.div
                      key="student-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Field label="College / Institution" icon={Building2} error={fieldErrors.college}>
                        <input
                          id="signup-college"
                          type="text"
                          value={collegeName}
                          onChange={(e) => setCollegeName(e.target.value)}
                          placeholder="e.g. AIIMS New Delhi, KMC Manipal"
                          className={`${inputClass} ${fieldErrors.college ? "border-red-500/60" : ""}`}
                        />
                      </Field>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="professional-field"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Field label="Your Role" icon={Stethoscope} error={fieldErrors.role}>
                        <div className="relative">
                          <select
                            id="signup-role"
                            value={professionalRole}
                            onChange={(e) => setProfessionalRole(e.target.value)}
                            className={`${inputClass} appearance-none pr-10 ${fieldErrors.role ? "border-red-500/60" : ""}`}
                          >
                            <option value="" disabled>Select your role…</option>
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7280] pointer-events-none" />
                        </div>
                      </Field>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Error banner */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 rounded-xl border border-red-800/40 bg-red-950/20 px-4 py-3"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-300">{error}</p>
                </motion.div>
              )}

              {/* Disclaimer */}
              <p className="text-[10px] text-[#4B5563] leading-relaxed border border-[#1a1a1a] rounded-xl p-3">
                ⚠️ Denoise X is an <strong className="text-[#6B7280]">educational and assistive tool only</strong>. It is not a diagnostic replacement. Always consult a qualified healthcare provider.
              </p>

              {/* Submit */}
              <button
                id="signup-submit"
                type="submit"
                disabled={loading}
                className="btn-purple h-12 w-full rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Creating account…
                  </>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-[#6B7280]">
                Already have an account?{" "}
                <Link href="/signin" className="text-[#22D3EE] hover:text-white font-semibold transition-colors">
                  Sign In
                </Link>
              </p>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
