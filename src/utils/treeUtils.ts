// SPDX-License-Identifier: Apache-2.0

function lcg(seed: number) {
  let s = seed
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0xffffffff }
}

function normalRand(rand: () => number) {
  const u = rand() || 1e-10, v = rand() || 1e-10
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function generateClassificationData(n: number, seed: number): { x1: number; x2: number; label: number }[] {
  const rand = lcg(seed)
  const data: { x1: number; x2: number; label: number }[] = []
  for (let i = 0; i < n; i++) {
    const label = i < n / 2 ? 0 : 1
    const cx = label === 0 ? -1.5 : 1.5
    const cy = label === 0 ? -1.5 : 1.5
    data.push({ x1: cx + normalRand(rand) * 1.2, x2: cy + normalRand(rand) * 1.2, label })
  }
  return data
}

export function giniImpurity(labels: number[]): number {
  if (labels.length === 0) return 0
  const counts: Record<number, number> = {}
  for (const l of labels) counts[l] = (counts[l] || 0) + 1
  let sumSq = 0
  for (const k of Object.keys(counts)) {
    const p = counts[Number(k)] / labels.length
    sumSq += p * p
  }
  return 1 - sumSq
}

export function entropy(labels: number[]): number {
  if (labels.length === 0) return 0
  const counts: Record<number, number> = {}
  for (const l of labels) counts[l] = (counts[l] || 0) + 1
  let ent = 0
  for (const k of Object.keys(counts)) {
    const p = counts[Number(k)] / labels.length
    if (p > 0) ent -= p * Math.log2(p)
  }
  return ent
}

export function simulateDecisionTreeAccuracy(
  maxDepths: number[],
  _n: number,
  seed: number
): { depth: number; trainAcc: number; testAcc: number }[] {
  const rand = lcg(seed)
  return maxDepths.map(depth => {
    const noise = (rand() - 0.5) * 0.015
    const trainAcc = 1 - Math.exp(-0.3 * depth) * 0.3 + noise * 0.5
    // test accuracy peaks near depth 4, gaussian-shaped
    const peak = 4
    const spread = 2.5
    const testBase = 0.88 * Math.exp(-((depth - peak) ** 2) / (2 * spread ** 2)) + 0.70
    const testAcc = Math.min(0.97, testBase + noise)
    return {
      depth,
      trainAcc: Math.min(1.0, Math.max(0.5, trainAcc)),
      testAcc: Math.min(0.97, Math.max(0.55, testAcc))
    }
  })
}

export function simulateRandomForestOOBError(
  nEstimatorsList: number[],
  seed: number
): { n: number; oobError: number }[] {
  const rand = lcg(seed)
  return nEstimatorsList.map(n => {
    const noise = (rand() - 0.5) * 0.008
    const oobError = 0.08 + 0.22 * Math.exp(-n / 30) + noise
    return { n, oobError: Math.max(0.04, Math.min(0.32, oobError)) }
  })
}

export function featureImportances(seed: number): { feature: string; importance: number }[] {
  const rand = lcg(seed)
  const raw = Array.from({ length: 6 }, (_, i) => ({
    feature: `Feature ${i + 1}`,
    importance: rand()
  }))
  const total = raw.reduce((s, r) => s + r.importance, 0)
  const normalized = raw.map(r => ({ ...r, importance: r.importance / total }))
  return normalized.sort((a, b) => b.importance - a.importance)
}

export function simulateBoostingCurves(
  nRounds: number,
  learningRate: number,
  seed: number
): { round: number; trainLoss: number; testLoss: number }[] {
  const rand = lcg(seed)
  const result: { round: number; trainLoss: number; testLoss: number }[] = []
  for (let r = 1; r <= nRounds; r++) {
    const noise = (rand() - 0.5) * 0.005
    const trainLoss = 0.5 * Math.exp(-r * learningRate * 0.8) + 0.02 + noise
    const overfit = learningRate > 0.3 && r > 50
      ? (learningRate - 0.3) * (r - 50) * 0.0004
      : 0
    const testLoss = 0.5 * Math.exp(-r * learningRate * 0.5) + 0.08 + overfit + noise * 0.8
    result.push({
      round: r,
      trainLoss: Math.max(0.01, trainLoss),
      testLoss: Math.max(0.05, testLoss)
    })
  }
  return result
}
