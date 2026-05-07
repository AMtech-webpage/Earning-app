import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Gamepad2, 
  Wallet, 
  Trophy as TrophyIcon, 
  BookOpen, 
  Settings, 
  LayoutDashboard, 
  CheckCircle2, 
  Search, 
  Bell,
  Menu,
  X,
  CreditCard,
  Bitcoin,
  ChevronRight,
  TrendingUp,
  Clock,
  History,
  MousePointer2,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Gift,
  Users,
  Copy,
  Zap,
  Tag,
  Headphones,
  MessageSquare,
  Send,
  Mail,
  ArrowRight,
  ShieldAlert,
  Phone,
  AlertCircle,
  Lock
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Hero3D } from './components/Hero3D';
import { AuthPage } from './components/Auth';
import { SecurityBanner } from './components/SecurityBanner';
import { ComingSoon } from './components/ComingSoon';
import { collection, query, orderBy, onSnapshot, where, doc, getDocFromServer } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';

import { useFirebase } from './contexts/FirebaseContext';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const getFlagEmoji = (countryName: string) => {
  const flags: Record<string, string> = {
    'Nigeria': '🇳🇬',
    'USA': '🇺🇸',
    'United Kingdom': '🇬🇧',
    'UK': '🇬🇧',
    'Germany': '🇩🇪',
    'China': '🇨🇳',
    'Japan': '🇯🇵',
    'Canada': '🇨🇦',
    'South Africa': '🇿🇦',
    'Ghana': '🇬🇭',
  };
  return flags[countryName] || '🌐';
};

// CRITICAL: Validate connection to Firestore as per security guidelines
const testConnection = async () => {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('offline')) {
      console.error("Firebase connection check: Client appears to be offline or configured incorrectly.");
    }
  }
};
testConnection();

