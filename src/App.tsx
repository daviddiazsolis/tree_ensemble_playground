// SPDX-License-Identifier: Apache-2.0
import { useState, useEffect } from 'react'
import { GitBranch, Layers, Zap, TrendingUp } from 'lucide-react'
import { ThemeProvider } from './context/ThemeContext'
import { LanguageProvider, useLanguage } from './context/LanguageContext'
import TranslationWidget from './components/TranslationWidget'
import Hero from './components/Hero'
import DecisionTree from './components/DecisionTree'
import RandomForest from './components/RandomForest'
import GradientBoosting from './components/GradientBoosting'
import BiasVariance from './components/BiasVariance'
import References from './components/References'
import Footer from './components/Footer'

const NAV_ITEMS = [
  { id: 'tree', key: 'navTree', icon: <GitBranch className="w-4 h-4" /> },
  { id: 'forest', key: 'navForest', icon: <Layers className="w-4 h-4" /> },
  { id: 'boosting', key: 'navBoosting', icon: <Zap className="w-4 h-4" /> },
  { id: 'bias-variance', key: 'navBiasVariance', icon: <TrendingUp className="w-4 h-4" /> },
]

function SectionNav() {
  const { t } = useLanguage()
  const [active, setActive] = useState('tree')

  useEffect(() => {
    const sections = NAV_ITEMS.map(n => document.getElementById(n.id)).filter(Boolean) as HTMLElement[]
    const observer = new IntersectionObserver(
      entries => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id)
        }
      },
      { rootMargin: '-30% 0px -60% 0px' }
    )
    sections.forEach(s => observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const handleClick = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    setActive(id)
  }

  return (
    <nav className="sticky top-0 z-40 bg-zinc-950/90 backdrop-blur border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-6 flex items-center gap-2 py-3 overflow-x-auto">
        <span className="text-zinc-500 text-sm font-medium mr-2 shrink-0">Jump to:</span>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => handleClick(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors shrink-0 border ${
              active === item.id
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            {item.icon}
            {t(item.key)}
          </button>
        ))}
      </div>
    </nav>
  )
}

function AppInner() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300">
      <TranslationWidget />
      <Hero />
      <SectionNav />
      <main>
        <DecisionTree />
        <RandomForest />
        <GradientBoosting />
        <BiasVariance />
        <References />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AppInner />
      </LanguageProvider>
    </ThemeProvider>
  )
}
