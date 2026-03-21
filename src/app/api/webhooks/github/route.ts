import { NextRequest, NextResponse } from 'next/server';
import { createNotification } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const event = request.headers.get('x-github-event') ?? 'unknown';
    const body = await request.json();

    switch (event) {
      case 'push': {
        const repo = body.repository?.name ?? 'unknown';
        const branch = body.ref?.replace('refs/heads/', '') ?? 'unknown';
        const pusher = body.pusher?.name ?? 'unknown';
        const commits = body.commits?.length ?? 0;
        await createNotification({
          type: 'info',
          title: `Push to ${repo}/${branch}`,
          body: `${pusher} pushed ${commits} commit${commits !== 1 ? 's' : ''}`,
          source: 'github',
        });
        break;
      }
      case 'deployment_status': {
        const state = body.deployment_status?.state;
        const env = body.deployment?.environment ?? 'production';
        const repo = body.repository?.name ?? 'unknown';
        await createNotification({
          type: state === 'success' ? 'success' : state === 'failure' ? 'error' : 'info',
          title: `Deployment ${state === 'success' ? 'Successful' : state === 'failure' ? 'Failed' : 'In Progress'}`,
          body: `${repo} → ${env}`,
          source: 'github',
        });
        break;
      }
      case 'pull_request': {
        const action = body.action;
        const title = body.pull_request?.title ?? 'PR';
        const repo = body.repository?.name ?? 'unknown';
        await createNotification({
          type: 'info',
          title: `PR ${action}: ${title}`,
          body: `Repository: ${repo}`,
          source: 'github',
        });
        break;
      }
      default:
        break;
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
