"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Zap } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/denoise", label: "Use Denoise" },
  { href: "/about", label: "About" },
  { href: "/feedback", label: "Feedback" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    /* Outer wrapper: full-width, fixed, no background — just positions the pill */
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      {/* Floating pill */}
      <nav
        className="pointer-events-auto flex items-center justify-between gap-6 w-full max-w-3xl px-4 py-2.5 rounded-2xl"
        style={{
          background: "rgba(12, 12, 12, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
        }}
      >
        {/* Logo */}
        <Link id="nav-logo" href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ background: "linear-gradient(135deg, #2563EB, #1d4ed8)", boxShadow: "0 2px 10px rgba(37,99,235,0.4)" }}
          >
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-[#E5E7EB]">
            Denoise<span className="text-gradient"> X</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const isActive = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                id={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive ? "text-white" : "text-[#9CA3AF] hover:text-[#E5E7EB]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/signin">
            <button
              id="nav-signin"
              className="text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5"
            >
              Sign In
            </button>
          </Link>
          <Link href="/denoise">
            <button
              id="nav-cta"
              className="text-sm font-semibold px-4 py-1.5 rounded-xl transition-all duration-200 hover:scale-105"
              style={{
                background: "#ffffff",
                color: "#000000",
                boxShadow: "0 2px 8px rgba(255,255,255,0.15)",
              }}
            >
              Get Started
            </button>
          </Link>
        </div>
      </nav>
    </div>
  );
}
