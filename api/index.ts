import app from '../backend/src/index.js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Vercel Serverless Function entry point
export default function handler(req: VercelRequest, res: VercelResponse) {
  return app(req, res);
}
