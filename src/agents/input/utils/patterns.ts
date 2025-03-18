import * as t from '@babel/types';
import { 
  DANGEROUS_FUNCTIONS, 
  SQL_FUNCTIONS, 
  FILE_OPERATIONS, 
  COMMAND_FUNCTIONS,
  XSS_ATTRIBUTES,
  SECURITY_FUNCTIONS
} from '../constants';
import { isUserInput } from './ast';

type DangerousFunction = typeof DANGEROUS_FUNCTIONS[number];
type SqlFunction = typeof SQL_FUNCTIONS[number];
type FileOperation = typeof FILE_OPERATIONS[number];
type CommandFunction = typeof COMMAND_FUNCTIONS[number];
type XssAttribute = typeof XSS_ATTRIBUTES[number];
type SecurityFunction = typeof SECURITY_FUNCTIONS[number];

/**
 * Gets the name of a function call node
 */
function getFunctionName(callee: t.Node): string {
  if (t.isIdentifier(callee)) {
    return callee.name;
  }
  if (t.isMemberExpression(callee) && t.isIdentifier(callee.property)) {
    return callee.property.name;
  }
  return '';
}

/**
 * Checks if a function call is potentially dangerous
 */
export function isDangerousCall(callee: t.Node): boolean {
  const name = getFunctionName(callee);
  return DANGEROUS_FUNCTIONS.includes(name as DangerousFunction);
}

/**
 * Checks if a function call is SQL-related
 */
export function isSqlCall(callee: t.Node): boolean {
  const name = getFunctionName(callee);
  return SQL_FUNCTIONS.includes(name as SqlFunction);
}

/**
 * Checks if a function call is file operation related
 */
export function isFileOperation(callee: t.Node): boolean {
  const name = getFunctionName(callee);
  return FILE_OPERATIONS.includes(name as FileOperation);
}

/**
 * Checks if a function call is command execution related
 */
export function isCommandExecution(callee: t.Node): boolean {
  const name = getFunctionName(callee);
  return COMMAND_FUNCTIONS.includes(name as CommandFunction);
}

/**
 * Checks if an attribute is potentially vulnerable to XSS
 */
export function isXssVulnerableAttribute(name: string): boolean {
  return XSS_ATTRIBUTES.includes(name as XssAttribute);
}

/**
 * Checks if a function call is a security function
 */
export function isSecurityFunction(callee: t.Node): boolean {
  const name = getFunctionName(callee);
  return SECURITY_FUNCTIONS.includes(name as SecurityFunction);
}

/**
 * Checks if a template literal contains user input
 */
export function hasUserInputInTemplate(node: t.TemplateLiteral): boolean {
  return node.expressions.some(expr => isUserInput(expr));
}

/**
 * Checks if a binary expression contains user input concatenation
 */
export function hasUserInputConcatenation(node: t.BinaryExpression): boolean {
  return node.operator === '+' && (isUserInput(node.left) || isUserInput(node.right));
}

/**
 * Checks if any arguments in a function call contain user input
 */
export function hasUserInputInArguments(node: t.CallExpression): boolean {
  return node.arguments.some(arg => {
    if (t.isSpreadElement(arg)) {
      return isUserInput(arg.argument);
    }
    return isUserInput(arg);
  });
}

/**
 * Checks if an assignment contains user input
 */
export function hasUserInputAssignment(node: t.AssignmentExpression): boolean {
  return isUserInput(node.right);
} 