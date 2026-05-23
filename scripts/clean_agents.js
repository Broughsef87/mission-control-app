const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanRoster() {
  const toDelete = ['Max', 'Gabriel', 'Ollie', 'Silas', 'theodore', 'main', 'charles', 'devroux', 'isaac'];
  
  for (const name of toDelete) {
    const { error } = await supabase.from('agent_status').delete().eq('agent_name', name);
    if (error) {
      console.error(`Failed to delete ${name}:`, error);
    } else {
      console.log(`Deleted ${name}`);
    }
  }

  const { error: updateError } = await supabase.from('agent_status').update({ agent_name: 'Ledger' }).eq('agent_name', 'ledger');
  if (updateError) {
    console.error('Failed to rename ledger:', updateError);
  } else {
    console.log('Renamed ledger to Ledger');
  }
}
cleanRoster();