const Sidebar = ({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean, setMobileOpen?: (open: boolean) => void }) => {
  const location = useLocation();
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Gamepad2, label: 'Play to Earn', path: '/earn' },
    { icon: History, label: 'Activity', path: '/transactions' },
    { icon: TrophyIcon, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Users, label: 'Referrals', path: '/referrals', badge: 'NEW' },
    { icon: Wallet, label: 'Withdraw', path: '/withdraw' },
    { icon: Gift, label: 'Bonus Codes', path: '/bonus' },
    { icon: Headphones, label: 'Support Center', path: '/support' },
    { icon: ShieldCheck, label: 'Legal & Ethics', path: '/legal' },
    { icon: Settings, label: 'Account Settings', path: '/profile' },
  ];

  const content = (
    <>
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen?.(false)}>
          <div className="w-8 h-8 bg-zinc-900 border border-white/10 rounded-lg flex items-center justify-center">
            <Gamepad2 className="text-primary w-5 h-5" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tighter italic">D<span className="text-primary">GAMERS</span></span>
        </Link>
        {setMobileOpen && (
          <button onClick={() => setMobileOpen(false)} className="md:hidden p-2 text-zinc-500 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen?.(false)}
            className={cn(
              "flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group",
              location.pathname === item.path 
                ? "bg-primary/10 text-white border border-primary/20" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("w-5 h-5 transition-colors", location.pathname === item.path ? "text-primary" : "group-hover:text-primary")} />
              <span className="font-medium">{item.label}</span>
            </div>
            {item.badge && (
              <span className="text-[8px] font-black bg-primary text-white px-1.5 py-0.5 rounded-sm">
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 font-medium uppercase">Withdraw Status</span>
            <span className="text-xs text-primary font-bold">$5.00</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Earn $2.75 more to cash out BTC</p>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-dark-bg h-screen sticky top-0 md:flex flex-col hidden z-20">
        {content}
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen?.(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.aside 
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-dark-bg border-r border-white/5 z-[70] flex flex-col md:hidden"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-[#050507] pt-24 pb-12 px-6 md:px-12 relative overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-24">
          <div className="space-y-8">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center group-hover:border-primary/50 transition-all shadow-2xl">
                <Gamepad2 className="text-primary w-7 h-7" />
              </div>
              <span className="font-display font-black text-3xl tracking-tighter text-white uppercase italic">
                D<span className="text-primary">GAMERS</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-sm leading-relaxed max-w-sm font-medium">
              DGamers Elite is the leading digital rewards platform for the African gaming community. We bridge the gap between passion and earnings through strategic partnerships with global advertising leaders.
            </p>
            <div className="flex items-center gap-4">
               {[
                 { icon: MessageSquare, label: 'Discord', color: 'hover:bg-[#5865F2]/20 hover:text-[#5865F2]' },
                 { icon: Send, label: 'Telegram', color: 'hover:bg-[#229ED9]/20 hover:text-[#229ED9]' },
                 { icon: Mail, label: 'Email', color: 'hover:bg-primary/20 hover:text-primary' }
               ].map((item, i) => (
                 <a 
                   key={i} 
                   href="#" 
                   className={cn(
                     "w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center text-zinc-500 transition-all border border-white/5",
                     item.color
                   )}
                   title={item.label}
                 >
                    <item.icon className="w-5 h-5" />
                 </a>
               ))}
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 px-1 border-l-2 border-primary">Platform</h4>
            <ul className="space-y-4">
              {['Earn Points', 'Leaderboard', 'Withdrawals', 'Referral Program'].map((item) => (
                <li key={item}>
                  <Link to={`/${item.split(' ')[0].toLowerCase()}`} className="text-zinc-400 hover:text-white transition-colors text-sm font-semibold tracking-tight block w-fit">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 px-1 border-l-2 border-primary">Resources</h4>
            <ul className="space-y-4">
              {[
                { label: 'Knowledge Base', path: '/articles' },
                { label: 'Security Center', path: '/support' },
                { label: 'Affiliate Terms', path: '/legal' },
                { label: 'Media Highlights', path: '/bonus' }
              ].map((item) => (
                <li key={item.label}>
                  <Link to={item.path} className="text-zinc-400 hover:text-white transition-colors text-sm font-semibold tracking-tight block w-fit">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-8 px-1 border-l-2 border-primary">Compliance</h4>
             <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-3">
                   <ShieldCheck className="w-5 h-5 text-emerald-500" />
                   <span className="text-xs font-black text-white uppercase tracking-widest">Verified Exchange</span>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-medium">
                  All transactions are monitored for security. D-Gamers complies with international KYC/AML guidelines for digital rewards platforms.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span className="text-[9px] font-black text-emerald-500 uppercase tracking-[0.2em]">Systems Operational</span>
                </div>
             </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
           <div className="flex flex-col gap-1">
             <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em]">© 2026 DGAMERS ELITE TECHNOLOGY GROUP</p>
             <p className="text-[9px] text-zinc-700 font-medium">Designed for elite performance. All rights reserved.</p>
           </div>
           
           <div className="flex items-center gap-8">
              {[
                { label: 'Privacy Policy', path: '/legal' },
                { label: 'Terms of Service', path: '/legal' },
                { label: 'Cookie Policy', path: '/legal' },
                { label: 'Contact Us', path: '/support' }
              ].map((link) => (
                <Link key={link.label} to={link.path} className="text-[10px] uppercase font-black tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors">
                  {link.label}
                </Link>
              ))}
           </div>
        </div>
      </div>
    </footer>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, logout, securityInfo } = useFirebase();

  const notifications = [
    { title: 'New Offer wall', msg: 'Lootably added 24 new games!', time: '2m ago', type: 'offer' },
    { title: 'Bonus Code Active', msg: 'Use code "MARCH24" for +10% earnings.', time: '1h ago', type: 'bonus' },
    { title: 'Referral Success', msg: 'You earned $0.25 from a friend.', time: '2h ago', type: 'referral' },
  ];

  return (
    <div className="flex min-h-screen bg-dark-bg text-zinc-100 relative overflow-hidden">
      <Hero3D particlesOnly />
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 sticky top-0 bg-dark-bg/80 backdrop-blur-xl z-50">
          <div className="flex items-center gap-2 md:gap-4 flex-1">
            <button 
              onClick={() => setMobileOpen(true)}
              className="p-2 md:hidden hover:bg-white/5 rounded-lg text-zinc-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                type="text" 
                placeholder="Search offers, games..." 
                className="w-full bg-zinc-900 border border-white/5 rounded-full py-1.5 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50 transition-colors"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end gap-0.5">
              <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.2em] italic">
                <ShieldCheck className="w-3 h-3" /> Verified System
              </div>
              <div className="text-[8px] text-zinc-500 font-bold uppercase tracking-widest px-2">
                {securityInfo ? `${securityInfo.ip} • NO VPN` : 'Checking Security...'}
              </div>
            </div>
            <div className="flex items-center gap-2 bg-gradient-to-r from-zinc-900 to-black px-4 py-1.5 rounded-full border border-white/5 group relative overflow-hidden">
              <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="flex flex-col items-end shrink-0 relative z-10">
                <span className="text-sm font-bold tracking-tight">${profile?.coins ? (profile.coins / 1000).toFixed(2) : '0.00'}</span>
                <span className="text-[8px] text-emerald-500 font-black uppercase tracking-widest flex items-center gap-0.5">
                   <ShieldCheck className="w-2 h-2" /> {profile?.country === 'Nigeria' ? 'NG VERIFIED' : 'SECURE'}
                </span>
              </div>
              <div className="h-6 w-px bg-white/10 mx-1 shrink-0 relative z-10"></div>
              <span className="text-xs text-zinc-500 font-mono relative z-10">{profile?.coins || 0} c</span>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 hover:bg-white/5 rounded-full relative transition-colors"
              >
                <Bell className="w-5 h-5 text-zinc-400" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-dark-bg"></span>
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <motion.div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowNotifications(false)} 
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-4 w-80 glass-card p-2 z-50 shadow-2xl shadow-black/50"
                    >
                      <div className="p-3 border-b border-white/5 flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">System Notifications</span>
                        <span className="text-[10px] text-primary hover:underline cursor-pointer">Mark all as read</span>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.map((n, i) => (
                          <div key={i} className="p-4 hover:bg-white/5 rounded-xl transition-colors cursor-pointer group">
                             <div className="flex gap-3">
                                <div className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                  n.type === 'offer' && "bg-blue-500/10 text-blue-400",
                                  n.type === 'bonus' && "bg-amber-500/10 text-amber-400",
                                  n.type === 'referral' && "bg-emerald-500/10 text-emerald-400"
                                )}>
                                  {n.type === 'offer' && <Zap className="w-4 h-4" />}
                                  {n.type === 'bonus' && <Tag className="w-4 h-4" />}
                                  {n.type === 'referral' && <Users className="w-4 h-4" />}
                                </div>
                                <div>
                                  <h4 className="text-sm font-bold">{n.title}</h4>
                                  <p className="text-xs text-zinc-500 leading-relaxed mt-0.5">{n.msg}</p>
                                  <span className="text-[10px] text-zinc-600 mt-2 block">{n.time}</span>
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                      <Link 
                        to="/articles" 
                        onClick={() => setShowNotifications(false)}
                        className="block w-full p-3 text-center text-xs font-bold text-zinc-500 hover:text-white transition-colors border-t border-white/5 mt-2"
                      >
                        View System Logs
                      </Link>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <div className="relative group/user">
              <Link to="/profile" className="block w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden hover:opacity-80 transition-opacity">
                <img referrerPolicy="no-referrer" src={profile?.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile?.username || 'Lucky'}`} alt="avatar" />
              </Link>
              <div className="absolute right-0 top-full mt-2 hidden group-hover/user:block glass-card p-2 min-w-[140px] shadow-2xl z-[60]">
                <Link to="/profile" className="text-xs font-bold text-zinc-300 hover:text-white w-full text-left p-2 flex items-center gap-2">
                  <Settings className="w-3.5 h-3.5" /> Profile Settings
                </Link>
                <div className="h-px bg-white/5 my-1"></div>
                <button onClick={logout} className="text-xs font-bold text-red-500 hover:text-red-400 w-full text-left p-2 flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
             <motion.div
                key={window.location.pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-6 md:p-8"
              >
                {children}
             </motion.div>
          </AnimatePresence>
        </main>
        <Footer />
      </div>
    </div>
  );
};

// Pages
const ProfilePage = () => {
  const { profile, updateProfileData, checkUsernameAvailability } = useFirebase();
  const [username, setUsername] = useState(profile?.username || '');
  const [displayName, setDisplayName] = useState(profile?.displayName || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (profile) {
      setUsername(profile.username);
      setDisplayName(profile.displayName || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleUsernameChange = async (val: string) => {
    setUsername(val);
    if (val === profile?.username) {
      setIsAvailable(null);
      return;
    }
    if (val.length < 3) {
      setIsAvailable(false);
      return;
    }
    setIsValidating(true);
    const available = await checkUsernameAvailability(val);
    setIsAvailable(available);
    setIsValidating(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSaveStatus('saving');
    try {
      await updateProfileData({ 
        username: username !== profile?.username ? username : undefined,
        displayName,
        bio
      });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err) {
      setSaveStatus('error');
    } finally {
      setIsUpdating(false);
    }
  };

  const updateAvatar = async (url: string) => {
    setSaveStatus('saving');
    try {
      await updateProfileData({ avatarUrl: url });
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
    }
  };

  const avatarSeeds = ['Cyber', 'Mage', 'Brave', 'Shadow', 'Neo', 'Gamer', 'Hunter', 'Zen'];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/3 space-y-6">
          <div className="glass-card p-8 bg-gradient-to-br from-zinc-900 to-black text-center relative overflow-hidden group">
             <div className="relative z-10">
               <div className="w-32 h-32 mx-auto rounded-full bg-zinc-800 border-2 border-primary/20 p-1 mb-4 relative group/avatar overflow-hidden">
                  <img 
                    referrerPolicy="no-referrer"
                    src={profile?.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${profile?.username}`} 
                    alt="avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
               </div>
               <h2 className="text-2xl font-black font-display tracking-tight text-white">{profile?.displayName || profile?.username}</h2>
               <p className="text-zinc-500 text-xs font-mono mt-1">Level 12 • {profile?.tier.toUpperCase()} RANK</p>
               
               <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Win Rate</span>
                    <span className="text-xl font-bold font-display">64%</span>
                  </div>
                  <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Streak</span>
                    <span className="text-xl font-bold font-display">x{profile?.stats?.highestStreak || 0}</span>
                  </div>
               </div>
             </div>
          </div>

          <div className="glass-card p-6 border-white/5">
             <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
               <TrophyIcon className="w-3 h-3 text-primary" /> Lifetime Achievements
             </h3>
             <div className="space-y-4">
               {[
                 { label: 'Total Quests', value: profile?.stats?.totalQuests || 0 },
                 { label: 'Games Played', value: profile?.stats?.gamesPlayed || 0 },
                 { label: 'Earned Coins', value: profile?.coins?.toLocaleString() || 0 },
               ].map((stat, i) => (
                 <div key={i} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0 text-sm">
                   <span className="text-zinc-400">{stat.label}</span>
                   <span className="font-bold text-zinc-100">{stat.value}</span>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="flex-1 space-y-6 w-full">
           <div className="glass-card p-8 border-white/5">
              <h2 className="text-xl font-bold mb-8 flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" /> Profile Settings
              </h2>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Unique Username</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => handleUsernameChange(e.target.value)}
                        className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all font-mono"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {isValidating && <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />}
                        {!isValidating && isAvailable === true && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                        {!isValidating && isAvailable === false && <X className="w-4 h-4 text-red-500" />}
                      </div>
                    </div>
                    {isAvailable === false && <p className="text-[10px] text-red-500 mt-1 font-bold">This username is taken or too short.</p>}
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Display Name</label>
                    <input 
                      type="text" 
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all font-display italic font-bold"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Gamer Bio</label>
                  <textarea 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    rows={3}
                    placeholder="Tell the world who you are..."
                    className="w-full bg-zinc-950 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-primary/50 transition-all resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest pl-1">Choose Your Avatar</label>
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
                    {avatarSeeds.map((seed) => (
                      <button
                        key={seed}
                        type="button"
                        onClick={() => updateAvatar(`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`)}
                        className={cn(
                          "aspect-square rounded-xl overflow-hidden border-2 transition-all hover:scale-105",
                          profile?.avatarUrl?.includes(seed) ? "border-primary shadow-[0_0_10px_rgba(37,99,235,0.3)]" : "border-white/5 opacity-50 hover:opacity-100"
                        )}
                      >
                        <img referrerPolicy="no-referrer" src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${seed}`} alt="seed" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      {saveStatus === 'success' && (
                        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-emerald-500 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Profile saved successfully!
                        </motion.span>
                      )}
                      {saveStatus === 'error' && (
                        <span className="text-xs text-red-500 font-bold flex items-center gap-1">
                          <X className="w-3 h-3" /> Error updating profile.
                        </span>
                      )}
                   </div>
                   <button 
                    disabled={isUpdating || (isAvailable === false && username !== profile?.username)}
                    className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 uppercase tracking-widest text-xs"
                   >
                    {isUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Profile Changes
                   </button>
                </div>
              </form>
           </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { profile, securityInfo } = useFirebase();
  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative min-h-[600px] flex items-center pt-20">
         <div className="absolute top-0 right-0 w-[60%] h-full pointer-events-none opacity-20 lg:opacity-40 grayscale group-hover:grayscale-0 transition-all duration-1000 overflow-hidden rounded-l-[5rem]">
            <Hero3D />
         </div>
         <div className="relative z-20 max-w-4xl space-y-10">
            <div className="flex flex-wrap gap-4 items-center">
              <motion.div 
                 initial={{ opacity: 0, x: -20 }}
                 animate={{ opacity: 1, x: 0 }}
                 className="inline-flex items-center gap-3 px-4 py-1.5 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black text-primary uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(37,99,235,0.15)]"
              >
                 <Zap className="w-4 h-4 fill-primary" /> Active Boost: +10% Yield
              </motion.div>
              {securityInfo && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="inline-flex items-center gap-3 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                >
                  <ShieldCheck className="w-4 h-4" /> Secure Node: {securityInfo.ip}
                </motion.div>
              )}
            </div>
            
            <div className="space-y-4">
               <h1 className="text-massive font-heavy italic tracking-tighter text-white uppercase leading-[0.8] drop-shadow-2xl">
                  ELITE <br />
                  <span className="text-zinc-700">REWARDS.</span>
               </h1>
               <p className="text-zinc-400 text-xl md:text-2xl font-medium max-w-2xl leading-relaxed">
                  Welcome back, <span className="text-white italic">{profile?.username}</span>. You are currently operating at <span className="text-primary font-black italic">OPTIMAL</span> capacity. 
                  Monitor your earnings and scale your influence.
               </p>
            </div>

            <div className="flex flex-wrap gap-6 pt-6">
               <Link to="/earn" className="btn-primary flex items-center gap-4 py-5 px-10">
                  Enter Earn Hub <ArrowRight className="w-5 h-5" />
               </Link>
               <Link to="/withdraw" className="btn-secondary py-5 px-10 flex items-center gap-4">
                  Request Settlement <Bitcoin className="w-5 h-5 text-primary/50" />
               </Link>
            </div>

            <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-8 border-t border-white/5 max-w-3xl">
               {[
                  { value: '₦12.5M', label: 'Total Volume' },
                  { value: '42K+', label: 'Verified Nodes' },
                  { value: '0.2s', label: 'Sync Speed' },
                  { value: '99.9%', label: 'Uptime' }
               ].map((stat, i) => (
                  <div key={i} className="space-y-1">
                     <div className="text-xl font-display font-black tracking-tighter text-white uppercase italic">{stat.value}</div>
                     <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{stat.label}</div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Stats Dashboard */}
      <section className="space-y-10">
         <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-zinc-500">Node Performance</h2>
            <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-zinc-700">
               <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Active Stream</span>
               <span className="flex items-center gap-2 italic">Refreshes every 60s</span>
            </div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Available Balance', value: `₦${(profile?.coins ? profile.coins : 0).toLocaleString()}`, sub: `${profile?.coins || 0} Elite Coins`, icon: Wallet, color: 'text-primary' },
              { label: 'Network Payouts', value: '₦842,500', sub: 'Lifetime Volume', icon: TrendingUp, color: 'text-emerald-500' },
              { label: 'Active Sessions', value: '03', sub: '2 Partners Connected', icon: Clock, color: 'text-amber-500' },
              { label: 'Account Tier', value: profile?.tier?.toUpperCase() || 'ELITE GUEST', sub: 'Upgrade for +15% Boost', icon: TrophyIcon, color: 'text-indigo-400' },
            ].map((stat, i) => (
               <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card p-10 border-white/5 relative group cursor-default"
               >
                  <div className="absolute top-8 right-8 text-white/5 group-hover:text-primary/20 transition-colors">
                     <stat.icon className="w-12 h-12" />
                  </div>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] block mb-6">{stat.label}</span>
                  <div className="space-y-2">
                     <h3 className={cn("text-3xl font-black font-display tracking-tighter italic uppercase underline decoration-primary/20 decoration-4 underline-offset-8", stat.color)}>{stat.value}</h3>
                     <p className="text-zinc-500 text-[10px] font-bold tracking-widest uppercase">{stat.sub}</p>
                  </div>
               </motion.div>
            ))}
         </div>
      </section>

      {/* Trust & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
         <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white italic">Recent Partner Verifications</h2>
                <Link to="/earn" className="text-[10px] font-black text-primary hover:text-white transition-colors uppercase tracking-widest">Connect New Node</Link>
            </div>
            
            <div className="space-y-4">
               {[
                 { user: 'Storm7', flow: 'Lootably Rewards', amount: '₦2,400', time: '2m ago', status: 'Verified' },
                 { user: 'GamerX', flow: 'Revenue Universe', amount: '₦850', time: '12m ago', status: 'Processing' },
                 { user: 'CryptoP', flow: 'AdGate Gateway', amount: '₦1,200', time: '24m ago', status: 'Verified' },
                 { user: 'MuizI', flow: 'BitLabs Global', amount: '₦450', time: '45m ago', status: 'Verified' },
               ].map((item, i) => (
                 <div key={i} className="flex items-center justify-between p-6 bg-zinc-950/20 border border-white/5 rounded-2xl hover:border-primary/20 transition-all group">
                    <div className="flex items-center gap-6">
                       <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center font-black text-primary italic">0{i+1}</div>
                       <div>
                          <h4 className="text-sm font-bold text-white uppercase tracking-tight group-hover:text-primary transition-colors">{item.user}</h4>
                          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{item.flow}</p>
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-lg font-display font-black text-white italic">{item.amount}</div>
                       <div className={cn("text-[8px] font-black uppercase tracking-widest", item.status === 'Verified' ? 'text-emerald-500' : 'text-amber-500')}>{item.status} • {item.time}</div>
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="space-y-10">
            <div className="flex items-center justify-between pb-4 border-b border-white/5">
                <h2 className="text-sm font-black uppercase tracking-[0.3em] text-white italic">Platform Pulse</h2>
            </div>
            
            <div className="glass-card p-8 border-primary/20 bg-primary/5 space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                     <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                     <h4 className="text-xs font-black text-white uppercase tracking-widest">Network Alert</h4>
                     <p className="text-[10px] text-zinc-500 font-medium italic">Torox Boost Active: +15% on All Game Nodes</p>
                  </div>
               </div>

               <div className="space-y-4">
                  {[
                    'Server synchronization complete.',
                    'Direct bank settlement portal active.',
                    'Gift code redundancy verified.',
                    'New audit layer deployed.'
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-3">
                       <CheckCircle2 className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                       <p className="text-[10px] text-zinc-400 leading-relaxed italic font-medium">{tip}</p>
                    </div>
                  ))}
               </div>
               
               <button className="w-full bg-primary hover:bg-blue-600 text-white font-bold uppercase tracking-widest text-[9px] py-3 rounded-lg transition-all shadow-[0_0_20px_var(--color-primary-glow)] hover:scale-[1.02] active:scale-[0.98] border border-white/10">View Full Audit Log</button>
            </div>
         </div>
      </div>
    </div>
  );
};

// Pages
const EarnPage = () => {
  const { awardCoins } = useFirebase();

  const handleTaskComplete = async (game: any) => {
    const amount = Math.floor(parseFloat(game.reward.replace('$', '')) * 1000);
    await awardCoins(amount, `Completed ${game.name} task`);
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Header Section */}
      <div className="relative">
        <div className="absolute -top-24 right-0 w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-1.5 bg-zinc-900 border border-white/10 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Live Partner Network</span>
            </div>
            <h1 className="text-massive font-heavy italic tracking-tighter text-white uppercase leading-[0.8] mb-4">
              CHOOSE <br />
              <span className="text-primary italic">YOUR PATH.</span>
            </h1>
            <p className="text-zinc-600 text-lg leading-relaxed max-w-xl font-medium">
              Access the largest offerwall network in Africa. We've optimized every endpoint to ensure the highest conversion rates for Nigerian traffic.
            </p>
            
            <div className="flex flex-wrap gap-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">
               <div className="flex items-center gap-2 px-4 py-2 border border-zinc-900 rounded-lg">
                  <ShieldCheck className="w-3 h-3 text-primary" /> Instant Tracking
               </div>
               <div className="flex items-center gap-2 px-4 py-2 border border-zinc-900 rounded-lg">
                  <TrendingUp className="w-3 h-3 text-primary" /> Daily Boosts
               </div>
               <div className="flex items-center gap-2 px-4 py-2 border border-zinc-900 rounded-lg">
                  <MessageSquare className="w-3 h-3 text-primary" /> 24/7 Support
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
             {[
               { label: 'Total Paid Out', value: '₦12.4M', icon: Wallet },
               { label: 'Active Users', value: '42K+', icon: Users },
               { label: 'Network Points', value: '8.5B', icon: Zap },
               { label: 'Partner Siphons', value: '150+', icon: Gamepad2 }
             ].map((stat, i) => (
                <div key={i} className="glass-card p-6 border-white/5 bg-zinc-950/20">
                   <stat.icon className="w-5 h-5 text-primary/50 mb-4" />
                   <div className="text-3xl font-display font-black tracking-tighter text-white">{stat.value}</div>
                   <div className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">{stat.label}</div>
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* Main Partners */}
      <section className="space-y-12">
        <div className="flex items-end justify-between border-b border-white/5 pb-8">
           <div className="space-y-2">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Certified Partners</h2>
              <p className="text-3xl font-display font-black tracking-tighter text-white italic uppercase">OFFERWALL MARKETPLACE</p>
           </div>
           <p className="text-zinc-600 text-sm hidden md:block max-w-xs text-right italic font-medium">
             Select a provider based on your device and region for optimal payouts.
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { 
              name: 'Revenue Universe', 
              desc: 'High-paying surveys and free trials. Best for desktop users.',
              payout: '1.5x Multiplier', 
              tags: ['Desktop', 'Survey'],
              color: 'bg-blue-600',
              img: 'https://images.unsplash.com/photo-1580234811497-9bd7fd2f357d?w=300&auto=format' 
            },
            { 
              name: 'Lootably', 
              desc: 'Premium game offers and micro-tasks. Fastest tracking in the industry.',
              payout: 'Instant Credit', 
              tags: ['Mobile', 'App'],
              color: 'bg-emerald-600',
              img: 'https://images.unsplash.com/photo-1552824734-80467882ff24?w=300&auto=format',
              featured: true
            },
            { 
              name: 'AdGate Media', 
              desc: 'Diverse range of tasks from surveys to registrations. Highly reliable.',
              payout: 'High Volume', 
              tags: ['Video', 'Global'],
              color: 'bg-purple-600',
              img: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=300&auto=format' 
            },
            { 
              name: 'BitLabs', 
              desc: 'Specialized survey panel with global reach and high acceptance rates.',
              payout: 'Unlimited', 
              tags: ['Survey', 'Global'],
              color: 'bg-cyan-600',
              img: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=300&auto=format' 
            },
            { 
              name: 'Torox', 
              desc: 'Massive library of game offers with competitive rates.',
              payout: '10K+ Offers', 
              tags: ['Games', 'Mobile'],
              color: 'bg-red-600',
              img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&auto=format' 
            },
            { 
              name: 'Timewall', 
              desc: 'Simple micro-tasks and social media shares. Easy to start.',
              payout: 'Easy Flow', 
              tags: ['Social', 'Web'],
              color: 'bg-amber-600',
              img: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=300&auto=format' 
            },
          ].map((partner) => (
            <motion.div 
              whileHover={{ y: -8, scale: 1.02 }}
              key={partner.name} 
              className="glass-card flex flex-col group overflow-hidden border-white/5 hover:border-primary/40 relative"
            >
              <div className="h-48 relative overflow-hidden bg-zinc-900 border-b border-white/5">
                 <img src={partner.img} alt={partner.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100" />
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />
                 <div className="absolute top-4 left-4 flex gap-2">
                    {partner.tags.map(tag => (
                      <span key={tag} className="bg-black/80 backdrop-blur-md text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border border-white/5 text-zinc-300">{tag}</span>
                    ))}
                 </div>
                 {partner.featured && (
                   <div className="absolute top-4 right-4 bg-primary text-white text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-lg shadow-primary/30">FEATURED</div>
                 )}
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-display font-black tracking-tighter text-white italic uppercase group-hover:text-primary transition-colors">{partner.name}</h3>
                   <div className={cn("w-2 h-2 rounded-full", partner.color)} />
                </div>
                <p className="text-zinc-500 text-xs leading-relaxed mb-6 font-medium">{partner.desc}</p>
                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                   <div className="flex flex-col">
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Rate</span>
                      <span className="text-sm font-black text-primary italic uppercase tracking-tight">{partner.payout}</span>
                   </div>
                   <button className="bg-primary hover:bg-blue-600 text-white font-black uppercase tracking-widest text-[9px] py-2 px-6 rounded-lg transition-all shadow-lg hover:shadow-primary/20">
                      Open Partner wall
                   </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Single Offers */}
      <section className="space-y-12">
        <div className="flex items-end justify-between border-b border-white/5 pb-8">
           <div className="space-y-2">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary">Direct Highlights</h2>
              <p className="text-3xl font-display font-black tracking-tighter text-white italic uppercase">HOT CAMPAIGNS</p>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Raid: Shadow Legends', reward: '₦12,500', company: 'Lootably', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=400&auto=format&fit=crop' },
            { name: 'Mafia City: Level 20', reward: '₦8,200', company: 'AdGate', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=400&auto=format&fit=crop' },
            { name: 'Rise of Kingdoms', reward: '₦15,000', company: 'RevU', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=400&auto=format&fit=crop' },
            { name: 'Star Trek Fleet', reward: '₦9,000', company: 'Torox', img: 'https://images.unsplash.com/photo-1552824734-80467882ff24?q=80&w=400&auto=format&fit=crop' },
          ].map((game) => (
            <motion.div 
               whileHover={{ scale: 1.02 }}
               key={game.name} 
               onClick={() => handleTaskComplete(game)} 
               className="glass-card overflow-hidden group cursor-pointer border-white/5 hover:border-primary/20 bg-zinc-950/20"
            >
              <div className="aspect-video bg-zinc-900 relative">
                 <img src={game.img} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80" />
                 <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent opacity-60" />
                 <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest border border-white/5 text-zinc-400">
                    {game.company}
                 </div>
              </div>
              <div className="p-4 space-y-4">
                <div>
                   <h4 className="text-sm font-bold text-white mb-1 line-clamp-1 italic uppercase tracking-tight">{game.name}</h4>
                   <div className="text-[10px] font-black text-primary bg-primary/10 w-fit px-2 py-0.5 rounded italic">BOOSTED RATE</div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                   <div className="text-xl font-display font-black italic tracking-tighter text-white">{game.reward}</div>
                   <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors">
                      <ArrowRight className="w-4 h-4 text-white" />
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Trust & Verification Section */}
      <section className="glass-card p-12 overflow-hidden relative">
         <div className="absolute -right-24 top-0 w-96 h-full bg-primary/5 -skew-x-12" />
         <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
               <h2 className="text-massive font-heavy italic tracking-tighter text-white uppercase leading-[0.8]">
                  ELITE <br />
                  <span className="text-primary italic">STANDARDS.</span>
               </h2>
               <p className="text-zinc-500 text-sm leading-relaxed max-w-sm font-medium">
                  We maintain strict partnerships with global offerwall providers. Our direct integrations ensure seamless tracking and daily payouts with zero intermediaries.
               </p>
               <div className="flex gap-4">
                  <div className="w-16 h-12 bg-white/5 rounded border border-white/10 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                     <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="w-16 h-12 bg-white/5 rounded border border-white/10 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                     <Lock className="w-6 h-6" />
                  </div>
                  <div className="w-16 h-12 bg-white/5 rounded border border-white/10 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                     <Headphones className="w-6 h-6" />
                  </div>
               </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
               {[
                  { title: 'Global Compliance', desc: 'Secure APIs following standard industry protocols.' },
                  { title: 'Fraud Protection', desc: 'Sift and Shield implementations on all transactional layers.' },
                  { title: 'Partner Loyalty', desc: 'Official direct publisher status with top network providers.' }
               ].map((item, i) => (
                  <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                     <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black font-mono shrink-0 italic">{i+1}</div>
                     <div>
                        <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{item.title}</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed italic">{item.desc}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>
    </div>
  );
};

const TransactionsPage = () => {
  const { user } = useFirebase();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/transactions`),
      orderBy('createdAt', 'desc')
    );

    const unsub = onSnapshot(q, (snapshot) => {
      setTransactions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `users/${user.uid}/transactions`);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold mb-4 font-display italic tracking-tight uppercase">Transaction History</h1>
        <p className="text-zinc-400 text-lg">Tracks your earnings, bonuses, and withdrawals in real-time.</p>
      </div>

      <div className="glass-card overflow-hidden border border-white/5">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 text-[10px] uppercase font-black tracking-[0.2em] text-zinc-500 border-b border-white/5">
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-600 mb-2" />
                    <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Fetching Ledger...</span>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-zinc-500 italic text-sm">
                    No transactions found yet. Start earning to see your history!
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors group">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded flex items-center gap-1 w-fit",
                        tx.status === 'completed' ? "bg-emerald-500/10 text-emerald-500" :
                        tx.status === 'pending' ? "bg-amber-500/10 text-amber-500" :
                        "bg-red-500/10 text-red-500"
                      )}>
                        {tx.status === 'completed' && <CheckCircle2 className="w-3 h-3" />}
                        {tx.status === 'pending' && <Clock className="w-3 h-3" />}
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold text-zinc-300 uppercase tracking-tighter">{tx.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-white line-clamp-1">{tx.description}</div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">ID: {tx.id.slice(0, 8)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-xs">
                      <span className={cn(
                        "font-bold",
                        tx.type === 'withdraw' ? "text-red-400" : "text-emerald-400"
                      )}>
                        {tx.type === 'withdraw' ? '-' : '+'}{tx.coins.toLocaleString()}
                      </span>
                      <span className="text-zinc-600 ml-1">coins</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-500 font-mono">
                      {tx.createdAt?.toDate ? tx.createdAt.toDate().toLocaleDateString() : 'Pending'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
            </div>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1 leading-none">Net Earnings</p>
          <p className="text-2xl font-bold font-display italic">
            +{transactions.filter(t => t.type !== 'withdraw').reduce((acc, t) => acc + (t.coins || 0), 0).toLocaleString()}
          </p>
        </div>
        
        <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <History className="w-5 h-5 text-red-500" />
            </div>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1 leading-none">Total Withdrawals</p>
          <p className="text-2xl font-bold font-display italic">
            -{transactions.filter(t => t.type === 'withdraw').reduce((acc, t) => acc + (t.coins || 0), 0).toLocaleString()}
          </p>
        </div>

        <div className="glass-card p-6 border-white/5 bg-gradient-to-br from-zinc-900/50 to-zinc-950/50 group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MousePointer2 className="w-5 h-5 text-primary" />
            </div>
          </div>
          <p className="text-[10px] uppercase font-bold tracking-widest text-zinc-500 mb-1 leading-none">Recent Activity</p>
          <p className="text-2xl font-bold font-display italic">
            {transactions.length} <span className="text-xs font-sans not-italic text-zinc-600 uppercase tracking-widest">Events</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const WithdrawPage = () => {
  const { profile, requestWithdrawal } = useFirebase();
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>('1000');
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const [details, setDetails] = useState<Record<string, string>>({});

  const availableCoins = profile?.coins || 0;
  const ngnAmount = availableCoins; 
  const progress = Math.min((availableCoins / 1000) * 100, 100);

  const handleWithdraw = async () => {
    if (!selectedMethod) {
      setStatus({ type: 'error', msg: 'Please select a withdrawal method.' });
      return;
    }

    // Validate details based on method
    if (selectedMethod === 'bank' && (!details.bankName || !details.accNumber)) {
      setStatus({ type: 'error', msg: 'Please provide bank details.' });
      return;
    }
    if (selectedMethod === 'btc' && !details.address) {
      setStatus({ type: 'error', msg: 'Please provide BTC wallet address.' });
      return;
    }
    if ((selectedMethod === 'opay' || selectedMethod === 'airtime') && !details.phone) {
      setStatus({ type: 'error', msg: 'Please provide phone number.' });
      return;
    }

    const coinsToWithdraw = parseInt(amount);
    if (isNaN(coinsToWithdraw) || coinsToWithdraw < 500) {
      setStatus({ type: 'error', msg: 'Minimum withdrawal is 500 Coins (₦500).' });
      return;
    }

    if (coinsToWithdraw > availableCoins) {
      setStatus({ type: 'error', msg: 'Insufficient balance.' });
      return;
    }

    setIsProcessing(true);
    setStatus(null);
    try {
      await requestWithdrawal(coinsToWithdraw, selectedMethod, details);
      setStatus({ type: 'success', msg: `Withdrawal of ₦${coinsToWithdraw.toLocaleString()} initiated successfully!` });
      setAmount('1000');
      setDetails({});
    } catch (err: any) {
      console.error(err);
      setStatus({ type: 'error', msg: 'Failed to process withdrawal. Please try again.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {status && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-4 rounded-xl border flex items-center gap-3",
            status.type === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border-red-500/20 text-red-400"
          )}
        >
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold uppercase tracking-tight italic">{status.msg}</span>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-10 bg-gradient-to-br from-zinc-900 to-black relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10 flex flex-col md:flex-row justify-between gap-8">
              <div className="space-y-4">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] block mb-2">Available Balance</span>
                <h1 className="text-6xl font-black font-display tracking-tight text-primary">₦{ngnAmount.toLocaleString()}</h1>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-mono font-bold text-zinc-300">{(availableCoins).toLocaleString()} Coins</span>
                  <div className="w-px h-3 bg-white/10"></div>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest leading-none">Verified Player</span>
                </div>
              </div>
              
              <div className="md:w-64 space-y-4">
                 <div className="space-y-1.5">
                   <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block px-1">Withdraw Amount (Coins)</label>
                   <input 
                    type="number" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-lg font-black font-display focus:outline-none focus:border-primary/50 text-white placeholder:text-zinc-800"
                   />
                 </div>

                 {/* Dynamic Details Fields */}
                 {selectedMethod === 'bank' && (
                   <div className="space-y-3">
                     <div className="space-y-1.5">
                       <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block px-1">Bank Name</label>
                       <input 
                        type="text" 
                        value={details.bankName || ''}
                        onChange={(e) => setDetails({...details, bankName: e.target.value})}
                        placeholder="e.g. Zenith Bank"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-white"
                       />
                     </div>
                     <div className="space-y-1.5">
                       <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block px-1">Account Number</label>
                       <input 
                        type="text" 
                        value={details.accNumber || ''}
                        onChange={(e) => setDetails({...details, accNumber: e.target.value})}
                        placeholder="10 Digits"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-white"
                       />
                     </div>
                   </div>
                 )}

                 {selectedMethod === 'btc' && (
                   <div className="space-y-1.5">
                     <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block px-1">BTC Wallet Address</label>
                     <input 
                      type="text" 
                      value={details.address || ''}
                      onChange={(e) => setDetails({...details, address: e.target.value})}
                      placeholder="Bitcoin Address"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-white"
                     />
                   </div>
                 )}

                 {(selectedMethod === 'opay' || selectedMethod === 'airtime') && (
                   <div className="space-y-1.5">
                     <label className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block px-1">Phone Number</label>
                     <input 
                      type="text" 
                      value={details.phone || ''}
                      onChange={(e) => setDetails({...details, phone: e.target.value})}
                      placeholder="080XXXXXXXX"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/50 text-white"
                     />
                   </div>
                 )}

                 <button 
                  onClick={handleWithdraw}
                  disabled={isProcessing || availableCoins < 500}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black uppercase tracking-tighter italic h-12 rounded-xl transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2"
                 >
                   {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                   Request Cash Out
                 </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[
               { name: 'Nigerian Bank Transfer', id: 'bank', sub: 'Instant NGN', min: '₦1,000', icon: CreditCard, hot: true },
               { name: 'Paga / OPay', id: 'opay', sub: 'Instant Mobile Money', min: '₦500', icon: Zap },
               { name: 'Airtime Recharge', id: 'airtime', sub: 'MTN, Airtel, Glo', min: '₦100', icon: Phone },
               { name: 'Bitcoin (BTC)', id: 'btc', sub: 'Global Crypto', min: '$10.00', icon: Bitcoin },
             ].map((method) => (
               <div 
                key={method.name} 
                onClick={() => setSelectedMethod(method.id)}
                className={cn(
                  "glass-card p-6 flex items-center justify-between group cursor-pointer transition-all border",
                  selectedMethod === method.id ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(37,99,235,0.1)]" : "border-white/5 hover:border-primary/40"
                )}
               >
                  <div className="flex items-center gap-4">
                     <div className={cn(
                       "w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform",
                       selectedMethod === method.id ? "bg-primary/20" : ""
                     )}>
                        <method.icon className={cn("w-5 h-5", selectedMethod === method.id ? "text-primary" : "text-zinc-500")} />
                     </div>
                     <div>
                        <h3 className="font-bold">{method.name}</h3>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">{method.sub}</span>
                     </div>
                  </div>
                  <div className="text-right">
                     <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Min.</div>
                     <div className="font-bold text-sm tracking-tight">{method.min}</div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6 bg-primary/5 border-primary/20">
             <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                <TrendingUp className="w-4 h-4 text-primary" />
                Next Payout Goal
             </h3>
             <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Progress to ₦1,000</span>
                  <span className="text-xl font-bold font-display">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-zinc-500 italic leading-relaxed">
                  Earn {(1000 - ngnAmount > 0 ? 1000 - ngnAmount : 0).toLocaleString()} more coins to unlock Nigerian Bank Transfers.
                </p>
             </div>
          </div>

          <div className="glass-card p-6">
             <h3 className="text-sm font-bold mb-4">Local Payment Log</h3>
             <div className="space-y-4">
                {[
                  { user: 'Abiola_NG', amount: 'N12,500', method: 'Bank', time: '2h ago' },
                  { user: 'Sodiq_Crypto', amount: '0.0004 BTC', method: 'BTC', time: '5h ago' },
                  { user: 'Grace_A', amount: 'N2,000', method: 'Airtime', time: '12h ago' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between group">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-white/5 overflow-hidden">
                           <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.user}`} alt="av" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">{c.user}</div>
                          <div className="text-[8px] text-zinc-600 font-bold uppercase">{c.method}</div>
                        </div>
                     </div>
                     <div className="text-right">
                        <div className="text-xs font-bold text-emerald-500 font-mono tracking-tighter">{c.amount}</div>
                        <div className="text-[8px] text-zinc-600 italic">{c.time}</div>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BonusPage = () => (
   <div className="max-w-2xl mx-auto py-12 space-y-12">
      <div className="text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
          <Gift className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-2">Redeem Bonus Code</h1>
        <p className="text-zinc-500">Check our social media for daily codes and secret bonuses.</p>
      </div>

      <div className="glass-card p-8 space-y-6">
        <div className="space-y-4">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest px-1">Bonus Code</label>
          <div className="flex gap-4">
            <input 
              type="text" 
              placeholder="NOVA_WELCOME_2026"
              className="flex-1 bg-zinc-900 border border-white/5 rounded-xl py-3 px-6 text-sm focus:outline-none focus:border-primary uppercase font-mono tracking-widest"
            />
            <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/20">
              Redeem
            </button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4">
           <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Daily Streak</span>
              <span className="text-xl font-bold font-display">Day 1 / 7</span>
           </div>
           <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 text-center">
              <span className="text-[10px] text-zinc-500 font-bold uppercase block mb-1">Active Bonus</span>
              <span className="text-xl font-bold font-display text-emerald-500">+10%</span>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold">Recent Redemptions</h3>
        <div className="space-y-2">
          {[1,2,3].map(i => (
            <div key={i} className="glass-card p-4 flex items-center justify-between text-sm">
               <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-emerald-500" /></div>
                  <span className="text-zinc-300 font-medium italic">Twitter_Drop_May4</span>
               </div>
               <span className="text-primary font-bold">+50 Coins</span>
            </div>
          ))}
        </div>
      </div>
   </div>
);

const ArticlesPage = () => (
  <div className="space-y-8">
     <h1 className="text-4xl font-bold font-display">Pro-Gamer Blog</h1>
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="glass-card group cursor-pointer border border-white/5 transition-all hover:border-primary/20">
             <div className="aspect-video bg-zinc-800 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-t from-dark-bg to-transparent opacity-60"></div>
                <div className="absolute bottom-4 left-4">
                  <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded font-bold uppercase">Strategy</span>
                </div>
             </div>
             <div className="p-6">
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors leading-tight">Mastering Offerwalls: How to earn your first $10.00 today.</h3>
                <p className="text-zinc-400 text-sm mb-4 line-clamp-2">Learn the secrets of the pro-gamer community and how to maximize your coin earnings per hour spent playing.</p>
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-zinc-700 rounded-full"></div>
                      <span className="text-xs text-zinc-500">Alex 'Nova' Chen</span>
                   </div>
                   <span className="text-xs text-zinc-600">May 4, 2026</span>
                </div>
             </div>
          </div>
        ))}
     </div>
  </div>
);

const SupportPage = () => {
  return (
    <div className="space-y-16 max-w-5xl mx-auto pb-20">
      <div className="text-center space-y-4">
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-white/10 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
            <Headphones className="w-3 h-3 text-primary" /> Support Center • 24/7
         </div>
         <h1 className="text-massive font-heavy italic tracking-tighter text-white uppercase leading-[0.8]">
            OPERATIONAL <br />
            <span className="text-primary italic">ASSISTANCE.</span>
         </h1>
         <p className="text-zinc-500 text-lg font-medium max-w-xl mx-auto italic">
            Technical queries and node resolution. Our specialists are on standby 
            to ensure your earning stream remains uninterrupted.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-12 bg-gradient-to-br from-zinc-900/50 to-black border-white/5 flex flex-col items-center text-center group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <Send className="w-32 h-32" />
          </div>
          <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform border border-primary/20">
             <Send className="w-12 h-12 text-primary" />
          </div>
          <h2 className="text-2xl font-black mb-4 font-display italic tracking-tight uppercase">Telegram Network</h2>
          <p className="text-zinc-600 text-sm font-medium mb-10 max-w-[240px] italic">Rapid response community for immediate technical synchronization.</p>
          <a 
            href="https://t.me/Dgamerssupport" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-primary hover:bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 italic border border-white/10"
          >
            Access Community Hub
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-12 bg-gradient-to-br from-zinc-900/50 to-black border-white/5 flex flex-col items-center text-center group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
            <MessageSquare className="w-32 h-32" />
          </div>
          <div className="w-24 h-24 bg-emerald-500/10 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform border border-emerald-500/20">
             <MessageSquare className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-black mb-4 font-display italic tracking-tight uppercase">Direct WhatsApp</h2>
          <p className="text-zinc-600 text-sm font-medium mb-10 max-w-[240px] italic">Encrypted one-on-one channel for sensitive account resolution.</p>
          <a 
            href="https://wa.me/2349034089737" 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3 italic border border-white/10"
          >
            Initiate Secure Chat
            <ExternalLink className="w-4 h-4" />
          </a>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto w-full">
        <div className="glass-card p-12 border-white/5 bg-zinc-900/20 relative group">
           <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="w-20 h-20 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center shrink-0">
                 <Mail className="text-primary w-10 h-10" />
              </div>
              <div className="flex-1 text-center md:text-left space-y-2">
                 <h4 className="text-lg font-black text-white uppercase italic tracking-tight">Corporate Relations</h4>
                 <p className="text-zinc-500 text-sm font-medium italic">For partner inquiries, compliance reviews, and high-volume node operator agreements.</p>
              </div>
              <a href="mailto:support@dgamers.com" className="bg-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest px-8 py-4 rounded-xl border border-white/10 transition-all italic whitespace-nowrap">
                Email Official HQ
              </a>
           </div>
        </div>
      </div>
    </div>
  );
};

const LegalPage = () => {
  const [activeTab, setActiveTab] = useState('payout');
  
  const tabs = [
    { id: 'payout', label: 'Payout Rules', icon: CreditCard },
    { id: 'terms', label: 'Terms of Service', icon: ShieldCheck },
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'faq', label: 'FAQ', icon: Gift },
  ];

  return (
    <div className="max-w-6xl mx-auto py-8 lg:py-12 space-y-8 lg:space-y-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="space-y-2 sticky top-24 h-fit">
          {tabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3",
                activeTab === tab.id 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]" 
                  : "text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent"
              )}
            >
              <tab.icon className="w-4 h-4 shrink-0" />
              {tab.label}
            </button>
          ))}
        </aside>

        <div className="lg:col-span-3 glass-card p-6 md:p-10 space-y-8 min-h-[600px] border-white/5">
          <div className="border-b border-white/5 pb-6">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em]">Compliance & Safety</span>
            <h1 className="text-3xl font-black font-display mt-2 italic tracking-tight">
              {tabs.find(t => t.id === activeTab)?.label}
            </h1>
          </div>

          <div className="prose prose-invert prose-zinc max-w-none text-zinc-400 space-y-6">
            {activeTab === 'payout' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <p>To maintain a high-trust environment at Dgamers, all payout requests are subject to verification. Users must reach a minimum threshold of $5.00 USD (5,000 Coins) before initiating a withdrawal.</p>
                <div className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl">
                  <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    Tier Based Limits
                  </h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-zinc-500 uppercase font-bold tracking-tighter">Bronze (Standard)</span>
                      <span className="text-white font-bold">$5 - $50 / Day</span>
                    </li>
                    <li className="flex justify-between border-b border-white/5 pb-2">
                      <span className="text-zinc-400 font-bold tracking-tighter italic">Platinum</span>
                      <span className="text-emerald-500 font-bold">$Unlimited / Day</span>
                    </li>
                  </ul>
                </div>
                <h3 className="text-white font-bold text-xl mt-8">1. Verification Period</h3>
                <p>Standard withdrawals take 24-72 hours to process. Platinum tier users enjoy instant processing for amounts up to $50.00.</p>
                <h3 className="text-white font-bold text-xl mt-8">2. Bitcoin (BTC) & Bitcoin Cash (BCH)</h3>
                <p>Crypto payments are calculated based on the exchange rate at the time of processing, not at the time of withdrawal request.</p>
              </motion.div>
            )}

            {activeTab === 'terms' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <p>Welcome to Dgamers. By accessing or using our platform, you agree to be bound by these Terms of Service. Please read them carefully.</p>
                
                <h3 className="text-white font-bold text-xl">1. Eligibility & Verification</h3>
                <p>Users must be at least 13 years of age. Dgamers is currently optimized and restricted for users residing in Nigeria. Use of VPNs, proxies, or any tool that masks your true location is strictly prohibited. Violation of this regional restriction will result in permanent account termination and forfeiture of all accumulated coins.</p>
                
                <h3 className="text-white font-bold text-xl">2. Account Responsibility</h3>
                <p>You are responsible for all activity under your account. Creating multiple accounts (multi-accounting) to exploit the reward system is a breach of these terms. You must provide accurate information during registration and profile updates.</p>
                
                <h3 className="text-white font-bold text-xl">3. Offerwall & Reward Fulfillment</h3>
                <p>Earnings are generated through third-party partners (Offerwalls). Dgamers does not guarantee completion or payout of any specific offer. Payouts are only granted once the third-party partner successfully verifies the task completion. We reserve the right to reclaim coins if a partner issues a chargeback due to fraudulent activity or invalid task completion.</p>
                
                <h3 className="text-white font-bold text-xl">4. Termination</h3>
                <p>We reserve the right to suspend or terminate accounts that violate these terms, engage in suspicious activity, or disrupt the platform's integrity for other elite gamers.</p>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <p>Dgamers is committed to protecting your privacy while ensuring a secure reward ecosystem. This policy explains how we handle your data.</p>
                
                <h3 className="text-white font-bold text-xl">1. Data We Collect</h3>
                <p>We collect essential information to track your rewards and prevent fraud, including:</p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Account Data: Email address, username, and public profile details.</li>
                  <li>Device Data: IP address, device type, and unique identifiers (UIDs) to verify regional eligibility and prevent multi-accounting.</li>
                  <li>Activity Data: History of completed offers, survey attempts, and withdrawals.</li>
                </ul>
                
                <h3 className="text-white font-bold text-xl">2. Usage of External Identifiers</h3>
                <p>To facilitate reward tracking, we share a unique, non-reversible hashed User ID with our offerwall partners (like Torox, Lootably). This ID allows partners to signal our platform when you have successfully completed a task without sharing your personal email or real name.</p>
                
                <h3 className="text-white font-bold text-xl">3. Data Security</h3>
                <p>Your data is stored securely using Firebase (Google Cloud Infrastructure). We employ strict security rules to ensure only you can access your private earnings and profile data.</p>
                
                <h3 className="text-white font-bold text-xl">4. No Data Selling</h3>
                <p>Dgamers does not sell, rent, or trade your personal information to third-party marketing companies. Your data is used strictly for the functionality and security of the Dgamers platform.</p>
              </motion.div>
            )}

            {activeTab === 'faq' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="space-y-8">
                  {[
                    { q: "Is Dgamers really free?", a: "Yes, 100% free. We get paid by game developers to find new players, and we share that revenue with you in coins." },
                    { q: "How much is 1,000 coins worth?", a: "1,000 coins is exactly equal to $1.00 USD. We use a simple 1:1 ratio for ease of tracking." },
                    { q: "Can I use a VPN?", a: "No. Using a VPN to access offers from other countries is considered fraud and will get your account permanently banned." },
                    { q: "How long until I receive my money?", a: "Bank transfers in Nigeria are typically processed within 24 hours. Crypto can take up to 48 hours for blockchain verification." },
                    { q: "Why was my offer rejected?", a: "Offers are usually rejected if you have already installed the app before, or if your connection was unstable during the task." },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/5 p-6 rounded-2xl border border-white/5 hover:border-primary/20 transition-all">
                      <h4 className="text-white font-bold mb-2 flex items-center gap-3">
                         <span className="text-primary font-mono text-lg">Q:</span>
                         {item.q}
                      </h4>
                      <p className="text-zinc-500 text-sm leading-relaxed">
                        <span className="text-zinc-300 font-bold">A:</span> {item.a}
                      </p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Leaderboard = () => (
  <div className="space-y-16 max-w-5xl mx-auto pb-20">
      <div className="text-center space-y-4">
         <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-900 border border-white/10 rounded-full text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
            <TrophyIcon className="w-3 h-3 text-primary" /> Season 04 • Active
         </div>
         <h1 className="text-massive font-heavy italic tracking-tighter text-white uppercase leading-[0.8]">
            ARENA <br />
            <span className="text-primary italic">LEGENDS.</span>
         </h1>
         <p className="text-zinc-500 text-lg font-medium max-w-xl mx-auto italic">
            Compete for the top position in the Nigerian Elite Tier. 
            Rewards are distributed every Sunday at 23:59 GMT+1.
         </p>
      </div>

      <div className="flex flex-wrap gap-4 justify-center">
         {[
           { label: 'Weekly Earnings', active: true },
           { label: 'Monthly Growth', active: false },
           { label: 'Lifetime Payouts', active: false }
         ].map((cat) => (
           <button key={cat.label} className={cn(
             "px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all italic",
             cat.active 
               ? "bg-primary text-white shadow-xl shadow-primary/20 border border-white/10" 
               : "bg-zinc-900/50 border border-white/5 text-zinc-600 hover:text-zinc-400"
           )}>
             {cat.label}
           </button>
         ))}
      </div>

      <div className="glass-card overflow-hidden border-white/5">
         <table className="w-full text-left border-collapse">
           <thead>
             <tr className="bg-zinc-900/50 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">
               <th className="px-8 py-6">Rank</th>
               <th className="px-8 py-6">Node Operator</th>
               <th className="px-8 py-6">Yield</th>
               <th className="px-8 py-6">Status</th>
               <th className="px-8 py-6 text-right">Activity</th>
             </tr>
           </thead>
           <tbody className="divide-y divide-white/5">
             {[
               { rank: 1, name: 'StormBreaker', country: 'Nigeria', amount: '₦542,400', games: 124, tier: 'Diamond' },
               { rank: 2, name: 'CryptoKing', country: 'Nigeria', amount: '₦312,200', games: 89, tier: 'Platinum' },
               { rank: 3, name: 'GamerX', country: 'Ghana', amount: '₦285,500', games: 102, tier: 'Gold' },
               { rank: 4, name: 'EtherFlow', country: 'USA', amount: '₦192,100', games: 67, tier: 'Silver' },
               { rank: 5, name: 'NightOwl', country: 'Canada', amount: '₦150,000', games: 45, tier: 'Silver' },
             ].map((row) => (
               <tr key={row.rank} className="hover:bg-white/[0.02] transition-colors group">
                 <td className="px-8 py-8">
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center font-display font-black italic text-lg border",
                      row.rank === 1 ? "bg-primary/20 border-primary/40 text-primary shadow-lg shadow-primary/10" : "bg-zinc-900 border-white/5 text-zinc-600"
                    )}>
                      {row.rank < 10 ? `0${row.rank}` : row.rank}
                    </div>
                 </td>
                 <td className="px-8 py-8">
                   <div className="flex items-center gap-4">
                     <div className="relative">
                       <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 group-hover:border-primary/40 transition-all flex items-center justify-center font-black text-zinc-700 uppercase italic">
                         {row.name[0]}
                       </div>
                       <span className="absolute -bottom-1 -right-1 text-sm bg-zinc-950 rounded-full w-6 h-6 flex items-center justify-center border border-white/10">{getFlagEmoji(row.country)}</span>
                     </div>
                     <div>
                        <span className={cn("font-bold text-base block uppercase tracking-tight italic", row.rank === 1 ? "text-primary" : "text-white")}>{row.name}</span>
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest leading-none">{row.country} • Local node</span>
                     </div>
                   </div>
                 </td>
                 <td className="px-8 py-8">
                    <div className="text-xl font-display font-black text-white italic tracking-tighter">{row.amount}</div>
                    <div className="text-[10px] font-black text-primary uppercase tracking-widest">Calculated Yield</div>
                 </td>
                 <td className="px-8 py-8">
                    <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded bg-white/5 border border-white/10 text-zinc-400 italic">
                      {row.tier} TIER
                    </span>
                 </td>
                 <td className="px-8 py-8 text-right">
                    <div className="text-sm font-bold text-zinc-300 italic">{row.games} Quests</div>
                    <div className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Active Sync</div>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         <div className="glass-card p-8 bg-primary/5 border-primary/20">
            <h4 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Elite Rewards</h4>
            <p className="text-zinc-600 text-sm leading-relaxed mb-6 font-medium">
               The top operator every week receives an exclusive <span className="text-white italic">Elite Founder Badge</span> and holds it until unseated. Diamond tier operators get instant withdrawal settlement.
            </p>
            <button className="btn-primary text-[10px] px-6 py-3 w-fit">View Tier Benefits</button>
         </div>
         <div className="glass-card p-8 border-white/5">
            <h4 className="text-xs font-black text-zinc-400 uppercase tracking-[0.3em] mb-4">Integrity Check</h4>
            <p className="text-zinc-600 text-sm leading-relaxed font-medium">
               All leaderboard earnings are reviewed by our compliance team. Any node detected using unauthorized protocols (VPN/Proxy) will be permanently purged from the arena.
            </p>
         </div>
      </div>
  </div>
);

const ReferralPage = () => {
  const { user, profile } = useFirebase();
  const [copied, setCopied] = useState(false);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [refEarnings, setRefEarnings] = useState(0);
  const [loading, setLoading] = useState(true);

  const refLink = profile?.referralCode 
    ? `${window.location.origin}/join?ref=${profile.referralCode}` 
    : user ? `${window.location.origin}/join?ref=${user.uid}` : 'Generating link...';

  useEffect(() => {
    if (!user) return;

    // 1. Fetch users referred by this user
    const q = query(
      collection(db, 'users'),
      where('referredBy', '==', user.uid)
    );

    const unsubReferrals = onSnapshot(q, (snapshot) => {
      setReferrals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // 2. Fetch referral commission transactions (including first withdrawal bonuses)
    const q2 = query(
      collection(db, `users/${user.uid}/transactions`),
      where('type', 'in', ['referral', 'referral_bonus']),
      orderBy('createdAt', 'desc')
    );

    const unsubEarnings = onSnapshot(q2, (snapshot) => {
      const docs = snapshot.docs.map(doc => doc.data());
      const total = docs.reduce((acc, doc) => acc + (doc.coins || 0), 0);
      setRefEarnings(total);
      setLoading(false);
    }, (error) => {
      console.warn("Error fetching referral earnings", error);
      setLoading(false);
    });

    return () => {
      unsubReferrals();
      unsubEarnings();
    };
  }, [user]);

  const copyToClipboard = () => {
    if (!user) return;
    navigator.clipboard.writeText(refLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-xs font-bold text-primary italic uppercase tracking-widest">
            <Zap className="w-3 h-3" /> Tier 1 Referral Rewards Live
          </div>
          <h1 className="text-5xl font-black font-display leading-[1.1] tracking-tighter italic">
            SHARE WEALTH. <br />
            EARN <span className="text-primary">PERMANENTLY.</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed max-w-md">
            Invite your friends to Dgamers and earn <span className="text-white font-bold">10% commission</span> on every single coin they earn. No limits, no expiration.
          </p>
          
          <div className="glass-card p-1.5 flex gap-2 items-center bg-zinc-900 border-white/10">
            <div className="flex-1 px-4 font-mono text-[10px] text-zinc-400 truncate tracking-tight">
              {refLink}
            </div>
            <button 
              onClick={copyToClipboard}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          {profile?.referredBy && (
            <div className="pt-2 flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              </div>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-black italic">
                Verified Referrer: <span className="text-white">{profile.referrerName || profile.referredBy.slice(0, 8)}</span>
              </p>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           {[
             { label: 'Total Invites', val: referrals.length.toString(), icon: Users, color: 'text-blue-500' },
             { label: 'Referral Earnings', val: `₦${refEarnings.toLocaleString()}`, icon: CreditCard, color: 'text-emerald-500' },
             { label: 'Commision Rate', val: '10%', icon: TrendingUp, color: 'text-amber-500' },
             { label: 'Tier Level', val: profile?.tier || 'Bronze', icon: TrophyIcon, color: 'text-purple-500' },
           ].map((stat, i) => (
             <div key={i} className="glass-card p-6 border-white/5 bg-gradient-to-br from-zinc-900/50 to-transparent">
                <stat.icon className={cn("w-6 h-6 mb-4", stat.color)} />
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest block mb-1">{stat.label}</span>
                <span className="text-2xl font-bold font-display uppercase tracking-tight italic">{stat.val}</span>
             </div>
           ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <h2 className="text-2xl font-bold italic font-display">Real-time Referral Network</h2>
          <div className="glass-card overflow-hidden">
             <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/5 bg-white/5">
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">User</th>
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Joined Date</th>
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">User Rank</th>
                     <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                   {loading ? (
                     <tr>
                       <td colSpan={4} className="px-6 py-12 text-center">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto text-zinc-600 mb-2" />
                          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Scanning Network...</span>
                       </td>
                     </tr>
                   ) : referrals.length === 0 ? (
                     <tr>
                       <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 italic text-sm">
                         No referrals found yet. Share your link to start earning!
                       </td>
                     </tr>
                   ) : (
                     referrals.map((ref, i) => (
                       <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="px-6 py-4">
                             <div className="flex items-center gap-3">
                                <div className="relative">
                                  <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/5 overflow-hidden">
                                     <img src={ref.avatarUrl || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${ref.username}`} alt="av" />
                                  </div>
                                  <span className="absolute -bottom-1 -right-1 text-[10px]">{getFlagEmoji(ref.country || 'Nigeria')}</span>
                                </div>
                                <span className="font-bold">{ref.username}</span>
                             </div>
                          </td>
                          <td className="px-6 py-4 text-zinc-500 text-sm whitespace-nowrap">
                            {ref.createdAt?.toDate ? ref.createdAt.toDate().toLocaleDateString() : 'Newcomer'}
                          </td>
                          <td className="px-6 py-4 italic">
                             <span className={cn(
                               "text-[9px] px-2 py-0.5 rounded font-black uppercase tracking-widest border",
                               ref.tier === 'platinum' ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400" : "bg-zinc-800 border-white/5 text-zinc-500"
                             )}>
                               {ref.tier || 'BRONZE'}
                             </span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono font-bold text-emerald-500">
                            {ref.coins > 0 ? 'ACTIVE' : 'IDLE'}
                          </td>
                       </tr>
                     ))
                   )}
                </tbody>
             </table>
          </div>
        </div>

        <div className="space-y-6">
           <h2 className="text-2xl font-bold italic font-display">How it Works</h2>
           <div className="glass-card p-8 border-primary/20 bg-primary/5 space-y-8">
              {[
                { title: 'Invite Friends', desc: 'Share your link with gamers, streamers, and friends.' },
                { title: 'They Perform', desc: 'User completes offers, surveys, or plays games.' },
                { title: 'You Earn 10%', desc: 'We instantly credit 10% of their earnings to your balance.' },
                { title: 'Lifetime Stream', desc: 'As long as they earn, you earn. Forever.' }
              ].map((step, i) => (
                <div key={i} className="flex gap-4">
                   <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                      0{i+1}
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-tight">{step.title}</h4>
                      <p className="text-xs text-zinc-500 leading-relaxed">{step.desc}</p>
                   </div>
                </div>
              ))}
              <div className="pt-4 border-t border-white/5">
                 <p className="text-[10px] text-zinc-500 italic leading-relaxed text-center">
                    Note: Fake accounts, self-referrals, and VPN users will result in immediate disqualification and balance reset.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const PublicPageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-dark-bg min-h-screen flex flex-col">
    <div className="fixed inset-0 z-0">
      <Hero3D particlesOnly />
    </div>
    <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-12 sticky top-0 bg-dark-bg/80 backdrop-blur-xl z-50">
      <Link to="/" className="flex items-center gap-2 group">
        <div className="w-10 h-10 bg-zinc-900 border border-white/10 rounded-xl flex items-center justify-center group-hover:border-primary/50 transition-all">
          <Gamepad2 className="text-primary w-6 h-6" />
        </div>
        <span className="font-display font-bold text-3xl tracking-tighter italic text-white uppercase">D<span className="text-primary">GAMERS</span></span>
      </Link>
      <Link to="/" className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all">
        Login / Sign Up
      </Link>
    </header>
    <main className="flex-1 relative z-10 p-6 md:p-12">
      {children}
    </main>
    <div className="relative z-10">
      <Footer />
    </div>
  </div>
);

function App() {
  const { user, loading: firebaseLoadingRaw } = useFirebase();
  const [accessDenied, setAccessDenied] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [forceLoad, setForceLoad] = useState(false);

  const firebaseLoading = firebaseLoadingRaw && !forceLoad;

  useEffect(() => {
    const verify = async () => {
      console.log("App: Verifying access...");
      try {
        // Use server.ts endpoint for verification
        const res = await fetch('/api/verify-access');
        if (!res.ok) throw new Error("Verification response not ok");
        const data = await res.json();
        console.log("App: Access data:", data);
        if (!data.isNigeria) {
          setAccessDenied(true);
        }
      } catch (e) {
        console.error("App: Access verification failed", e);
        // Fallback for dev/preview environments to ensure we don't block
        // if the server route isn't perfectly configured yet
      } finally {
        setCheckingAccess(false);
        // Add a slight delay for aesthetic splash screen
        setTimeout(() => {
          console.log("App: Booting complete");
          setIsLoading(false);
        }, 1500);
      }
    };
    verify();

    // Secondary fallback: if for some reason the above hangs, ensure we show something
    const timeout = setTimeout(() => {
      console.log("App: Safety timeout reached, forcing load");
      setCheckingAccess(false);
      setIsLoading(false);
      setForceLoad(true);
    }, 6000);

    return () => clearTimeout(timeout);
  }, []);

  if (checkingAccess || isLoading || firebaseLoading) {
    return (
      <div className="fixed inset-0 bg-black z-[100] flex items-center justify-center overflow-hidden">
        <Hero3D />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-20 h-20 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(37,99,235,0.2)]"
          >
            <Gamepad2 className="text-primary w-10 h-10" />
          </motion.div>
          <div className="flex flex-col items-center gap-4">
            <h1 className="text-4xl font-black font-display tracking-tighter italic text-white text-center">
              D<span className="text-primary">GAMERS</span>
            </h1>
            <div className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] font-mono">
                {checkingAccess ? "Verifying Session..." : firebaseLoading ? "Connecting to Firebase..." : "Initializing Interface..."}
              </span>
              <div className="w-32 h-0.5 bg-zinc-800 relative overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="absolute inset-0 bg-primary"
                />
              </div>
            </div>
            {forceLoad && (
              <button 
                onClick={() => { setCheckingAccess(false); setIsLoading(false); setForceLoad(false); }}
                className="mt-8 text-[10px] text-primary border border-primary/20 bg-primary/5 px-6 py-3 rounded-xl hover:bg-primary/20 transition-all uppercase font-bold tracking-[0.2em]"
              >
                Launch Anyway
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-center p-8 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 to-black">
        <ShieldCheck className="w-16 h-16 text-primary mb-6 animate-bounce" />
        <h1 className="text-4xl font-black font-display mb-4 italic tracking-tight">REGIONAL RESTRICTION</h1>
        <p className="text-zinc-400 max-w-md leading-relaxed text-lg">
          Dgamers is currently only available for elite gamers in <span className="text-primary font-bold">Nigeria.</span>
        </p>
        <p className="text-zinc-600 mt-4 text-sm font-mono uppercase tracking-widest">
          VPN connection detected or invalid region.
        </p>
        <button 
          onClick={() => setAccessDenied(false)}
          className="mt-8 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-[0.3em] border border-white/10 px-6 py-2 rounded-full transition-all"
        >
          [ Bypass for Testing ]
        </button>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/legal" element={<PublicPageWrapper><LegalPage /></PublicPageWrapper>} />
      <Route path="/support" element={<PublicPageWrapper><SupportPage /></PublicPageWrapper>} />
      <Route path="/coming-soon" element={<PublicPageWrapper><ComingSoon /></PublicPageWrapper>} />
      <Route path="*" element={
        !user ? (
          <AuthPage />
        ) : (
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/earn" element={<EarnPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/referrals" element={<ReferralPage />} />
              <Route path="/withdraw" element={<WithdrawPage />} />
              <Route path="/bonus" element={<BonusPage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/support" element={<SupportPage />} />
              <Route path="/legal" element={<LegalPage />} />
              <Route path="/coming-soon" element={<ComingSoon />} />
            </Routes>
          </Layout>
        )
      } />
    </Routes>
  );
}

export default App;
