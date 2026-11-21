import { createApp } from './app.js';
import { env } from './lib/env.js';
import { connectDB, hasDatabase } from './lib/db.js';

const app = createApp();

app.listen(env.PORT, async () => {
  console.log(`[api] listening on http://localhost:${env.PORT}`);
  if (hasDatabase()) {
    try {
      await connectDB();
      console.log('[api] MongoDB connected');
    } catch (err) {
      console.error('[api] MongoDB connection failed:', (err as Error).message);
    }
  } else {
    console.log('[api] No MONGODB_URI set: serving bundled content in read-only mode');
  }
});
