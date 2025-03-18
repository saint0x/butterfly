import { AnalysisResult, SecurityFinding } from '../core';
import { AgentConfig } from '../../prompts';

/**
 * gRPC service definitions for agent communication
 */
export interface SecurityAgentService {
  analyze(request: CodebaseRequest): Promise<AnalysisResult>;
  streamAnalysis(request: CodebaseRequest): AsyncIterator<AnalysisResult>;
  reportStatus(): Promise<AgentStatus>;
  configure(config: AgentConfig): Promise<void>;
}

/**
 * Request format for codebase analysis
 */
export interface CodebaseRequest {
  files: string[];
  config?: {
    include?: string[];
    exclude?: string[];
    maxDepth?: number;
    timeout?: number;
  };
  context?: {
    repository?: string;
    branch?: string;
    commit?: string;
    ci?: boolean;
  };
}

/**
 * Agent-to-Manager communication protocol
 */
export interface AgentManagerProtocol {
  // Agent registration
  register(agent: AgentInfo): Promise<void>;
  unregister(agentId: string): Promise<void>;
  
  // Status reporting
  reportStatus(status: AgentStatus): Promise<void>;
  reportError(error: AgentError): Promise<void>;
  
  // Finding management
  submitFinding(finding: SecurityFinding): Promise<void>;
  updateFinding(findingId: string, update: Partial<SecurityFinding>): Promise<void>;
  
  // Analysis coordination
  requestWork(): Promise<WorkItem>;
  completeWork(workId: string, result: WorkResult): Promise<void>;
  
  // Resource management
  requestResources(resources: ResourceRequest): Promise<ResourceAllocation>;
  releaseResources(resourceId: string): Promise<void>;
}

/**
 * Agent information
 */
export interface AgentInfo {
  id: string;
  name: string;
  version: string;
  capabilities: string[];
  requirements: {
    memory: number;
    cpu: number;
    concurrent: boolean;
  };
}

/**
 * Agent error information
 */
export interface AgentError {
  agentId: string;
  code: string;
  message: string;
  severity: 'FATAL' | 'ERROR' | 'WARNING';
  timestamp: number;
  context?: Record<string, unknown>;
}

/**
 * Work item for agent processing
 */
export interface WorkItem {
  id: string;
  type: 'FILE' | 'DIRECTORY' | 'PATTERN';
  target: string;
  priority: number;
  deadline?: number;
  context?: Record<string, unknown>;
}

/**
 * Work result from agent
 */
export interface WorkResult {
  workId: string;
  status: 'SUCCESS' | 'FAILURE' | 'TIMEOUT';
  findings: SecurityFinding[];
  coverage: {
    files: number;
    lines: number;
  };
  performance: {
    duration: number;
    memory: number;
  };
  errors?: AgentError[];
}

/**
 * Resource request from agent
 */
export interface ResourceRequest {
  agentId: string;
  memory: number;
  cpu: number;
  duration: number;
  priority: number;
}

/**
 * Resource allocation for agent
 */
export interface ResourceAllocation {
  resourceId: string;
  granted: {
    memory: number;
    cpu: number;
    duration: number;
  };
  constraints: {
    maxMemory: number;
    maxCpu: number;
    timeout: number;
  };
}

/**
 * Agent message format
 */
export interface AgentMessage {
  from: string;
  to: string;
  type: 'REQUEST' | 'RESPONSE' | 'EVENT' | 'ERROR';
  payload: Record<string, unknown>;
  timestamp: number;
  correlationId?: string;
}

/**
 * Agent status information
 */
export interface AgentStatus {
  agentId: string;
  state: 'IDLE' | 'WORKING' | 'ERROR' | 'TERMINATED';
  health: {
    memory: number;
    cpu: number;
    uptime: number;
    lastHeartbeat: number;
  };
  metrics: {
    filesAnalyzed: number;
    findingsReported: number;
    errorsEncountered: number;
  };
} 