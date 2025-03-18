// Agent Prompts
import { INPUT_AGENT_PROMPT, INPUT_AGENT_CONFIG } from './input';
import { AUTH_AGENT_PROMPT, AUTH_AGENT_CONFIG } from './auth';
import { DEPS_AGENT_PROMPT, DEPS_AGENT_CONFIG } from './deps';
import { INFRA_AGENT_PROMPT, INFRA_AGENT_CONFIG } from './infra';
import { CODE_AGENT_PROMPT, CODE_AGENT_CONFIG } from './code';
import { MANAGER_AGENT_PROMPT, MANAGER_AGENT_CONFIG } from './manager';

// Agent Types
export interface AgentConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemFlags: Record<string, boolean>;
}

export interface AgentPrompt {
  prompt: string;
  config: AgentConfig;
}

// Re-export agent prompts and configs
export {
  INPUT_AGENT_PROMPT,
  INPUT_AGENT_CONFIG,
  AUTH_AGENT_PROMPT,
  AUTH_AGENT_CONFIG,
  DEPS_AGENT_PROMPT,
  DEPS_AGENT_CONFIG,
  INFRA_AGENT_PROMPT,
  INFRA_AGENT_CONFIG,
  CODE_AGENT_PROMPT,
  CODE_AGENT_CONFIG,
  MANAGER_AGENT_PROMPT,
  MANAGER_AGENT_CONFIG
};

// Consolidated Agent Configurations
export const AGENT_CONFIGS = {
  input: { prompt: INPUT_AGENT_PROMPT, config: INPUT_AGENT_CONFIG },
  auth: { prompt: AUTH_AGENT_PROMPT, config: AUTH_AGENT_CONFIG },
  deps: { prompt: DEPS_AGENT_PROMPT, config: DEPS_AGENT_CONFIG },
  infra: { prompt: INFRA_AGENT_PROMPT, config: INFRA_AGENT_CONFIG },
  code: { prompt: CODE_AGENT_PROMPT, config: CODE_AGENT_CONFIG },
  manager: { prompt: MANAGER_AGENT_PROMPT, config: MANAGER_AGENT_CONFIG }
} as const;

// Agent Dependencies (as defined in Manager's coordination matrix)
export const AGENT_DEPENDENCIES = {
  input: ['auth', 'code'],
  auth: ['input', 'code'],
  deps: ['code'],
  infra: ['deps'],
  code: [],
  manager: [] // Manager coordinates all but depends on none
} as const;

// Agent Priorities
export const AGENT_PRIORITIES = {
  input: 'HIGH',
  auth: 'CRITICAL',
  deps: 'HIGH',
  infra: 'HIGH',
  code: 'MEDIUM',
  manager: 'CRITICAL'
} as const;

// Agent Focus Areas
export const AGENT_FOCUS_AREAS = {
  input: ['injection', 'xss', 'file-handling'],
  auth: ['authentication', 'authorization', 'session'],
  deps: ['vulnerabilities', 'supply-chain', 'licensing'],
  infra: ['container', 'cloud', 'environment'],
  code: ['crypto', 'quality', 'patterns'],
  manager: ['coordination', 'strategy', 'quality']
} as const; 