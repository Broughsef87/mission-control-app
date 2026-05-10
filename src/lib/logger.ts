import { getSupabaseAdmin } from './supabase';

function db() { return getSupabaseAdmin(); }

export async function logAgentAction(agent: string, action: string, path?: string) {
  try {
    await db().from('agent_logs').insert({ agent_name: agent, action, details: path ? { path } : null });
  } catch (error) {
    console.error('Failed to log agent action:', error);
  }
}

export async function logTokenUsage(agent: string, model: string, tokens: number, cost: number) {
  try {
    await db().from('token_logs').insert({ agent_name: agent, model, tokens, cost });
  } catch (error) {
    console.error('Failed to log token usage:', error);
  }
}

export async function updateExternalStatus(service: string, status: string, message?: string) {
  try {
    await db().from('external_statuses').insert({ service, status, message });
  } catch (error) {
    console.error('Failed to update external status:', error);
  }
}
