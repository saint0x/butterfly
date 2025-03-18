/**
 * Base security finding interface
 */
export interface SecurityFinding {
  id: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  category: SecurityCategory;
  title: string;
  description: string;
  location: CodeLocation;
  remediation: string;
  cwe?: string[];
  cvss?: CVSSScore;
  metadata: Record<string, unknown>;
  timestamp: number;
  hash: string;
}

/**
 * Analysis configuration
 */
export interface AnalysisConfig {
  analysisMode: 'FULL' | 'INCREMENTAL';
  maxDepth?: number;
  excludePatterns?: RegExp[];
  includePatterns?: RegExp[];
  maxWorkers?: number;
  cacheStrategy?: 'DISK' | 'MEMORY';
  [key: string]: unknown;
}

/**
 * Code location information
 */
export interface CodeLocation {
  file: string;
  line: number;
  column: number;
  snippet: string;
  context: string;
  functionName?: string;
  className?: string;
}

/**
 * Security categories
 */
export type SecurityCategory =
  | 'INPUT_VALIDATION'
  | 'AUTHENTICATION'
  | 'AUTHORIZATION'
  | 'CRYPTOGRAPHY'
  | 'CONFIGURATION'
  | 'DEPENDENCY'
  | 'CODE_QUALITY'
  | 'INFRASTRUCTURE';

/**
 * CVSS score information
 */
export interface CVSSScore {
  version: '3.0' | '3.1';
  score: number;
  vector: string;
  metrics: {
    attackVector: string;
    attackComplexity: string;
    privilegesRequired: string;
    userInteraction: string;
    scope: string;
    confidentiality: string;
    integrity: string;
    availability: string;
  };
}

/**
 * Analysis result interface
 */
export interface AnalysisResult {
  findings: SecurityFinding[];
  summary: AnalysisSummary;
  metadata: AnalysisMetadata;
  timestamp: number;
  version: string;
}

/**
 * Analysis summary information
 */
export interface AnalysisSummary {
  totalFindings: number;
  findingsBySeverity: Record<string, number>;
  findingsByCategory: Record<SecurityCategory, number>;
  riskScore: number;
  coverage: {
    files: number;
    lines: number;
    functions: number;
  };
  duration: number;
}

/**
 * Analysis metadata
 */
export interface AnalysisMetadata {
  repository?: {
    url: string;
    branch: string;
    commit: string;
  };
  environment: {
    nodeVersion: string;
    platform: string;
    cpuCores: number;
    memoryLimit: number;
  };
  configuration: {
    agents: string[];
    rules: Record<string, boolean>;
    thresholds: Record<string, number>;
  };
  dependencies: {
    name: string;
    version: string;
    vulnerabilities?: number;
  }[];
}

/**
 * Base agent interface
 */
export interface Agent {
  id: string;
  name: string;
  version: string;
  analyze(files: string[]): Promise<AnalysisResult>;
  configure(config: Record<string, unknown>): void;
  validateConfig(config: Record<string, unknown>): boolean;
  reportStatus(): Promise<AgentStatus>;
}

/**
 * Agent status information
 */
export interface AgentStatus {
  id: string;
  status: 'IDLE' | 'ANALYZING' | 'ERROR';
  currentFile?: string;
  progress: number;
  findings: number;
  errors: number;
  memory: number;
  uptime: number;
}

/**
 * Agent configuration interface
 */
export interface AgentConfig {
  enabled: boolean;
  priority: number;
  concurrent: boolean;
  timeout: number;
  memory: number;
  rules: Record<string, boolean>;
  patterns: Record<string, RegExp[]>;
  thresholds: Record<string, number>;
} 