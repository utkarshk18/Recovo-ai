/**
 * RECOVO AI — Optimized Symptom Analysis & Triage Engine
 * Combines high-performance Gemini 2.5 AI with caching, schema enforcement, and rule-based fallback.
 */

const crypto = require('crypto');

// ── Keyword Dictionaries for Rule-Based Fallback & Fast Safety Guard ─────────

const HIGH_RISK_KEYWORDS = [
  'severe pain','excruciating','unbearable','10/10','9/10','8/10',
  'high fever','fever','temperature','chills','shivering',
  'pus','discharge','oozing','infected','infection',
  'chest pain','difficulty breathing','short of breath','breathless',
  'unconscious','fainted','collapsed','emergency',
  'blood','bleeding','wound opened','stitches came out',
  'vomiting','can\'t eat','can\'t drink','dehydrated',
  'swollen leg','swollen foot','red leg','hot leg', 'clot',
  'very warm','burning','extremely warm','hot to touch'
];

const MEDIUM_RISK_KEYWORDS = [
  'moderate pain','5/10','6/10','7/10','painful','hurts a lot',
  'swelling','swollen','redness','red','warm to touch','warmth',
  'slight fever','low fever','mild fever','a little fever',
  'nausea','dizzy','dizziness','light headed',
  'wound looks different','wound smells','odour','odor',
  'bruising','discoloration','skin color',
  'not sleeping','can\'t sleep','restless','anxious','worried',
  'not eating well','poor appetite','weak','weakness','fatigue'
];

const LOW_RISK_KEYWORDS = [
  'mild pain','slight pain','little pain','3/10','2/10','1/10',
  'okay','fine','good','well','normal','better',
  'some stiffness','stiff','tight','uncomfortable',
  'a bit tired','slightly tired','resting well',
  'no fever','no swelling','no discharge','healing','improving',
  'took medication','took medicine','taking pills on time'
];

const PAIN_PATTERN = /(\d+)\s*(?:out of|\/)\s*10/i;

// ── In-Memory Response Cache for Sub-Millisecond Speed ───────────────────────

const CACHE = new Map();
const CACHE_MAX_SIZE = 300;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

const ENGINE_STATS = {
  totalRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  aiRequests: 0,
  fallbackRequests: 0,
  totalLatencyMs: 0
};

function normalizeTranscript(text) {
  return (text || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\d\/]/g, '')
    .replace(/\s+/g, ' ');
}

function getCachedAnalysis(text) {
  const normKey = normalizeTranscript(text);
  if (!normKey) return null;
  const entry = CACHE.get(normKey);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    CACHE.delete(normKey);
    return null;
  }
  return { ...entry.data, cached: true, responseTimeMs: 0 };
}

function setCachedAnalysis(text, data) {
  const normKey = normalizeTranscript(text);
  if (!normKey) return;
  if (CACHE.size >= CACHE_MAX_SIZE) {
    const firstKey = CACHE.keys().next().value;
    CACHE.delete(firstKey);
  }
  CACHE.set(normKey, { timestamp: Date.now(), data });
}

// ── Rule-based Scoring System (Fast Fallback Engine) ─────────────────────────

