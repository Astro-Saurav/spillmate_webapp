import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { Heart, TrendingUp, Calendar, Plus, Check } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';

// --- Type Definitions and Mock Data ---
interface MoodEntry {
  id: string;
  mood_rating: number;
  notes?: string;
  created_at: string;
}

const moodOptions = [
  { value: 1, emoji: '😢', label: 'Very Sad' }, { value: 2, emoji: '😔', label: 'Sad' },
  { value: 3, emoji: '😐', label: 'Neutral' }, { value: 4, emoji: '🙂', label: 'Okay' },
  { value: 5, emoji: '😊', label: 'Good' }, { value: 6, emoji: '😄', label: 'Happy' },
  { value: 7, emoji: '🤩', label: 'Great' }, { value: 8, emoji: ' euphoric', label: 'Euphoric' },
];

/**
 * A completely redesigned and interactive Mood Tracker page.
 * Features a modern two-column layout, visual mood selection, and satisfying animations.
 */
export default function MoodTracker() {
  const { user } = useAuth();
  const [currentMood, setCurrentMood] = useState<number>(5);
  const [notes, setNotes] = useState('');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // --- Mock API Functions ---
  useEffect(() => {
    // Simulates fetching initial mood history
    const loadMoodHistory = () => {
        if (!user) return;
        const mockHistory: MoodEntry[] = [
            { id: '1', mood_rating: 6, notes: "Had a great day at work.", created_at: new Date(Date.now() - 86400000).toISOString() },
            { id: '2', mood_rating: 4, notes: "Felt a bit tired.", created_at: new Date(Date.now() - 172800000).toISOString() },
        ];
        setMoodHistory(mockHistory);
    }
    loadMoodHistory();
  }, [user]);

  const submitMood = () => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitted(false);

    // Simulate an API call
    setTimeout(() => {
        const newEntry: MoodEntry = {
            id: new Date().toISOString(),
            mood_rating: currentMood,
            notes: notes,
            created_at: new Date().toISOString(),
        };
        // Add the new entry to the top of the history list for immediate feedback
        setMoodHistory(prev => [newEntry, ...prev]);
        setIsSubmitting(false);
        setSubmitted(true);
        setNotes(''); // Clear notes after submission
        setTimeout(() => setSubmitted(false), 2000); // Reset success state
    }, 1000);
  };

  const selectedMoodData = moodOptions.find(mood => mood.value === Math.round(currentMood)) || moodOptions[4];

  // --- Animation Variants ---
  const itemVariants: Variants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1, transition: { type: 'spring' } } };
  const cardClass = 'bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-black/30';

  const averageMood = moodHistory.length > 0 ? moodHistory.reduce((s, e) => s + e.mood_rating, 0) / moodHistory.length : 5;
  const moodStreak = 7; // Mock streak

  return (
    <motion.div initial="hidden" animate="visible" variants={{visible: { transition: { staggerChildren: 0.1 } }}} className="space-y-8">
      
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-3xl font-bold text-white">How Are You Feeling?</h1>
        <p className="mt-1 text-slate-400">Track your emotional well-being to find patterns and progress.</p>
      </motion.div>

      {/* --- Main Two-Column Layout --- */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Left Column: Mood Input */}
        <motion.div variants={itemVariants} className={`${cardClass} lg:col-span-2 space-y-8 relative`}>
            {/* Background Glow */}
            <div className="absolute inset-0 -z-10 rounded-2xl bg-purple-600/10 blur-2xl"/>

            {/* Selected Mood Display */}
            <AnimatePresence mode="wait">
              <motion.div key={selectedMoodData.label} initial={{y:10, opacity:0}} animate={{y:0, opacity:1}}
                  className="flex flex-col items-center justify-center space-y-2 text-center">
                  <div className="text-6xl">{selectedMoodData.emoji}</div>
                  <p className="text-xl font-semibold text-white">{selectedMoodData.label}</p>
              </motion.div>
            </AnimatePresence>

            {/* Mood Slider */}
            <div className="flex flex-col items-center gap-4">
              <input type="range" min="1" max="8" step="0.1" value={currentMood}
                onChange={e => setCurrentMood(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-lg mood-slider"/>
              <div className="flex w-full justify-between text-xs text-slate-400 px-1">
                <span>Sad</span><span>Neutral</span><span>Happy</span>
              </div>
            </div>

            {/* Notes Textarea */}
            <div>
              <label htmlFor="notes" className="text-sm font-medium text-slate-300">Notes (optional)</label>
              <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)}
                  placeholder="What's on your mind today?"
                  className="mt-1 w-full rounded-md border-slate-600 bg-slate-900 px-3 py-2 text-white shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"/>
            </div>

            {/* Submit Button */}
            <motion.button onClick={submitMood} disabled={isSubmitting || submitted}
                className="flex w-full items-center justify-center gap-2 rounded-lg py-3 text-lg font-semibold text-white transition-all bg-gradient-to-r from-purple-600 to-teal-600 hover:shadow-lg hover:shadow-purple-600/30 disabled:opacity-60 disabled:cursor-not-allowed">
              <AnimatePresence mode="wait">
                  {isSubmitting ? ( <motion.div key="loading" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>Saving...</motion.div> ) : 
                   submitted ? ( <motion.div key="success" initial={{opacity:0, scale:0.8}} animate={{opacity:1, scale:1}} className="flex items-center gap-2"><Check /> Logged!</motion.div> ) :
                   ( <motion.div key="ready" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex items-center gap-2"><Plus /> Log Mood</motion.div> )}
              </AnimatePresence>
            </motion.button>
        </motion.div>

        {/* Right Column: Stats & History */}
        <div className="space-y-8">
            <motion.div variants={itemVariants} className={cardClass}>
              <h3 className="text-lg font-semibold mb-4">At a Glance</h3>
              <div className="space-y-4">
                  <div className="flex items-center gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20 text-purple-400"><TrendingUp/></div><div><p className="text-sm text-slate-400">Average Mood</p><p className="font-bold text-white">{averageMood.toFixed(1)} / 8</p></div></div>
                  <div className="flex items-center gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400"><Calendar/></div><div><p className="text-sm text-slate-400">Logged This Week</p><p className="font-bold text-white">{moodHistory.length}</p></div></div>
                  <div className="flex items-center gap-4"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/20 text-pink-400"><Heart/></div><div><p className="text-sm text-slate-400">Current Streak</p><p className="font-bold text-white">{moodStreak} days</p></div></div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className={cardClass}>
                <h3 className="text-lg font-semibold mb-4">Recent Entries</h3>
                <div className="space-y-4">
                  {moodHistory.slice(0, 3).map(entry => {
                    const mood = moodOptions.find(m => m.value === entry.mood_rating) || moodOptions[4];
                    return (
                        <div key={entry.id} className="flex items-start gap-4 border-b border-slate-700/50 pb-3 last:border-b-0 last:pb-0">
                            <div className="mt-1 text-3xl">{mood.emoji}</div>
                            <div>
                              <p className="font-semibold text-white">{mood.label} <span className="text-sm font-normal text-slate-400">({entry.mood_rating}/8)</span></p>
                              {entry.notes && <p className="text-sm text-slate-400">"{entry.notes}"</p>}
                              <p className="text-xs text-slate-500 mt-1">{new Date(entry.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    );
                  })}
                </div>
            </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

// Add this CSS to your global stylesheet (e.g., index.css) for the slider thumb styling
/*
.mood-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  background: #a855f7;
  cursor: pointer;
  border-radius: 50%;
  border: 2px solid white;
}
.mood-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  background: #a855f7;
  cursor: pointer;
  border-radius: 50%;
  border: 2px solid white;
}
*/