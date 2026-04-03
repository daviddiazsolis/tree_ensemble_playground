// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer
} from 'recharts'
import { AlertTriangle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { simulateBoostingCurves } from '../utils/treeUtils'

const LR_OPTIONS = [0.01, 0.05, 0.1, 0.3, 0.5] as const

export default function GradientBoosting() {
  const { t } = useLanguage()
  const [nRounds, setNRounds] = useState(60)
  const [learningRate, setLearningRate] = useState<number>(0.1)

  const allCurves = useMemo(
    () => simulateBoostingCurves(150, learningRate, 99),
    [learningRate]
  )

  const chartData = useMemo(() => allCurves.slice(0, nRounds), [allCurves, nRounds])

  const currentPoint = chartData[chartData.length - 1]

  const minTestLoss = useMemo(() => Math.min(...allCurves.map(d => d.testLoss)), [allCurves])
  const isOverfitting = currentPoint ? currentPoint.testLoss > minTestLoss + 0.012 : false

  return (
    <section id="boosting" className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50 scroll-mt-24">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-100 mb-2">{t('boostTitle')}</h2>
          <p className="text-amber-400 font-medium mb-2">{t('boostSubtitle')}</p>
          <p className="text-zinc-400 text-sm max-w-3xl">{t('boostHint')}</p>
        </div>

        {/* Controls */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 mb-6 flex flex-wrap gap-6 items-center">
          <div className="flex-1 min-w-[220px]">
            <label className="block text-zinc-300 text-sm font-medium mb-2">
              {t('boostRounds')}: <span className="text-amber-400 font-bold">{nRounds}</span>
            </label>
            <input
              type="range" min={10} max={150} step={5} value={nRounds}
              onChange={e => setNRounds(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
          <div>
            <label className="block text-zinc-300 text-sm font-medium mb-2">{t('boostLR')}</label>
            <div className="flex gap-2 flex-wrap">
              {LR_OPTIONS.map(lr => (
                <button
                  key={lr}
                  onClick={() => setLearningRate(lr)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-mono font-medium transition-colors border ${
                    learningRate === lr
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'border-zinc-700 text-zinc-400 hover:text-zinc-200'
                  }`}
                >{lr}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-center">
            <div className="text-2xl font-bold text-amber-400">{currentPoint?.trainLoss.toFixed(4) ?? '—'}</div>
            <div className="text-zinc-400 text-sm mt-1">{t('boostTrainLoss')}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-center">
            <div className="text-2xl font-bold text-rose-400">{currentPoint?.testLoss.toFixed(4) ?? '—'}</div>
            <div className="text-zinc-400 text-sm mt-1">{t('boostTestLoss')}</div>
          </div>
        </div>

        {/* Overfitting warning */}
        {isOverfitting && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-4 mb-6 flex items-start gap-3"
          >
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <p className="text-rose-300 text-sm">{t('boostOverfitWarning')}</p>
          </motion.div>
        )}

        {/* Chart */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="text-zinc-200 font-semibold mb-4">Loss Curves</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="round" stroke="#71717a" tick={{ fill: '#a1a1aa' }} label={{ value: 'Round', position: 'insideBottom', offset: -2, fill: '#71717a' }} />
              <YAxis stroke="#71717a" tick={{ fill: '#a1a1aa' }} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                labelStyle={{ color: '#a1a1aa' }}
                formatter={(v: number) => v.toFixed(4)}
                labelFormatter={v => `Round: ${v}`}
              />
              <Legend wrapperStyle={{ color: '#a1a1aa' }} />
              <ReferenceLine
                x={allCurves.reduce((best, c) => c.testLoss < best.testLoss ? c : best, allCurves[0]).round}
                stroke="#22c55e" strokeDasharray="4 2"
                label={{ value: 'Best', fill: '#22c55e', fontSize: 11 }}
              />
              <Line type="monotone" dataKey="trainLoss" name={t('boostTrainLoss')} stroke="#f59e0b" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="testLoss" name={t('boostTestLoss')} stroke="#fb7185" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-zinc-500 text-xs">{t('boostExplain')}</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
