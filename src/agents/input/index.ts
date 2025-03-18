import * as t from '@babel/types';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { Agent, AnalysisResult, AgentStatus, SecurityFinding } from '../../types/core';
import { SecurityCategory, InputVulnerabilityType } from '../../types/enums';
import { InputSecurityConfig, InputSecurityFinding, AnalysisStatus } from '../../types/agents/input';
import {
  isDangerousCall,
  isSqlCall,
  isFileOperation,
  isXssVulnerableAttribute,
  isSecurityFunction,
  hasUserInputInTemplate,
  hasUserInputConcatenation,
  hasUserInputInArguments
} from './utils/patterns';
import {
  createSqlInjectionFinding,
  createXssFinding,
  createCommandInjectionFinding,
  createPathTraversalFinding
} from './utils/findings';
import { isUserInput } from './utils/ast';

export class InputSecurityAgent implements Agent {
  public readonly id: string;
  public readonly name = 'InputSecurityAgent';
  public readonly version = '1.0.0';

  private findings: InputSecurityFinding[] = [];
  private status: AnalysisStatus = {
    filesAnalyzed: 0,
    findingsCount: {
      SQL_INJECTION: 0,
      XSS: 0,
      COMMAND_INJECTION: 0,
      PATH_TRAVERSAL: 0,
      UNSAFE_DESERIALIZATION: 0
    } as Record<InputVulnerabilityType, number>,
    avgProcessingTime: 0,
    peakMemoryUsage: 0,
    startTime: Date.now()
  };
  private config: InputSecurityConfig;

  constructor(config: Partial<InputSecurityConfig> = {}) {
    this.id = createHash('sha256').update(`${this.name}${Date.now()}`).digest('hex');
    this.config = {
      analysisMode: 'FULL',
      validateInputs: true,
      sanitizeData: true,
      ...config
    };
  }

  public async analyze(files: string[]): Promise<AnalysisResult> {
    this.status.startTime = Date.now();
    this.findings = [];

    for (const file of files) {
      const startTime = Date.now();
      await this.analyzeFile(file);
      this.status.filesAnalyzed++;
      this.status.avgProcessingTime = 
        (this.status.avgProcessingTime * (this.status.filesAnalyzed - 1) + (Date.now() - startTime)) / 
        this.status.filesAnalyzed;
    }

    this.status.endTime = Date.now();
    const duration = this.status.endTime - this.status.startTime;

    const findings: SecurityFinding[] = this.findings.map(finding => ({
      id: createHash('sha256').update(`${this.id}${Date.now()}${JSON.stringify(finding)}`).digest('hex'),
      title: `${finding.type} Vulnerability Detected`,
      severity: finding.severity,
      location: {
        file: finding.location.file,
        line: finding.location.line,
        column: finding.location.column,
        context: finding.location.context
      },
      description: finding.description,
      remediation: finding.remediation,
      category: finding.category,
      timestamp: Date.now(),
      hash: createHash('sha256').update(JSON.stringify(finding)).digest('hex'),
      metadata: finding.metadata
    }));

    return {
      findings,
      summary: {
        analyzedFiles: this.status.filesAnalyzed,
        totalFindings: this.findings.length,
        findingsCount: Object.entries(SecurityCategory).reduce((acc, [, value]) => {
          acc[value as SecurityCategory] = this.findings.filter(f => f.category === value).length;
          return acc;
        }, {} as Record<SecurityCategory, number>)
      },
      metadata: {
        duration,
        agentVersion: this.version,
        agentConfig: this.config as Record<string, unknown>
      },
      timestamp: Date.now(),
      version: this.version
    };
  }

  public getStatus(): AgentStatus {
    return {
      id: this.id,
      state: 'analyzing',
      health: 'healthy',
      metrics: {
        filesAnalyzed: this.status.filesAnalyzed,
        findingsCount: Object.values(SecurityCategory).reduce((acc, category) => {
          acc[category] = this.findings.filter(f => f.category === category).length;
          return acc;
        }, {} as Record<SecurityCategory, number>),
        avgProcessingTime: this.status.avgProcessingTime,
        peakMemoryUsage: process.memoryUsage().heapUsed
      }
    };
  }

