import { NextResponse } from 'next/server';
import os from 'os';

export const dynamic = 'force-dynamic';

export async function GET() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsage = Math.round((usedMem / totalMem) * 100);
  
  const cpus = os.cpus();
  // Simple load approximation (Windows doesn't give loadavg easily via os.loadavg)
  // We'll just return core count and model for now, maybe refined later
  const cpuModel = cpus[0].model;
  const coreCount = cpus.length;
  
  const uptime = os.uptime(); // seconds

  return NextResponse.json({
    memory: {
      total: totalMem,
      free: freeMem,
      used: usedMem,
      usage: memUsage
    },
    cpu: {
      model: cpuModel,
      cores: coreCount
    },
    uptime
  });
}
