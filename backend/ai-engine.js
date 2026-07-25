/**
 * RECOVO AI — Symptom Analysis Engine
 * Rule-based NLP scoring system for post-surgery symptom assessment.
 */

// ── Keyword dictionaries ──────────────────────────────────────────────────────

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

// ── Scoring function ──────────────────────────────────────────────────────────

function ruleBasedAnalyzeSymptoms(text) {
  const lower = text.toLowerCase();
  let highScore = 0, medScore = 0, lowScore = 0;
  const matchedReasons = [];

  // Helper to match whole words safely
  const hasKeyword = (str, kw) => {
    const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp('\\b' + escaped + '\\b', 'i').test(str);
  };

  let activeText = lower;

  // 1. Handle Negations (Prevents "no fever" from triggering "fever")
  const negations = [
    'no fever', 'no swelling', 'no discharge', 'no bleeding', 'no blood',
    'no pain', 'not painful', 'not swollen', 'not red', 'no chills',
    'no nausea', 'no dizziness', 'without fever', 'blood pressure normal'
  ];

  negations.forEach(neg => {
    if (activeText.includes(neg)) {
      lowScore += 1;
      activeText = activeText.replace(new RegExp(neg, 'g'), '');
    }
  });

  // Check pain scale explicitly
  const painMatch = lower.match(PAIN_PATTERN);
  let painLevel = 0;
  if (painMatch) {
    painLevel = parseInt(painMatch[1]);
    if (painLevel >= 8) { highScore += 3; matchedReasons.push(`High pain level reported (${painLevel}/10)`); }
    else if (painLevel >= 5) { medScore += 2; matchedReasons.push(`Moderate pain reported (${painLevel}/10)`); }
    else if (painLevel > 0) { lowScore += 2; matchedReasons.push(`Mild pain reported (${painLevel}/10)`); }
  }

  // Score high-risk keywords
  HIGH_RISK_KEYWORDS.forEach(kw => {
    if (hasKeyword(activeText, kw)) {
      highScore += 2;
      const reason = formatReason(kw, 'high');
      if (!matchedReasons.includes(reason)) matchedReasons.push(reason);
    }
  });

  // Score medium-risk keywords
  MEDIUM_RISK_KEYWORDS.forEach(kw => {
    if (hasKeyword(activeText, kw)) {
      medScore += 1;
      const reason = formatReason(kw, 'medium');
      if (!matchedReasons.includes(reason)) matchedReasons.push(reason);
    }
  });

  // Score low-risk keywords
  LOW_RISK_KEYWORDS.forEach(kw => {
    if (hasKeyword(activeText, kw)) {
      lowScore += 1;
    }
  });

  // Determine risk level
  let riskLevel, confidence, action, followUpNeeded;

  const total = highScore + medScore + lowScore || 1;

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

  // Build human-readable reasons (limit to 4)
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
    rawScores: { highScore, medScore, lowScore }
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

let aiClient = null;
try {
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

async function analyzeSymptoms(text) {
  if (!text || typeof text !== 'string') {
    return ruleBasedAnalyzeSymptoms(text || '');
  }

  if (aiClient) {
    try {
      const systemInstruction = `You are RECOVO AI, an expert post-surgery recovery monitoring assistant.
Analyze the patient's reported symptoms and return a structured JSON evaluation.

Rules for response:
- "riskLevel": Must be exactly one of "low", "medium", or "high". High risk is for severe pain (8-10/10), high fever, heavy bleeding, chest pain, infection signs (pus), or calf swelling/clots. Medium risk is for moderate pain (4-7/10), mild swelling, mild fever, nausea, or dizziness. Low risk is for mild pain (1-3/10), normal healing, stiffness, or rest.
- "confidence": Integer percentage between 0 and 100 representing your analysis confidence.
- "message": Concise, empathetic message for the patient (1-2 sentences).
- "reasons": Array of 2 to 4 concise bullet points explaining why this risk level was assigned.
- "action": Specific, actionable advice for the patient.
- "followUpNeeded": Boolean (true if details are ambiguous or confidence is under 70%, else false).
- "painLevel": Integer from 0 to 10 based on user transcript or symptom severity (e.g. 8-10 for severe/excruciating pain, 4-7 for moderate pain, 1-3 for mild pain, 0 for no pain).

Respond strictly with a JSON object matching this schema:
{
  "riskLevel": "low" | "medium" | "high",
  "confidence": number,
  "message": "string",
  "reasons": ["string"],
  "action": "string",
  "followUpNeeded": boolean,
  "painLevel": number
}`;

      const prompt = `${systemInstruction}\n\nPatient symptom transcript: "${text}"`;

      const response = await aiClient.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      if (response && response.text) {
        const result = JSON.parse(response.text);

        const validRisk = ['low', 'medium', 'high'].includes((result.riskLevel || '').toLowerCase())
          ? result.riskLevel.toLowerCase()
          : 'medium';

        return {
          riskLevel: validRisk,
          confidence: typeof result.confidence === 'number' ? Math.max(0, Math.min(100, Math.round(result.confidence))) : 80,
          message: result.message || 'Symptom analysis complete.',
          reasons: Array.isArray(result.reasons) && result.reasons.length > 0 ? result.reasons : ['Symptom description analyzed by Gemini AI.'],
          action: result.action || 'Please consult your doctor if symptoms worsen.',
          followUpNeeded: typeof result.followUpNeeded === 'boolean' ? result.followUpNeeded : false,
          painLevel: typeof result.painLevel === 'number' ? Math.max(0, Math.min(10, Math.round(result.painLevel))) : 0,
          engine: 'Gemini 2.5 Flash'
        };
      }
    } catch (err) {
      console.warn('⚠️ Gemini AI analysis failed, falling back to rule-based engine:', err.message);
    }
  }

  return ruleBasedAnalyzeSymptoms(text);
}

module.exports = { analyzeSymptoms };
