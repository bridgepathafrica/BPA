import { EventEmitter } from "node:events";
import { initD1 } from "@workspace/db";
import app from "./app";

type WorkerEnv = {
  DB?: unknown;
  [key: string]: string | unknown;
};

let d1Initialized = false;

function injectEnv(env: WorkerEnv) {
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === "string") {
      process.env[key] = value;
    }
  }
  if (env.DB && !d1Initialized) {
    initD1(env.DB);
    d1Initialized = true;
  }
}

async function expressHandler(request: Request): Promise<Response> {
  const url = new URL(request.url);

  return new Promise<Response>((resolve) => {
    const req = new EventEmitter() as Record<string, unknown> & EventEmitter;
    req["method"] = request.method;
    req["url"] = url.pathname + url.search;
    req["httpVersion"] = "1.1";
    req["httpVersionMajor"] = 1;
    req["httpVersionMinor"] = 1;
    req["socket"] = { remoteAddress: "127.0.0.1", encrypted: true };
    req["connection"] = req["socket"];

    const headersObj: Record<string, string> = {};
    request.headers.forEach((value, key) => { headersObj[key] = value; });
    req["headers"] = headersObj;
    req["rawHeaders"] = [];
    req["trailers"] = {};
    req["readable"] = true;
    req["pipe"] = () => req;
    req["resume"] = () => { setTimeout(() => req.emit("end"), 0); return req; };
    req["pause"] = () => req;

    if (request.body) {
      const reader = request.body.getReader();
      (async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) { req.emit("end"); break; }
            req.emit("data", Buffer.from(value));
          }
        } catch { req.emit("end"); }
      })();
    } else {
      setTimeout(() => req.emit("end"), 0);
    }

    const res = new EventEmitter() as Record<string, unknown> & EventEmitter;
    const responseHeaders: Record<string, string | string[]> = {};
    const chunks: Buffer[] = [];
    let finished = false;

    res["statusCode"] = 200;
    res["statusMessage"] = "";
    res["headersSent"] = false;
    res["writable"] = true;
    res["socket"] = { destroy: () => {} };
    res["connection"] = res["socket"];
    res["locals"] = {};

    res["setHeader"] = (name: string, value: string | string[]) => {
      responseHeaders[name.toLowerCase()] = value;
      return res;
    };
    res["getHeader"] = (name: string) => responseHeaders[name.toLowerCase()];
    res["getHeaders"] = () => ({ ...responseHeaders });
    res["hasHeader"] = (name: string) => name.toLowerCase() in responseHeaders;
    res["removeHeader"] = (name: string) => { delete responseHeaders[name.toLowerCase()]; };
    res["flushHeaders"] = () => {};

    res["writeHead"] = (code: number, message?: string | Record<string, string>, hdrs?: Record<string, string>) => {
      res["statusCode"] = code;
      const headers = typeof message === "object" ? message : (hdrs ?? {});
      for (const [k, v] of Object.entries(headers)) {
        responseHeaders[k.toLowerCase()] = v;
      }
      res["headersSent"] = true;
      return res;
    };

    res["write"] = (chunk: Buffer | string, encoding?: string | (() => void), callback?: () => void) => {
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string, typeof encoding === "string" ? (encoding as BufferEncoding) : "utf8"));
      if (typeof encoding === "function") encoding();
      else if (callback) callback();
      return true;
    };

    res["end"] = (chunk?: Buffer | string, encoding?: string | (() => void), callback?: () => void) => {
      if (finished) return res;
      finished = true;
      if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string, typeof encoding === "string" ? (encoding as BufferEncoding) : "utf8"));
      if (typeof encoding === "function") encoding();
      else if (callback) callback();

      res["headersSent"] = true;
      res["writable"] = false;
      res.emit("finish");

      const body = chunks.length ? Buffer.concat(chunks) : null;
      const finalStatus = Number(res["statusCode"] ?? 200);
      const finalHeaders = new Headers();
      for (const [k, v] of Object.entries(responseHeaders)) {
        if (Array.isArray(v)) v.forEach(val => finalHeaders.append(k, val));
        else finalHeaders.set(k, v);
      }

      resolve(new Response(body, { status: finalStatus, headers: finalHeaders }));
      return res;
    };

    app(req as Parameters<typeof app>[0], res as Parameters<typeof app>[1]);
  });
}

export default {
  async fetch(request: Request, env: WorkerEnv, _ctx: ExecutionContext): Promise<Response> {
    try {
      injectEnv(env);
      return await expressHandler(request);
    } catch (err) {
      const msg = err instanceof Error ? err.message + "\n" + (err as Error).stack : String(err);
      return new Response(JSON.stringify({ error: "Worker error", detail: msg }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  },
};
