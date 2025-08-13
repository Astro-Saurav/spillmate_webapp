import { useEffect, useState } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  MessageCircle,
  Heart,
  TrendingUp,
  Clock,
  Plus,
  BarChart3,
  Zap,
} from 'lucide-react';

import { useAuth } from '@/react-app/hooks/useAuth'

interface Conversation {
  id: string;
  title: string;
  created_at: string;
}

const positiveThoughts = [
  "You are capable of amazing things.",
  "Your potential is limitless. Keep going.",
  "Every day is a new beginning.",
  "You are stronger than you think.",
  "Believe in yourself and all that you are.",
];

/**
 * Renders a refined and animated dashboard for a mental health application.
 */
export default function Dashboard() {
  const { user, profile } = useAuth();

  const [stats, setStats] = useState({
    totalConversations: 0,
    averageMood: 0.0,
    streakDays: 0,
    hoursSupported: 0,
  });
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [thoughtIndex, setThoughtIndex] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchMockData = () => {
        const conversationsData = [
          { id: '1', title: 'Feeling a bit anxious today', created_at: new Date().toISOString() },
          { id: '2', title: 'Reflecting on my week', created_at: new Date().toISOString() },
        ];
        const moodData = [
          { id: '1', mood_rating: 8 }, { id: '2', mood_rating: 7 },
        ];
        
        const avgMood = moodData.reduce((sum, mood) => sum + mood.mood_rating, 0) / moodData.length;

        setConversations(conversationsData.slice(0, 3));
        setStats({
          totalConversations: conversationsData.length,
          hoursSupported: Math.floor(conversationsData.length * 0.5),
          averageMood: avgMood,
          streakDays: moodData.length,
        });

        setLoading(false);
      };

      const timer = setTimeout(fetchMockData, 1200);
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    const timer = setInterval(() => {
      setThoughtIndex(prevIndex => (prevIndex + 1) % positiveThoughts.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  
  const getMoodEmoji = (rating: number): string => {
    if (rating >= 8) return '😊';
    if (rating >= 6) return '🙂';
    return '😐';
  };
  
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  // UPDATED: "Pop-up" animation variant
  const itemVariants: Variants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
          className="h-12 w-12 rounded-full border-t-2 border-purple-400"
        />
        <p className="mt-4 text-lg text-slate-300">Preparing your space...</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
        {/* NEW: Decorative background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="h-[30rem] w-[50rem] rounded-full bg-purple-600/20 blur-[100px]" />
        </div>

        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 mx-auto w-full max-w-4xl space-y-8"
        >
        {/* MODIFIED: Pushed header down with mt-8 */}
        <motion.div variants={itemVariants} className="mt-8 text-center">
            <h1 className="text-3xl font-bold md:text-4xl">
            Welcome, <span className="text-purple-400">{user?.email?.split('@')[0]}</span>
            </h1>
            <p className="mt-2 text-slate-400">Here is your peaceful space.</p>
        </motion.div>

        {/* Positive Thought Slideshow Section */}
        <motion.div variants={itemVariants} className="relative flex h-16 items-center justify-center px-6 text-center">
            <AnimatePresence mode="wait">
            <motion.p
                key={thoughtIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
                className="text-lg italic text-teal-300"
            >
                "{positiveThoughts[thoughtIndex]}"
            </motion.p>
            </AnimatePresence>
        </motion.div>
        
        {/* Core Actions Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link to="/conversations" className="group">
                <motion.div
                    whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(192, 132, 252, 0.1)' }}
                    className="flex h-full flex-col items-center justify-center rounded-2xl bg-slate-800/60 p-6 text-center transition-shadow"
                >
                    <Plus className="mb-2 h-8 w-8 text-purple-400" />
                    <h3 className="text-xl font-semibold text-white">New Conversation</h3>
                    <p className="text-slate-400">Find clarity through words</p>
                </motion.div>
            </Link>
            <Link to="/mood-tracker" className="group">
                <motion.div
                    whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(244, 114, 182, 0.1)' }}
                    className="flex h-full flex-col items-center justify-center rounded-2xl bg-slate-800/60 p-6 text-center transition-shadow"
                >
                    <Heart className="mb-2 h-8 w-8 text-pink-400" />
                    <h3 className="text-xl font-semibold text-white">Track Mood</h3>
                    <p className="text-slate-400">Acknowledge your feelings</p>
                </motion.div>
            </Link>
        </motion.div>

        {/* Stats and Journey Link Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="grid grid-cols-2 gap-6 rounded-2xl bg-slate-800/60 p-6 text-center">
                {[
                    { icon: MessageCircle, label: 'Conversations', value: stats.totalConversations, color: 'text-purple-400' },
                    { icon: Heart, label: 'Average Mood', value: stats.averageMood.toFixed(1), color: 'text-pink-400' },
                    { icon: TrendingUp, label: 'Streak', value: `${stats.streakDays} days`, color: 'text-teal-400' },
                    { icon: Clock, label: 'Hours Saved', value: stats.hoursSupported, color: 'text-indigo-400' },
                ].map(stat => (
                    <div key={stat.label}>
                        <stat.icon className={`mx-auto mb-1 h-7 w-7 ${stat.color}`} />
                        <p className="text-lg font-bold">{stat.value}</p>
                        <p className="text-sm text-slate-400">{stat.label}</p>
                    </div>
                ))}
            </div>
            <Link to="/insights" className="group">
                <motion.div
                    whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(34, 211, 238, 0.1)' }}
                    className="flex h-full flex-col items-center justify-center rounded-2xl bg-slate-800/60 p-6 text-center transition-shadow"
                >
                    <BarChart3 className="mb-2 h-8 w-8 text-cyan-400" />
                    <h3 className="text-xl font-semibold text-white">View Your Journey</h3>
                    <div className="mt-2 flex items-center justify-center space-x-4 text-slate-400">
                        <span>{conversations.length} recent chats</span>
                        <span>{getMoodEmoji(stats.averageMood)} mood avg</span>
                    </div>
                </motion.div>
            </Link>
        </motion.div>

        {/* Upgrade Notice for Free Users */}
        {profile?.role === 'free_user' && (
            <motion.div variants={itemVariants}>
            <Link to="/pricing" className="group">
                <motion.div
                    whileHover={{ y: -5, boxShadow: '0 10px 20px rgba(251, 191, 36, 0.1)' }}
                    className="relative rounded-2xl bg-yellow-900/40 p-6 text-center transition-shadow"
                >
                    <div className="items-center sm:flex sm:gap-6 sm:text-left">
                        <div className="mx-auto mb-4 h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-yellow-500/20 sm:mx-0 sm:mb-0 sm:flex">
                            <Zap className="h-8 w-8 text-yellow-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">Unlock Your Full Potential</h3>
                            <p className="text-yellow-200/80">Upgrade to premium for unlimited conversations and insights.</p>
                        </div>
                    </div>
                </motion.div>
            </Link>
            </motion.div>
        )}
        </motion.div>
    </div>
  );
}
