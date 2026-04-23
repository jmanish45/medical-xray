"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Zap, LogOut, GraduationCap, Menu, X, UserCircle2 } from "lucide-react";
import { isAuthenticated, getToken, signOut } from "@/lib/auth";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/denoise", label: "Use Denoise" },
  { href: "/about", label: "About" },
  { href: "/feedback", label: "Feedback" },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [authed, setAuthed] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated()) {
      setAuthed(true);
      const stored =
        typeof window !== "undefined"
          ? localStorage.getItem("denoisex_name")
          : null;
      setDisplayName(stored || "Doctor");
    } else {
      setAuthed(false);
      setDisplayName("");
    }
  }, [pathname]);

  function handleSignOut() {
    signOut();
    if (typeof window !== "undefined") {
      localStorage.removeItem("denoisex_name");
    }
    setAuthed(false);
    setDisplayName("");
    router.push("/");
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-4 pointer-events-none">
      <nav
        className="pointer-events-auto flex items-center justify-between gap-6 w-full max-w-3xl px-4 py-2.5 rounded-2xl"
        style={{
          background: "rgba(12, 12, 12, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow:
            "0 4px 24px rgba(0, 0, 0, 0.5), 0 1px 0 rgba(255,255,255,0.04) inset",
        }}
      >
        {/* Logo */}
        <Link
          id="nav-logo"
          href="/"
          className="flex items-center gap-2 group flex-shrink-0"
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
            style={{
              background: "linear-gradient(135deg, #2563EB, #1d4ed8)",
              boxShadow: "0 2px 10px rgba(37,99,235,0.4)",
            }}
          >
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-[#E5E7EB]">
            Denoise<span className="text-gradient"> X</span>
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                id={`nav-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                href={link.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "text-white"
                    : "text-[#9CA3AF] hover:text-[#E5E7EB]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Auth CTA */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {authed ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border border-[#1a2744] bg-[#1a2744]/40">
                <GraduationCap className="w-3.5 h-3.5 text-[#22D3EE]" />
                <span className="text-sm font-medium text-[#E5E7EB] max-w-[100px] truncate">
                  {displayName}
                </span>
              </div>
              <button
                id="nav-signout"
                onClick={handleSignOut}
                title="Sign Out"
                className="flex items-center gap-1.5 text-sm font-medium text-[#9CA3AF] hover:text-red-400 transition-colors px-3 py-1.5 rounded-xl hover:bg-red-900/20"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <>
              <Link href="/signin">
                <button
                  id="nav-signin"
                  className="text-sm font-medium text-[#9CA3AF] hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5"
                >
                  Sign In
                </button>
              </Link>
              <Link href="/signup">
                <button
                  id="nav-signup"
                  className="text-sm font-semibold px-4 py-1.5 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{
                    background: "#ffffff",
                    color: "#000000",
                    boxShadow: "0 2px 8px rgba(255,255,255,0.15)",
                  }}
                >
                  Sign Up
                </button>
              </Link>
            </>
          )}

          {/* Mobile hamburger */}
          <button
            className="md:hidden ml-1 text-[#9CA3AF] hover:text-white p-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="absolute top-[60px] left-4 right-4 pointer-events-auto rounded-2xl p-4 flex flex-col gap-2 md:hidden"
          style={{
            background: "rgba(12,12,12,0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          }}
        >
          {NAV_LINKS.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#1a2744] text-white"
                    : "text-[#9CA3AF] hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="border-t border-[#1a1a1a] mt-1 pt-2">
            {authed ? (
              <button
                onClick={() => {
                  handleSignOut();
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-900/20 flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({displayName})
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  href="/signin"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#9CA3AF] hover:bg-white/5 flex items-center gap-2"
                >
                  <UserCircle2 className="w-4 h-4" /> Sign In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMenuOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-black flex items-center gap-2 justify-center"
                >
                  <GraduationCap className="w-4 h-4" /> Create Account
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
