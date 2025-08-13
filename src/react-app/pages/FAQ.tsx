import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, HelpCircle, Shield, Heart, MessageCircle, Search } from 'lucide-react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const faqs: FAQItem[] = [
    {
      category: 'about',
      question: 'What is Spillmate?',
      answer: 'Spillmate is a confidential, AI-powered mental health companion designed to provide 24/7 emotional support. We offer judgment-free conversations, mood tracking, and crisis guidance in a safe, secure environment.'
    },
    {
      category: 'about',
      question: 'How does Spillmate work?',
      answer: 'Spillmate uses advanced AI technology trained specifically for mental health support. You can chat with our AI companion anytime, track your mood, and access resources when you need them most. All conversations are private and confidential.'
    },
    {
      category: 'conversations',
      question: 'Are my conversations really private?',
      answer: 'Yes, absolutely. All conversations are encrypted end-to-end and stored securely. We never share your personal information or conversation content with third parties. Your privacy and confidentiality are our top priorities.'
    },
    {
      category: 'conversations',
      question: 'Can the AI replace therapy or professional help?',
      answer: 'No, Spillmate is designed to complement, not replace, professional mental health care. While our AI provides valuable support and coping strategies, we always recommend consulting with licensed mental health professionals for serious concerns.'
    },
    {
      category: 'conversations',
      question: 'What happens if I express thoughts of self-harm?',
      answer: 'If you express thoughts of self-harm or suicide, Spillmate will immediately provide crisis resources, including emergency hotlines and local support services. We take these situations seriously and prioritize your safety above all else.'
    },
    {
      category: 'privacy',
      question: 'How is my data protected?',
      answer: 'We use industry-standard security measures including SSL encryption, secure data centers, and strict access controls. We are HIPAA compliant and follow all relevant privacy regulations to protect your information.'
    },
    {
      category: 'privacy',
      question: 'Do you share my information with anyone?',
      answer: 'No, we never share your personal information, conversations, or data with third parties without your explicit consent. The only exception would be if legally required to prevent imminent harm.'
    },
    {
      category: 'privacy',
      question: 'Can I delete my data?',
      answer: 'Yes, you have full control over your data. You can request to delete your account and all associated data at any time through your account settings or by contacting our support team.'
    },
    {
      category: 'features',
      question: 'What features are included in the free plan?',
      answer: 'The free plan includes 1 AI conversation per day, basic mood tracking, access to crisis resources, and community support materials. You can upgrade anytime for unlimited conversations and advanced features.'
    },
    {
      category: 'features',
      question: 'How does mood tracking work?',
      answer: 'Our mood tracking feature lets you log your emotional state on a 1-10 scale with optional notes. Over time, you can see patterns and trends in your mental health, helping you identify triggers and celebrate progress.'
    },
    {
      category: 'features',
      question: 'Can I access Spillmate on my phone?',
      answer: 'Yes, Spillmate works on all devices including smartphones, tablets, and computers. Simply access it through your web browser for a seamless experience across all your devices.'
    },
    {
      category: 'support',
      question: 'What should I do in a mental health emergency?',
      answer: 'In a mental health emergency, please contact emergency services (911) or go to your nearest emergency room. You can also contact the National Suicide Prevention Lifeline at 988 or text HOME to 741741 for the Crisis Text Line.'
    },
    {
      category: 'support',
      question: 'How can I get help using Spillmate?',
      answer: 'If you need help using Spillmate, you can access our help center, contact support through the app, or email us directly. Premium users also have access to priority support for faster assistance.'
    },
    {
      category: 'support',
      question: 'Can I provide feedback about my experience?',
      answer: 'Absolutely! We value your feedback and use it to improve Spillmate. You can submit feedback through the app, rate your conversations, or contact us directly with suggestions or concerns.'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Questions', icon: HelpCircle },
    { id: 'about', name: 'About Spillmate', icon: Heart },
    { id: 'conversations', name: 'Conversations', icon: MessageCircle },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'features', name: 'Features', icon: HelpCircle },
    { id: 'support', name: 'Support', icon: HelpCircle }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleOpen = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <div className="flex items-center justify-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-teal-500 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Frequently Asked Questions</h1>
          </div>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Find answers to common questions about Spillmate, your mental health companion.
            Can't find what you're looking for? Contact our support team.
          </p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
        </motion.div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap gap-2"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </motion.div>

        {/* FAQ Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {filteredFAQs.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-medium text-white">No questions found</h3>
                <p className="text-slate-400 text-sm">
                  Try adjusting your search terms or category filter.
                </p>
              </div>
            </div>
          ) : (
            filteredFAQs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => toggleOpen(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-800/30 transition-colors"
                >
                  <h3 className="font-medium text-white pr-4">{faq.question}</h3>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-4 text-slate-300 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  )
}
