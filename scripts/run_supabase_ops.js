const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('Running Supabase operations...');
  
  const scribeId = crypto.randomUUID();
  const { error: scribeErr } = await supabase
    .from('agent_status')
    .insert({
      id: scribeId,
      agent_name: 'Scribe',
      status: 'Active',
      task: 'Ingesting knowledge captures',
      location: 'Ingestion Desk',
      last_seen: new Date().toISOString()
    });
  if (scribeErr) console.error('Failed to add Scribe:', scribeErr);
  else console.log('Successfully added Scribe in agent_status with ID:', scribeId);

  console.log('Done!');
}

main();
