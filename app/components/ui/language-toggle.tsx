"use client"

import { motion } from 'framer-motion'
import { useLanguage } from '../../lib/language-context'
import { Globe } from 'lucide-react'

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage()

  return (
    <motion.button
      onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
      className="relative flex items-center gap-2 px-3 py-2 rounded-full bg-secondary/80 backdrop-blur-sm border border-border/50 hover:bg-secondary transition-colors"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Globe className="w-4 h-4 text-muted-foreground" />
      <div className="flex items-center">
        <span className={`text-sm font-medium transition-colors ${language === 'ar' ? 'text-primary' : 'text-muted-foreground'}`}>
          عربي
        </span>
        <span className="mx-1.5 text-border">/</span>
        <span className={`text-sm font-medium transition-colors ${language === 'en' ? 'text-primary' : 'text-muted-foreground'}`}>
          EN
        </span>
      </div>

      {/* Ripple effect on switch */}
      <motion.div
        key={language}
        className="absolute inset-0 rounded-full bg-primary/5"
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  )
}