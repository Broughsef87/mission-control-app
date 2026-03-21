import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function logAgentAction(agent: string, action: string, path?: string) {
  try {
    await prisma.agentAction.create({
      data: { agent, action, path }
    });
  } catch (error) {
    console.error('Failed to log agent action:', error);
  }
}

export async function logTokenUsage(agent: string, model: string, tokens: number, cost: number) {
  try {
    await prisma.tokenLog.create({
      data: { agent, model, tokens, cost }
    });
  } catch (error) {
    console.error('Failed to log token usage:', error);
  }
}

export async function updateExternalStatus(service: string, status: string, message?: string) {
  try {
    await prisma.externalStatus.create({
      data: { service, status, message }
    });
  } catch (error) {
    console.error('Failed to update external status:', error);
  }
}
