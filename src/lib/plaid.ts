import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid';

let _client: PlaidApi | null = null;

export function getPlaid(): PlaidApi | null {
  if (_client) return _client;

  const clientId = process.env.PLAID_CLIENT_ID;
  const secret = process.env.PLAID_SECRET;
  const env = (process.env.PLAID_ENV || 'sandbox') as keyof typeof PlaidEnvironments;

  if (!clientId || !secret) return null;
  if (!PlaidEnvironments[env]) {
    throw new Error(`Invalid PLAID_ENV: ${env}. Must be sandbox, development, or production.`);
  }

  _client = new PlaidApi(
    new Configuration({
      basePath: PlaidEnvironments[env],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': clientId,
          'PLAID-SECRET': secret,
        },
      },
    })
  );
  return _client;
}

export function plaidConfigured(): boolean {
  return !!(process.env.PLAID_CLIENT_ID && process.env.PLAID_SECRET);
}
