import { Agent, AnalysisResult, SecurityFinding } from '../types/core';
import { SecurityCategory } from '../types/enums';
import { WorkerPool } from './workers';
import { AnalysisCache } from './cache';
import { CodeSearch } from './search';
import { createHash } from 'crypto';

// Define the missing types
export interface AnalysisConfig {
  analysisMode: 'FULL' | 'INCREMENTAL';
  maxDepth?: number;
  excludePatterns?: RegExp[];
  includePatterns?: RegExp[];
  [key: string]: unknown;
}

export class CodebaseAnalyzer {
  private findings: SecurityFinding[] = [];

  constructor(
    private readonly agents: Agent[],
    private readonly config: AnalysisConfig,
    private readonly workerPool: WorkerPool,
    private readonly cache: AnalysisCache
  ) {}

  async analyze(codebasePath: string): Promise<AnalysisResult> {
    const startTime = Date.now();
    
    // Generate cache key for this analysis
    const cacheKey = this.generateCacheKey(codebasePath);
    
    // Check cache first
    const cachedResult = await this.cache.get(cacheKey);
    if (cachedResult && this.config.analysisMode !== 'FULL') {
      return cachedResult;
    }

    // Initialize code search
    const search = new CodeSearch({
      maxDepth: 10,
      excludePatterns: [/node_modules/, /\.git/],
      includePatterns: [],
      fileSizeLimit: 5 * 1024 * 1024 // 5MB
    });

    // Process files in parallel using agents
    const tasks = this.agents.map(agent => 
      this.workerPool.execute(async () => {
        const files = await search.searchFiles(codebasePath, [/.*/]);
        const result = await agent.analyze(files.map(f => f.file.path));
        return result.findings;
      })
    );

    // Collect all findings
    const agentFindings = await Promise.all(tasks);
    this.findings = agentFindings.flat();

    const endTime = Date.now();
    const duration = endTime - startTime;

    // Create analysis result
    const result: AnalysisResult = {
      findings: this.findings,
      summary: {
        analyzedFiles: this.agents.reduce((total, agent) => total + agent.getStatus().metrics.filesAnalyzed, 0),
        totalFindings: this.findings.length,
        findingsCount: this.calculateFindingsCount()
      },
      metadata: {
        duration,
        agentVersion: '1.0.0',
        agentConfig: this.config
      },
      timestamp: Date.now(),
      version: '1.0.0'
    };

    // Cache the result
    await this.cache.set(cacheKey, result);

    return result;
  }

  private generateCacheKey(codebasePath: string): string {
    const hash = createHash('sha256');
    hash.update(codebasePath);
    hash.update(JSON.stringify(this.config));
    return hash.digest('hex');
  }

  private calculateFindingsCount(): Record<SecurityCategory, number> {
    return this.findings.reduce((counts, finding) => {
      counts[finding.category] = (counts[finding.category] || 0) + 1;
      return counts;
    }, {} as Record<SecurityCategory, number>);
  }
} 