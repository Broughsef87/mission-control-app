/**
 * sync-memory-logs.js
 * Reads daily memory logs from C:\Users\broug\.openclaw\workspace\memory\YYYY-MM-DD.md
 * and upserts them into the Supabase `daily_logs` table.
 *
 * Usage: node scripts/sync-memory-logs.js
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load env vars from .env file
function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  }
}

loadEnv(path.join(__dirname, '../.env'));
loadEnv(path.join(__dirname, '../.env.local'));

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const MEMORY_DIR = 'C:/Users/broug/.openclaw/workspace/memory';

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: false } });

async function syncMemoryLogs() {
  if (!fs.existsSync(MEMORY_DIR)) {
    console.error(`Memory directory not found: ${MEMORY_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(MEMORY_DIR).filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f));

  if (files.length === 0) {
    console.log('No dated memory log files found.');
    return;
  }

  console.log(`Found ${files.length} daily log file(s). Syncing to Supabase...`);
  let synced = 0;
  let errors = 0;

  for (const file of files) {
    const log_date = file.replace('.md', ''); // e.g. 2026-03-23
    const filePath = path.join(MEMORY_DIR, file);
    const content = fs.readFileSync(filePath, 'utf8');

    const { error } = await supabase
      .from('daily_logs')
      .upsert({ log_date, content, synced_at: new Date().toISOString() }, { onConflict: 'log_date' });

    if (error) {
      console.error(`  ✗ ${file}: ${error.message}`);
      errors++;
    } else {
      console.log(`  ✓ ${file}`);
      synced++;
    }
  }

  console.log(`\nDone. ${synced} synced, ${errors} errors.`);
}

syncMemoryLogs().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
