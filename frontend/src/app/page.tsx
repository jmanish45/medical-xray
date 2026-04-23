"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  ShieldCheck,
  Brain,
  GitBranch,
  Clock,
  Scan,
  ChevronRight,
  Activity,
  Star,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

import SplitText from "@/components/SplitText";
import MagicBento from "@/components/MagicBento";

/* ============================================
   DATA
   ============================================ */
const features = [
  {
    icon: Brain,
    title: "Zero-Hallucination AI",
    desc: "Preserves 100% of biological structures. Our N2N framework mathematically guarantees no anatomy is invented or erased.",
  },
  {
    icon: GitBranch,
    title: "Smart Gateway Routing",
    desc: "Calculates noise variance in real-time to safely bypass already-clean digital scans and preserve bone detail.",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    desc: "Patient data and DICOM files never leave your environment. Zero cloud dependency, zero PHI exposure.",
  },
  {
    icon: Scan,
    title: "Optimized for ICU & Rural",
    desc: "Minimal UI designed for high-stress environments. Works on portable tablets and low-bandwidth connections.",
  },
  {
    icon: Clock,
    title: "Lightning-Fast Processing",
    desc: "Batch-process entire studies in seconds. Enhanced clinical outputs delivered faster than a radiographer refresh.",
  },
  {
    icon: Scan,
    title: "DICOM Native",
    desc: "Reads DICOM metadata natively, handles PhotometricInterpretation inversion and 16-bit pixel arrays seamlessly.",
  },
];

const stats = [
  { value: "100%", label: "Anatomy Preserved" },
  { value: "N2N", label: "AI Framework" },
  { value: "DICOM", label: "Native Format" },
  { value: "<3s", label: "Avg. Processing" },
];

const techSteps = [
  {
    step: "01",
    title: "Smart Gateway",
    desc: "The system calculates noise variance using edge-masked flat tissue regions. Only truly noisy scans proceed to the AI — clean scans bypass the model entirely.",
  },
  {
    step: "02",
    title: "N2N U-Net Denoising",
    desc: "The 256×256 patch-based U-Net model—trained with Noise-to-Noise mathematics—strips quantum mottle, scatter, and grid lines without inventing new data.",
  },
  {
    step: "03",
    title: "Clinical Enhancement",
    desc: "CLAHE contrast enhancement and soft unsharp masking are applied to both paths, delivering a final clinical output ready for diagnostic review.",
  },
];

/* ============================================
   HERO
   ============================================ */
