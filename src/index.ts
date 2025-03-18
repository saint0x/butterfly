import { Command } from 'commander';
import { CodebaseAnalyzer } from './core/analyzer';
import { WorkerPool } from './core/workers';
import { DiskCache, MemoryCache } from './core/cache';
import { InputSecurityAgent } from './agents/input';
import { AnalysisConfig } from './types/core/index';
import { InputSecurityConfig } from './types/agents/input';

export class Butterfly {
  private readonly analyzer: CodebaseAnalyzer;
  private readonly workerPool: WorkerPool;
  private readonly cache: DiskCache | MemoryCache;
  
  constructor(config: AnalysisConfig) {
    this.workerPool = new WorkerPool(config['maxWorkers'] as number | undefined);
    this.cache = config['cacheStrategy'] === 'DISK' ? new DiskCache() : new MemoryCache();
    
    // Initialize agents
    const agents = [
      new InputSecurityAgent(config as InputSecurityConfig),
      // Add other agents here as they are implemented
    ];
    
    this.analyzer = new CodebaseAnalyzer(
      agents,
      config,
      this.workerPool,
      this.cache
    );
  }
  
  async analyze(codebasePath: string): Promise<void> {
    try {
      const results = await this.analyzer.analyze(codebasePath);
      this.printResults(results);
    } catch (error) {
      console.error('Analysis failed:', error);
      process.exit(1);
    }
  }
  
  private printResults(results: any): void {
    console.log('\n=== Butterfly Security Analysis Results ===\n');
    
    // Print summary
    console.log('Summary:');
    console.log(`Total Findings: ${results.summary.totalFindings}`);
    console.log(`Files Analyzed: ${results.summary.filesAnalyzed}`);
    console.log(`Analysis Duration: ${results.summary.analysisDuration}ms\n`);
    
    // Print findings by severity
    console.log('Findings by Severity:');
    Object.entries(results.summary.findingsBySeverity)
      .sort((a, b) => this.getSeverityPriority(b[0]) - this.getSeverityPriority(a[0]))
      .forEach(([severity, count]) => {
        console.log(`${severity}: ${count}`);
      });
    
    // Print findings by category
    console.log('\nFindings by Category:');
    Object.entries(results.summary.findingsByCategory)
      .forEach(([category, count]) => {
        console.log(`${category}: ${count}`);
      });
    
    // Print detailed findings
    if (results.findings.length > 0) {
      console.log('\nDetailed Findings:');
      results.findings.forEach((finding: any) => {
        console.log(`\n[${finding.severity}] ${finding.description}`);
        console.log(`File: ${finding.location.file}`);
        console.log(`Line: ${finding.location.line}`);
        console.log(`Context:\n${finding.location.context}`);
        console.log(`Remediation: ${finding.remediation}`);
      });
    }
  }
  
  private getSeverityPriority(severity: string): number {
    const priorities: Record<string, number> = {
      'CRITICAL': 4,
      'HIGH': 3,
      'MEDIUM': 2,
      'LOW': 1,
      'INFO': 0
    };
    return priorities[severity] || 0;
  }
  
  async shutdown(): Promise<void> {
    await this.workerPool.shutdown();
  }
}

// CLI setup
const program = new Command();

program
  .name('butterfly')
  .description('High-performance security analysis tool')
  .version('1.0.0');

program
  .command('analyze')
  .description('Analyze a codebase for security issues')
  .argument('<path>', 'Path to the codebase')
  .option('-w, --workers <number>', 'Number of worker threads', '4')
  .option('-c, --cache <type>', 'Cache strategy (memory|disk)', 'memory')
  .option('-m, --mode <type>', 'Analysis mode (full|incremental|diff)', 'full')
  .action(async (path: string, options: any) => {
    const config: AnalysisConfig = {
      maxWorkers: parseInt(options.workers),
      chunkSize: 100,
      cacheStrategy: options.cache === 'disk' ? 'DISK' : 'MEMORY',
      analysisMode: options.mode.toUpperCase() as any,
      fileFilters: []
    };
    
    const butterfly = new Butterfly(config);
    await butterfly.analyze(path);
    await butterfly.shutdown();
  });

program.parse(); 