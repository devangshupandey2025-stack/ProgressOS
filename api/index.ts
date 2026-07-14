import app from '../backend/src/index.js';

export default function handler(req: any, res: any) {
  if (!app) {
    res.status(500).json({
      success: false,
      error: 'Backend failed to initialize',
    });
    return;
  }
  try {
    return app(req, res);
  } catch (err: any) {
    console.error('Handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: err.message || 'Internal server error',
      });
    }
  }
}
