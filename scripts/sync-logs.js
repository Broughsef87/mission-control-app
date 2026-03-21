const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

async function syncLogs() {
  try {
    const logPath = 'C:/Users/broug/.openclaw/logs/config-audit.jsonl';
    if (!fs.existsSync(logPath)) {
      console.log('Log file not found');
      return;
    }

    const data = fs.readFileSync(logPath, 'utf8');
    const lines = data.trim().split('\n');
    const lastLines = lines.slice(-20); // Sync last 20 actions

    for (const line of lastLines) {
      const entry = JSON.parse(line);
      await prisma.agentAction.create({
        data: {
          agent: entry.agent || 'Unknown',
          action: entry.action || 'UNKNOWN',
          path: entry.path || '',
          timestamp: new Date(entry.timestamp || Date.now())
        }
      });
    }

    // Also update Gabriel's pulse in Agent table if it exists
    // (Note: Schema only has AgentAction, not Agent in the version I read last? 
    // Wait, let me check schema again. It had Agent in my thought but not in my read.)
    // My read of schema.prisma showed: Project, Task, AgentAction, TokenLog, ExternalStatus.
    // So no Agent table.
    
    console.log(`Synced ${lastLines.length} actions from config-audit.jsonl`);
  } catch (error) {
    console.error('Sync failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncLogs();
