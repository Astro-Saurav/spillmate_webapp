import { motion, Variants } from 'framer-motion';
import { Check, Star, Zap, Crown, Heart } from 'lucide-react';
import { Link } from 'react-router-dom'; // Corrected import

// Mock hook for standalone functionality
const useAuth = () => ({
  profile: { role: 'free_user' }, // Try 'free_user' or 'premium_user
});

/**
 * A redesigned, animated pricing page with interactive elements.
 */
export default function Pricing() {
  const { profile } = useAuth();

  const plans = [
    {
      name: 'Mindful Start',
      price: 'Free',
      description: 'Perfect for getting started on your mental health journey.',
      icon: Heart,
      features: [
        '3 AI conversations per week',
        'Basic mood tracking',
        'Community support resources',
      ],
      buttonText: 'Current Plan',
      buttonClass: 'bg-slate-700 text-slate-300 cursor-default',
      popular: false,
    },
    {
      name: 'Thrive Plus',
      price: '$9.99',
      period: '/month',
      description: 'Unlimited access for continuous mental wellness support.',
      icon: Star,
      features: [
        'Unlimited AI conversations',
        'Advanced mood & sentiment insights',
        'Personalized coping strategies',
        'Conversation history & export',
        'Priority email support',
      ],
      buttonText: 'Upgrade Now',
      buttonClass: 'bg-gradient-to-r from-purple-500 to-teal-500 hover:shadow-purple-500/30',
      popular: true,
    },
    {
      name: 'Empower Pro',
      price: 'Custom',
      description: 'Dedicated support for teams and organizations.',
      icon: Crown,
      features: [
        'Everything in Thrive Plus',
        'Team dashboards & analytics',
        'Dedicated account manager',
        'Advanced security & compliance',
      ],
      buttonText: 'Contact Sales',
      buttonClass: 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:shadow-orange-500/30',
      popular: false,
    }
  ];

  // --- Animation Variants ---
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
  };

  const itemVariants: Variants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { type: 'spring', stiffness: 300, damping: 20 },
    },
  };

  // --- Premium User View ---
  if (profile?.role === 'premium_user') {
    return (
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="flex h-full flex-col items-center justify-center space-y-8 text-center"
      >
        <motion.div
            variants={itemVariants}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-teal-500"
        >
          <Star className="h-10 w-10 text-white" />
        </motion.div>
        <motion.div variants={itemVariants} className="space-y-4">
          <h1 className="text-3xl font-bold text-white">You're Already a Premium Member!</h1>
          <p className="mx-auto max-w-2xl text-slate-400">
            You have unlimited access to all Spillmate features. Continue your journey with confidence.
          </p>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Link
            to="/dashboard"
            className="inline-block rounded-xl bg-gradient-to-r from-purple-600 to-teal-600 px-8 py-3 font-semibold transition-all hover:from-purple-700 hover:to-teal-700"
          >
            Back to Dashboard
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  // --- Standard Pricing View ---
  return (
    <div className="relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
             <div className="h-[40rem] w-[60rem] rounded-full bg-gradient-to-br from-purple-600/20 via-slate-950 to-teal-600/20 blur-[120px]" />
        </div>
        
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 space-y-16"
        >
            {/* Header */}
            <motion.div variants={itemVariants} className="space-y-6 text-center">
                <h1 className="text-4xl font-bold md:text-5xl">
                <span className="bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent"> Choose Your Path </span>
                <span className="text-white">to Well-being</span>
                </h1>
                <p className="mx-auto max-w-3xl text-xl text-slate-300">
                    Find the plan that best supports your goals. Every journey begins with a single step.
                </p>
            </motion.div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:items-start">
                {plans.map((plan) => (
                    <motion.div
                        key={plan.name}
                        variants={itemVariants}
                        whileHover={{ y: -10, scale: plan.popular ? 1.05 : 1.02 }}
                        className={`relative rounded-3xl p-8 space-y-8 backdrop-blur-md bg-slate-800/60 border border-slate-700
                            ${ plan.popular ? 'border-2 border-purple-500' : '' }
                        `}
                    >
                    {plan.popular && (
                        <>
                            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute -top-4 left-1/2 -translate-x-1/2">
                                <div className="flex items-center space-x-2 rounded-full bg-gradient-to-r from-purple-600 to-teal-600 px-5 py-2 text-sm font-semibold text-white">
                                    <Zap className="h-4 w-4" />
                                    <span>Most Popular</span>
                                </div>
                            </motion.div>
                            <div className="absolute inset-0 -z-10 rounded-3xl bg-purple-500/10 blur-xl"/>
                        </>
                    )}
                    
                    <div className="space-y-4 text-center">
                        <plan.icon className="mx-auto h-10 w-10 bg-gradient-to-r from-purple-400 to-teal-400 rounded-lg p-2 text-white" />
                        <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                        <p className="mx-auto min-h-[40px] max-w-xs text-sm text-slate-400">{plan.description}</p>
                    </div>

                    <div className="flex items-baseline justify-center space-x-1">
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                        {plan.period && ( <span className="text-slate-400">{plan.period}</span> )}
                    </div>
                    
                    <ul className="space-y-3">
                        {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start space-x-3">
                            <Check className="h-5 w-5 flex-shrink-0 text-green-400 mt-0.5" />
                            <span className="text-sm text-slate-300">{feature}</span>
                        </li>
                        ))}
                    </ul>

                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        className={`w-full rounded-xl py-3 font-semibold text-white transition-all shadow-lg ${plan.buttonClass}`}
                        disabled={plan.name === 'Mindful Start'} >
                        {plan.buttonText}
                    </motion.button>
                    </motion.div>
                ))}
            </div>

            {/* FAQ Section */}
            <motion.div variants={itemVariants} className="mx-auto max-w-4xl space-y-8">
                <h2 className="text-center text-3xl font-bold text-white"> Frequently Asked Questions </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {[
                        { q: "Can I cancel anytime?", a: "Yes, you can cancel your subscription at any time from your account settings. Access remains until your billing period ends." },
                        { q: "Is my data secure?", a: "Absolutely. We use end-to-end encryption and follow strict privacy standards to protect your data." },
                        { q: "Do you offer refunds?", a: "We have a 30-day money-back guarantee. If you're not satisfied, contact support for a full refund." },
                        { q: "How does the trial work?", a: "All paid plans start with a 7-day free trial, giving you full access to premium features with no commitment." }
                    ].map((faq, index) => (
                        <motion.div key={index} variants={itemVariants} className="space-y-3 rounded-xl bg-slate-800/60 p-6">
                            <h3 className="font-semibold text-white">{faq.q}</h3>
                            <p className="text-sm text-slate-300">{faq.a}</p>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    </div>
  );
}
