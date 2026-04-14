import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { authService } from '@/src/services/authService';
import { toast } from 'sonner';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const user = await authService.login(email);
      toast.success('Logged in successfully!');
      if (user.role === 'owner') {
        navigate('/owner');
      } else {
        navigate('/');
      }
    } catch (error) {
      toast.error('Login failed.');
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 shadow-xl"
      >
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900">{t('login')}</h1>
          <p className="mt-2 text-neutral-500">Welcome back to Qareeb</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-4 pl-12 pr-4 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-4 pl-12 pr-4 text-sm focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 py-4 font-bold text-white transition-colors hover:bg-primary-700"
          >
            {t('login')}
            <ArrowRight className="h-5 w-5" />
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-neutral-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-bold text-primary-600 hover:underline">
            {t('register')}
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
