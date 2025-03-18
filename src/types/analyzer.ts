export interface AnalysisConfig {
  analysisMode: 'FULL' | 'INCREMENTAL';
  maxDepth?: number;
  excludePatterns?: RegExp[];
  includePatterns?: RegExp[];
  [key: string]: unknown;
} 