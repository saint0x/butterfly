import { AnalysisResult } from '../types/core';
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export interface AnalysisCache {
  get(key: string): Promise<AnalysisResult | null>;
  set(key: string, value: AnalysisResult): Promise<void>;
  invalidate(key: string): Promise<void>;
  clear(): Promise<void>;
}

export class DiskCache implements AnalysisCache {
  private readonly cacheDir: string;
  private readonly memCache: Map<string, AnalysisResult>;
  private readonly maxAge: number;

  constructor(
    cacheDir?: string,
    maxAge: number = 24 * 60 * 60 * 1000 // 24 hours
  ) {
    this.cacheDir = cacheDir ?? join(homedir(), '.butterfly', 'cache');
    this.memCache = new Map();
    this.maxAge = maxAge;
    this.initCache().catch(console.error);
  }

  private async initCache(): Promise<void> {
    try {
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.error('Failed to initialize cache directory:', error);
    }
  }

  async get(key: string): Promise<AnalysisResult | null> {
    // Check memory cache first
    const memResult = this.memCache.get(key);
    if (memResult) {
      return memResult;
    }

    try {
      const filePath = this.getCacheFilePath(key);
      const data = await fs.readFile(filePath, 'utf-8');
      const result = JSON.parse(data) as AnalysisResult;

      // Check if cache is still valid
      if (Date.now() - result.timestamp > this.maxAge) {
        await this.invalidate(key);
        return null;
      }

      // Update memory cache
      this.memCache.set(key, result);
      return result;
    } catch {
      return null;
    }
  }

  async set(key: string, value: AnalysisResult): Promise<void> {
    try {
      const filePath = this.getCacheFilePath(key);
      await fs.writeFile(filePath, JSON.stringify(value));
      this.memCache.set(key, value);
    } catch (error) {
      console.error('Failed to write to cache:', error);
    }
  }

  async invalidate(key: string): Promise<void> {
    try {
      const filePath = this.getCacheFilePath(key);
      await fs.unlink(filePath);
      this.memCache.delete(key);
    } catch {
      // Ignore errors if file doesn't exist
    }
  }

  async clear(): Promise<void> {
    try {
      await fs.rm(this.cacheDir, { recursive: true });
      await this.initCache();
      this.memCache.clear();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  private getCacheFilePath(key: string): string {
    return join(this.cacheDir, `${key}.json`);
  }
}

export class MemoryCache implements AnalysisCache {
  private readonly cache: Map<string, AnalysisResult>;
  private readonly maxAge: number;

  constructor(maxAge: number = 24 * 60 * 60 * 1000) {
    this.cache = new Map();
    this.maxAge = maxAge;
  }

  async get(key: string): Promise<AnalysisResult | null> {
    const result = this.cache.get(key);
    if (!result) {
      return null;
    }

    if (Date.now() - result.timestamp > this.maxAge) {
      await this.invalidate(key);
      return null;
    }

    return result;
  }

  async set(key: string, value: AnalysisResult): Promise<void> {
    this.cache.set(key, value);
  }

  async invalidate(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }
} 