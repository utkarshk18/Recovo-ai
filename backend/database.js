/**
 * RECOVO AI — Database (sql.js — pure JavaScript SQLite, no compilation needed)
 */

const initSqlJs = require('sql.js');
const fs   = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'recovo.db');

let _db = null;

async function getDb() {
  if (_db) return _db;

  const SQL = await initSqlJs();

  // Load existing DB or create new
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(fileBuffer);
  } else {
    _db = new SQL.Database();
  }

  // Create schema
  _db.run(`
    CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL DEFAULT 'Patient',
      age INTEGER,
      surgery_type TEXT,
      surgery_date TEXT,
      doctor_name TEXT DEFAULT 'Dr. Rajesh Sharma',
      doctor_phone TEXT DEFAULT '+91 98123 45678',
      caregiver_name TEXT,
      caregiver_phone TEXT,
      language TEXT DEFAULT 'en',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS checkins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL DEFAULT 1,
      transcript TEXT NOT NULL,
      risk_level TEXT NOT NULL,
      confidence INTEGER NOT NULL,
      message TEXT,
      action TEXT,
      reasons TEXT,
      pain_level INTEGER DEFAULT 0,
      follow_up_needed INTEGER DEFAULT 0,
      checked_in_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS followup_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      checkin_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      answered_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS medications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL DEFAULT 1,
      name TEXT NOT NULL,
      dose TEXT,
      time_slot TEXT,
      icon TEXT DEFAULT '💊',
      active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS med_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      med_id INTEGER NOT NULL,
      taken INTEGER NOT NULL DEFAULT 0,
      log_date TEXT DEFAULT (date('now')),
      logged_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS emergency_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER NOT NULL DEFAULT 1,
      action TEXT NOT NULL,
      logged_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Migration: Add doctor_name and doctor_phone if missing
  try { _db.run("ALTER TABLE patients ADD COLUMN doctor_name TEXT DEFAULT 'Dr. Rajesh Sharma'"); } catch (_) {}
  try { _db.run("ALTER TABLE patients ADD COLUMN doctor_phone TEXT DEFAULT '+91 98123 45678'"); } catch (_) {}

  // Seed default patient
  const patRow = _db.exec('SELECT COUNT(*) as c FROM patients');
  const patCount = patRow[0]?.values[0][0] || 0;
  if (patCount === 0) {
    _db.run(`INSERT INTO patients (name,age,surgery_type,surgery_date,doctor_name,doctor_phone,caregiver_name,caregiver_phone,language)
             VALUES ('Ramesh Kumar',62,'Knee Replacement','2026-04-16','Dr. Rajesh Sharma','+91 98123 45678','Priya Kumar','+91 98765 43210','en')`);
  }

  // Seed medications
  const medRow = _db.exec('SELECT COUNT(*) as c FROM medications');
  const medCount = medRow[0]?.values[0][0] || 0;
  if (medCount === 0) {
    _db.run(`INSERT INTO medications (patient_id,name,dose,time_slot,icon) VALUES
      (1,'Amoxicillin','500mg — 1 capsule','8:00 AM','💊'),
      (1,'Ibuprofen','400mg — 1 tablet after food','2:00 PM','🔴'),
      (1,'Pantoprazole','40mg — 1 tablet before food','8:00 PM','🟡')`);
  }

  // Seed 5 days of check-ins
  const cinRow = _db.exec('SELECT COUNT(*) as c FROM checkins');
  const cinCount = cinRow[0]?.values[0][0] || 0;
  if (cinCount === 0) {
    _db.run(`INSERT INTO checkins (patient_id,transcript,risk_level,confidence,message,action,reasons,pain_level,checked_in_at) VALUES
      (1,'Severe pain 8/10','high',78,'Urgent attention needed','Visit ER immediately','["High pain (8/10)"]',8,datetime('now','-4 days')),
      (1,'Mild pain 4/10 took medicines','low',82,'You are doing well','Rest and take meds','["Mild pain (4/10)","Medication taken"]',4,datetime('now','-3 days')),
      (1,'Swelling on knee pain 5/10','medium',61,'Monitor closely','Watch symptoms','["Swelling noticed"]',5,datetime('now','-2 days')),
      (1,'Much better pain 2/10 no fever','low',89,'Great progress','Keep resting','["Low pain (2/10)"]',2,datetime('now','-1 days')),
      (1,'Feeling fine slight stiffness','low',84,'You are doing well','Rest and hydrate','["Mild stiffness"]',1,datetime('now'))`);
  }

  persist();
  console.log(`✅ Database ready at ${DB_PATH}`);
  return _db;
}

// Persist DB to disk after writes
function persist() {
  if (!_db) return;
  try {
    const data = _db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (e) {
    console.error('DB persist error:', e.message);
  }
}

// ── Query helpers ─────────────────────────────────────────────────────────────

function queryAll(sql, params = []) {
  const res = _db.exec(sql, params);
  if (!res.length) return [];
  const { columns, values } = res[0];
  return values.map(row => {
    const obj = {};
    columns.forEach((col, i) => { obj[col] = row[i]; });
    return obj;
  });
}

function queryOne(sql, params = []) {
  const rows = queryAll(sql, params);
  return rows[0] || null;
}

function run(sql, params = []) {
  _db.run(sql, params);
  persist();
}

module.exports = { getDb, queryAll, queryOne, run, persist };
