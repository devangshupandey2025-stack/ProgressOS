let app: any;
let initError: string | null = null;

try {
  // Dynamic import so we can catch initialization failures (missing env vars, etc.)
  // and return a proper JSON error instead of Vercel's default HTML 500 page.
  const mod = await import('../backend/src/index.js');
  app = mod.default;
} catch (err: any) {
  initError = err.message || 'Unknown initialization error';
  console.error('Backend initialization failed:', err);
}

export default function handler(req: any, res: any) {
  if (initError) {
    res.setHeader('Content-Type', 'application/json');
    res.status(500).json({
      success: false,
      error: initError,
    });
    return;
  }
  if (!app) {
    res.status(500).json({
      success: false,
      error: 'Backend failed to initialize for an unknown reason',
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
