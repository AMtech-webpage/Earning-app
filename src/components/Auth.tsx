import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Chrome, ArrowRight, Asterisk, Loader2, AlertCircle, X, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Hero3D } from './Hero3D';

import { useFirebase } from '../contexts/FirebaseContext';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showBonusField, setShowBonusField] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [refCode, setRefCode] = useState('');

  const { 
    signIn, 
    signUpWithEmail, 
    signInWithEmail, 
    isAuthenticating, 
    authError, 
    clearAuthError 
  } = useFirebase();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      try {
        await signInWithEmail(email, password);
      } catch (err) {
        // Error handled in context
      }
    } else {
      try {
        if (refCode) localStorage.setItem('dgamers_ref', refCode);
        await signUpWithEmail(email, password, usernameInput);
      } catch (err) {
        // Error handled in context
      }
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-dark-bg">
      {/* Left side: 3D Visual */}
      <div className="hidden lg:flex flex-col items-center justify-center relative bg-gradient-to-br from-black to-zinc-900 overflow-hidden border-r border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,123,255,0.1),transparent_70%)]"></div>
        <div className="w-full h-[600px] relative">
          <Hero3D />
        </div>
        <div className="relative z-10 text-center px-12">
          <h2 className="text-4xl font-bold font-display mb-4 italic tracking-tighter">D<span className="text-primary">GAMERS</span> ELITE</h2>
          <p className="text-zinc-500 max-w-sm mx-auto">
            Join the most professional GPT platform in the gaming industry. 
            Secure, fast, and high-paying.
          </p>
        </div>
      </div>

      {/* Right side: Forms */}
      <div className="flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -mr-48 -mt-48"></div>
        
        <div className="w-full max-w-md space-y-8 relative z-10">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-bold font-display italic tracking-tight">{isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}</h1>
            <p className="text-zinc-500 mt-2">Start earning from your favorite games today.</p>
          </div>

          <AnimatePresence>
            {authError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 relative"
              >
                <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Authentication Error</p>
                  <p className="text-sm text-zinc-400 leading-relaxed">{authError}</p>
                </div>
                <button 
                  onClick={clearAuthError}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <button 
              onClick={signIn}
              disabled={isAuthenticating}
              className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-transparent shadow-xl shadow-white/5 active:scale-95"
            >
              {isAuthenticating ? (
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              ) : (
                <Chrome className="w-5 h-5 text-red-500" />
              )}
              {isAuthenticating ? 'Authenticating...' : 'Continue with Google'}
            </button>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase">
                <span className="bg-dark-bg px-4 text-zinc-500 tracking-[0.3em] font-black">Or with email</span>
              </div>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {!isLogin && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">Display Username</label>
                  <div className="relative">
                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      type="text" 
                      required
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      disabled={isAuthenticating}
                      placeholder="Gamer1337"
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary transition-all text-sm disabled:opacity-50 placeholder:text-zinc-700"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isAuthenticating}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary transition-all text-sm disabled:opacity-50 placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-1">Password</label>
                <div className="relative">
                  <Asterisk className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input 
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isAuthenticating}
                    placeholder="••••••••"
                    className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary transition-all text-sm disabled:opacity-50 placeholder:text-zinc-700"
                  />
                </div>
              </div>

              {!isLogin && (
                <div className="pt-2">
                   <button 
                    type="button"
                    disabled={isAuthenticating}
                    onClick={() => setShowBonusField(!showBonusField)}
                    className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest hover:text-primary transition-colors disabled:opacity-50"
                   >
                     {showBonusField ? '- Hide Referral' : '+ Referral Code?'}
                   </button>
                   <AnimatePresence>
                    {showBonusField && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-2"
                      >
                        <input 
                          type="text" 
                          value={refCode}
                          onChange={(e) => setRefCode(e.target.value)}
                          disabled={isAuthenticating}
                          placeholder="ENTER_REFERRAL_CODE"
                          className="w-full bg-primary/5 border border-primary/20 rounded-xl py-2.5 px-4 text-xs focus:outline-none focus:border-primary uppercase font-mono tracking-widest disabled:opacity-50 placeholder:text-zinc-800"
                        />
                      </motion.div>
                    )}
                   </AnimatePresence>
                </div>
              )}

              <button 
                type="submit"
                disabled={isAuthenticating}
                className="w-full bg-primary py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary/90 disabled:opacity-50 transition-all shadow-xl shadow-primary/20 text-white active:scale-95 text-sm uppercase tracking-widest"
              >
                {isAuthenticating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Login To Dashboard' : 'Create My Account'}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-6">
               <button 
                disabled={isAuthenticating}
                onClick={() => { setIsLogin(!isLogin); clearAuthError(); }}
                className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors disabled:opacity-50 uppercase tracking-[0.1em] font-bold"
               >
                 {isLogin ? "Don't have an account? " : "Already have an account? "}
                 <span className="text-primary">{isLogin ? 'SIGN UP' : 'LOGIN'}</span>
               </button>
            </div>
          </div>

          <div className="pt-12 text-center">
            <div className="flex items-center justify-center gap-6 text-[10px] uppercase font-bold tracking-widest text-zinc-700">
              <Link to="/legal" className="hover:text-zinc-500">Terms</Link>
              <Link to="/legal" className="hover:text-zinc-500">Privacy</Link>
              <Link to="/legal" className="hover:text-zinc-500">Support</Link>
            </div>
            <p className="text-[10px] text-zinc-800 mt-4 uppercase tracking-[0.3em] font-black">© 2026 Dgamers</p>
          </div>
        </div>
      </div>
    </div>
  );
};

