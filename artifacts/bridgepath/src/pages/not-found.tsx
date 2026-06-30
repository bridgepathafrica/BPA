import { Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const CORAL = "#C8461A";
const NAVY  = "#0C1A33";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FEF9F4" }}>
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-5 py-24">
        <div className="max-w-2xl w-full text-center">

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          >
            <span
              className="block text-[9rem] sm:text-[12rem] font-extrabold leading-none select-none"
              style={{
                fontFamily: "var(--app-font-display)",
                color: CORAL,
                opacity: 0.18,
              }}
            >
              404
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="-mt-12 sm:-mt-16"
          >
            <h1
              className="text-3xl sm:text-4xl font-bold mb-4"
              style={{ fontFamily: "var(--app-font-display)", color: NAVY }}
            >
              Page not found
            </h1>
            <p className="text-[#7A6A5A] text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed">
              The page you're looking for doesn't exist or may have been moved. Let's get you back on track.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white text-sm"
                  style={{ backgroundColor: CORAL, boxShadow: "0 4px 20px rgba(200,70,26,0.35)", fontFamily: "var(--app-font-display)" }}
                >
                  <ArrowLeft className="h-4 w-4" /> Back to home
                </motion.button>
              </Link>
              <Link href="/jobs">
                <motion.button
                  whileHover={{ scale: 1.04, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-sm border-2"
                  style={{ borderColor: NAVY, color: NAVY, fontFamily: "var(--app-font-display)" }}
                >
                  <Search className="h-4 w-4" /> Browse jobs
                </motion.button>
              </Link>
            </div>

            <div className="mt-14 pt-8 border-t border-[#E0D4C4]">
              <p className="text-xs font-bold uppercase tracking-widest text-[#7A6A5A] mb-5">You might be looking for</p>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { label: "Job listings", href: "/jobs" },
                  { label: "HR services", href: "/services" },
                  { label: "About us", href: "/about" },
                  { label: "Contact", href: "/contact" },
                  { label: "Developers", href: "/developers" },
                  { label: "Sign in", href: "/auth/login" },
                ].map((link) => (
                  <Link key={link.href} href={link.href}>
                    <span
                      className="px-4 py-2 rounded-full text-sm font-semibold border border-[#E0D4C4] hover:border-[#C8461A] hover:text-[#C8461A] transition-colors cursor-pointer inline-block"
                      style={{ color: "#4A3A2A" }}
                    >
                      {link.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