function ruleBasedAnalyzeSymptoms(text) {
  const lower = text.toLowerCase();
  let highScore = 0, medScore = 0, lowScore = 0;
  const matchedReasons = [];

  const hasKeyword = (str, kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('\\b' + escaped + '\\b', 'i').test(str);
  };

  let activeText = lower;

  const negations = [
    'no fever', 'no swelling', 'no discharge', 'no bleeding', 'no blood',
    'no pain', 'not painful', 'not swollen', 'not red', 'no chills',
    'no nausea', 'no dizziness', 'without fever', 'blood pressure normal',
    'don\'t have any high fever', 'no pus', 'no redness'
  ];

  negations.forEach(neg => {
    if (activeText.includes(neg)) {
      lowScore += 1;
      activeText = activeText.replace(new RegExp(neg, 'g'), '');
    }
  });

  const painMatch = lower.match(PAIN_PATTERN);
  let painLevel = 0;
  if (painMatch) {
    painLevel = parseInt(painMatch[1]);
    if (painLevel >= 8) { highScore += 3; matchedReasons.push(`High pain level reported (${painLevel}/10)`); }
    else if (painLevel >= 5) { medScore += 2; matchedReasons.push(`Moderate pain reported (${painLevel}/10)`); }
    else if (painLevel > 0) { lowScore += 2; matchedReasons.push(`Mild pain reported (${painLevel}/10)`); }
  }

  HIGH_RISK_KEYWORDS.forEach(kw => {
    if (hasKeyword(activeText, kw)) {
      highScore += 2;
      const reason = formatReason(kw, 'high');
      if (!matchedReasons.includes(reason)) matchedReasons.push(reason);
    }
  });

  MEDIUM_RISK_KEYWORDS.forEach(kw => {
    if (hasKeyword(activeText, kw)) {
      medScore += 1;
      const reason = formatReason(kw, 'medium');
      if (!matchedReasons.includes(reason)) matchedReasons.push(reason);
    }
  });

  LOW_RISK_KEYWORDS.forEach(kw => {
    if (hasKeyword(activeText, kw)) {
      lowScore += 1;
    }
  });

  let riskLevel, confidence, action, followUpNeeded;

  if (highScore >= 3) {
    riskLevel = 'high';
    confidence = Math.min(95, 60 + highScore * 5);
    action = 'Please visit your doctor or emergency room immediately. Do not delay.';
    followUpNeeded = false;
  } else if (medScore >= 3 || (medScore >= 2 && highScore >= 1)) {
    riskLevel = 'medium';
    confidence = Math.min(85, 50 + medScore * 5 + highScore * 3);
    action = 'Monitor your symptoms closely. If pain or swelling increases, call your doctor today.';
    followUpNeeded = confidence < 70;
  } else if (highScore >= 1 && medScore >= 1) {
    riskLevel = 'medium';
    confidence = Math.min(75, 45 + highScore * 5 + medScore * 3);
    action = 'Some symptoms need attention. Contact your doctor if things get worse.';
    followUpNeeded = true;
  } else {
    riskLevel = 'low';
    confidence = Math.min(92, 60 + lowScore * 5);
    action = 'Stay at home and rest. Take your medications on time. Call your doctor if pain worsens.';
    followUpNeeded = confidence < 65;
  }

  const reasons = buildReasons(lower, painLevel, matchedReasons).slice(0, 4);
  if (reasons.length === 0) reasons.push('General symptoms assessed from your description');

  const messages = {
    high: "Your symptoms need urgent medical attention. Please seek help now.",
    medium: "Some symptoms need attention. Monitor closely today.",
    low: "You're doing well! Keep resting and stay hydrated."
  };

  return {
    riskLevel,
    confidence,
    message: messages[riskLevel],
    reasons,
    action,
    followUpNeeded,
    painLevel,
    engine: 'Rule-Based Engine (Fallback)'
  };
}

function formatReason(keyword, level) {
  const map = {
    'fever': 'Fever mentioned — possible infection sign',
    'high fever': 'High fever reported — needs urgent attention',
    'swelling': 'Swelling noticed around wound or limb',
    'swollen': 'Swelling noticed around wound or limb',
    'redness': 'Redness near wound area',
    'red': 'Redness reported near surgical site',
    'pus': 'Pus or discharge — possible infection',
    'discharge': 'Wound discharge mentioned',
    'infected': 'Signs of possible infection present',
    'chest pain': 'Chest pain reported — urgent evaluation needed',
    'bleeding': 'Bleeding from wound reported',
    'nausea': 'Nausea or digestive issues reported',
    'dizzy': 'Dizziness or light-headedness reported',
    'warm to touch': 'Wound area warm to touch — monitor closely',
    'warmth': 'Warmth reported near wound site',
    'weakness': 'General weakness or fatigue reported',
    'vomiting': 'Vomiting reported — dehydration risk',
  };
  return map[keyword] || `Symptom detected: ${keyword}`;
}

function buildReasons(text, painLevel, matched) {
  const reasons = [...new Set(matched)];
  if (text.includes('no fever') && !reasons.some(r => r.includes('fever'))) {
    reasons.push('No fever reported — good sign');
  }
  if (text.includes('resting') || text.includes('rest')) {
    reasons.push('Patient is resting — aids recovery');
  }
  if (painLevel > 0 && !reasons.some(r => r.includes('pain'))) {
    reasons.push(`Pain level ${painLevel}/10 noted`);
  }
  if (text.includes('medication') || text.includes('medicine') || text.includes('pill')) {
    reasons.push('Medication compliance reported — positive indicator');
  }
  return reasons;
}

