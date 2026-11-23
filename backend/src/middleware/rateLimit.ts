import { Request, Response, NextFunction } from 'express';

/** Per-instance limiter, suitable for a single process. Multi-replica deployments need Redis. */
export const rateLimit = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; expiresAt: number }>();
  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    if (requests.size > 10000) {
      for (const [key, entry] of requests) if (entry.expiresAt <= now) requests.delete(key);
    }
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const previous = requests.get(key);
    const entry = previous && previous.expiresAt > now ? previous : { count: 0, expiresAt: now + windowMs };
    entry.count += 1;
    requests.set(key, entry);
    res.setHeader('RateLimit-Limit', String(maxRequests));
    res.setHeader('RateLimit-Remaining', String(Math.max(0, maxRequests - entry.count)));
    if (entry.count > maxRequests) {
      res.setHeader('Retry-After', String(Math.max(1, Math.ceil((entry.expiresAt - now) / 1000))));
      res.status(429).json({ message: 'Too many requests. Please try again later.' });
      return;
    }
    next();
  };
};
