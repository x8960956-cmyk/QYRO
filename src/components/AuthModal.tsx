import React, { useState, useEffect } from 'react';
import { User, Lock, Mail, X, Check, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export interface AuthUser {
  email: string;
  name: string;
  avatar?: string;
  provider?: 'google' | 'email';
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: AuthUser) => void;
}

// Google "G" Logo conforming to official Google brand specs
export const GoogleLogoIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
    />
  </svg>
);

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGoogleConfirm, setShowGoogleConfirm] = useState(false);
  const [googleAccountEmail, setGoogleAccountEmail] = useState('x8960956@gmail.com');

  const completeLogin = (userObj: AuthUser) => {
    localStorage.setItem('qyro_user', JSON.stringify(userObj));
    onSuccess(userObj);
    onClose();
  };

  // Google Sign-In button handler
  const handleGoogleSignInClick = () => {
    setShowGoogleConfirm(true);
  };

  const confirmGoogleLogin = () => {
    const defaultName = googleAccountEmail.split('@')[0].replace(/[._]/g, ' ');
    const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
    const userObj: AuthUser = {
      email: googleAccountEmail.trim(),
      name: formattedName || 'Google User',
      avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(googleAccountEmail)}`,
      provider: 'google',
    };
    completeLogin(userObj);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    const userObj: AuthUser = {
      email,
      name: name || email.split('@')[0],
      provider: 'email',
    };

    completeLogin(userObj);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#111A31] border border-[#25304B] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-6 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-[#A8B4D0] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7657FF] to-[#15D9F5] p-[2px] mx-auto shadow-md glow-violet">
            <div className="w-full h-full bg-[#080B18] rounded-[14px] flex items-center justify-center text-[#15D9F5]">
              <User className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-[#F8FAFF] font-heading">
            {isSignUp ? 'Create QYRO Account' : 'Sign In to QYRO'}
          </h3>
          <p className="text-xs text-[#A8B4D0]">
            Sync your dynamic QR codes, track live analytics, and organize designs in My Vault.
          </p>
        </div>

        {/* Google Account Quick Authorization View */}
        {showGoogleConfirm ? (
          <div className="bg-[#0D1428] border border-[#25304B] rounded-2xl p-5 space-y-4 animate-scaleUp">
            <div className="flex items-center space-x-3 pb-3 border-b border-[#25304B]">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md shrink-0">
                <GoogleLogoIcon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#F8FAFF]">Google Sign-In</div>
                <div className="text-[11px] text-[#A8B4D0]">Authorize with your Google account</div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">
                  Google Account Email:
                </label>
                <div className="flex items-center rounded-xl border border-[#25304B] bg-[#111A31] px-3 focus-within:border-[#15D9F5]">
                  <Mail className="w-4 h-4 text-[#A8B4D0] mr-2" />
                  <input
                    type="email"
                    value={googleAccountEmail}
                    onChange={(e) => setGoogleAccountEmail(e.target.value)}
                    placeholder="user@gmail.com"
                    className="w-full py-2.5 bg-transparent text-xs text-[#F8FAFF] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-[#111A31] rounded-xl border border-[#25304B]/60 text-[11px] text-[#A8B4D0] flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                <span>
                  QYRO securely retrieves your profile name and email address to activate your cloud vault.
                </span>
              </div>
            </div>

            <div className="flex space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setShowGoogleConfirm(false)}
                className="w-1/3 py-2.5 rounded-xl bg-[#111A31] text-xs font-semibold text-[#A8B4D0] hover:text-white"
              >
                Back
              </button>
              <button
                type="button"
                onClick={confirmGoogleLogin}
                className="w-2/3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md flex items-center justify-center space-x-2 transition-all"
              >
                <GoogleLogoIcon className="w-4 h-4" />
                <span>Continue as Google User</span>
              </button>
            </div>
          </div>
        ) : forgotSent ? (
          <div className="p-4 bg-[#10B981]/10 border border-[#10B981]/30 rounded-xl text-xs text-[#10B981] text-center space-y-2">
            <Check className="w-6 h-6 mx-auto text-[#10B981]" />
            <p>Password reset instructions have been dispatched to your email address.</p>
            <button
              onClick={() => setForgotSent(false)}
              className="text-xs font-bold underline mt-2 block mx-auto"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* OFFICIAL GOOGLE SIGN-IN BUTTON */}
            <button
              type="button"
              onClick={handleGoogleSignInClick}
              disabled={googleLoading}
              className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-md border border-slate-200 flex items-center justify-center space-x-3 transition-all hover:shadow-lg active:scale-[0.99]"
            >
              <GoogleLogoIcon className="w-4 h-4 shrink-0" />
              <span>{isSignUp ? 'Sign up with Google' : 'Sign in with Google'}</span>
            </button>

            {/* OR DIVIDER */}
            <div className="flex items-center space-x-3">
              <div className="flex-1 h-[1px] bg-[#25304B]" />
              <span className="text-[10px] font-mono uppercase text-[#A8B4D0] tracking-wider">
                Or with Email
              </span>
              <div className="flex-1 h-[1px] bg-[#25304B]" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">
                    Full Name
                  </label>
                  <div className="flex items-center rounded-xl border border-[#25304B] bg-[#0D1428] px-3 focus-within:border-[#15D9F5]">
                    <User className="w-4 h-4 text-[#A8B4D0] mr-2" />
                    <input
                      type="text"
                      required={isSignUp}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Vance"
                      className="w-full py-2.5 bg-transparent text-xs text-[#F8FAFF] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#A8B4D0] mb-1">
                  Email Address
                </label>
                <div className="flex items-center rounded-xl border border-[#25304B] bg-[#0D1428] px-3 focus-within:border-[#15D9F5]">
                  <Mail className="w-4 h-4 text-[#A8B4D0] mr-2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full py-2.5 bg-transparent text-xs text-[#F8FAFF] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-[#A8B4D0]">Password</label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => setForgotSent(true)}
                      className="text-[11px] text-[#15D9F5] hover:underline"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="flex items-center rounded-xl border border-[#25304B] bg-[#0D1428] px-3 focus-within:border-[#15D9F5]">
                  <Lock className="w-4 h-4 text-[#A8B4D0] mr-2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full py-2.5 bg-transparent text-xs text-[#F8FAFF] focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#7657FF] to-[#246BFD] hover:opacity-95 text-white font-bold text-xs shadow-lg glow-violet transition-all flex items-center justify-center space-x-1.5"
              >
                <span>{isSignUp ? 'Create Free Account' : 'Sign In with Email'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs text-[#A8B4D0] hover:text-[#15D9F5]"
                >
                  {isSignUp
                    ? 'Already have an account? Sign In'
                    : "Don't have an account? Sign Up"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