function HeroSection() {
  return (
    <section className="relative min-h-[85vh] sm:min-h-screen flex items-center orb-bg overflow-hidden">
      {/* Atmospheric backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,0.18),transparent_46%),radial-gradient(circle_at_85%_78%,rgba(20,184,166,0.18),transparent_38%)]" />

      {/* Hero body illustration */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <Image
          src="/human_body_bg3.png"
          alt="Human body diagnostic background"
          fill
          priority
          className="object-cover object-center opacity-100"
        />
      </div>

      {/* Contrast and readability overlay */}
      <div className="absolute inset-0 z-[2] bg-gradient-to-b sm:bg-gradient-to-r from-black/90 via-black/60 to-transparent pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-16
                      flex items-center">

        <div className="space-y-5 sm:space-y-7 max-w-2xl">
          <div className="pill-badge fade-in-up">
            <Activity className="w-3 h-3" />
            AI-Powered Radiology
          </div>

          <div className="fade-in-up fade-in-up-delay-1">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-[#E5E7EB] flex flex-col items-start text-left">
              <SplitText text="Clear X-Rays." className="block" delay={30} textAlign="left" />
              <SplitText text="Better Learning." className="block" delay={30} textAlign="left" />
              <SplitText text="Stronger Future." className="block text-gradient-split" delay={30} textAlign="left" />
            </h1>
          </div>

          <p className="text-base sm:text-lg text-[#9CA3AF] leading-relaxed max-w-lg fade-in-up fade-in-up-delay-2">
            Our AI removes noise while preserving anatomy, helping the next generation of doctors learn
            with clarity and confidence — without ever hallucinating or altering the underlying human anatomy.
          </p>

          <div className="flex flex-wrap items-center gap-4 fade-in-up fade-in-up-delay-3">
            {["DICOM Support", "Zero-Cloud Privacy", "ICU-Ready"].map((tag) => (
              <span key={tag} className="flex items-center gap-1.5 text-xs sm:text-sm text-[#22D3EE] font-medium">
                <CheckCircle2 className="w-4 h-4" />
                {tag}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 fade-in-up fade-in-up-delay-4">
            <Link href="/denoise">
              <Button id="hero-try-btn" className="btn-purple h-12 w-full sm:w-auto px-8 text-base rounded-full font-semibold gap-2">
                Upload X-Ray
                <Zap className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                id="hero-learn-btn"
                variant="outline"
                className="h-12 w-full sm:w-auto px-8 text-base rounded-full font-semibold gap-2
                           border-emerald-500/60 text-emerald-300 bg-transparent
                           hover:bg-emerald-900/40 hover:border-emerald-300"
              >
                See How It Works
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   STATS BAR
   ============================================ */
function StatsBar() {
  return (
    <section className="py-8 border-y border-[#1a1a1a] bg-black">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="stat-card">
            <div className="text-2xl sm:text-3xl font-extrabold text-gradient mb-1">{s.value}</div>
            <div className="text-xs sm:text-sm text-[#6B7280] font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ============================================
   FEATURES
   ============================================ */
function FeaturesSection() {
  return (
    <section id="features" className="py-14 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 md:px-12">
      <div className="text-center mb-10 sm:mb-16">
        <div className="pill-badge mb-4 mx-auto w-fit">
          <Star className="w-3 h-3" />
          Key Features
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#E5E7EB] mb-3 sm:mb-4">
          Engineering Breakthroughs
        </h2>
        <p className="text-[#9CA3AF] max-w-xl mx-auto text-base sm:text-lg">
          Every feature is purpose-built for clinical reliability in demanding medical environments.
        </p>
      </div>

      <div className="flex justify-center w-full mx-auto">
        <MagicBento 
          cards={features.map((f) => ({
            title: f.title,
            description: f.desc,
            icon: <f.icon className="w-6 h-6" strokeWidth={1.8} />
          }))}
          textAutoHide={false}
          enableStars={true}
          enableSpotlight={true}
          enableBorderGlow={true}
          enableTilt={true}
          enableMagnetism={false}
          clickEffect={true}
          spotlightRadius={400}
          particleCount={12}
          glowColor="37, 99, 235"
          disableAnimations={false}
        />
      </div>
    </section>
  );
}

/* ============================================
   HOW IT WORKS
   ============================================ */
function HowItWorksSection() {
  return (
    <section className="py-14 sm:py-24 bg-black orb-bg">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="text-center mb-10 sm:mb-16">
          <div className="pill-badge mb-4 mx-auto w-fit">
            <Zap className="w-3 h-3" />
            The Pipeline
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#E5E7EB] mb-3 sm:mb-4">
            How Denoise X Works
          </h2>
          <p className="text-[#9CA3AF] max-w-xl mx-auto text-base sm:text-lg">
            A three-stage clinical pipeline that guarantees safety, precision, and speed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
          {techSteps.map((step, i) => (
            <div key={step.step} className="relative">
              {i < techSteps.length - 1 && (
                <div
                  className="hidden md:block absolute top-8 left-[calc(100%-0px)] w-full h-px"
                  style={{
                    background: "linear-gradient(90deg, rgba(37,99,235,0.5), transparent)",
                    zIndex: 0,
                  }}
                />
              )}
              <div className="glass-card glass-card-hover rounded-2xl p-6 sm:p-8 relative z-10">
                <div className="text-4xl sm:text-5xl font-black text-gradient opacity-30 mb-3 sm:mb-4 leading-none">
                  {step.step}
                </div>
                <h3 className="font-bold text-[#E5E7EB] text-lg sm:text-xl mb-2 sm:mb-3">{step.title}</h3>
                <p className="text-[#9CA3AF] text-sm leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================
   CTA
   ============================================ */
function CTASection() {
  return (
    <section className="py-14 sm:py-24 px-4 sm:px-6 md:px-12">
      <div className="max-w-4xl mx-auto text-center">
        <div className="gradient-border p-[1px] rounded-3xl">
          <div className="bg-black rounded-3xl p-8 sm:p-14 relative overflow-hidden">
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
              style={{
                background: "radial-gradient(circle, rgba(37,99,235,0.20) 0%, transparent 70%)",
              }}
            />
            <div className="relative z-10">
              <Badge className="mb-6 bg-[rgba(37,99,235,0.15)] text-[#22D3EE] border-[rgba(37,99,235,0.35)] text-sm px-4 py-1">
                Ready to Enhance?
              </Badge>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-[#E5E7EB] mb-4 sm:mb-6 leading-tight">
                Start enhancing your
                <br />
                <span className="text-gradient">X-rays today</span>
              </h2>
              <p className="text-[#9CA3AF] text-base sm:text-lg mb-8 sm:mb-10 max-w-md mx-auto">
                Upload your first DICOM or PNG file and see the difference Denoise X delivers in seconds.
              </p>
              <Link href="/denoise">
                <Button id="cta-main-btn" className="btn-purple h-12 sm:h-14 w-full sm:w-auto px-10 text-base sm:text-lg rounded-full font-bold gap-2">
                  Try Denoise X Now
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <p className="text-xs text-[#6B7280] mt-6">
                ⚠️ For supplementary clinical decision support only. Always consult a qualified healthcare provider.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================
   FOOTER
   ============================================ */
function Footer() {
  return (
    <footer className="border-t border-[#1a1a1a] py-8 sm:py-10 px-4 sm:px-6 md:px-12 bg-black">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg btn-purple flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[#E5E7EB]">
            Denoise<span className="text-gradient"> X</span>
          </span>
        </div>
        <p className="text-xs sm:text-sm text-[#6B7280] text-center md:text-left">
          © 2026 Denoise X. Built with N2N + U-Net AI. For clinical decision support only.
        </p>
        <div className="flex gap-6 text-sm text-[#6B7280]">
          <Link href="/about" className="hover:text-[#22D3EE] transition-colors">About</Link>
          <Link href="/feedback" className="hover:text-[#22D3EE] transition-colors">Feedback</Link>
        </div>
      </div>
    </footer>
  );
}

/* ============================================
   PAGE
   ============================================ */
export default function HomePage() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <FeaturesSection />
      <div className="section-divider mx-auto max-w-4xl" />
      <HowItWorksSection />
      <CTASection />
      <Footer />
    </>
  );
}
