const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('agent_logs')
    .select('agent_name, action, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
    
  if (error) {
    console.error(error);
    return;
  }
  
  console.log("RECENT AGENT LOGS:");
  data.forEach(d => console.log(`[${d.created_at}] ${d.agent_name}: ${d.action}`));
}

check();