// ── Gemini AI SDK Initialization ─────────────────────────────────────────────

let aiClient = null;
try {
  const path = require('path');
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  require('dotenv').config();
  const { GoogleGenAI } = require('@google/genai');
  const key = process.env.GEMINI_API_KEY;
  if (key && key !== 'your_gemini_api_key_here' && key.trim() !== '') {
    aiClient = new GoogleGenAI({ apiKey: key });
  } else {
    console.log('Gemini AI key not set. Using rule-based fallback.');
  }
} catch (e) {
  console.log('Gemini AI SDK not available. Using rule-based fallback.');
}

/**
 * Robust JSON Parser for Gemini AI output. Handles markdown fences,
 * unescaped control characters/newlines, and auto-repairs truncated JSON.
 */
function parseAndCleanJson(rawText) {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty response text from Gemini AI');
  }

  let cleaned = rawText.trim();

  // 1. Strip markdown code block delimiters if present
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

  // 2. Extract JSON object substring if extra commentary is present
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace >= firstBrace) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  } else if (firstBrace !== -1) {
    cleaned = cleaned.substring(firstBrace);
  }

  // Attempt 1: Standard JSON parse
  try {
    return JSON.parse(cleaned);
  } catch (e1) {
    // Attempt 2: Escape unescaped control characters & raw newlines inside strings
    try {
      const sanitized = cleaned.replace(/[\r\n\t]/g, (match) => {
        if (match === '\r') return '';
        if (match === '\n') return '\\n';
        if (match === '\t') return '\\t';
        return match;
      });
      return JSON.parse(sanitized);
    } catch (e2) {
      // Attempt 3: Repair truncated JSON structures (missing closing quotes/brackets)
      try {
        const repaired = autoRepairTruncatedJson(cleaned);
        return JSON.parse(repaired);
      } catch (e3) {
        throw new Error(`JSON Parse Error (${e1.message}) on payload: "${cleaned.substring(0, 100)}..."`);
      }
    }
  }
}

/**
 * Auto-repairs truncated JSON string payloads by closing open strings, arrays, and objects.
 */
function autoRepairTruncatedJson(str) {
  let s = str.trim();
  let inString = false;
  let escaped = false;
  const stack = [];

  for (let i = 0; i < s.length; i++) {
    const char = s[i];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === '\\') {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (!inString) {
      if (char === '{' || char === '[') {
        stack.push(char === '{' ? '}' : ']');
      } else if (char === '}' || char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop();
        }
      }
    }
  }

  if (inString) {
    s += '"';
  }

  s = s.replace(/[,:]\s*$/, '');

  while (stack.length > 0) {
    s += stack.pop();
  }

  return s;
}

// Optimized System Instruction for Gemini Prompt Caching & Accuracy
const SYSTEM_INSTRUCTION = `You are RECOVO AI, an expert post-surgery recovery monitoring assistant.
Analyze patient post-op symptom descriptions carefully to determine clinical risk and extract pain metrics.

CRITICAL TRIAGE & NEGATION RULES:
1. RISK LEVEL ASSIGNMENT ("high" | "medium" | "low"):
   - "high": Pain >= 8/10, high fever (>101°F / 38.3°C), yellow pus/foul discharge, active wound bleeding/dehiscence, chest pain, shortness of breath, sudden swollen/hot calf (DVT risk), or persistent vomiting/dehydration.
   - "medium": Pain 4-7/10, low-grade fever (99-100°F), mild swelling or redness without pus, persistent nausea, dizziness, or sleep anxiety.
   - "low": Pain 0-3/10, minor stiffness, resting well, clear negative declarations ("no fever, no swelling, no pain"), or normal healing signs.

2. NEGATION SENSITIVITY:
   - Declarations like "no fever", "no pus", "no bleeding", "don't have severe pain" MUST NOT trigger medium or high risk. Evaluate negated symptoms as low risk indicators.

3. PAIN LEVEL (0 to 10):
   - Extract explicitly mentioned numeric pain levels (e.g., "9/10" -> 9, "4 out of 10" -> 4).
   - If no explicit number is mentioned, infer based on severity descriptors (excruciating=9, severe=8, moderate=5, mild=2, none=0).

Output MUST strictly conform to the defined JSON schema.`;

