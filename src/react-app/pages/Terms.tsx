import { motion, Variants } from 'framer-motion';
import { Shield, Eye, Lock, FileText } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// --- THIS IS THE FIX (PART 1) ---
// We define a clear "blueprint" for what a single section object looks like.
interface Section {
  title: string;
  content: string[];
}
// ------------------------------

export default function Terms() {
  const location = useLocation();
  const isPrivacy = location.pathname === '/privacy';

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30, skewY: 3 },
    visible: {
      opacity: 1,
      y: 0,
      skewY: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15,
      },
    },
  };

  // --- THIS IS THE FIX (PART 2) ---
  // We apply our blueprint to the `sections` array.
  // Now, TypeScript knows that every `section` will have a `title` and a `content` property.
  const sections: Section[] = isPrivacy ? [
    { title: 'Information We Collect', content: [ 'Account information (email address, profile data)', 'Conversation data (chat messages, mood entries)', 'Usage data (how you interact with our service)', 'Device information (browser type, IP address for security)', 'We do not collect sensitive personal data beyond what\'s necessary for the service' ] },
    { title: 'How We Use Your Information', content: [ 'Provide AI-powered mental health conversations', 'Track your mood patterns and progress over time', 'Improve our AI models and service quality', 'Send important service updates and notifications', 'Provide customer support when needed', 'Ensure platform security and prevent abuse' ] },
    { title: 'Data Security & Protection', content: [ 'All conversations are encrypted end-to-end', 'Data is stored in secure, HIPAA-compliant servers', 'Regular security audits and vulnerability assessments', 'Strict access controls - only authorized personnel', 'No third-party access to your conversation data', 'Automatic data deletion options available' ] },
    { title: 'Your Rights & Controls', content: [ 'Access and download your personal data anytime', 'Delete your account and all associated data', 'Control what information is collected', 'Opt out of non-essential communications', 'Request corrections to your data', 'File complaints with data protection authorities' ] },
    { title: 'Data Sharing & Disclosure', content: [ 'We never sell your personal information', 'No advertising or marketing data sharing', 'Limited sharing only with service providers (hosting, security)', 'Legal disclosure only when required by law', 'Emergency disclosure to prevent imminent harm', 'All third parties bound by strict confidentiality agreements' ] }
  ] : [
    { title: 'Service Description', content: [ 'Spillmate provides AI-powered mental health support and conversations', 'Service is for informational and emotional support purposes only', 'Not a substitute for professional medical or psychological treatment', 'Available 24/7 through web and mobile platforms', 'Includes mood tracking, conversation history, and crisis resources' ] },
    { title: 'User Responsibilities', content: [ 'Provide accurate information during registration', 'Use the service only for its intended mental health support purpose', 'Do not share your account credentials with others', 'Report any technical issues or security concerns promptly', 'Respect the AI and other users in all interactions', 'Seek professional help for serious mental health crises' ] },
    { title: 'Privacy & Confidentiality', content: [ 'All conversations are private and confidential', 'We use encryption to protect your data', 'No conversation content is shared with third parties', 'Anonymous usage data may be used to improve the service', 'You can delete your data at any time', 'See our Privacy Policy for complete details' ] },
    { title: 'Subscription & Billing', content: [ 'Free plan includes limited daily conversations', 'Premium plans offer unlimited conversations and features', 'Subscriptions auto-renew unless cancelled', 'Refunds available within 30 days of purchase', 'Changes to pricing will be communicated in advance', 'You can cancel your subscription at any time' ] },
    { title: 'Limitation of Liability', content: [ 'Spillmate is not a medical device or healthcare provider', 'AI responses are not medical advice or diagnoses', 'Service provided "as is" without warranties', 'We are not liable for decisions made based on AI conversations', 'Maximum liability limited to amount paid for service', 'Always seek professional help for medical emergencies' ] }
  ];

  const glassEffectClass = "bg-slate-800/30 border border-slate-700/30 backdrop-blur-md";

  return (
    <div className="min-h-screen bg-slate-950 py-12" style={{ perspective: '1200px' }}>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8"
      >
        {/* Header */}
        <motion.div
          variants={itemVariants}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl flex items-center justify-center">
              {isPrivacy ? <Eye className="w-6 h-6 text-white" /> : <FileText className="w-6 h-6 text-white" />}
            </div>
            <h1 className="text-3xl font-bold text-white">
              {isPrivacy ? 'Privacy Policy' : 'Terms of Service'}
            </h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            {isPrivacy 
              ? 'Learn how we protect your privacy and handle your personal information.'
              : 'Please read these terms carefully before using Spillmate.'
            }
          </p>
          <p className="text-sm text-slate-500">
            Last updated: December 2024
          </p>
        </motion.div>

        {/* Introduction */}
        <motion.div
          variants={itemVariants}
          whileHover={{ y: -5, rotateX: 5, boxShadow: '0px 15px 30px rgba(0, 0, 0, 0.3)' }}
          transition={{ type: 'spring', stiffness: 300 }}
          className={`${glassEffectClass} rounded-2xl p-6 space-y-4`}
        >
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-semibold text-white">Our Commitment</h2>
          </div>
          <p className="text-slate-300 leading-relaxed">
            {isPrivacy 
              ? 'At Spillmate, your privacy and confidentiality are paramount. We are committed to protecting your personal information and ensuring that your mental health conversations remain completely private and secure.'
              : 'Spillmate is committed to providing a safe, supportive environment for mental health conversations. These terms outline our mutual responsibilities and help ensure the service benefits everyone.'
            }
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section) => (
            <motion.div
              key={section.title}
              variants={itemVariants}
              whileHover={{ y: -5, rotateX: 5, boxShadow: '0px 15px 30px rgba(0, 0, 0, 0.3)' }}
              transition={{ type: 'spring', stiffness: 300 }}
              className={`${glassEffectClass} rounded-xl p-6 space-y-4`}
            >
              <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                <Lock className="w-5 h-5 text-purple-400" />
                <span>{section.title}</span>
              </h3>
              <ul className="space-y-2">
                {/* Because `section` is now correctly typed, TypeScript knows `content` is a string array. */}
                {/* This automatically fixes the `itemIndex` error as well. */}
                {section.content.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start space-x-3">
                    <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-slate-300 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Emergency Notice */}
        <motion.div
          variants={itemVariants}
          className="rounded-2xl p-6 border-2 border-red-500/30 bg-red-500/10 space-y-4"
        >
          <div className="flex items-center space-x-3">
            <Shield className="w-6 h-6 text-red-400" />
            <h3 className="text-lg font-semibold text-white">Important Emergency Notice</h3>
          </div>
          <p className="text-slate-300 leading-relaxed">
            <strong>If you are experiencing a mental health emergency or having thoughts of suicide or self-harm, 
            please seek immediate professional help.</strong>
          </p>
        </motion.div>

      </motion.div>
    </div>
  )
}