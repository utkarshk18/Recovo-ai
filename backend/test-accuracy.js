/**
 * RECOVO AI — Gemini AI Clinical Accuracy & Performance Benchmark Suite
 */

const fs = require('fs');
const path = require('path');
const { analyzeSymptoms, clearCache } = require('./ai-engine');

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function analyzeWithRetry(transcript, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const res = await analyzeSymptoms(transcript);
    // If fallback was triggered due to rate limit, wait and retry
    if (res.engine && res.engine.includes('Fallback') && attempt < maxRetries) {
      console.log(`   ⏳ Rate limit detected, waiting 12s before retry (attempt ${attempt}/${maxRetries})...`);
      await delay(12000);
      continue;
    }
    return res;
  }
  return await analyzeSymptoms(transcript);
}

async function runBenchmark(options = {}) {
  const verbose = options.verbose ?? true;
  const rateLimitFriendly = options.rateLimitFriendly ?? true;
  const testCasesPath = path.join(__dirname, 'test-cases.json');
  
  if (!fs.existsSync(testCasesPath)) {
    console.error('❌ Test cases file not found:', testCasesPath);
    return null;
  }

  // Clear cache for clean benchmark
  clearCache();

  const testCases = JSON.parse(fs.readFileSync(testCasesPath, 'utf8'));
  console.log(`\n🧪 Running RECOVO AI Benchmark Suite (${testCases.length} Test Cases)...`);
  console.log('='.repeat(75));

  let correctCount = 0;
  let highRiskTotal = 0;
  let highRiskCorrect = 0;
  let medRiskTotal = 0;
  let medRiskCorrect = 0;
  let lowRiskTotal = 0;
  let lowRiskCorrect = 0;
  let totalPainError = 0;
  let validSchemaCount = 0;
  let aiEngineCount = 0;

  const latencies = [];
  const results = [];

  for (const tc of testCases) {
    const startTime = Date.now();
    let result;
    let error = null;

    try {
      if (rateLimitFriendly) {
        result = await analyzeWithRetry(tc.transcript);
      } else {
        result = await analyzeSymptoms(tc.transcript);
      }
    } catch (err) {
      error = err.message;
      result = { riskLevel: 'error', confidence: 0, painLevel: -1 };
    }

    const duration = Date.now() - startTime;
    latencies.push(duration);

    if (result.engine && result.engine.includes('Gemini')) {
      aiEngineCount++;
    }

    // Evaluate Risk Level
    const isRiskCorrect = (result.riskLevel || '').toLowerCase() === tc.expectedRisk.toLowerCase();
    if (isRiskCorrect) correctCount++;

    if (tc.expectedRisk === 'high') {
      highRiskTotal++;
      if (isRiskCorrect) highRiskCorrect++;
    } else if (tc.expectedRisk === 'medium') {
      medRiskTotal++;
      if (isRiskCorrect) medRiskCorrect++;
    } else if (tc.expectedRisk === 'low') {
      lowRiskTotal++;
      if (isRiskCorrect) lowRiskCorrect++;
    }

    // Evaluate Pain Level Range
    const actualPain = typeof result.painLevel === 'number' ? result.painLevel : 0;
    const [minP, maxP] = tc.expectedPainRange;
    let painDiff = 0;
    if (actualPain < minP) painDiff = minP - actualPain;
    else if (actualPain > maxP) painDiff = actualPain - maxP;
    totalPainError += painDiff;

    // Check JSON Schema Validity
    const isValidSchema = 
      ['low', 'medium', 'high'].includes(result.riskLevel) &&
      typeof result.confidence === 'number' &&
      typeof result.message === 'string' &&
      Array.isArray(result.reasons) &&
      typeof result.action === 'string' &&
      typeof result.painLevel === 'number';
    
    if (isValidSchema) validSchemaCount++;

    const statusIcon = isRiskCorrect ? '✅' : '❌';
    
    if (verbose) {
      console.log(`${statusIcon} Case #${String(tc.id).padStart(2, '0')} [${tc.category}] (${duration}ms)`);
      console.log(`   Transcript: "${tc.transcript.substring(0, 60)}..."`);
      console.log(`   Expected: Risk=${tc.expectedRisk.toUpperCase()}, Pain=${minP}-${maxP} | Actual: Risk=${(result.riskLevel||'').toUpperCase()}, Pain=${actualPain}, Engine=${result.engine || 'Fallback'}`);
      if (!isRiskCorrect) {
        console.log(`   ⚠️ MISMATCH: Expected ${tc.expectedRisk.toUpperCase()} but got ${(result.riskLevel||'').toUpperCase()}`);
      }
      console.log('-'.repeat(75));
    }

    results.push({
      id: tc.id,
      category: tc.category,
      transcript: tc.transcript,
      expectedRisk: tc.expectedRisk,
      actualRisk: result.riskLevel,
      expectedPainRange: tc.expectedPainRange,
      actualPain: actualPain,
      isRiskCorrect,
      painDiff,
      duration,
      engine: result.engine || 'Rule-Based Fallback',
      reasons: result.reasons
    });

    // Spacing between requests to respect rate limits if calling live API
    if (rateLimitFriendly && tc.id < testCases.length) {
      await delay(2500);
    }
  }

  // Summary Math
  const total = testCases.length;
  const accuracy = ((correctCount / total) * 100).toFixed(1);
  const highRecall = highRiskTotal > 0 ? ((highRiskCorrect / highRiskTotal) * 100).toFixed(1) : '100.0';
  const medAccuracy = medRiskTotal > 0 ? ((medRiskCorrect / medRiskTotal) * 100).toFixed(1) : '100.0';
  const lowAccuracy = lowRiskTotal > 0 ? ((lowRiskCorrect / lowRiskTotal) * 100).toFixed(1) : '100.0';
  const painMAE = (totalPainError / total).toFixed(2);
  const schemaPassRate = ((validSchemaCount / total) * 100).toFixed(1);

  latencies.sort((a, b) => a - b);
  const avgLatency = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const minLatency = latencies[0];
  const maxLatency = latencies[latencies.length - 1];
  const p90Latency = latencies[Math.floor(latencies.length * 0.9)] || maxLatency;

  const summary = {
    totalTestCases: total,
    overallAccuracy: parseFloat(accuracy),
    highRiskRecall: parseFloat(highRecall),
    medRiskAccuracy: parseFloat(medAccuracy),
    lowRiskAccuracy: parseFloat(lowAccuracy),
    painLevelMAE: parseFloat(painMAE),
    schemaPassRate: parseFloat(schemaPassRate),
    aiEvaluatedCount: aiEngineCount,
    latency: {
      avgMs: avgLatency,
      minMs: minLatency,
      maxMs: maxLatency,
      p90Ms: p90Latency
    },
    engineUsed: aiEngineCount > 15 ? 'Gemini 2.5 Flash (Optimized)' : 'Hybrid Engine',
    timestamp: new Date().toISOString(),
    results
  };

  console.log('\n📊 BENCHMARK SUMMARY REPORT');
  console.log('='.repeat(75));
  console.log(`🎯 Overall Risk Accuracy:     ${summary.overallAccuracy}% (${correctCount}/${total})`);
  console.log(`🚨 High-Risk Sensitivity:     ${summary.highRiskRecall}% (${highRiskCorrect}/${highRiskTotal})`);
  console.log(`🟡 Medium-Risk Accuracy:     ${summary.medRiskAccuracy}% (${medRiskCorrect}/${medRiskTotal})`);
  console.log(`🟢 Low-Risk Accuracy:        ${summary.lowRiskAccuracy}% (${lowRiskCorrect}/${lowRiskTotal})`);
  console.log(`🩹 Pain Level Error (MAE):    ${summary.painLevelMAE}`);
  console.log(`📋 JSON Schema Pass Rate:    ${summary.schemaPassRate}%`);
  console.log(`🤖 AI Engine Coverage:       ${aiEngineCount}/${total} cases evaluated by Gemini AI`);
  console.log(`⚡ Response Latency:          Avg: ${avgLatency}ms | P90: ${p90Latency}ms | Min: ${minLatency}ms | Max: ${maxLatency}ms`);
  console.log('='.repeat(75) + '\n');

  return summary;
}

if (require.main === module) {
  runBenchmark().then(() => process.exit(0)).catch(e => {
    console.error('Benchmark execution error:', e);
    process.exit(1);
  });
}

module.exports = { runBenchmark };
