const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID?.trim();
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET?.trim();
const GOOGLE_CALENDAR_REFRESH_TOKEN_WORKSPACE = process.env.GOOGLE_CALENDAR_REFRESH_TOKEN_WORKSPACE?.trim();

async function run() {
  console.log('Testing Workspace Refresh Token...');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_CALENDAR_REFRESH_TOKEN_WORKSPACE,
      grant_type: 'refresh_token',
    }),
  });
  
  const data = await res.json();
  if (!res.ok) {
    console.error('Failed to get access token:', data);
    return;
  }
  
  console.log('Got access token! Length:', data.access_token.length);
}

run().catch(console.error);
