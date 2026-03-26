const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// 1. Parse .env.local manually
const envPath = path.join(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) process.env[match[1]] = match[2].trim();
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// 2. OpenClaw Audit Log Path
const logPath = 'C:/Users/broug/.openclaw/logs/config-audit.jsonl';
let lastSize = 0;

if (fs.existsSync(logPath)) {
  lastSize = fs.statSync(logPath).size;
}

console.log(`Starting OpenClaw -> Supabase Sync daemon... Monitoring logs from size: ${lastSize}`);

const activeAgents = new Map(); // Agent Name -> Last Seen timestamp

async function processNewLogs() {
  if (!fs.existsSync(logPath)) return;
  
  const currentSize = fs.statSync(logPath).size;
  if (currentSize === lastSize) return;
  
  // File was truncated or rotated
  if (currentSize < lastSize) {
    lastSize = 0;
  }
  
  const stream = fs.createReadStream(logPath, {
    start: lastSize,
    end: currentSize - 1,
    encoding: 'utf8'
  });
  
  lastSize = currentSize;
  
  let data = '';
  for await (const chunk of stream) {
    data += chunk;
  }
  
  const lines = data.split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return;
  
  console.log(`[${new Date().toISOString()}] Processing ${lines.length} new log entries...`);
  
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      const agent = entry.agentName || 'Devroux'; // Fallback
      
      activeAgents.set(agent, Date.now());
      
      const { error } = await supabase.from('agent_logs').insert({
        agent_name: agent,
        action: entry.action || 'UNKNOWN',
        path: entry.path || null,
        created_at: entry.timestamp ? new Date(entry.timestamp).toISOString() : new Date().toISOString()
      });
      
      if (error) console.error("Error inserting log:", error);
      
    } catch (e) {
      // ignore parse errors for partial lines
    }
  }
  
  await updateAgentStatuses();
}

async function updateAgentStatuses() {
  const now = Date.now();
  for (const [agent, lastSeen] of activeAgents.entries()) {
    // Idle after 5 minutes of no logs
    const status = (now - lastSeen > 5 * 60 * 1000) ? 'idle' : 'active';
    
    const { error } = await supabase.from('agent_statuses')
      .update({ status, last_seen: new Date(lastSeen).toISOString() })
      .eq('agent_name', agent);
      
    if (error) console.error(`Error updating status for ${agent}:`, error);
  }
}

// Watch logs periodically (every 2 seconds)
setInterval(processNewLogs, 2000);

// Re-check statuses every 60 seconds (in case they go idle)
setInterval(updateAgentStatuses, 60000);
