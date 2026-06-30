type SharpChain = {
  resize(w?: number | null, h?: number | null, opts?: object): SharpChain;
  jpeg(opts?: object): SharpChain;
  png(opts?: object): SharpChain;
  webp(opts?: object): SharpChain;
  avif(opts?: object): SharpChain;
  toBuffer(): Promise<Buffer>;
  toFile(path: string): Promise<{ size: number; width: number; height: number }>;
  composite(layers: object[]): SharpChain;
  flatten(opts?: object): SharpChain;
  extend(opts: object): SharpChain;
  metadata(): Promise<object>;
};

function createChain(): SharpChain {
  const chain: SharpChain = {
    resize: () => chain,
    jpeg: () => chain,
    png: () => chain,
    webp: () => chain,
    avif: () => chain,
    composite: () => chain,
    flatten: () => chain,
    extend: () => chain,
    toBuffer: async () => { throw new Error("[compat] sharp is not available in Cloudflare Workers"); },
    toFile: async () => { throw new Error("[compat] sharp is not available in Cloudflare Workers"); },
    metadata: async () => ({}),
  };
  return chain;
}

function sharp(_input?: unknown, _options?: unknown): SharpChain {
  return createChain();
}

sharp.cache = () => ({});
sharp.counters = () => ({});
sharp.simd = () => false;
sharp.concurrency = () => 0;
sharp.versions = {};
sharp.format = {};
sharp.interpolators = {};

export default sharp;
