import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
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
  Tag
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Hero3D } from './components/Hero3D';
import { AuthPage } from './components/Auth';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';

import { useFirebase } from './contexts/FirebaseContext';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Sidebar = ({ mobileOpen, setMobileOpen }: { mobileOpen?: boolean, setMobileOpen?: (open: boolean) => void }) => {
  const location = useLocation();
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Gamepad2, label: 'Play to Earn', path: '/earn' },
    { icon: History, label: 'Activity', path: '/transactions' },
    { icon: TrophyIcon, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Users, label: 'Referrals', path: '/referrals', badge: 'NEW' },
    { icon: Wallet, label: 'Cash Out', path: '/withdraw' },
    { icon: Gift, label: 'Bonus Codes', path: '/bonus' },
    { icon: BookOpen, label: 'Guides', path: '/articles' },
    { icon: ShieldCheck, label: 'Legal & FAQ', path: '/legal' },
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

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { profile, logout } = useFirebase();
  
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
              <button onClick={logout} className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 overflow-hidden hover:opacity-80 transition-opacity">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.username || 'Lucky'}`} alt="avatar" />
              </button>
              <div className="absolute right-0 top-full mt-2 hidden group-hover/user:block glass-card p-2 min-w-[120px]">
                <button onClick={logout} className="text-xs font-bold text-red-500 hover:text-red-400 w-full text-left p-2">Logout</button>
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
      </div>
    </div>
  );
};

