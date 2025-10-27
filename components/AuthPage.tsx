import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AuthPageProps {
  onSuccess?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (!displayName.trim()) {
          throw new Error('لطفاً نام نمایشی خود را وارد کنید');
        }
        await signUp(email, password, displayName);
      }
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'خطایی رخ داد. لطفاً دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-700/50 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎲</div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-teal-400 mb-2">
              {isLogin ? 'ورود' : 'ثبت‌نام'}
            </h1>
            <p className="text-gray-400">
              {isLogin ? 'به سیستم پیش‌بینی خوش آمدید' : 'حساب کاربری جدید بسازید'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">
                  نام نمایشی
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full bg-slate-900 text-white p-3 rounded-lg border-2 border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="نام خود را وارد کنید"
                  required={!isLogin}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                ایمیل
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 text-white p-3 rounded-lg border-2 border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                رمز عبور
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 text-white p-3 rounded-lg border-2 border-slate-600 focus:border-blue-500 focus:outline-none transition-colors"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-900 disabled:to-blue-900 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-lg shadow-lg hover:shadow-blue-500/50 transform hover:-translate-y-1 transition-all duration-300 ease-in-out focus:outline-none focus:ring-4 focus:ring-blue-300/50"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>در حال پردازش...</span>
                </div>
              ) : (
                <span>{isLogin ? '🔓 ورود' : '✨ ثبت‌نام'}</span>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              {isLogin ? 'حساب کاربری ندارید؟ ثبت‌نام کنید' : 'قبلاً ثبت‌نام کرده‌اید؟ وارد شوید'}
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-gray-500 text-sm">
          <p>با ثبت‌نام، پیش‌بینی‌های خود را ثبت کنید و در لیدربورد شرکت کنید</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
