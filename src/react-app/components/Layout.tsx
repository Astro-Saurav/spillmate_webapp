import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import {
  Home,
  MessageSquare,
  Heart,
  CreditCard,
  HelpCircle,
  Settings,
  Menu,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, profile, signOut, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- ANIMATION VARIANTS ---
  const navContainerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      }
    }
  };

  const navItemVariants: Variants = {
    hidden: { y: 20, opacity: 0, scale: 0.9 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20,
      }
    }
  };
  
  const pageVariants: Variants = {
    initial: {
      opacity: 0,
      y: 30,
      skewY: 2,
    },
    in: {
      opacity: 1,
      y: 0,
      skewY: 0,
      transition: {
        type: "tween",
        ease: "anticipate",
        duration: 0.6
      }
    },
    out: {
      opacity: 0,
      y: -30,
      skewY: -2,
      transition: {
        type: "tween",
        ease: "anticipate",
        duration: 0.4
      }
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, roles: ['free_user', 'premium_user', 'admin'] },
    { name: 'Conversations', href: '/conversations', icon: MessageSquare, roles: ['free_user', 'premium_user', 'admin'] },
    { name: 'Mood Tracker', href: '/mood-tracker', icon: Heart, roles: ['free_user', 'premium_user', 'admin'] },
    { name: 'Buy Sessions', href: '/pricing', icon: CreditCard, roles: ['free_user'] },
    { name: 'Settings', href: '/settings', icon: Settings, roles: ['free_user', 'premium_user', 'admin'] },
  ];

  const isActive = (href: string) => location.pathname === href;

  // IMPORTANT BUG FIX: Changed `||` to `&&` to correctly filter navigation based on user role.
  const filteredNavigation = navigation.filter(item =>
    !profile?.role || item.roles.includes(profile.role)
  );
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-400"></div>
      </div>
    );
  }
  
  if (!user) {
    return ( <div className="min-h-screen bg-slate-950">{children}</div> );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white" style={{ perspective: '1000px' }}>
      <motion.nav 
        initial="hidden"
        animate="visible"
        variants={navContainerVariants}
        className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/50 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex items-center space-x-8">
              <Link to="/dashboard" className="flex flex-shrink-0 items-center space-x-2">
                <motion.div
                  whileHover={{ rotateY: 180, scale: 1.1, transition: { duration: 0.6 } }}
                  className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-teal-500"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  <Heart className="h-5 w-5 text-white" />
                </motion.div>
                <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-xl font-bold text-transparent">Spillmate</span>
              </Link>
              
              <motion.div 
                variants={navContainerVariants}
                initial="hidden"
                animate="visible"
                className="hidden space-x-1 md:flex">
                {filteredNavigation.map(item => (
                  <motion.div key={item.name} variants={navItemVariants}>
                    <Link
                      to={item.href}
                      className="relative px-1 py-1 block"
                    >
                      <motion.div
                        whileHover={{ y: -4, rotateX: -15, scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                        className={`flex items-center space-x-2 rounded-lg px-3 py-2 transition-colors ${isActive(item.href) ? 'text-white' : 'text-slate-300 hover:bg-slate-800/50 hover:text-white'}`}
                      >
                        <item.icon className="h-4 w-4" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </motion.div>
                      {isActive(item.href) && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-purple-500 to-teal-500"/>}
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            </div>

            {/* --- THIS IS THE FIX (PART 1) --- */}
            {/* Animate the desktop sign out button */}
            <div className="hidden items-center space-x-4 md:flex">
              <motion.button
                onClick={signOut}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="rounded-lg px-3 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800/50 hover:text-white"
              >
                Sign Out
              </motion.button>
            </div>
            
            <div className="flex items-center md:hidden">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white">
                  {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>
          </div>
        </div>
        
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden border-t border-slate-800 md:hidden">
              <div className="space-y-1 px-2 pb-3 pt-2">
                {filteredNavigation.map(item => (
                    <Link
                      key={item.name}
                      to={item.href}
                      onClick={() => setIsMenuOpen(false)}
                      className={`flex items-center gap-3 rounded-md px-3 py-3 text-base font-medium ${isActive(item.href) ? 'bg-purple-600/30 text-white' : 'text-slate-300 hover:bg-slate-800/50'}`}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                ))}
                <div className="border-t border-slate-700/50 pt-2">
                  {/* --- THIS IS THE FIX (PART 2) --- */}
                  {/* Animate the mobile sign out button */}
                  <motion.button
                    onClick={signOut}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-base font-medium text-slate-300 transition-colors hover:bg-slate-800/50"
                  >
                    <LogOut className="h-5 w-5"/> Sign Out
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          variants={pageVariants}
          initial="initial"
          animate="in"
          exit="out"
          className="flex-1"
        >
          <div className="mx-auto max-w-5xl p-4 py-8 sm:p-6 lg:p-8">
              {children}
          </div>
        </motion.main>
      </AnimatePresence>

       <footer className="border-t border-slate-800 bg-slate-900/30 py-6 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm sm:flex-row sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link to="/terms" className="text-slate-400 transition-colors hover:text-white"> Terms of Service </Link>
            <Link to="/privacy" className="text-slate-400 transition-colors hover:text-white"> Privacy Policy </Link>
            <Link to="/faq" className="flex items-center gap-1 text-slate-400 transition-colors hover:text-white"> <HelpCircle className="h-4 w-4" /> FAQ </Link>
          </div>
          <p className="text-slate-400">© 2024 Spillmate. Your mental health matters.</p>
        </div>
      </footer>
    </div>
  );
}