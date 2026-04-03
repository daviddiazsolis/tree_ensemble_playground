// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, LabelList
} from 'recharts'
import { useLanguage } from '../context/LanguageContext'
import { simulateRandomForestOOBError, featureImportances } from '../utils/treeUtils'

const AMBER = '#f59e0b'
const COLORS = ['#f59e0b', '#fb923c', '#fbbf24', '#a78bfa', '#60a5fa', '#34d399']

export default function RandomForest() {
  const { t } = useLanguage()
  const [nEstimators, setNEstimators] = useState(50)

  const nList = useMemo(() => Array.from({ length: 20 }, (_, i) => (i + 1) * 10), [])
  const oobData = useMemo(() => simulateRandomForestOOBError(nList, 7), [nList])
  const importances = useMemo(() => featureImportances(13), [])

  const currentOOB = useMemo(() => {
    const idx = Math.round(nEstimators / 10) - 1
    return oobData[Math.min(idx, oobData.length - 1)]?.oobError ?? 0
  }, [nEstimators, oobData])

  return (
    <section id="forest" className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50 scroll-mt-24">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-100 mb-2">{t('forestTitle')}</h2>
          <p className="text-amber-400 font-medium mb-2">{t('forestSubtitle')}</p>
          <p className="text-zinc-400 text-sm max-w-3xl">{t('forestHint')}</p>
        </div>

        {/* Controls + badge */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 mb-6 flex flex-wrap gap-6 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-zinc-300 text-sm font-medium mb-2">
              {t('forestNEstimators')}: <span className="text-amber-400 font-bold">{nEstimators}</span>
            </label>
            <input
              type="range" min={10} max={200} step={10} value={nEstimators}
              onChange={e => setNEstimators(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
          <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-center">
            <div className="text-2xl font-bold text-amber-400">{(currentOOB * 100).toFixed(2)}%</div>
            <div className="text-zinc-400 text-sm">{t('forestOOBError')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* OOB Error Chart */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-zinc-200 font-semibold mb-4">OOB Error vs n_estimators</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={oobData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="n" stroke="#71717a" tick={{ fill: '#a1a1aa' }} label={{ value: 'Trees', position: 'insideBottom', offset: -2, fill: '#71717a' }} />
                <YAxis stroke="#71717a" tick={{ fill: '#a1a1aa' }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  labelStyle={{ color: '#a1a1aa' }}
                  formatter={(v: number) => `${(v * 100).toFixed(2)}%`}
                  labelFormatter={v => `Trees: ${v}`}
                />
                <Line type="monotone" dataKey="oobError" name={t('forestOOBError')} stroke={AMBER} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 pt-4 border-t border-zinc-800 space-y-1">
              <p className="text-zinc-500 text-xs">{t('forestOOBExplain')}</p>
              <p className="text-zinc-500 text-xs">{t('forestDiminishing')}</p>
            </div>
          </div>

          {/* Feature Importances */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-zinc-200 font-semibold mb-4">{t('forestFeatureImportance')}</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={importances} layout="vertical" margin={{ top: 5, right: 40, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" horizontal={false} />
                <XAxis type="number" stroke="#71717a" tick={{ fill: '#a1a1aa' }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                <YAxis type="category" dataKey="feature" stroke="#71717a" tick={{ fill: '#a1a1aa' }} width={70} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  labelStyle={{ color: '#a1a1aa' }}
                  formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                />
                <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                  {importances.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                  <LabelList dataKey="importance" position="right" formatter={(v: number) => `${(v * 100).toFixed(1)}%`} style={{ fill: '#a1a1aa', fontSize: 11 }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
