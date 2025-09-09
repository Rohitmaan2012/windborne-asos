import { LRUCache } from "lru-cache";
import type { Station, HistoricalPayload } from "./types";

export const stationsCache = new LRUCache<string, Station[]>({
  max: 5,
  ttl: 10 * 60 * 1000, // 10m
});

export const historicalCache = new LRUCache<string, HistoricalPayload>({
  max: 500,
  ttl: 5 * 60 * 1000, // 5m
});
