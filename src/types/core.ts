import { SecurityCategory } from './enums';
export type { AnalysisConfig } from './analyzer';

export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface FileFilter {
  pattern: RegExp;
  exclude: boolean;
}

export interface CodeLocation {
  file: string;
  line: number;
  column: number;
  context?: string;
}

export interface SecurityTransformation {
  type: string;
  impact: 'SANITIZE' | 'VALIDATE' | 'TRANSFORM' | 'unknown';
}

export interface SecurityFinding {
  id: string;
  title: string;
  severity: SeverityLevel;
  location: CodeLocation;
  description: string;
  remediation: string;
  category: SecurityCategory;
  timestamp: number;
  hash: string;
  metadata?: {
    confidence?: number;
    dataFlow?: string[];
    transformations?: SecurityTransformation[];
    [key: string]: unknown;
  };
}

export interface AnalysisSummary {
  analyzedFiles: number;
  totalFindings: number;
  findingsCount: Record<SecurityCategory, number>;
}

export interface AnalysisMetadata {
  duration: number;
  agentVersion: string;
  agentConfig?: Record<string, unknown>;
}

export interface AnalysisResult {
  findings: SecurityFinding[];
  summary: AnalysisSummary;
  metadata: AnalysisMetadata;
  timestamp: number;
  version: string;
}

export interface AgentMetrics {
  filesAnalyzed: number;
  findingsCount: Record<SecurityCategory, number>;
  avgProcessingTime: number;
  peakMemoryUsage: number;
}

export type AgentState = 'idle' | 'analyzing' | 'error';
export type AgentHealth = 'healthy' | 'degraded' | 'unhealthy';

export interface AgentStatus {
  id: string;
  state: AgentState;
  health: AgentHealth;
  metrics: AgentMetrics;
}

export interface Agent {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  
  analyze(files: string[]): Promise<AnalysisResult>;
  getStatus(): AgentStatus;
  configure(config: Record<string, unknown>): void;
  validateConfig(config: Record<string, unknown>): boolean;
  reportStatus(): Promise<AgentStatus>;
} 