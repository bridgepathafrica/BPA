import type { Request, Response, NextFunction } from "express";

const noopLog = {
  trace: (..._args: unknown[]) => {},
  debug: (..._args: unknown[]) => {},
  info:  (...args: unknown[]) => console.log(...args),
  warn:  (...args: unknown[]) => console.warn(...args),
  error: (...args: unknown[]) => console.error(...args),
  fatal: (...args: unknown[]) => console.error(...args),
  child: () => noopLog,
};

function middleware(req: Request & { log?: typeof noopLog }, _res: Response, next: NextFunction) {
  req.log = noopLog;
  next();
}

export default function pinoHttp(_opts?: unknown) {
  return middleware;
}