// Pages
const Dashboard = () => {
  const { profile } = useFirebase();
  return (
    <div className="space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 glass-card p-10 bg-gradient-to-br from-zinc-900 to-black relative overflow-hidden group min-h-[440px] flex flex-col justify-center border-white/5">
        <Hero3D />
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-8 bg-primary"></span>
              <span className="text-primary font-bold text-xs uppercase tracking-[0.3em]">Elite Reward Hub</span>
            </div>
            <h1 className="text-7xl font-black mb-8 font-display max-w-2xl leading-[0.9] tracking-tighter italic">
              LEVEL UP YOUR<br />
              <span className="text-primary">BALANCE.</span>
            </h1>
            <p className="text-zinc-400 max-w-sm mb-10 leading-relaxed text-lg font-medium">
              The most reliable play-to-earn ecosystem in Nigeria. Join elite gamers and cash out at just $5.00.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-primary hover:bg-primary/90 text-white px-10 py-4 rounded-xl font-bold shadow-[0_0_30px_rgba(37,99,235,0.2)] flex items-center gap-2 group transition-all border border-white/10 uppercase tracking-widest text-xs">
                Start Earning
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-10 py-4 rounded-xl font-bold transition-all backdrop-blur-md uppercase tracking-widest text-xs">
                Whitepaper
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="glass-card p-8 flex flex-col justify-between h-full bg-zinc-900/40 border-white/5">
          <div>
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> System Projections
            </span>
            <div className="flex items-end gap-2 mt-4">
              <span className="text-5xl font-black font-display tracking-tight">$142.50</span>
            </div>
            <p className="text-xs text-emerald-500 font-bold uppercase mt-2 font-mono">Performance: +12.4%</p>
          </div>
          <div className="mt-12 space-y-4 pt-8 border-t border-white/5 font-mono text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 uppercase tracking-tighter">Verified Coins</span>
              <span className="text-white font-bold">{profile?.coins?.toLocaleString() || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-500 uppercase tracking-tighter">Status</span>
              <span className="text-emerald-500 uppercase">Operational</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
       <div className="md:col-span-3 space-y-8">
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Gamepad2 className="text-primary w-5 h-5" />
                Featured Partner Offerwalls
              </h2>
              <Link to="/earn" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                View All Partners <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: 'Revenue Universe', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop' },
                { name: 'Lootably', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=200&auto=format&fit=crop' },
                { name: 'AdGate Media', img: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=200&auto=format&fit=crop' },
                { name: 'BitLabs', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=200&auto=format&fit=crop' },
              ].map((partner) => (
                <div key={partner.name} className="glass-card p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/30 transition-all overflow-hidden relative">
                  <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                    <img src={partner.img} alt={partner.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="w-16 h-16 bg-zinc-800 rounded-2xl mb-4 group-hover:scale-110 transition-transform flex items-center justify-center border border-white/5 overflow-hidden">
                    <img src={partner.img} alt={partner.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-bold text-sm tracking-tight relative z-10">{partner.name}</h3>
                  <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold relative z-10">Hot Offers</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BookOpen className="text-primary w-5 h-5" />
              Pro-Gamer Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: 'The $5 Cash-out Strategy', category: 'Guides', date: '2h ago' },
                { title: 'Maximizing Reward Payouts', category: 'Earnings', date: '5h ago' },
                { title: 'Why Bitcoin for Payments?', category: 'Crypto', date: '1d ago' },
              ].map((article, i) => (
                <div key={i} className="glass-card overflow-hidden group cursor-pointer border border-white/5 hover:border-primary/20">
                  <div className="h-40 bg-zinc-800"></div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded font-bold uppercase">{article.category}</span>
                      <span className="text-[10px] text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {article.date}</span>
                    </div>
                    <h3 className="font-bold group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
       </div>

       <div className="space-y-6">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Live Activity</h3>
          <div className="space-y-3">
             {[
               { user: 'Storm7', amount: '$5.00', partner: 'RevU', time: 'Just now' },
               { user: 'GamerX', amount: '$1.25', partner: 'Lootably', time: '2m ago' },
               { user: 'CryptoP', amount: '$15.00', partner: 'AdGate', time: '5m ago' },
               { user: 'MuizI', amount: '$2.50', partner: 'BitLabs', time: '8m ago' },
               { user: 'Elite1', amount: '$0.80', partner: 'Lootably', time: '12m ago' },
               { user: 'Zoro99', amount: '$10.00', partner: 'RevU', time: '15m ago' },
             ].map((feed, i) => (
               <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="glass-card p-4 border border-white/5 flex flex-col gap-1"
               >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm">{feed.user}</span>
                    <span className="text-emerald-500 font-bold text-sm tracking-tight">{feed.amount}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-500">
                    <span className="uppercase font-bold tracking-widest">{feed.partner}</span>
                    <span className="italic">{feed.time}</span>
                  </div>
               </motion.div>
             ))}
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
    <div className="space-y-12">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold mb-4 font-display italic tracking-tight">Earn Rewards</h1>
        <p className="text-zinc-400 text-lg">Select a partner offerwall to discover thousands of games, surveys, and tasks. High-fidelity integrations ensure instant coin tracking.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Revenue Universe', payout: 'High', bonus: '+10%', color: 'border-blue-500/20', img: 'https://images.unsplash.com/photo-1580234811497-9bd7fd2f357d?w=300&auto=format' },
          { name: 'Lootably', payout: 'Instant', bonus: 'Featured', color: 'border-emerald-500/20', img: 'https://images.unsplash.com/photo-1552824734-80467882ff24?w=300&auto=format' },
          { name: 'AdGate Media', payout: 'High', bonus: '+5%', color: 'border-purple-500/20', img: 'https://images.unsplash.com/photo-1614332287897-cdc485fa562d?w=300&auto=format' },
          { name: 'BitLabs', payout: 'Surveys', bonus: 'New', color: 'border-cyan-500/20', img: 'https://images.unsplash.com/photo-1551269901-5c5e14c25df7?w=300&auto=format' },
          { name: 'AdTally', payout: 'Videos', bonus: '+15%', color: 'border-red-500/20', img: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&auto=format' },
          { name: 'Timewall', payout: 'Microtasks', bonus: 'Active', color: 'border-amber-500/20', img: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?w=300&auto=format' },
        ].map((partner) => (
          <motion.div 
            whileHover={{ y: -5 }}
            key={partner.name} 
            className={cn("glass-card p-6 cursor-pointer border hover:border-primary/50 transition-all group overflow-hidden relative", partner.color)}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity">
              <img src={partner.img} alt="" className="w-full h-full object-cover" />
            </div>
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className="w-14 h-14 bg-zinc-800 rounded-xl overflow-hidden border border-white/5">
                <img src={partner.img} alt={partner.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/5 rounded italic text-zinc-400">{partner.bonus}</span>
            </div>
            <h3 className="text-xl font-bold mb-1 relative z-10 font-display italic">{partner.name}</h3>
            <p className="text-zinc-500 text-[10px] uppercase tracking-[0.2em] font-bold mb-4 relative z-10">{partner.payout} Payouts</p>
            <button className="w-full bg-white/5 hover:bg-white/10 py-3 rounded-xl text-xs font-bold border border-white/5 transition-all relative z-10 uppercase tracking-widest group-hover:bg-primary group-hover:border-primary transition-all duration-300">Open Offerwall</button>
          </motion.div>
        ))}
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 font-display italic tracking-tight">Top Featured Games</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'Raid: Shadow Legends', reward: '$12.50', img: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=200&auto=format&fit=crop' },
            { name: 'Mafia City', reward: '$8.20', img: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=200&auto=format&fit=crop' },
            { name: 'World of Tanks', reward: '$5.50', img: 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?q=80&w=200&auto=format&fit=crop' },
            { name: 'Rise of Kingdoms', reward: '$15.00', img: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=200&auto=format&fit=crop' },
            { name: 'Star Trek Fleet', reward: '$9.00', img: 'https://images.unsplash.com/photo-1552824734-80467882ff24?q=80&w=200&auto=format&fit=crop' },
          ].map((game) => (
            <div key={game.name} onClick={() => handleTaskComplete(game)} className="glass-card overflow-hidden group cursor-pointer border border-white/5 hover:border-primary/20 transition-all">
              <div className="aspect-[3/4] bg-zinc-800 relative overflow-hidden">
                 <img src={game.img} alt={game.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-4">
                    <span className="bg-primary text-white text-[10px] font-black px-4 py-2 rounded-lg uppercase tracking-widest shadow-2xl">Claim Reward</span>
                 </div>
                 <div className="absolute top-2 right-2 bg-primary px-2 py-1 rounded-md shadow-lg shadow-primary/20 text-[10px] font-bold">
                   {game.reward}
                 </div>
              </div>
              <div className="p-3 text-center relative bg-zinc-900 border-t border-white/5">
                <h4 className="text-xs font-bold leading-tight line-clamp-1">{game.name}</h4>
              </div>
            </div>
          ))}
        </div>
      </div>
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
  const { profile } = useFirebase();
  const amount = profile?.coins ? profile.coins / 1000 : 0;
  const progress = Math.min((amount / 5) * 100, 100);

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-10 bg-gradient-to-br from-zinc-900 to-black relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="relative z-10">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] block mb-2">Available Balance</span>
              <div className="flex items-center gap-4">
                <h1 className="text-6xl font-black font-display tracking-tight">${amount.toFixed(2)}</h1>
                <div className="h-10 w-px bg-white/10 mx-2"></div>
                <div className="flex flex-col">
                  <span className="text-emerald-500 font-mono font-bold">2,250 Coins</span>
                  <span className="text-[10px] text-zinc-600 font-bold uppercase">~ 5,175.00 NGN</span>
                </div>
              </div>
              <p className="text-zinc-500 text-sm mt-6 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Verified for Nigerian Bank Transfers (Instant).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             {[
               { name: 'Nigerian Bank Transfer', sub: 'Instant NGN', min: '$5.00', icon: CreditCard, hot: true },
               { name: 'Bitcoin (BTC)', sub: 'Global Crypto', min: '$10.00', icon: Bitcoin },
               { name: 'Airtime Recharge', sub: 'MTN, Airtel, Glo', min: '$1.00', icon: Zap },
               { name: 'USDT (TRC20)', sub: 'Stablecoin', min: '$15.00', icon: ShieldCheck },
             ].map((method) => (
               <div key={method.name} className="glass-card p-6 flex items-center justify-between group cursor-pointer hover:border-primary/40 transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <method.icon className="w-5 h-5 text-primary" />
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
                  <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Progress to $5.00</span>
                  <span className="text-xl font-bold font-display">{progress.toFixed(0)}%</span>
                </div>
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all duration-1000"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-zinc-500 italic leading-relaxed">
                  Earn ${(5 - amount).toFixed(2)} more to unlock Nigerian Bank Transfers.
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
                <p>By using Dgamers, you agree to the following terms and conditions. These terms ensure a fair and safe experience for all elite gamers on our platform.</p>
                <h3 className="text-white font-bold text-xl">1. Eligibility</h3>
                <p>You must be at least 13 years of age to use Dgamers. Our platform is currently optimized for users residing in Nigeria. Accessing the platform from other regions or using a VPN is strictly prohibited and will result in an immediate account ban.</p>
                <h3 className="text-white font-bold text-xl">2. Account Security</h3>
                <p>You are responsible for maintaining the confidentiality of your account information. Any activity that occurs under your account is your responsibility. Multi-accounting (creating more than one account for same user) is a violation of our terms.</p>
                <h3 className="text-white font-bold text-xl">3. Reward Revocation</h3>
                <p>Dgamers reserves the right to revoke coins or earnings if we detect fraudulent activity, completion of offers through unauthorized means, or exploit of platform mechanics.</p>
              </motion.div>
            )}

            {activeTab === 'privacy' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <p>Your privacy is paramount. We only collect the data necessary to provide you with a world-class reward experience.</p>
                <h3 className="text-white font-bold text-xl">1. Data Collection</h3>
                <p>We collect basic profile information (email, username), device identifiers (to prevent fraud), and IP address data for regional verification purposes.</p>
                <h3 className="text-white font-bold text-xl">2. Third-Party Partners</h3>
                <p>When you use offerwalls (Lootably, RevU, etc.), they may collect data as part of their fulfillment process. Please review their independent privacy policies for details.</p>
                <h3 className="text-white font-bold text-xl">3. No Selling of Data</h3>
                <p>Dgamers never sells your personal information to third-party advertisers. Your data is used exclusively for reward tracking and security verification.</p>
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
  <div className="space-y-8">
     <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-4xl font-bold mb-4 font-display">Global Arena</h1>
        <p className="text-zinc-400">Compete with gamers worldwide. Top ranks earn weekly bonuses and exclusive cyan badges.</p>
     </div>

     <div className="flex flex-wrap gap-2 justify-center mb-8">
        {['Top Earners (Weekly)', 'Most Games Played', 'Highest Payout'].map((cat, i) => (
          <button key={cat} className={cn(
            "px-6 py-2 rounded-full text-sm font-medium transition-all border",
            i === 0 ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" : "bg-zinc-900 border-white/5 text-zinc-400 hover:text-white"
          )}>
            {cat}
          </button>
        ))}
     </div>

     <div className="glass-card overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/5">
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Rank</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">User</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Earnings</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Games</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {[
              { rank: 1, name: 'StormBreaker', amount: '$542.40', games: 124, color: 'text-cyan-400 shadow-cyan-400/50' },
              { rank: 2, name: 'CryptoKing', amount: '$312.20', games: 89, color: 'text-zinc-200' },
              { rank: 3, name: 'GamerX', amount: '$285.50', games: 102, color: 'text-zinc-200' },
              { rank: 4, name: 'EtherFlow', amount: '$192.10', games: 67, color: 'text-zinc-400' },
              { rank: 5, name: 'NightOwl', amount: '$150.00', games: 45, color: 'text-zinc-400' },
            ].map((row) => (
              <tr key={row.rank} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-6 font-display font-bold">
                   <div className={cn(
                     "w-8 h-8 rounded-lg flex items-center justify-center border",
                     row.rank === 1 ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400" : "bg-zinc-800 border-white/5"
                   )}>
                     {row.rank}
                   </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/5 group-hover:border-primary/50 transition-colors"></div>
                    <span className={cn("font-bold", row.rank === 1 && "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]")}>{row.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono font-bold text-zinc-200 group-hover:text-primary transition-colors">{row.amount}</td>
                <td className="px-6 py-4 text-zinc-500 group-hover:text-zinc-300">{row.games}</td>
              </tr>
            ))}
          </tbody>
        </table>
     </div>
  </div>
);

const ReferralPage = () => {
  const { profile } = useFirebase();
  const [copied, setCopied] = useState(false);
  const refLink = `${window.location.origin}/join?ref=${profile?.uid || 'USR_67J29'}`;

  const copyToClipboard = () => {
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
          {profile?.referrerId && (
            <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-bold">
              You were referred by: <span className="text-primary">{profile.referrerId.slice(0, 8)}...</span>
            </p>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-4">
           {[
             { label: 'Total Invites', val: '0', icon: Users, color: 'text-blue-500' },
             { label: 'Referral Earnings', val: '$0.00', icon: CreditCard, color: 'text-emerald-500' },
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

      <div>
        <h2 className="text-2xl font-bold mb-6">Real-time Referral Network</h2>
        <div className="glass-card overflow-hidden">
           <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 bg-white/5">
                   <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">User</th>
                   <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Joined Date</th>
                   <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500">Earnings Status</th>
                   <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-zinc-500 text-right">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                 {[
                   { user: 'Storm7', date: 'May 1, 2026', status: 'Active', commission: '$4.20' },
                   { user: 'GamerX', date: 'Apr 28, 2026', status: 'Active', commission: '$1.45' },
                   { user: 'CryptoP', date: 'Apr 25, 2026', status: 'Pending', commission: '$0.00' },
                   { user: 'MuizI', date: 'Apr 22, 2026', status: 'Active', commission: '$6.85' },
                 ].map((ref, i) => (
                   <tr key={i} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/5"></div>
                            <span className="font-bold">{ref.user}</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-500 text-sm whitespace-nowrap">{ref.date}</td>
                      <td className="px-6 py-4 italic">
                         <span className={cn(
                           "text-xs px-2 py-0.5 rounded font-bold uppercase",
                           ref.status === 'Active' ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                         )}>
                           {ref.status}
                         </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-emerald-500">{ref.commission}</td>
                   </tr>
                 ))}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { user, loading: firebaseLoading } = useFirebase();
  const [accessDenied, setAccessDenied] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verify = async () => {
      try {
        // Use server.ts endpoint for verification
        const res = await fetch('/api/verify-access');
        const data = await res.json();
        if (!data.isNigeria) {
          setAccessDenied(true);
        }
      } catch (e) {
        console.error("Access verification failed", e);
      } finally {
        setCheckingAccess(false);
        // Add a slight delay for aesthetic splash screen
        setTimeout(() => setIsLoading(false), 2000);
      }
    };
    verify();
  }, []);

  if (checkingAccess || isLoading || firebaseLoading) {
    return (
// ... (rest of simple spinner logic)
      <div className="fixed inset-0 bg-dark-bg z-[100] flex items-center justify-center overflow-hidden">
        <Hero3D />
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-20 h-20 bg-zinc-900 border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(37,99,235,0.2)]"
          >
            <Gamepad2 className="text-primary w-10 h-10" />
          </motion.div>
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col items-center gap-2"
          >
            <h1 className="text-4xl font-black font-display tracking-tighter italic">
              D<span className="text-primary">GAMERS</span>
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-12 h-0.5 bg-zinc-800 relative overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="absolute inset-0 bg-primary"
                />
              </div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] font-mono">
                {checkingAccess ? "Verifying Session" : "Booting Systems"}
              </span>
              <div className="w-12 h-0.5 bg-zinc-800 relative overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="absolute inset-0 bg-primary"
                />
              </div>
            </div>
          </motion.div>
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
    <Router>
      {!user ? (
        <AuthPage />
      ) : (
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/earn" element={<EarnPage />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/referrals" element={<ReferralPage />} />
            <Route path="/withdraw" element={<WithdrawPage />} />
            <Route path="/bonus" element={<BonusPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/legal" element={<LegalPage />} />
          </Routes>
        </Layout>
      )}
    </Router>
  );
}

export default App;
