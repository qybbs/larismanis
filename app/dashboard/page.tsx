"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Calendar, MessageSquare, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function Dashboard() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <main className="min-h-screen bg-secondary relative overflow-hidden font-sans selection:bg-primary selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-accent/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col justify-center px-6 pt-12 pb-8 lg:p-20 text-white lg:max-w-[50vw]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 max-w-lg w-full"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/10 backdrop-blur-md w-fit">
              <Sparkles className="w-3 h-3 text-accent" />
              <span className="text-xs font-medium text-accent">AI Marketing Assistant</span>
            </div>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9]">
              Laris<span className="text-primary italic">Manis</span>
            </h1>

            <p className="text-lg md:text-xl text-white/70 leading-relaxed max-w-md">
              Asisten digital instan buat usahamu makin cuan. <span className="text-white font-medium">Gak pake ribet.</span>
            </p>

            <div className="hidden lg:flex gap-4 pt-4">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-secondary bg-gray-300" />
                ))}
              </div>
              <p className="text-sm text-white/50 self-center">Dipercaya 1000+ UMKM</p>
            </div>
          </motion.div>
        </section>

        {/* Tools Menu Sheet */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.2 }}
          className="bg-background rounded-t-[2.5rem] lg:rounded-l-[3rem] lg:rounded-tr-none shadow-[0_-10px_40px_rgba(0,0,0,0.2)] min-h-[60vh] lg:min-h-screen lg:w-[50vw] p-6 md:p-10 lg:p-16 pb-12 flex flex-col justify-center"
        >
          <div className="max-w-xl mx-auto space-y-8 w-full">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold text-secondary">Tools Sakti</h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-secondary/40 bg-secondary/5 px-3 py-1 rounded-full">v1.0</span>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid gap-4">
              {/* Feature A: Magic Content */}
              <Link href="/generate" className="group">
                <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center gap-5 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-primary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150" />

                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Sparkles className="w-7 h-7 md:w-8 md:h-8" />
                  </div>

                  <div className="flex-1 z-10">
                    <h3 className="text-lg md:text-xl font-bold text-secondary leading-tight mb-1">Magic Content</h3>
                    <p className="text-xs md:text-sm text-secondary/60 line-clamp-2">Bikin poster iklan & caption otomatis dari foto.</p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              {/* Feature B: Campaign Planner */}
              <Link href="/plan" className="group">
                <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center gap-5 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-accent/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150" />

                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-accent/10 flex items-center justify-center text-amber-600 group-hover:bg-accent group-hover:text-black transition-colors">
                    <Calendar className="w-7 h-7 md:w-8 md:h-8" />
                  </div>

                  <div className="flex-1 z-10">
                    <h3 className="text-lg md:text-xl font-bold text-secondary leading-tight mb-1">Campaign Planner</h3>
                    <p className="text-xs md:text-sm text-secondary/60 line-clamp-2">Jadwal konten mingguan instan anti pusing.</p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-accent group-hover:text-black transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>

              {/* Feature C: Consultant */}
              <Link href="/consult" className="group">
                <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 flex items-center gap-5 relative overflow-hidden">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-secondary/5 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-150" />

                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                    <MessageSquare className="w-7 h-7 md:w-8 md:h-8" />
                  </div>

                  <div className="flex-1 z-10">
                    <h3 className="text-lg md:text-xl font-bold text-secondary leading-tight mb-1">Consultant</h3>
                    <p className="text-xs md:text-sm text-secondary/60 line-clamp-2">Curhat strategi bisnis & dapat solusi jitu.</p>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-secondary group-hover:text-white transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </div>

            <footer className="pt-8 text-center lg:text-left">
              <p className="text-xs text-secondary/30 font-medium">&copy; {new Date().getFullYear()} LarisManis. Growth Green Theme.</p>
            </footer>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