const RESPONSE_SCHEMA = {
  type: 'OBJECT',
  properties: {
    riskLevel: { type: 'STRING', enum: ['low', 'medium', 'high'] },
    confidence: { type: 'INTEGER' },
    message: { type: 'STRING' },
    reasons: { type: 'ARRAY', items: { type: 'STRING' } },
    action: { type: 'STRING' },
    followUpNeeded: { type: 'BOOLEAN' },
    painLevel: { type: 'INTEGER' }
  },
  required: ['riskLevel', 'confidence', 'message', 'reasons', 'action', 'followUpNeeded', 'painLevel']
};

/**
 * Primary Symptom Analysis Function (with caching, optimized Gemini SDK call, and fallback)
 */
async function analyzeSymptoms(text) {
  ENGINE_STATS.totalRequests++;
  const startTime = Date.now();

  if (!text || typeof text !== 'string' || text.trim().length < 2) {
    const fallback = ruleBasedAnalyzeSymptoms(text || '');
    ENGINE_STATS.fallbackRequests++;
    return { ...fallback, responseTimeMs: Date.now() - startTime };
  }

  // 1. In-Memory Cache Check (< 1ms)
  const cachedResult = getCachedAnalysis(text);
  if (cachedResult) {
    ENGINE_STATS.cacheHits++;
    return cachedResult;
  }
  ENGINE_STATS.cacheMisses++;

  // 2. Call Gemini AI with SDK-level optimizations
  if (aiClient) {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash'];
    for (const modelName of modelsToTry) {
      try {
        ENGINE_STATS.aiRequests++;

        const response = await aiClient.models.generateContent({
          model: modelName,
          contents: `Patient transcript: "${text.trim()}"`,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            responseMimeType: 'application/json',
            responseSchema: RESPONSE_SCHEMA,
            temperature: 0.1,
            maxOutputTokens: 2048
          }
        });

        const responseTimeMs = Date.now() - startTime;
        ENGINE_STATS.totalLatencyMs += responseTimeMs;

        if (response && response.text) {
          const result = parseAndCleanJson(response.text);

          const validRisk = ['low', 'medium', 'high'].includes((result.riskLevel || '').toLowerCase())
            ? result.riskLevel.toLowerCase()
            : 'medium';

          const finalResult = {
            riskLevel: validRisk,
            confidence: typeof result.confidence === 'number' ? Math.max(0, Math.min(100, Math.round(result.confidence))) : 85,
            message: result.message || 'Symptom analysis complete.',
            reasons: Array.isArray(result.reasons) && result.reasons.length > 0 ? result.reasons : ['Symptom description evaluated by Gemini AI.'],
            action: result.action || 'Please consult your healthcare provider if symptoms worsen.',
            followUpNeeded: typeof result.followUpNeeded === 'boolean' ? result.followUpNeeded : false,
            painLevel: typeof result.painLevel === 'number' ? Math.max(0, Math.min(10, Math.round(result.painLevel))) : 0,
            engine: `Gemini (${modelName})`,
            responseTimeMs,
            cached: false
          };

          setCachedAnalysis(text, finalResult);
          return finalResult;
        }
      } catch (err) {
        console.warn(`⚠️ Gemini AI model (${modelName}) call failed:`, err.message);
      }
    }
  }

  // 3. Fallback Engine
  ENGINE_STATS.fallbackRequests++;
  const fallbackResult = ruleBasedAnalyzeSymptoms(text);
  const responseTimeMs = Date.now() - startTime;
  return { ...fallbackResult, responseTimeMs, cached: false };
}

function getEngineStats() {
  const avgLatency = ENGINE_STATS.aiRequests > 0 
    ? Math.round(ENGINE_STATS.totalLatencyMs / ENGINE_STATS.aiRequests) 
    : 0;
  
  const cacheHitRate = ENGINE_STATS.totalRequests > 0 
    ? ((ENGINE_STATS.cacheHits / ENGINE_STATS.totalRequests) * 100).toFixed(1) 
    : '0.0';

  return {
    ...ENGINE_STATS,
    avgLatencyMs: avgLatency,
    cacheHitRate: parseFloat(cacheHitRate),
    cacheSize: CACHE.size
  };
}

function clearCache() {
  CACHE.clear();
}

module.exports = { 
  analyzeSymptoms,
  getEngineStats,
  clearCache
};