  public configure(config: InputSecurityConfig): void {
    this.config = { ...this.config, ...config };
  }

  public validateConfig(_config: Record<string, unknown>): boolean {
    return true;
  }

  public async reportStatus(): Promise<AgentStatus> {
    return this.getStatus();
  }

  private async analyzeFile(filename: string): Promise<void> {
    try {
      const code = readFileSync(filename, 'utf-8');
      const ast = parse(code, {
        sourceType: 'module',
        plugins: ['jsx', 'typescript']
      });

      traverse(ast, {
        CallExpression: (path) => {
          const { callee } = path.node;
          if (isDangerousCall(callee) && hasUserInputInArguments(path.node)) {
            const finding = createCommandInjectionFinding(path, filename);
            this.findings.push({
              ...finding,
              type: InputVulnerabilityType.COMMAND_INJECTION,
              category: SecurityCategory.COMMAND_INJECTION,
              severity: 'CRITICAL',
              metadata: {
                dataFlow: [],
                transformations: [],
                confidence: 8
              }
            });
            this.status.findingsCount.COMMAND_INJECTION++;
          }
          if (isSqlCall(callee) && hasUserInputInArguments(path.node)) {
            const finding = createSqlInjectionFinding(path, filename);
            this.findings.push({
              ...finding,
              type: InputVulnerabilityType.SQL_INJECTION,
              category: SecurityCategory.SQL_INJECTION,
              severity: 'CRITICAL',
              metadata: {
                dataFlow: [],
                transformations: [],
                confidence: 8
              }
            });
            this.status.findingsCount.SQL_INJECTION++;
          }
          if (isFileOperation(callee) && hasUserInputInArguments(path.node)) {
            const finding = createPathTraversalFinding(path, filename);
            this.findings.push({
              ...finding,
              type: InputVulnerabilityType.PATH_TRAVERSAL,
              category: SecurityCategory.PATH_TRAVERSAL,
              severity: 'HIGH',
              metadata: {
                dataFlow: [],
                transformations: [],
                confidence: 8
              }
            });
            this.status.findingsCount.PATH_TRAVERSAL++;
          }
        },

        JSXAttribute: (path) => {
          const { name, value } = path.node;
          if (t.isJSXIdentifier(name) && isXssVulnerableAttribute(name.name)) {
            if (t.isJSXExpressionContainer(value) && isUserInput(value.expression)) {
              const finding = createXssFinding(path, filename);
              this.findings.push({
                ...finding,
                type: InputVulnerabilityType.XSS,
                category: SecurityCategory.XSS,
                severity: 'HIGH',
                metadata: {
                  dataFlow: [],
                  transformations: [],
                  confidence: 8
                }
              });
              this.status.findingsCount.XSS++;
            }
          }
        },

        TemplateLiteral: (path) => {
          if (hasUserInputInTemplate(path.node)) {
            const parent = path.parent;
            if (t.isCallExpression(parent) && !isSecurityFunction(parent.callee)) {
              const finding = createXssFinding(path, filename);
              this.findings.push({
                ...finding,
                type: InputVulnerabilityType.XSS,
                category: SecurityCategory.XSS,
                severity: 'HIGH',
                metadata: {
                  dataFlow: [],
                  transformations: [],
                  confidence: 8
                }
              });
              this.status.findingsCount.XSS++;
            }
          }
        },

        BinaryExpression: (path) => {
          if (hasUserInputConcatenation(path.node)) {
            const parent = path.parent;
            if (t.isCallExpression(parent) && !isSecurityFunction(parent.callee)) {
              const finding = createXssFinding(path, filename);
              this.findings.push({
                ...finding,
                type: InputVulnerabilityType.XSS,
                category: SecurityCategory.XSS,
                severity: 'HIGH',
                metadata: {
                  dataFlow: [],
                  transformations: [],
                  confidence: 8
                }
              });
              this.status.findingsCount.XSS++;
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error analyzing file ${filename}:`, error);
    }
  }
} 