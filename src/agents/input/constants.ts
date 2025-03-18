/**
 * Dangerous function names that could lead to vulnerabilities
 */
export const DANGEROUS_FUNCTIONS = [
  'Function',
  'eval',
  'setTimeout',
  'setInterval'
] as const;

/**
 * SQL-related function names
 */
export const SQL_FUNCTIONS = [
  'query',
  'execute',
  'run'
] as const;

/**
 * File operation function names
 */
export const FILE_OPERATIONS = [
  'readFile',
  'writeFile',
  'appendFile'
] as const;

/**
 * Command execution function names
 */
export const COMMAND_FUNCTIONS = [
  'exec',
  'spawn',
  'execSync'
] as const;

/**
 * XSS-vulnerable HTML attributes
 */
export const XSS_ATTRIBUTES = [
  'dangerouslySetInnerHTML',
  'innerHTML'
] as const;

/**
 * Security-related function names
 */
export const SECURITY_FUNCTIONS = [
  'escape',
  'sanitize',
  'validate',
  'encode',
  'filter',
  'parseInt',
  'parseFloat'
] as const;

/**
 * Common sources of user input
 */
export const USER_INPUT_SOURCES = [
  'req.body',
  'req.query',
  'req.params',
  'document.location',
  'window.location',
  'localStorage',
  'sessionStorage',
  'document.cookie'
] as const;

/**
 * Default remediation messages
 */
export const DEFAULT_REMEDIATIONS = {
  SQL_INJECTION: 'Use parameterized queries or an ORM to prevent SQL injection',
  XSS: 'Use appropriate encoding functions and Content Security Policy (CSP)',
  COMMAND_INJECTION: 'Avoid command execution with user input, use allowlist if necessary',
  PATH_TRAVERSAL: 'Validate and sanitize file paths, use path.resolve()',
  UNSAFE_DESERIALIZATION: 'Use safe deserialization methods, validate input before parsing'
} as const; 