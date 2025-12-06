"use client";

import Link from "next/link";
import { Sparkles, Loader2, Mail, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Error logging in with Google. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Dummy User Logic
    if (email === "demo@example.com" && password === "demo123") {
      // Simulate login delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push("/dashboard");
      return;
    }

    try {
      const supabase = getSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.push("/dashboard");
    } catch (error) {
      console.error('Error logging in:', error);
      alert('Invalid login credentials.');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-secondary relative overflow-hidden font-sans selection:bg-primary selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-primary/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-accent/10 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row min-h-screen">
        {/* Hero Section (Left) */}
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
              Masuk sekarang dan biarkan AI membantu bisnismu tumbuh lebih cepat.
            </p>
          </motion.div>
        </section>

        {/* Login Form (Right) */}
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 200, delay: 0.2 }}
          className="bg-background rounded-t-[2.5rem] lg:rounded-l-[3rem] lg:rounded-tr-none shadow-[0_-10px_40px_rgba(0,0,0,0.2)] min-h-[60vh] lg:min-h-screen lg:w-[50vw] p-6 md:p-10 lg:p-16 pb-12 flex flex-col justify-center"
        >
          <div className="max-w-md mx-auto w-full space-y-8">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl font-bold text-secondary mb-2">Selamat Datang Kembali</h2>
              <p className="text-secondary/60">Masuk ke akun LarisManis kamu.</p>
            </div>

            <div className="space-y-4">
              {/* Google Login */}
              <button
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 border border-gray-200 rounded-xl hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group bg-white text-secondary font-medium"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                )}
                <span>Masuk dengan Google</span>
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">atau dengan email</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Email Login Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary/80">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nama@email.com"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium text-secondary/80">Password</label>
                    <a href="#" className="text-xs text-primary hover:underline">Lupa password?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-primary text-white font-medium py-3.5 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      Masuk
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="text-center text-sm text-secondary/60">
              Belum punya akun?{' '}
              <Link href="/register" className="text-primary font-medium hover:underline">
                Daftar sekarang
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
