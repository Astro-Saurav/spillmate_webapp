import { useState, ChangeEvent, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { User, CreditCard, Bell, Upload, FileDown } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { Link } from 'react-router-dom';

const predefinedAvatars = [
  { id: 1, gradient: 'from-purple-500 to-indigo-500' }, { id: 2, gradient: 'from-teal-500 to-cyan-500' },
  { id: 3, gradient: 'from-pink-500 to-rose-500' }, { id: 4, gradient: 'from-orange-500 to-amber-500' },
];


export default function Settings() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [displayName, setDisplayName] = useState('Valued User');
  
  const [selectedAvatar, setSelectedAvatar] = useState<number | null>(1);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveChanges = () => { alert('Saving changes...'); };
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(e.target.files[0]);
      setSelectedAvatar(null);
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 400, damping: 25 } }
  };
  const contentVariants: Variants = {
    hidden: { y: 15, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { y: -15, opacity: 0, transition: { duration: 0.2, ease: 'easeInOut' } }
  };
  
  if (loading) return <div className="flex h-full items-center justify-center py-20"><div className="h-12 w-12 animate-spin rounded-full border-b-2 border-purple-500"></div></div>;
  const cardClass = 'bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 shadow-lg shadow-black/30';
  const tabs = [{ id: 'profile', name: 'Profile', icon: User }, { id: 'subscription', name: 'Subscription', icon: CreditCard }, { id: 'preferences', name: 'Preferences', icon: Bell }];
  const billingHistory = [{ id: 'inv1', date: 'August 1, 2024', amount: '$9.99' }, { id: 'inv2', date: 'July 1, 2024', amount: '$9.99' }];

  return (
    <motion.div initial="hidden" animate="visible" variants={{visible: { transition: { staggerChildren: 0.1 } } }} className="space-y-8">
      <motion.div variants={itemVariants}><h1 className="text-3xl font-bold text-white">Account Settings</h1><p className="mt-1 text-slate-400">Manage your profile, subscription, and preferences.</p></motion.div>
      <motion.div variants={itemVariants} className="relative flex space-x-1 rounded-full bg-slate-800 p-1.5 shadow-lg shadow-black/30">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`relative flex w-full items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition z-10 ${activeTab === tab.id ? 'text-white' : 'text-slate-400 hover:text-white'}`}>
            {activeTab === tab.id && <motion.div layoutId="activeSettingsTab" className="absolute inset-0 z-0 rounded-full bg-purple-600 shadow-md shadow-purple-500/40" />}
            <span className="relative z-10 flex items-center gap-2"><tab.icon className="h-5 w-5" /> {tab.name}</span>
          </button>
        ))}
      </motion.div>
      
      {/* --- CORRECTED Tab Content Structure --- */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div key="profile" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className={cardClass}>
              <h3 className="text-xl font-semibold">Public Profile</h3>
              <div className="mt-6 flex flex-col items-center gap-8 md:flex-row"><div className="relative h-28 w-28 flex-shrink-0">{uploadedImage ? ( <img src={uploadedImage} alt="Profile" className="h-full w-full rounded-full object-cover"/> ) : ( <div className={`h-full w-full rounded-full bg-gradient-to-br ${predefinedAvatars.find(a => a.id === selectedAvatar)?.gradient || ''}`}/> )}</div><div className="w-full space-y-4"><p className="text-sm text-slate-400">Choose a 3D avatar or upload your own.</p><div className="flex items-center justify-center md:justify-start gap-4">{predefinedAvatars.map(avatar => (<motion.div key={avatar.id} onClick={() => { setSelectedAvatar(avatar.id); setUploadedImage(null); }} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className={`h-12 w-12 cursor-pointer rounded-full bg-gradient-to-br ${avatar.gradient} transition-all ${selectedAvatar === avatar.id ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-slate-800' : ''}`}/>))}<input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" /><motion.button onClick={() => fileInputRef.current?.click()} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full bg-slate-700 text-slate-400 hover:text-white"><Upload className="h-6 w-6"/></motion.button></div></div></div>
              <div className="mt-8 space-y-6"><div><label className="block text-sm font-medium text-slate-300">Display Name</label><input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} className="mt-1 block w-full rounded-md border-slate-600 bg-slate-900 px-3 py-2 text-white shadow-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"/></div><div><label className="block text-sm font-medium text-slate-300">Email Address</label><input type="email" value={user?.email || ''} readOnly disabled className="mt-1 block w-full rounded-md border-slate-700 bg-slate-800/50 px-3 py-2 text-slate-400"/></div></div>
              <div className="mt-8 border-t border-slate-700 pt-5 text-right"><motion.button onClick={handleSaveChanges} whileHover={{scale:1.05}} whileTap={{scale:0.95}} className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-700">Save Changes</motion.button></div>
            </motion.div>
          )}

          {activeTab === 'subscription' && (
            <motion.div key="subscription" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                <div className={cardClass}><h3 className="text-xl font-semibold">Your Subscription</h3>
                  {profile?.role === 'premium_user' ? (
                      <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3"><motion.div whileHover={{y:-5}} className="rounded-lg bg-slate-900/50 p-4"><p className="text-sm text-slate-400">Status</p><span className="flex items-center gap-2 font-semibold text-green-400"><div className="h-2 w-2 rounded-full bg-green-400"/>Active</span></motion.div><motion.div whileHover={{y:-5}} className="rounded-lg bg-slate-900/50 p-4"><p className="text-sm text-slate-400">Next Renewal</p><p className="font-semibold text-white">August 30, 2025</p></motion.div><motion.div whileHover={{y:-5}} className="rounded-lg bg-slate-900/50 p-4"><p className="text-sm text-slate-400">Billing Cycle</p><p className="font-semibold text-white">Monthly</p></motion.div></div>
                  ) : ( <div className="mt-6 flex flex-col items-center justify-between gap-6 rounded-lg bg-slate-900/50 p-6 text-center sm:flex-row sm:text-left"><p className="max-w-md text-slate-300">You are on the <span className="font-semibold text-white">Free Plan</span>. Upgrade to unlock premium features.</p><Link to="/pricing"><motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} className="rounded-lg bg-purple-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-purple-700">Upgrade Plan</motion.button></Link></div> )}
                </div>
                {profile?.role === 'premium_user' && (
                    <div className={cardClass}> <h3 className="text-xl font-semibold">Billing History</h3> <div className="mt-4 flow-root"><div className="-mx-6 -my-2 overflow-x-auto"><div className="inline-block min-w-full py-2 align-middle px-6"><table className="min-w-full divide-y divide-slate-700"><thead className="text-sm text-slate-400"><tr><th className="py-3.5 text-left">Date</th><th className="py-3.5 text-left">Amount</th><th className="relative py-3.5"><span className="sr-only">Download</span></th></tr></thead><tbody className="divide-y divide-slate-800 text-sm">{billingHistory.map(item => (<tr key={item.id}><td className="py-4">{item.date}</td><td className="py-4">{item.amount}</td><td className="py-4 text-right"><Link to="#" className="flex justify-end items-center gap-2 text-purple-400 hover:text-purple-300"><FileDown className="h-4 w-4"/> Invoice</Link></td></tr>))}</tbody></table></div></div></div> </div>
                )}
            </motion.div>
          )}

          {activeTab === 'preferences' && ( <motion.div key="preferences" variants={contentVariants} initial="hidden" animate="visible" exit="exit" className={cardClass}><h3 className="text-xl font-semibold">Preferences</h3> <p className="mt-4 text-slate-400">Notification preferences will be available here soon.</p> </motion.div> )}
        </AnimatePresence>
      </div>
    </motion.div>
  );

}

