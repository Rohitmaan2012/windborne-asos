// Rolling-window limiter: allow <= 20 requests per 60s
const hits: number[] = [];

export function allow(): boolean {
  const now = Date.now();
  while (hits.length && now - hits[0] > 60_000) hits.shift();
  if (hits.length >= 20) return false; // 20/min
  hits.push(now);
  return true;
}
