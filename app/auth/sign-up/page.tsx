'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          // No email redirect needed since we disable email confirmation
        },
      });

      if (signUpError) throw signUpError;

      if (data.user) {
        // Session created, redirect to studio
        router.push('/studio');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1410] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-[#e8e4dd] text-3xl font-bold mb-2">Clar1ty</h1>
          <p className="text-[#8b8278]">Create your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-[#8b8278] text-sm mb-2">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-[#2d2620] border border-[#3a3530] rounded-lg text-[#e8e4dd] placeholder-[#6b6158] focus:outline-none focus:border-[#d4a574]"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-[#8b8278] text-sm mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 bg-[#2d2620] border border-[#3a3530] rounded-lg text-[#e8e4dd] placeholder-[#6b6158] focus:outline-none focus:border-[#d4a574]"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-[#8b8278] text-sm mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-[#2d2620] border border-[#3a3530] rounded-lg text-[#e8e4dd] placeholder-[#6b6158] focus:outline-none focus:border-[#d4a574]"
              required
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#d4a574] hover:bg-[#e8c4a0] disabled:opacity-50 text-[#1a1410] font-semibold rounded-lg transition-colors"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-[#8b8278]">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-[#d4a574] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
