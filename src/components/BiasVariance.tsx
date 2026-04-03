// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer
} from 'recharts'
import { useLanguage } from '../context/LanguageContext'

function computeBVData() {
  return Array.from({ length: 10 }, (_, i) => {
    const c = i + 1
    const bias2 = 0.5 / c
    const variance = 0.02 * c * c
    const irreducible = 0.05
    const total = bias2 + variance + irreducible
    return { complexity: c, bias2, variance, irreducible, total }
  })
}

export default function BiasVariance() {
  const { t } = useLanguage()
  const [complexity, setComplexity] = useState(4)

  const data = useMemo(() => computeBVData(), [])

  const sweetSpot = useMemo(() => {
    return data.reduce((best, cur) => cur.total < best.total ? cur : best, data[0]).complexity
  }, [data])

  const current = data.find(d => d.complexity === complexity) ?? data[0]

  return (
    <section id="bias-variance" className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50 scroll-mt-24">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-100 mb-2">{t('bvTitle')}</h2>
          <p className="text-amber-400 font-medium mb-2">{t('bvSubtitle')}</p>
          <p className="text-zinc-400 text-sm max-w-3xl">{t('bvHint')}</p>
        </div>

        {/* Controls */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 mb-6">
          <label className="block text-zinc-300 text-sm font-medium mb-2">
            {t('bvComplexity')}: <span className="text-amber-400 font-bold">{complexity}</span>
          </label>
          <input
            type="range" min={1} max={10} step={1} value={complexity}
            onChange={e => setComplexity(Number(e.target.value))}
            className="w-full accent-amber-500"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-center">
            <div className="text-2xl font-bold text-blue-400">{current.bias2.toFixed(3)}</div>
            <div className="text-zinc-400 text-sm mt-1">{t('bvBias')}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-center">
            <div className="text-2xl font-bold text-rose-400">{current.variance.toFixed(3)}</div>
            <div className="text-zinc-400 text-sm mt-1">{t('bvVariance')}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-center">
            <div className="text-2xl font-bold text-zinc-400">{current.irreducible.toFixed(3)}</div>
            <div className="text-zinc-400 text-sm mt-1">{t('bvIrreducible')}</div>
          </div>
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 text-center">
            <div className="text-2xl font-bold text-amber-400">{current.total.toFixed(3)}</div>
            <div className="text-zinc-400 text-sm mt-1">{t('bvTotalError')}</div>
          </div>
        </div>

        {/* Chart */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <h3 className="text-zinc-200 font-semibold mb-4">Bias-Variance Decomposition</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis dataKey="complexity" stroke="#71717a" tick={{ fill: '#a1a1aa' }} label={{ value: 'Complexity', position: 'insideBottom', offset: -2, fill: '#71717a' }} />
              <YAxis stroke="#71717a" tick={{ fill: '#a1a1aa' }} />
              <Tooltip
                contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                labelStyle={{ color: '#a1a1aa' }}
                formatter={(v: number) => v.toFixed(3)}
                labelFormatter={v => `Complexity: ${v}`}
              />
              <Legend wrapperStyle={{ color: '#a1a1aa' }} />
              <ReferenceLine x={sweetSpot} stroke="#22c55e" strokeDasharray="4 2" label={{ value: t('bvSweetSpot') + sweetSpot, fill: '#22c55e', fontSize: 11 }} />
              <ReferenceLine x={complexity} stroke="#f59e0b" strokeWidth={1.5} label={{ value: 'Current', fill: '#f59e0b', fontSize: 11 }} />
              <Line type="monotone" dataKey="bias2" name={t('bvBias')} stroke="#60a5fa" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="variance" name={t('bvVariance')} stroke="#fb7185" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="irreducible" name={t('bvIrreducible')} stroke="#71717a" strokeWidth={1.5} strokeDasharray="5 3" dot={false} />
              <Line type="monotone" dataKey="total" name={t('bvTotalError')} stroke="#f59e0b" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-zinc-500 text-xs">{t('bvExplain')}</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
