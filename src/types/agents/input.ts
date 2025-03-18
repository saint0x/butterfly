import { SecurityFinding, CodeLocation, SeverityLevel, SecurityTransformation, AnalysisConfig } from '../core';
import { SecurityCategory, InputVulnerabilityType } from '../enums';

/**
 * Extended security finding specific to input vulnerabilities
 */
export interface InputSecurityFinding extends SecurityFinding {
  category: SecurityCategory;
  type: InputVulnerabilityType;
  severity: SeverityLevel;
  location: CodeLocation;
  description: string;
  remediation: string;
  metadata: {
    confidence: number;
    dataFlow: string[];
    transformations: SecurityTransformation[];
  };
}

/**
 * Represents a data flow path from source to sink
 */
export interface DataFlowPath {
  source: CodeLocation;
  transformations: CodeTransformation[];
  sink: CodeLocation;
  confidence: number;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
}

/**
 * Represents a code transformation in the data flow
 */
export interface CodeTransformation {
  location: CodeLocation;
  type: string;
  impact: 'SANITIZE' | 'VALIDATE' | 'TRANSFORM' | 'unknown';
  confidence: number;
}

/**
 * Information about input validation
 */
export interface ValidationInfo {
  type: string;
  pattern: RegExp;
  message: string;
}

/**
 * Configuration for input security analysis
 */
export interface InputSecurityConfig extends AnalysisConfig {
  // Input-specific configuration options
  validateInputs?: boolean;
  sanitizeData?: boolean;
  customPatterns?: RegExp[];
  patterns?: {
    sql?: RegExp[];
    xss?: RegExp[];
    command?: RegExp[];
    path?: RegExp[];
  };
  thresholds?: {
    severity?: number;
    confidence?: number;
  };
}

/**
 * Context for input security analysis
 */
export interface InputAnalysisContext {
  fileType: string;
  framework?: string;
  environment?: string;
  dependencies: string[];
  securityHeaders: Record<string, string>;
  apis?: {
    endpoint: string;
    method: string;
    inputSchema?: Record<string, unknown>;
  }[];
}

/**
 * Message format for communication with Manager Agent
 */
export interface InputAgentMessage {
  type: 'FINDING' | 'STATUS' | 'ERROR' | 'COVERAGE';
  timestamp: number;
  agentId: string;
  data: InputSecurityFinding | AnalysisStatus | ErrorInfo | CoverageInfo;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  requiresAttention: boolean;
}

/**
 * Status of the analysis process
 */
export interface AnalysisStatus {
  filesAnalyzed: number;
  findingsCount: Record<InputVulnerabilityType, number>;
  avgProcessingTime: number;
  peakMemoryUsage: number;
  startTime: number;
  endTime?: number;
}

/**
 * Error information structure
 */
export interface ErrorInfo {
  code: string;
  message: string;
  location?: CodeLocation;
  stack?: string;
  severity: 'FATAL' | 'ERROR' | 'WARNING';
  recoverable: boolean;
}

/**
 * Coverage information for analysis
 */
export interface CoverageInfo {
  totalFiles: number;
  analyzedFiles: number;
  skippedFiles: number;
  coverage: {
    lines: number;
    functions: number;
    branches: number;
  };
  uncoveredPaths: string[];
} 