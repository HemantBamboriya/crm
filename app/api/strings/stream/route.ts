import { ChangeStream, Document } from 'mongodb';
import { ensureDbSetup, serializeLiveString } from '@/lib/server-data';
import { getDb } from '@/lib/mongodb';

export const runtime = 'nodejs';

interface DbLiveString {
  _id: { toHexString: () => string };
  value: string;
  createdAt: Date;
  userId?: string;
  userName?: string;
}

export async function GET(request: Request) {
  await ensureDbSetup();
  const encoder = new TextEncoder();
  const db = await getDb();
  const collection = db.collection<DbLiveString>('live_strings');

  let keepAliveTimer: NodeJS.Timeout | undefined;
  let pollTimer: NodeJS.Timeout | undefined;
  let stream: ChangeStream<Document> | null = null;
  let closed = false;
  let lastCreatedAt = new Date(0);

  const responseStream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: string, payload: unknown) => {
        if (closed) return;
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`)
        );
      };

      const closeAll = () => {
        if (closed) return;
        closed = true;
        if (keepAliveTimer) clearInterval(keepAliveTimer);
        if (pollTimer) clearInterval(pollTimer);
        if (stream) {
          stream.close().catch(() => undefined);
        }
      };

      keepAliveTimer = setInterval(() => {
        if (!closed) {
          controller.enqueue(encoder.encode(': ping\n\n'));
        }
      }, 15000);

      request.signal.addEventListener('abort', () => {
        closeAll();
      });

      const latest = await collection.find({}).sort({ createdAt: -1 }).limit(1).toArray();
      if (latest[0]?.createdAt) {
        lastCreatedAt = latest[0].createdAt;
      }

      sendEvent('ready', { ok: true });

      const startPolling = () => {
        if (pollTimer) return;

        pollTimer = setInterval(async () => {
          if (closed) return;

          const items = await collection
            .find({ createdAt: { $gt: lastCreatedAt } })
            .sort({ createdAt: 1 })
            .limit(20)
            .toArray();

          for (const item of items) {
            if (item.createdAt > lastCreatedAt) {
              lastCreatedAt = item.createdAt;
            }
            sendEvent('insert', serializeLiveString(item));
          }
        }, 2000);
      };

      try {
        stream = collection.watch(
          [{ $match: { operationType: 'insert' } }],
          { fullDocument: 'default' }
        );

        stream.on('change', (change) => {
          if (change.operationType !== 'insert') {
            return;
          }

          const item = change.fullDocument as DbLiveString | undefined;
          if (!item) return;
          if (item.createdAt > lastCreatedAt) {
            lastCreatedAt = item.createdAt;
          }
          sendEvent('insert', serializeLiveString(item));
        });

        stream.on('error', () => {
          startPolling();
        });
      } catch {
        startPolling();
      }
    },
    cancel() {
      closed = true;
      if (keepAliveTimer) clearInterval(keepAliveTimer);
      if (pollTimer) clearInterval(pollTimer);
      if (stream) {
        stream.close().catch(() => undefined);
      }
    },
  });

  return new Response(responseStream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
