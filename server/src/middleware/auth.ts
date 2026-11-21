import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../lib/env.js';
import { connectDB, hasDatabase } from '../lib/db.js';

export interface AuthPayload {
  sub: string;
  role: 'user' | 'admin';
  name: string;
}

declare module 'express-serve-static-core' {
  interface Request {
    auth?: AuthPayload;
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string, public code?: string) {
    super(message);
  }
}

export function signToken(payload: AuthPayload) {
  if (!env.JWT_SECRET) throw new HttpError(500, 'JWT_SECRET is not configured on the server.');
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] });
}

function readToken(req: Request): AuthPayload | undefined {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ') || !env.JWT_SECRET) return undefined;
  try {
    return jwt.verify(header.slice(7), env.JWT_SECRET) as AuthPayload;
  } catch {
    return undefined;
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  req.auth = readToken(req);
  next();
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const auth = readToken(req);
  if (!auth) return next(new HttpError(401, 'Sign in to continue.', 'UNAUTHENTICATED'));
  req.auth = auth;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, (err?: unknown) => {
    if (err) return next(err);
    if (req.auth?.role !== 'admin') return next(new HttpError(403, 'Admin access only.', 'FORBIDDEN'));
    next();
  });
}

/** Routes that write data need MongoDB. Without it the API stays read-only. */
export async function requireDb(_req: Request, _res: Response, next: NextFunction) {
  if (!hasDatabase()) {
    return next(
      new HttpError(503, 'The database is not connected yet, so this action is unavailable. Add MONGODB_URI to enable accounts, reviews and the admin dashboard.', 'NO_DATABASE'),
    );
  }
  await connectDB();
  next();
}
