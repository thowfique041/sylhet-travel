import express, { type NextFunction, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { ZodError } from 'zod';
import { env } from './lib/env.js';
import { HttpError } from './middleware/auth.js';
import { content } from './routes/content.js';
import { auth } from './routes/auth.js';
import { me } from './routes/me.js';
import { admin } from './routes/admin.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
  app.use(cors({ origin: env.CLIENT_ORIGIN ? env.CLIENT_ORIGIN.split(',') : true }));
  app.use(express.json({ limit: '1mb' }));

  const api = express.Router();
  api.use(content);
  api.use('/auth', auth);
  api.use(me);
  api.use(admin);
  api.use((_req, _res, next) => next(new HttpError(404, 'That API route does not exist.')));
  app.use('/api', api);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ZodError) {
      return res.status(400).json({ error: err.issues[0]?.message ?? 'Check the form and try again.', issues: err.issues });
    }
    if (err instanceof HttpError) return res.status(err.status).json({ error: err.message, code: err.code });
    const e = err as { code?: number; message?: string; name?: string };
    if (e?.code === 11000) return res.status(409).json({ error: 'An item with that slug or email already exists.' });
    if (e?.name === 'MongooseServerSelectionError') return res.status(503).json({ error: 'The database is not reachable right now.' });
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  });

  return app;
}
