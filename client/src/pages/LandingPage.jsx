import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Search,
  Clock,
  Lock,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  Sun,
  Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[#fbfbfd] dark:bg-[#000000] text-[#1d1d1f] dark:text-[#f5f5f7] selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-neutral-900 transition-colors duration-300 overflow-x-hidden">
      {/* Apple-style Top Navigation Bar */}
      <header className="sticky top-0 z-50 h-14 bg-[#fbfbfd]/80 dark:bg-[#000000]/80 backdrop-blur-md border-b border-[#e5e5ea] dark:border-[#262629] transition-colors">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-white">
              LifeVault
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => navigate('/app/dashboard')}
                className="px-4 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-medium text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <span>Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white px-3 py-1.5 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-medium text-xs shadow-sm transition-all"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 pb-20 px-6 max-w-5xl mx-auto text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-200/60 dark:bg-neutral-800/80 text-xs font-medium text-neutral-600 dark:text-neutral-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Intelligence built into your personal vault</span>
        </div>

        <h1 className="text-5xl sm:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.06] max-w-4xl mx-auto">
          Your documents.<br />
          <span className="text-neutral-400 dark:text-neutral-500 font-normal">
            Organized. Intelligent. Secure.
          </span>
        </h1>

        <p className="text-lg sm:text-xl text-neutral-500 dark:text-neutral-400 max-w-2xl mx-auto font-normal leading-relaxed">
          The private digital vault for everything that matters. LifeVault reads, categorizes, tracks deadlines, and searches your life records with zero clutter.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
          <Link
            to={isAuthenticated ? "/app/dashboard" : "/register"}
            className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-medium text-sm flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#visual-tour"
            className="w-full sm:w-auto px-6 py-3.5 rounded-full border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800/80 font-medium text-sm transition-colors"
          >
            See how it works
          </a>
        </div>

        {/* High-Fidelity LifeVault Mock Product Visualization */}
        <div className="mt-16 pt-4">
          <div className="relative mx-auto max-w-4xl rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-neutral-200/50 to-neutral-100/20 dark:from-neutral-800/40 dark:to-neutral-900/10 border border-[#e5e5ea] dark:border-[#262629] shadow-2xl overflow-hidden">
            <div className="rounded-2xl bg-white dark:bg-[#161617] border border-neutral-200/70 dark:border-neutral-800 p-6 sm:p-8 text-left space-y-6">
              {/* Mock Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-neutral-100 dark:border-neutral-800">
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-neutral-900 dark:text-white">
                    Good morning, Alex.
                  </h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                    Your documents are under control.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-medium">
                    24 Vaulted Documents
                  </div>
                  <div className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-medium">
                    1 Expiring Soon
                  </div>
                </div>
              </div>

              {/* Mock Document Rows */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#262629] flex items-center justify-between gap-4 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-700 dark:text-neutral-300">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                        MacBook Pro AppleCare+ Agreement
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        Warranty • Issuer: Apple Inc. • Added 2 days ago
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400">
                      Expires in 28 days
                    </span>
                    <span className="text-xs font-medium text-neutral-400">PDF</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#fbfbfd] dark:bg-[#1c1c1e] border border-[#e5e5ea] dark:border-[#262629] flex items-center justify-between gap-4 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-neutral-200/60 dark:bg-neutral-800 flex items-center justify-center shrink-0 text-neutral-700 dark:text-neutral-300">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white truncate">
                        California Driver's License
                      </p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500">
                        Identity • Issuer: CA DMV • Valid until 2029
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Active
                    </span>
                    <span className="text-xs font-medium text-neutral-400">JPEG</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Storytelling Section 1 */}
      <section id="visual-tour" className="py-24 px-6 border-t border-[#e5e5ea] dark:border-[#262629]">
        <div className="max-w-5xl mx-auto space-y-12 text-center">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Clarity & Structure
            </span>
            <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Everything important,<br />in one place.
            </h2>
            <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Never hunt through email attachments, dusty drawers, or messy cloud folders again. Certificates, policies, receipts, and identification are unified in an effortless library.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-6">
            <div className="bg-white dark:bg-[#161617] p-8 rounded-3xl border border-[#e5e5ea] dark:border-[#262629] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-white">
                <Layers className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Smart Categories
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-normal">
                Organized automatically into Identity, Education, Finance, Insurance, Warranty, and Medical records.
              </p>
            </div>

            <div className="bg-white dark:bg-[#161617] p-8 rounded-3xl border border-[#e5e5ea] dark:border-[#262629] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-white">
                <Clock className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Proactive Timelines
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-normal">
                Deadlines, renewals, and expiration dates are brought forward before surprise expirations happen.
              </p>
            </div>

            <div className="bg-white dark:bg-[#161617] p-8 rounded-3xl border border-[#e5e5ea] dark:border-[#262629] space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-800 dark:text-white">
                <Lock className="w-5 h-5 stroke-[2]" />
              </div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">
                Zero Cloud Clutter
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-normal">
                No complex folder nests. A streamlined single pane with instant filtering and search across all files.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Storytelling Section 2 */}
      <section className="py-24 px-6 bg-neutral-100/60 dark:bg-[#111112] border-t border-[#e5e5ea] dark:border-[#262629]">
        <div className="max-w-5xl mx-auto space-y-12 text-center">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              LifeVault Intelligence
            </span>
            <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Your documents<br />understand themselves.
            </h2>
            <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Powered by advanced Gemini AI and high-precision OCR. As soon as a document is uploaded, LifeVault extracts issuers, expiration dates, summaries, and key numbers behind the scenes.
            </p>
          </div>

          <div className="bg-white dark:bg-[#161617] rounded-3xl p-8 sm:p-12 border border-[#e5e5ea] dark:border-[#262629] text-left max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-2 text-xs font-medium text-neutral-500">
              <Sparkles className="w-4 h-4 text-neutral-900 dark:text-white" />
              <span>LifeVault Intelligence Extraction</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-white">
                Automatic Document Summaries
              </h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed">
                "Official Comprehensive Health Insurance Policy issued by BlueCross BlueShield. Policy #948201. Annual deductible $1,500. Coverage active through December 31, 2026."
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-neutral-100 dark:border-neutral-800 text-xs">
              <div>
                <span className="text-neutral-400 block">Issuer</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">BlueCross</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Category</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">Insurance</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Expiry Date</span>
                <span className="font-medium text-neutral-800 dark:text-neutral-200">Dec 31, 2026</span>
              </div>
              <div>
                <span className="text-neutral-400 block">Confidence</span>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">98% Verified</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Storytelling Section 3 */}
      <section className="py-24 px-6 border-t border-[#e5e5ea] dark:border-[#262629]">
        <div className="max-w-5xl mx-auto space-y-12 text-center">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Proactive Deadlines
            </span>
            <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Never miss an expiry.
            </h2>
            <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Track warranties before manufacturer coverage lapses. Renew passports and licenses comfortably in advance with scheduled alerts.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629] space-y-2">
              <span className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Within 7 Days
              </span>
              <h4 className="font-semibold text-neutral-900 dark:text-white">Urgent Renewals</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Highlights immediate expiring documents so you never lose coverage or incur late penalties.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629] space-y-2">
              <span className="text-xs font-medium text-neutral-600 dark:text-neutral-300 uppercase tracking-wide">
                Within 30 Days
              </span>
              <h4 className="font-semibold text-neutral-900 dark:text-white">Upcoming Deadlines</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Comfortable planning horizon for warranty claims, lease agreements, and vehicle registrations.
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629] space-y-2">
              <span className="text-xs font-medium text-neutral-400 uppercase tracking-wide">
                Scheduled Alerts
              </span>
              <h4 className="font-semibold text-neutral-900 dark:text-white">Custom Reminders</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Set custom reminder dates on any document with personal notes and notifications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Storytelling Section 4 */}
      <section className="py-24 px-6 bg-neutral-100/60 dark:bg-[#111112] border-t border-[#e5e5ea] dark:border-[#262629]">
        <div className="max-w-5xl mx-auto space-y-12 text-center">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Instant Retrieval
            </span>
            <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Search like you remember.
            </h2>
            <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Don't remember the exact filename? Search for "Samsung warranty", "Stanford degree", "Amazon receipt", or keywords buried inside the document body.
            </p>
          </div>

          {/* Natural Search Visual Demo */}
          <div className="max-w-2xl mx-auto bg-white dark:bg-[#161617] rounded-3xl p-6 sm:p-8 border border-[#e5e5ea] dark:border-[#262629] shadow-sm space-y-5 text-left">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                readOnly
                value="Samsung warranty"
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-medium text-sm border border-neutral-200 dark:border-neutral-700"
              />
            </div>

            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-900 dark:text-white">
                  Samsung 65" OLED TV Warranty Card.pdf
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">
                  Matches OCR content
                </span>
              </div>
              <p className="text-xs text-neutral-500">
                Matched issuer "Samsung Electronics" and extracted text "...valid for 24 months from purchase date..."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Storytelling Section 5 */}
      <section className="py-24 px-6 border-t border-[#e5e5ea] dark:border-[#262629]">
        <div className="max-w-5xl mx-auto space-y-8 text-center">
          <div className="space-y-4 max-w-2xl mx-auto">
            <span className="text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
              Security
            </span>
            <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-white">
              Private by design.
            </h2>
            <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 leading-relaxed">
              Every document is strictly isolated per authenticated user account. Files are validated for genuine binary magic bytes, preventing spoofing and ensuring full zero-knowledge integrity.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left max-w-3xl mx-auto pt-4">
            <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629] space-y-2">
              <h4 className="font-semibold text-neutral-900 dark:text-white">Strict Multi-Tenant Isolation</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Queries are scoped to your authenticated account ID at the database driver level. No cross-user access is possible.
              </p>
            </div>
            <div className="p-6 rounded-3xl bg-neutral-50 dark:bg-[#161617] border border-[#e5e5ea] dark:border-[#262629] space-y-2">
              <h4 className="font-semibold text-neutral-900 dark:text-white">Magic-Byte Signature Inspection</h4>
              <p className="text-xs text-neutral-500 leading-relaxed">
                Every uploaded file is inspected at the binary level, rejecting fake extensions and malicious payload masquerading.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-28 px-6 text-center border-t border-[#e5e5ea] dark:border-[#262629] bg-neutral-50/50 dark:bg-[#0d0d0e]">
        <div className="max-w-3xl mx-auto space-y-8">
          <h2 className="text-4xl sm:text-6xl font-semibold tracking-tight text-neutral-900 dark:text-white">
            Your life, organized.
          </h2>
          <p className="text-base sm:text-lg text-neutral-500 dark:text-neutral-400 font-normal">
            Take two minutes to vault your first document. Experience clarity, calm, and intelligent organization.
          </p>
          <div className="pt-2">
            <Link
              to={isAuthenticated ? "/app/dashboard" : "/register"}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-neutral-900 hover:bg-neutral-800 dark:bg-white dark:hover:bg-neutral-100 text-white dark:text-neutral-950 font-medium text-sm shadow-sm transition-transform hover:scale-105 active:scale-95"
            >
              <span>Get Started with LifeVault</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Apple-style Minimal Footer */}
      <footer className="py-8 px-6 border-t border-[#e5e5ea] dark:border-[#262629] text-xs text-neutral-400 dark:text-neutral-600">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>Copyright © {new Date().getFullYear()} LifeVault Inc. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <Link to="/login" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-neutral-900 dark:hover:text-white transition-colors">
              Create Account
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
