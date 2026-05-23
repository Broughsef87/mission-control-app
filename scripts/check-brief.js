const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase
    .from('daily_briefings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(2);
    
  if (error) {
    console.error(error);
    return;
  }
  
  console.log("LATEST BRIEF:");
  console.log(JSON.stringify(data[0].content));
  console.log("\nSECOND LATEST BRIEF:");
  console.log(JSON.stringify(data[1].content));
}

check();
