import { motion, Variants } from 'framer-motion';
import { 
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer
} from 'recharts';
import { Heart, Activity, TrendingUp } from 'lucide-react';

// --- Mock Data for New Charts ---

const weeklyMoodData = [
  { name: 'Mon', mood: 7 }, { name: 'Tue', mood: 8 }, { name: 'Wed', mood: 6 },
  { name: 'Thu', mood: 7 }, { name: 'Fri', mood: 9 }, { name: 'Sat', mood: 8 },
  { name: 'Sun', mood: 7 },
];

const monthlyMoodData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  mood: 6 + Math.sin(i / 3) * 2 + Math.random() * 1.5,
}));

const sentimentData = [
    { sentiment: 'Joy', value: 85 },
    { sentiment: 'Calm', value: 70 },
    { sentiment: 'Optimism', value: 65 },
    { sentiment: 'Sadness', value: 30 },
    { sentiment: 'Anxiety', value: 45 },
    { sentiment: 'Anger', value: 20 },
];

/**
 * A redesigned, multi-chart Insights page for comprehensive data visualization.
 * Features animated bar, line, and radar charts.
 */
export default function Insights() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants: Variants = {
    hidden: { scale: 0.95, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="text-center">
        <h1 className="text-3xl font-bold md:text-4xl">
          Your Mental Health <span className="text-teal-400">Insights</span>
        </h1>
        <p className="mt-1 text-slate-400">Review your progress and find patterns.</p>
      </motion.div>

      {/* Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <motion.div whileHover={{ y: -5 }} className="rounded-2xl bg-slate-800 p-6 text-center shadow-lg shadow-black/20">
          <Heart className="mx-auto h-8 w-8 text-pink-400" />
          <p className="mt-2 text-2xl font-bold">7.8</p>
          <p className="text-sm text-slate-400">Overall Mood Avg</p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="rounded-2xl bg-slate-800 p-6 text-center shadow-lg shadow-black/20">
          <Activity className="mx-auto h-8 w-8 text-purple-400" />
          <p className="mt-2 text-2xl font-bold">12</p>
          <p className="text-sm text-slate-400">Total Conversations</p>
        </motion.div>
        <motion.div whileHover={{ y: -5 }} className="rounded-2xl bg-slate-800 p-6 text-center shadow-lg shadow-black/20">
          <TrendingUp className="mx-auto h-8 w-8 text-teal-400" />
          <p className="mt-2 text-2xl font-bold">+15%</p>
          <p className="text-sm text-slate-400">Mood Improvement</p>
        </motion.div>
      </motion.div>

      {/* Main Grid for Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Weekly Mood Trend Chart (Bar Chart) */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-slate-800 p-6 shadow-lg shadow-black/20">
          <h3 className="text-xl font-semibold text-white">Weekly Mood Trend</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyMoodData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.4}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" strokeOpacity={0.5} />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip cursor={{ fill: 'rgba(148, 163, 184, 0.1)' }} contentStyle={{ background: '#1e293b', borderColor: '#475569' }}/>
                <Bar dataKey="mood" fill="url(#colorMood)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Conversation Sentiment Chart (Radar Chart) */}
        <motion.div variants={itemVariants} className="rounded-2xl bg-slate-800 p-6 shadow-lg shadow-black/20">
          <h3 className="text-xl font-semibold text-white">Conversation Sentiment</h3>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={sentimentData}>
                  <defs>
                      <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#a855f7" stopOpacity={0.4}/>
                        <stop offset="100%" stopColor="#a855f7" stopOpacity={0.1}/>
                      </linearGradient>
                  </defs>
                  <PolarGrid stroke="#475569" strokeOpacity={0.6}/>
                  <PolarAngleAxis dataKey="sentiment" stroke="#94a3b8" />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" strokeOpacity={0} />
                  <Radar name="Sentiment" dataKey="value" stroke="#a855f7" fill="url(#sentimentGradient)" fillOpacity={0.8} />
                  <Tooltip contentStyle={{ background: '#1e293b', borderColor: '#475569' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Monthly Mood Fluctuation (Line Chart) */}
      <motion.div variants={itemVariants} className="rounded-2xl bg-slate-800 p-6 shadow-lg shadow-black/20">
        <h3 className="text-xl font-semibold text-white">30-Day Mood Fluctuation</h3>
        <div className="mt-6 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyMoodData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f472b6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f472b6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" strokeOpacity={0.5}/>
              <XAxis dataKey="day" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip cursor={{ stroke: 'rgba(244, 114, 182, 0.5)', strokeWidth: 1 }} contentStyle={{ background: '#1e293b', borderColor: '#475569' }} />
              <Line type="monotone" dataKey="mood" stroke="#f472b6" strokeWidth={2} dot={false} name="Mood Score"/>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </motion.div>
  );

}
