// Re-export types from core
export type {
  Agent,
  AgentHealth,
  AgentMetrics,
  AgentState,
  AgentStatus,
  AnalysisMetadata,
  AnalysisResult,
  AnalysisSummary,
  CodeLocation,
  FileFilter,
  SecurityFinding,
  SecurityTransformation,
  SeverityLevel
} from './core';

// Re-export types from analyzer
export type { AnalysisConfig } from './analyzer';

// Re-export enums
export { SecurityCategory, InputVulnerabilityType } from './enums';

// Re-export types from proto
export type {
  SecurityAgentService,
  CodebaseRequest,
  AgentManagerProtocol,
  AgentInfo,
  AgentError,
  WorkItem,
  WorkResult,
  ResourceRequest,
  ResourceAllocation,
  AgentMessage,
  AgentStatus as ProtoAgentStatus
} from './proto';

// Re-export agent types
export type { InputSecurityFinding, DataFlowPath, CodeTransformation } from './agents/input';

// Re-export common types with namespaces
import * as Core from './core';
import * as Proto from './proto';
import * as Agents from './agents/input';

export { Core, Proto, Agents }; 