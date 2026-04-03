// SPDX-License-Identifier: Apache-2.0
import { useState, useMemo } from 'react'
import { motion } from 'motion/react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer
} from 'recharts'
import { useLanguage } from '../context/LanguageContext'
import { simulateDecisionTreeAccuracy } from '../utils/treeUtils'

type ImpurityType = 'gini' | 'entropy'

interface TreeNodeProps {
  depth: number
  maxDepth: number
  nodeIndex: number
  gini: number
}

function TreeNode({ depth, maxDepth, nodeIndex, gini }: TreeNodeProps) {
  const isLeaf = depth >= maxDepth
  const featureIdx = (nodeIndex % 2) + 1
  const threshold = (0.2 + (nodeIndex * 0.15) % 0.6).toFixed(2)
  const label = nodeIndex % 2 === 0 ? 'Class 0' : 'Class 1'

  return (
    <div className="flex flex-col items-center">
      <div className={`rounded-xl border px-3 py-2 text-xs text-center min-w-[90px] ${
        isLeaf
          ? 'border-amber-500/40 bg-amber-500/10 text-amber-300'
          : 'border-zinc-700 bg-zinc-800/60 text-zinc-300'
      }`}>
        {isLeaf ? (
          <>
            <div className="font-bold">{label}</div>
            <div className="text-zinc-500">Gini: {gini.toFixed(3)}</div>
          </>
        ) : (
          <>
            <div className="font-mono font-semibold">x{featureIdx} ≤ {threshold}</div>
            <div className="text-zinc-500">Gini: {gini.toFixed(3)}</div>
          </>
        )}
      </div>
      {!isLeaf && depth < maxDepth && (
        <div className="flex gap-4 mt-3 relative">
          <div className="flex flex-col items-center">
            <div className="w-px h-3 bg-zinc-700" />
            <TreeNode
              depth={depth + 1}
              maxDepth={maxDepth}
              nodeIndex={nodeIndex * 2}
              gini={Math.max(0, gini - 0.08 - (nodeIndex % 3) * 0.04)}
            />
          </div>
          <div className="flex flex-col items-center">
            <div className="w-px h-3 bg-zinc-700" />
            <TreeNode
              depth={depth + 1}
              maxDepth={maxDepth}
              nodeIndex={nodeIndex * 2 + 1}
              gini={Math.max(0, gini - 0.06 - (nodeIndex % 3) * 0.03)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function DecisionTree() {
  const { t } = useLanguage()
  const [depth, setDepth] = useState(3)
  const [impurity, setImpurity] = useState<ImpurityType>('gini')

  const depths = useMemo(() => Array.from({ length: 10 }, (_, i) => i + 1), [])
  const chartData = useMemo(() => simulateDecisionTreeAccuracy(depths, 200, 42), [depths])

  const currentPoint = chartData.find(d => d.depth === depth) ?? chartData[0]
  const optimalDepth = chartData.reduce((best, cur) => cur.testAcc > best.testAcc ? cur : best, chartData[0]).depth

  return (
    <section id="tree" className="py-16 px-6 max-w-7xl mx-auto border-t border-zinc-800/50 scroll-mt-24">
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-zinc-100 mb-2">{t('treeTitle')}</h2>
          <p className="text-amber-400 font-medium mb-2">{t('treeSubtitle')}</p>
          <p className="text-zinc-400 text-sm max-w-3xl">{t('treeHint')}</p>
        </div>

        {/* Controls */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 mb-6 flex flex-wrap gap-6 items-center">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-zinc-300 text-sm font-medium mb-2">
              {t('treeDepth')}: <span className="text-amber-400 font-bold">{depth}</span>
            </label>
            <input
              type="range" min={1} max={10} step={1} value={depth}
              onChange={e => setDepth(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
          <div className="flex gap-2">
            <span className="text-zinc-400 text-sm self-center">{t('treeImpurity')}:</span>
            <button
              onClick={() => setImpurity('gini')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${impurity === 'gini' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'border-zinc-700 text-zinc-400 hover:text-zinc-200'}`}
            >{t('treeGini')}</button>
            <button
              onClick={() => setImpurity('entropy')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${impurity === 'entropy' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'border-zinc-700 text-zinc-400 hover:text-zinc-200'}`}
            >{t('treeEntropy')}</button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-center">
            <div className="text-2xl font-bold text-amber-400">{(currentPoint.trainAcc * 100).toFixed(1)}%</div>
            <div className="text-zinc-400 text-sm mt-1">{t('treeTrainAcc')}</div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 text-center">
            <div className="text-2xl font-bold text-blue-400">{(currentPoint.testAcc * 100).toFixed(1)}%</div>
            <div className="text-zinc-400 text-sm mt-1">{t('treeTestAcc')}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-zinc-200 font-semibold mb-4">Accuracy vs Tree Depth</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="depth" stroke="#71717a" tick={{ fill: '#a1a1aa' }} label={{ value: 'Depth', position: 'insideBottom', offset: -2, fill: '#71717a' }} />
                <YAxis domain={[0.5, 1.0]} stroke="#71717a" tick={{ fill: '#a1a1aa' }} tickFormatter={v => `${(v * 100).toFixed(0)}%`} />
                <Tooltip
                  contentStyle={{ background: '#18181b', border: '1px solid #3f3f46', borderRadius: '8px' }}
                  labelStyle={{ color: '#a1a1aa' }}
                  formatter={(v: number) => `${(v * 100).toFixed(1)}%`}
                />
                <Legend wrapperStyle={{ color: '#a1a1aa' }} />
                <ReferenceLine x={optimalDepth} stroke="#22c55e" strokeDasharray="4 2" label={{ value: 'Optimal', fill: '#22c55e', fontSize: 11 }} />
                <Line type="monotone" dataKey="trainAcc" name={t('treeTrainAcc')} stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 3 }} />
                <Line type="monotone" dataKey="testAcc" name={t('treeTestAcc')} stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Tree visualization */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="text-zinc-200 font-semibold mb-4">{t('treeVisualTitle')}</h3>
            {depth > 4 ? (
              <div className="flex items-center justify-center h-48 text-center">
                <div className="rounded-xl border border-zinc-700 bg-zinc-800/40 p-6 max-w-sm">
                  <div className="text-amber-400 font-semibold mb-2">Depth = {depth}</div>
                  <p className="text-zinc-400 text-sm">{t('treeVisualTooDeep')}</p>
                </div>
              </div>
            ) : (
              <div className="overflow-auto flex justify-center">
                <TreeNode depth={0} maxDepth={depth} nodeIndex={1} gini={0.48} />
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <p className="text-zinc-500 text-xs mb-2">{t('treeSplitExplain')}</p>
              <div className="flex gap-3">
                <code className="px-2 py-1 rounded bg-zinc-800 text-amber-300 text-xs">
                  {impurity === 'gini' ? t('treeGiniFormula') : t('treeEntropyFormula')}
                </code>
              </div>
              <p className="text-zinc-500 text-xs mt-2">{t('treeImpurityExplain')}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
