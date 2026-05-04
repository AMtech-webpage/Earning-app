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
  ExternalLink,
  ShieldCheck,
  Gift
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Hero3D } from './components/Hero3D';

// Helper for tailwind classes
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Mock Components (to be moved to files)
const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Gamepad2, label: 'Play to Earn', path: '/earn' },
    { icon: TrophyIcon, label: 'Leaderboard', path: '/leaderboard' },
    { icon: Wallet, label: 'Cash Out', path: '/withdraw' },
    { icon: Gift, label: 'Bonus Codes', path: '/bonus' },
    { icon: BookOpen, label: 'Guides', path: '/articles' },
  ];

  return (
    <aside className="w-64 border-r border-white/5 bg-dark-bg h-screen sticky top-0 md:flex flex-col hidden">
      <div className="p-6 border-b border-white/5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Gamepad2 className="text-white w-5 h-5" />
          </div>
          <span className="font-display font-bold text-xl tracking-tighter">NOVA<span className="text-primary">REWARDS</span></span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              location.pathname === item.path 
                ? "bg-primary/10 text-white border border-primary/20" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <item.icon className={cn("w-5 h-5 transition-colors", location.pathname === item.path ? "text-primary" : "group-hover:text-primary")} />
            <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-white/5">
        <div className="bg-zinc-900/50 rounded-2xl p-4 border border-white/5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-zinc-500 font-medium">MIN. WASHOUT</span>
            <span className="text-xs text-primary font-bold">$5.00</span>
          </div>
          <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '45%' }}></div>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Earn $2.75 more to cash out BTC</p>
        </div>
      </div>
    </aside>
  );
};

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex min-h-screen bg-dark-bg text-zinc-100 relative overflow-hidden">
      <Hero3D particlesOnly />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 sticky top-0 bg-dark-bg/80 backdrop-blur-xl z-50">
          <div className="flex items-center gap-4 flex-1">
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
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-full border border-white/5">
              <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center mr-1">
                <Bitcoin className="text-primary w-3 h-3" />
              </div>
              <span className="text-sm font-bold">$2.25</span>
              <span className="text-xs text-zinc-500 border-l border-white/10 pl-2">2,250 Coins</span>
            </div>
            <button className="p-2 hover:bg-white/5 rounded-full relative">
              <Bell className="w-5 h-5 text-zinc-400" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-dark-bg"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10"></div>
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
const Dashboard = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 glass-card p-8 bg-gradient-to-br from-zinc-900 to-black relative overflow-hidden group min-h-[400px] flex flex-col justify-center">
        <Hero3D />
        <div className="relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-primary font-bold text-sm uppercase tracking-widest mb-2 block">Powered by Lootably & RevU</span>
            <h1 className="text-6xl font-bold mb-6 font-display max-w-lg leading-[1.1]">
              Level Up Your <span className="text-primary italic">Balance.</span>
            </h1>
            <p className="text-zinc-400 max-w-sm mb-8 leading-relaxed text-lg">
              The ultimate play-to-earn destination. Join elite gamers and cash out at just $5.00.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-full font-bold shadow-lg shadow-primary/40 flex items-center gap-2 group transition-all">
                Start Earning
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-8 py-3 rounded-full font-bold transition-all">
                How it works
              </button>
            </div>
          </motion.div>
        </div>
      </div>
      <div className="flex flex-col gap-6">
        <div className="glass-card p-6 flex flex-col justify-between h-full">
          <div>
            <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">Estimated Monthly Earnings</span>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-4xl font-bold font-display">$142.50</span>
              <span className="text-emerald-500 text-sm font-bold flex items-center gap-0.5 mb-1.5">
                <TrendingUp className="w-3 h-3" /> +12%
              </span>
            </div>
          </div>
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Lifetime Coins</span>
              <span className="font-mono">142,500</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Games Completed</span>
              <span className="font-mono">42</span>
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
              {['Revenue Universe', 'Lootably', 'AdGate Media', 'BitLabs'].map((partner) => (
                <div key={partner} className="glass-card p-6 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary/30 transition-all">
                  <div className="w-16 h-16 bg-zinc-800 rounded-2xl mb-4 group-hover:scale-110 transition-transform"></div>
                  <h3 className="font-bold text-sm tracking-tight">{partner}</h3>
                  <span className="text-[10px] text-zinc-500 mt-1 uppercase tracking-widest font-bold">Hot Offers</span>
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

// Pages
const EarnPage = () => (
  <div className="space-y-12">
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold mb-4 font-display">Earn Rewards</h1>
      <p className="text-zinc-400 text-lg">Select a partner offerwall to discover thousands of games, surveys, and tasks. High-fidelity integrations ensure instant coin tracking.</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { name: 'Revenue Universe', payout: 'High', bonus: '+10%', color: 'border-blue-500/20' },
        { name: 'Lootably', payout: 'Instant', bonus: 'Featured', color: 'border-emerald-500/20' },
        { name: 'AdGate Media', payout: 'High', bonus: '+5%', color: 'border-purple-500/20' },
        { name: 'BitLabs', payout: 'Surveys', bonus: 'New', color: 'border-cyan-500/20' },
        { name: 'AdTally', payout: 'Videos', bonus: '+15%', color: 'border-red-500/20' },
        { name: 'Timewall', payout: 'Microtasks', bonus: 'Active', color: 'border-amber-500/20' },
      ].map((partner) => (
        <motion.div 
          whileHover={{ y: -5 }}
          key={partner.name} 
          className={cn("glass-card p-6 cursor-pointer border hover:border-primary/50 transition-all", partner.color)}
        >
          <div className="flex justify-between items-start mb-6">
            <div className="w-14 h-14 bg-zinc-800 rounded-xl"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-white/5 rounded italic text-zinc-400">{partner.bonus}</span>
          </div>
          <h3 className="text-xl font-bold mb-1">{partner.name}</h3>
          <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold mb-4">{partner.payout} Payouts</p>
          <button className="w-full bg-white/5 hover:bg-white/10 py-2 rounded-lg text-sm font-bold border border-white/5 transition-all">Open Offerwall</button>
        </motion.div>
      ))}
    </div>

    <div>
      <h2 className="text-2xl font-bold mb-6">Top Featured Games</h2>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { name: 'Raid: Shadow Legends', reward: '$12.50' },
          { name: 'Mafia City', reward: '$8.20' },
          { name: 'World of Tanks', reward: '$5.50' },
          { name: 'Rise of Kingdoms', reward: '$15.00' },
          { name: 'Star Trek Fleet', reward: '$9.00' },
        ].map((game) => (
          <div key={game.name} className="glass-card overflow-hidden group cursor-pointer">
            <div className="aspect-[3/4] bg-zinc-800 relative">
               <div className="absolute top-2 right-2 bg-primary px-2 py-1 rounded-md shadow-lg shadow-primary/20 text-[10px] font-bold">
                 {game.reward}
               </div>
            </div>
            <div className="p-3 text-center">
              <h4 className="text-xs font-bold leading-tight line-clamp-1">{game.name}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const WithdrawPage = () => {
  const [amount, setAmount] = useState(2.25);
  const progress = (amount / 5) * 100;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-2">Withdraw Rewards</h1>
        <p className="text-zinc-500">Reach the $5.00 threshold to unlock premium payouts.</p>
      </div>

      <div className="glass-card p-12 text-center space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full bg-primary"
          />
        </div>
        <div>
          <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Available Balance</span>
          <div className="text-6xl font-bold font-display mt-2">${amount.toFixed(2)}</div>
        </div>
        <div className="flex justify-center gap-8 py-4">
          <div className="text-center">
            <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Threshold</div>
            <div className="font-bold">$5.00</div>
          </div>
          <div className="text-center">
            <div className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-1">Status</div>
            <div className="text-amber-500 font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> Locked</div>
          </div>
        </div>
        <p className="text-sm text-zinc-400">You need <span className="text-white font-bold">${(5 - amount).toFixed(2)}</span> more to cash out.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { name: 'Bitcoin (BTC)', icon: Bitcoin, color: 'hover:border-orange-500/30' },
          { name: 'Bitcoin Cash (BCH)', icon: Bitcoin, color: 'hover:border-emerald-500/30' },
          { name: 'Bank Transfer', icon: CreditCard, color: 'hover:border-primary/30' },
        ].map((method) => (
          <div key={method.name} className={cn("glass-card p-8 flex flex-col items-center justify-center gap-4 opacity-50 grayscale cursor-not-allowed border-transparent transition-all", method.color)}>
            <method.icon className="w-12 h-12 text-zinc-600" />
            <h3 className="font-bold text-zinc-400">{method.name}</h3>
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Locked until $5.00</span>
          </div>
        ))}
      </div>

      <div className="glass-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-zinc-500" />
          Withdrawal History
        </h3>
        <div className="text-center py-12 text-zinc-500 text-sm">
          No withdrawals found. Complete offers to start earning.
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

const LegalPage = () => (
  <div className="max-w-4xl mx-auto py-12 space-y-12">
     <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="space-y-2 sticky top-24 h-fit">
           <button className="w-full text-left px-4 py-2 rounded-lg bg-primary/10 text-primary font-bold text-sm">Payout Rules</button>
           <button className="w-full text-left px-4 py-2 rounded-lg text-zinc-500 hover:text-white font-bold text-sm transition-colors">Account Bans</button>
           <button className="w-full text-left px-4 py-2 rounded-lg text-zinc-500 hover:text-white font-bold text-sm transition-colors">VPN Policy</button>
           <button className="w-full text-left px-4 py-2 rounded-lg text-zinc-500 hover:text-white font-bold text-sm transition-colors">Privacy Policy</button>
        </aside>
        <div className="md:col-span-3 glass-card p-10 space-y-6">
           <div className="border-b border-white/5 pb-6">
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Last Updated: May 4, 2026</span>
              <h1 className="text-3xl font-bold mt-2">Payout Rules & Eligibility</h1>
           </div>
           <div className="prose prose-invert prose-zinc max-w-none text-zinc-400 space-y-4">
              <p>To maintain a high-trust environment at NovaRewards, all payout requests are subject to verification. Users must reach a minimum threshold of $5.00 USD (5,000 Coins) before initiating a withdrawal.</p>
              <h3 className="text-white font-bold text-xl mt-8">1. Verification Period</h3>
              <p>Standard withdrawals take 24-72 hours to process. Platinum tier users enjoy instant processing for amounts up to $50.00.</p>
              <h3 className="text-white font-bold text-xl mt-8">2. Bitcoin (BTC) & Bitcoin Cash (BCH)</h3>
              <p>Crypto payments are calculated based on the exchange rate at the time of processing, not at the time of withdrawal request.</p>
              <h3 className="text-white font-bold text-xl mt-8">3. Global Bank Transfers</h3>
              <p>Bank transfers are processed via our global partners and may take 3-5 business days depending on your region.</p>
           </div>
        </div>
     </div>
  </div>
);

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

import { AuthPage } from './components/Auth';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  if (!isAuthenticated) {
    return <AuthPage onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/earn" element={<EarnPage />} />
          <Route path="/withdraw" element={<WithdrawPage />} />
          <Route path="/bonus" element={<BonusPage />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/legal" element={<LegalPage />} />
        </Routes>
      </Layout>
    </Router>
  );
}
