import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, Chrome, ArrowRight, Asterisk, Loader2, AlertCircle, X, Users, Gamepad2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Hero3D } from './Hero3D';

import { useFirebase } from '../contexts/FirebaseContext';
import { SecurityBanner } from './SecurityBanner';

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showBonusField, setShowBonusField] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [refCode, setRefCode] = useState(localStorage.getItem('dgamers_ref') || '');
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref') || params.get('referrer');
    if (ref) {
      setRefCode(ref);
      localStorage.setItem('dgamers_ref', ref);
      setShowBonusField(true);
      setIsLogin(false); // Default to Register mode for referred users
    }
  }, []);

  const { 
    signIn, 
    signUpWithEmail, 
    signInWithEmail, 
    isAuthenticating, 
    authError, 
    clearAuthError 
  } = useFirebase();

  const handleRefCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setRefCode(val);
    if (val) {
      localStorage.setItem('dgamers_ref', val);
    } else {
      localStorage.removeItem('dgamers_ref');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    
    // Professional 2-second logic wait simulation
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSimulating(false);

    if (isLogin) {
      try {
        await signInWithEmail(email, password);
      } catch (err) {
        // Error handled in context
      }
    } else {
      try {
        await signUpWithEmail(email, password, usernameInput);
      } catch (err) {
        // Error handled in context
      }
    }
  };

  const isAnyLoading = isAuthenticating || isSimulating;

  return (
    <div className="min-h-screen flex flex-col bg-dark-bg">
      <SecurityBanner />
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left side: 3D Visual */}
        <div className="hidden lg:flex flex-col items-center justify-center relative bg-dark-bg overflow-hidden border-r border-white/5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,123,255,0.05),transparent_70%)]"></div>
          <div className="absolute top-0 left-0 p-12 z-20">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-12 h-12 bg-zinc-950 border border-white/10 rounded-2xl flex items-center justify-center group-hover:border-primary/50 transition-all">
                <Gamepad2 className="text-primary w-8 h-8" />
              </div>
              <span className="font-display font-black text-4xl tracking-tighter italic text-white uppercase">D<span className="text-primary">GAMERS</span></span>
            </Link>
          </div>
          <div className="w-full h-full relative">
            <Hero3D />
            <div className="absolute inset-0 flex items-center justify-center px-12 select-none pointer-events-none">
              <h1 className="text-massive font-heavy italic tracking-tighter text-white opacity-20 whitespace-nowrap">
                ELITE REWARDS
              </h1>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-12 z-20 bg-gradient-to-t from-dark-bg to-transparent">
            <div className="max-w-sm">
              <h2 className="text-3xl font-black font-display mb-4 italic tracking-tighter uppercase leading-none">THE NEXT ERA OF <span className="text-primary">EARNING</span></h2>
              <p className="text-zinc-500 font-medium leading-relaxed">
                Connect with premium offerwalls, complete high-stakes quests, and withdraw your value instantly in Nigeria.
              </p>
            </div>
          </div>
        </div>

        {/* Right side: Forms */}
        <div className="flex flex-col items-center justify-center p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] -mr-48 -mt-48"></div>
          
          <div className="w-full max-w-md space-y-8 relative z-10">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold font-display italic tracking-tight uppercase tracking-widest">{isLogin ? 'WELCOME BACK' : 'CREATE ACCOUNT'}</h1>
              <p className="text-zinc-500 mt-2 font-medium">Elevate your mobile gaming experience.</p>
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
                    <p className="text-sm text-zinc-400 leading-relaxed font-medium">{authError}</p>
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
                disabled={isAnyLoading}
                className="w-full bg-white text-black py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-transparent shadow-xl shadow-white/5 active:scale-95"
              >
                {isAuthenticating ? (
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
                ) : (
                  <Chrome className="w-5 h-5 text-red-500" />
                )}
                {isAuthenticating ? 'Authorizing Access...' : 'Continue with Google'}
              </button>

              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-dark-bg px-4 text-zinc-500 tracking-[0.3em] font-black italic">Or with secure email</span>
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
                        disabled={isAnyLoading}
                        placeholder="NIGERIA_PLAYER"
                        className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary transition-all text-sm disabled:opacity-50 placeholder:text-zinc-700 font-bold tracking-tight"
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
                      disabled={isAnyLoading}
                      placeholder="player@dgamers.ng"
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary transition-all text-sm disabled:opacity-50 placeholder:text-zinc-700 font-bold tracking-tight"
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
                      disabled={isAnyLoading}
                      placeholder="••••••••"
                      className="w-full bg-zinc-900 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:border-primary transition-all text-sm disabled:opacity-50 placeholder:text-zinc-700"
                    />
                  </div>
                </div>

                {!isLogin && (
                  <div className="pt-4 border-t border-white/5 space-y-4">
                    <div className="flex items-center justify-between px-1">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Referral System</label>
                      <button 
                        type="button"
                        onClick={() => setShowBonusField(!showBonusField)}
                        className="text-[10px] text-primary font-black uppercase tracking-widest hover:underline"
                      >
                        {showBonusField ? 'CANCEL' : 'ADD CODE'}
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {showBonusField && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden space-y-2"
                        >
                          <p className="text-[10px] text-zinc-600 font-medium px-1">Enter your friend's unique ID to unlock elite bonuses and support them.</p>
                          <div className="relative">
                            <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                            <input 
                              type="text" 
                              value={refCode}
                              onChange={handleRefCodeChange}
                              disabled={isAnyLoading}
                              placeholder="ELITE_REFERRAL_ID"
                              className="w-full bg-primary/5 border border-primary/20 rounded-xl py-3 pl-12 pr-4 text-xs focus:outline-none focus:border-primary uppercase font-mono tracking-widest disabled:opacity-50 placeholder:text-zinc-800"
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isAnyLoading}
                  className="glow-button-3d w-full"
                >
                  {isAnyLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'INITIATE LOGIN' : 'CREATE CONTROL ACCOUNT'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              <div className="text-center pt-6">
                 <button 
                  disabled={isAnyLoading}
                  onClick={() => { setIsLogin(!isLogin); clearAuthError(); }}
                  className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors disabled:opacity-50 uppercase tracking-[0.1em] font-bold"
                 >
                   {isLogin ? "New to the hub? " : "Already verified? "}
                   <span className="text-primary">{isLogin ? 'REGISTER' : 'LOGIN'}</span>
                 </button>
              </div>
            </div>

            <div className="pt-12 text-center">
              <div className="flex items-center justify-center gap-6 text-[10px] uppercase font-bold tracking-widest text-blue-500/40">
                <Link to="/coming-soon" className="hover:text-primary transition-colors">Platform Status</Link>
                <Link to="/coming-soon" className="hover:text-primary transition-colors">Risk Policy</Link>
                <Link to="/coming-soon" className="hover:text-primary transition-colors">Regional Support</Link>
              </div>
              <p className="text-[10px] text-blue-500/20 mt-4 uppercase tracking-[0.3em] font-black">© 2026 DGAMERS ELITE REWARDS</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

