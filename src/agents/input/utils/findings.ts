import { SecurityFinding } from '../../../types/core';
import { SecurityCategory, SeverityLevel } from '../../../types/enums';
import { DEFAULT_REMEDIATIONS } from '../constants';
import { getNodeLocation } from './ast';
import { v4 as uuidv4 } from 'uuid';

type TransformationType = 'SANITIZE' | 'VALIDATE' | 'TRANSFORM' | 'unknown';

const TRANSFORMATION_TYPES: Record<string, TransformationType> = {
  escape: 'SANITIZE',
  sanitize: 'SANITIZE',
  validate: 'VALIDATE',
  encode: 'TRANSFORM',
  filter: 'TRANSFORM',
  parseInt: 'TRANSFORM',
  parseFloat: 'TRANSFORM'
} as const;

function getSeverityLevel(severity: number): SeverityLevel {
  if (severity >= 9) return 'CRITICAL';
  if (severity >= 7) return 'HIGH';
  if (severity >= 5) return 'MEDIUM';
  if (severity >= 3) return 'LOW';
  return 'INFO';
}

/**
 * Creates a security finding for SQL injection
 */
export function createSqlInjectionFinding(
  path: any,
  filename: string,
  transformations: string[] = []
): SecurityFinding {
  const severity = calculateSeverity(transformations);
  return {
    id: uuidv4(),
    title: 'SQL Injection Vulnerability',
    category: SecurityCategory.SQL_INJECTION,
    severity: getSeverityLevel(severity),
    location: getNodeLocation(path, filename),
    description: 'Potential SQL injection vulnerability detected',
    remediation: DEFAULT_REMEDIATIONS.SQL_INJECTION,
    metadata: {
      confidence: calculateConfidence(transformations),
      transformations: transformations.map(t => ({
        type: t,
        impact: TRANSFORMATION_TYPES[t] || 'unknown'
      }))
    },
    timestamp: Date.now(),
    hash: uuidv4()
  };
}

/**
 * Creates a security finding for XSS
 */
export function createXssFinding(
  path: any,
  filename: string,
  transformations: string[] = []
): SecurityFinding {
  const severity = calculateSeverity(transformations);
  return {
    id: uuidv4(),
    title: 'Cross-Site Scripting (XSS) Vulnerability',
    category: SecurityCategory.XSS,
    severity: getSeverityLevel(severity),
    location: getNodeLocation(path, filename),
    description: 'Potential Cross-Site Scripting (XSS) vulnerability detected',
    remediation: DEFAULT_REMEDIATIONS.XSS,
    metadata: {
      confidence: calculateConfidence(transformations),
      transformations: transformations.map(t => ({
        type: t,
        impact: TRANSFORMATION_TYPES[t] || 'unknown'
      }))
    },
    timestamp: Date.now(),
    hash: uuidv4()
  };
}

/**
 * Creates a security finding for command injection
 */
export function createCommandInjectionFinding(
  path: any,
  filename: string,
  transformations: string[] = []
): SecurityFinding {
  const severity = calculateSeverity(transformations);
  return {
    id: uuidv4(),
    title: 'Command Injection Vulnerability',
    category: SecurityCategory.COMMAND_INJECTION,
    severity: getSeverityLevel(severity),
    location: getNodeLocation(path, filename),
    description: 'Potential command injection vulnerability detected',
    remediation: DEFAULT_REMEDIATIONS.COMMAND_INJECTION,
    metadata: {
      confidence: calculateConfidence(transformations),
      transformations: transformations.map(t => ({
        type: t,
        impact: TRANSFORMATION_TYPES[t] || 'unknown'
      }))
    },
    timestamp: Date.now(),
    hash: uuidv4()
  };
}

/**
 * Creates a security finding for path traversal
 */
export function createPathTraversalFinding(
  path: any,
  filename: string,
  transformations: string[] = []
): SecurityFinding {
  const severity = calculateSeverity(transformations);
  return {
    id: uuidv4(),
    title: 'Path Traversal Vulnerability',
    category: SecurityCategory.PATH_TRAVERSAL,
    severity: getSeverityLevel(severity),
    location: getNodeLocation(path, filename),
    description: 'Potential path traversal vulnerability detected',
    remediation: DEFAULT_REMEDIATIONS.PATH_TRAVERSAL,
    metadata: {
      confidence: calculateConfidence(transformations),
      transformations: transformations.map(t => ({
        type: t,
        impact: TRANSFORMATION_TYPES[t] || 'unknown'
      }))
    },
    timestamp: Date.now(),
    hash: uuidv4()
  };
}

function calculateSeverity(transformations: string[]): number {
  let severity = 9;
  for (const t of transformations) {
    const impact = TRANSFORMATION_TYPES[t];
    if (impact === 'SANITIZE') severity -= 3;
    else if (impact === 'VALIDATE') severity -= 2;
    else if (impact === 'TRANSFORM') severity -= 1;
  }
  return Math.max(1, severity);
}

function calculateConfidence(transformations: string[]): number {
  let confidence = 9;
  for (const t of transformations) {
    const impact = TRANSFORMATION_TYPES[t];
    if (impact === 'SANITIZE') confidence -= 2;
    else if (impact === 'VALIDATE') confidence -= 1;
    else if (impact === 'TRANSFORM') confidence -= 0.5;
  }
  return Math.max(1, confidence);
} 