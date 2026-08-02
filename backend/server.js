/**
 * RECOVO AI — Express Backend Server (sql.js version)
 */

const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { getDb, queryAll, queryOne, run } = require('./database');
const { analyzeSymptoms, getEngineStats, clearCache } = require('./ai-engine');
const { runBenchmark } = require('./test-accuracy');

const app  = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

// Normalize request URL for serverless rewrites
app.use((req, _res, next) => {
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  }
  console.log(`[${new Date().toISOString().substring(11,19)}] ${req.method} ${req.url}`);
  next();
});

// ── Bootstrap DB before handling requests ──────────────────────────────────────
let dbReady = false;
getDb().then(() => { dbReady = true; }).catch(e => { console.error('DB init failed:', e); });

app.use(async (_req, res, next) => {
  if (!dbReady) {
    try {
      await getDb();
      dbReady = true;
    } catch (e) {
      return res.status(503).json({ error: 'Database initializing failed: ' + e.message });
    }
  }
  next();
});

// ══════════════════════════════════════════════════════════════════════════════
// PATIENT
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/patient', (_req, res) => {
  try {
    const p = queryOne('SELECT * FROM patients WHERE id=1');
    if (!p) return res.status(404).json({ error: 'Patient not found' });
    res.json({ success: true, data: p });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/patient', (req, res) => {
  try {
    const { name, age, surgery_type, surgery_date, doctor_name, doctor_phone, caregiver_name, caregiver_phone, language } = req.body;
    run('UPDATE patients SET name=?,age=?,surgery_type=?,surgery_date=?,doctor_name=?,doctor_phone=?,caregiver_name=?,caregiver_phone=?,language=? WHERE id=1',
      [name, age, surgery_type, surgery_date, doctor_name, doctor_phone, caregiver_name, caregiver_phone, language]);
    res.json({ success: true, message: 'Profile updated successfully ✅' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// CHECK-IN & ANALYSIS
// ══════════════════════════════════════════════════════════════════════════════
app.post('/api/checkin', async (req, res) => {
  try {
    const { transcript } = req.body;
    if (!transcript || transcript.trim().length < 3)
      return res.status(400).json({ error: 'Please describe your symptoms.' });

    const analysis = await analyzeSymptoms(transcript);

    run(`INSERT INTO checkins (patient_id,transcript,risk_level,confidence,message,action,reasons,pain_level,follow_up_needed,checked_in_at)
         VALUES (1,?,?,?,?,?,?,?,?,datetime('now'))`,
      [transcript, analysis.riskLevel, analysis.confidence, analysis.message,
       analysis.action, JSON.stringify(analysis.reasons), analysis.painLevel,
       analysis.followUpNeeded ? 1 : 0]);

    const last = queryOne('SELECT id FROM checkins ORDER BY id DESC LIMIT 1');
    res.json({ success: true, checkinId: last?.id, analysis });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/checkins', (_req, res) => {
  try {
    const rows = queryAll('SELECT id,risk_level,confidence,message,pain_level,reasons,checked_in_at FROM checkins WHERE patient_id=1 ORDER BY checked_in_at DESC LIMIT 30');
    res.json({ success: true, data: rows.map(r => ({ ...r, reasons: safeJson(r.reasons, []) })) });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/checkin/latest', (_req, res) => {
  try {
    const row = queryOne('SELECT * FROM checkins WHERE patient_id=1 ORDER BY checked_in_at DESC LIMIT 1');
    if (!row) return res.json({ success: true, data: null });
    row.reasons = safeJson(row.reasons, []);
    res.json({ success: true, data: row });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/checkin/:id/followup', async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;
    if (!Array.isArray(answers)) return res.status(400).json({ error: 'answers must be array' });

    answers.forEach(a => {
      run('INSERT INTO followup_answers (checkin_id,question,answer) VALUES (?,?,?)', [id, a.question, a.answer]);
    });

    const checkin = queryOne('SELECT transcript FROM checkins WHERE id=?', [id]);
    const extra = answers.map(a => `${a.question}: ${a.answer}`).join('. ');
    const combined = (checkin?.transcript || '') + '. ' + extra;
    const analysis = await analyzeSymptoms(combined);

    run('UPDATE checkins SET risk_level=?,confidence=?,message=?,action=?,reasons=?,pain_level=?,follow_up_needed=0 WHERE id=?',
      [analysis.riskLevel, analysis.confidence, analysis.message, analysis.action,
       JSON.stringify(analysis.reasons), analysis.painLevel, id]);

    res.json({ success: true, analysis });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// MEDICATIONS
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/medications', (_req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const meds = queryAll('SELECT * FROM medications WHERE patient_id=1 AND active=1');
    const result = meds.map(m => {
      const log = queryOne('SELECT taken FROM med_logs WHERE med_id=? AND log_date=? ORDER BY logged_at DESC LIMIT 1', [m.id, today]);
      return { ...m, taken: log ? !!log.taken : false };
    });
    res.json({ success: true, data: result });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/medications', (req, res) => {
  try {
    const { name, dose, time_slot, icon } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Medicine name is required.' });
    run('INSERT INTO medications (patient_id,name,dose,time_slot,icon) VALUES (1,?,?,?,?)',
      [name.trim(), dose?.trim() || `${name} — as prescribed`, time_slot?.trim() || '8:00 AM', icon || '💊']);
    const last = queryOne('SELECT id FROM medications ORDER BY id DESC LIMIT 1');
    res.json({ success: true, id: last?.id, message: `${name} added successfully ✅` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/medications/:id/toggle', (req, res) => {
  try {
    const { id } = req.params;
    const { taken } = req.body;
    const today = new Date().toISOString().split('T')[0];
    const existing = queryOne('SELECT id FROM med_logs WHERE med_id=? AND log_date=?', [id, today]);
    if (existing) {
      run('UPDATE med_logs SET taken=?,logged_at=datetime("now") WHERE id=?', [taken ? 1 : 0, existing.id]);
    } else {
      run('INSERT INTO med_logs (med_id,taken,log_date) VALUES (?,?,?)', [id, taken ? 1 : 0, today]);
    }
    const med = queryOne('SELECT name FROM medications WHERE id=?', [id]);
    res.json({ success: true, message: taken ? `${med?.name} marked as taken ✅` : `${med?.name} marked as pending ⏳` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/medications/:id', (req, res) => {
  try {
    const { id } = req.params;
    const med = queryOne('SELECT name FROM medications WHERE id=? AND patient_id=1', [id]);
    if (!med) return res.status(404).json({ error: 'Medicine not found.' });
    run('UPDATE medications SET active=0 WHERE id=?', [id]);
    res.json({ success: true, message: `${med.name} removed from your list 🗑️` });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// RECOVERY
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/recovery', (_req, res) => {
  try {
    const checkins = queryAll('SELECT risk_level,confidence,pain_level,checked_in_at FROM checkins WHERE patient_id=1 ORDER BY checked_in_at ASC');
    const patient = queryOne('SELECT surgery_date FROM patients WHERE id=1');
    const surgeryDate = patient?.surgery_date ? new Date(patient.surgery_date) : new Date();
    const recoveryDay = Math.max(1, Math.ceil((Date.now() - surgeryDate.getTime()) / 86400000));

    const riskMap = { low: 1, medium: 2, high: 3 };

    // Attach 1-based day index to each checkin
    const checkinsWithDay = checkins.map((c, i) => ({ ...c, day: i + 1 }));

    // Take recent checkins for clean UI visualization
    const recentCheckins = checkinsWithDay.length > 0 ? checkinsWithDay.slice(-10) : [];

    const timeline = checkinsWithDay.slice(-14).map(c => ({
      day: c.day,
      riskLevel: c.risk_level,
      painLevel: c.pain_level,
      date: c.checked_in_at?.split(' ')[0]
    }));

    const painTrend = recentCheckins.map(c => {
      let val = c.pain_level;
      if (!val || val === 0) {
        val = c.risk_level === 'high' ? 8 : (c.risk_level === 'medium' ? 5 : (c.risk_level === 'low' ? 2 : 0));
      }
      return {
        label: 'D' + c.day,
        value: val
      };
    });

    const riskTrend = recentCheckins.map(c => ({
      label: 'D' + c.day,
      value: riskMap[c.risk_level] || 1
    }));

    const alerts = checkinsWithDay
      .filter(c => c.risk_level !== 'low')
      .slice(-5)
      .map(c => ({
        day: c.day,
        riskLevel: c.risk_level,
        date: c.checked_in_at
      }));

    res.json({ success: true, data: { recoveryDay, timeline, painTrend, riskTrend, alerts } });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// EMERGENCY
// ══════════════════════════════════════════════════════════════════════════════
app.post('/api/emergency/notify', (req, res) => {
  try {
    const action = req.body.action || 'caregiver_notified';
    run('INSERT INTO emergency_logs (patient_id,action) VALUES (1,?)', [action]);
    const p = queryOne('SELECT doctor_name, doctor_phone, caregiver_name, caregiver_phone FROM patients WHERE id=1');
    if (action === 'doctor_called') {
      res.json({ success: true, message: `Calling ${p?.doctor_name || 'Doctor'} 📞`, doctor: p });
    } else {
      res.json({ success: true, message: `Caregiver ${p?.caregiver_name || ''} has been notified 🔔`, caregiver: p });
    }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// AI DIAGNOSTICS & BENCHMARKING
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/ai/stats', (_req, res) => {
  try {
    const stats = getEngineStats();
    res.json({ success: true, data: stats });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai/benchmark', async (req, res) => {
  try {
    const quick = req.body?.quick ?? false;
    const summary = await runBenchmark({ verbose: false, rateLimitFriendly: true });
    res.json({ success: true, data: summary });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/ai/cache/clear', (_req, res) => {
  try {
    clearCache();
    res.json({ success: true, message: 'AI Engine response cache cleared successfully 🧹' });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ══════════════════════════════════════════════════════════════════════════════
// HEALTH CHECK
// ══════════════════════════════════════════════════════════════════════════════
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'RECOVO AI Backend', version: '1.0.0', dbReady, timestamp: new Date().toISOString() });
});

// ── Helper ────────────────────────────────────────────────────────────────────
function safeJson(str, fallback) { try { return JSON.parse(str); } catch { return fallback; } }

// ── Start ─────────────────────────────────────────────────────────────────────
if (require.main === module || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`\n🚀 RECOVO AI Backend → http://localhost:${PORT}`);
    console.log(`📊 API Health      → http://localhost:${PORT}/api/health`);
    console.log(`🌐 Frontend        → http://localhost:${PORT}\n`);
  });
}

module.exports = app;
