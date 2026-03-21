const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function sync() {
  console.log('Starting Mission Control Sync...');

  // 1. Assign Night Sprints (from HEARTBEAT.md)
  const tasks = [
    { agent: 'Max', content: 'Refactor Forge OS UI (v1.2) - Mobile compatibility check', projectId: 'p1' },
    { agent: 'Charles', content: 'Analyze Vercel usage for dad-strength-app (Optimization audit)', projectId: 'p1' },
    { agent: 'Isaac', content: 'Security audit on local network & OpenClaw exposure', projectId: 'p3' },
    { agent: 'Silas', content: 'Update developer documentation for plugin-sdk v2.1', projectId: 'p4' },
    { agent: 'Ollie', content: 'Social media strategy for next launch (Forge OS Promo)', projectId: '5' }
  ];

  for (const task of tasks) {
    const existing = await prisma.task.findFirst({
      where: { agent: task.agent, content: task.content, projectId: task.projectId }
    });
    if (!existing) {
      await prisma.task.create({ data: task });
      console.log(`Assigned ${task.agent}: ${task.content}`);
    } else {
      console.log(`Task for ${task.agent} already exists.`);
    }
  }

  // 2. Sync Agent Actions (from config-audit.jsonl)
  const logsPath = 'C:/Users/broug/.openclaw/logs/config-audit.jsonl';
  if (fs.existsSync(logsPath)) {
    const content = fs.readFileSync(logsPath, 'utf8');
    const lines = content.trim().split('\n').slice(-10); // Sync last 10 actions for Pulse
    for (const line of lines) {
      try {
        const entry = JSON.parse(line);
        // Only sync if not already present (timestamp + agent + action)
        const timestamp = new Date(entry.timestamp);
        const existing = await prisma.agentAction.findFirst({
          where: { agent: entry.agentName, action: entry.action, timestamp: timestamp }
        });
        if (!existing) {
          await prisma.agentAction.create({
            data: {
              agent: entry.agentName,
              action: entry.action,
              path: entry.path,
              timestamp: timestamp
            }
          });
        }
      } catch (e) {
        console.error('Failed to parse line:', line, e);
      }
    }
    console.log('Agent actions synced.');
  }

  // 3. Update Project Pulse
  await prisma.project.update({
    where: { id: 'p1' },
    data: { status: 'Overnight Sprint active', updatedAt: new Date() }
  });

  console.log('Sync complete.');
}

sync()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
