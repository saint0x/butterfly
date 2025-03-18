/**
 * Common user input sources that could be vulnerable
 */
export const USER_INPUT_SOURCES = [
  'req.body',
  'req.query',
  'req.params',
  'event.target.value',
  'document.getElementById',
  'localStorage.getItem'
] as const;

/**
 * Functions that are considered dangerous when used with user input
 */
export const DANGEROUS_FUNCTIONS = [
  'eval',
  'Function',
  'setTimeout',
  'setInterval'
] as const;

/**
 * SQL-related functions that could be vulnerable to injection
 */
export const SQL_FUNCTIONS = [
  'query',
  'execute',
  'run'
] as const;

/**
 * File system operations that could be vulnerable to path traversal
 */
export const FILE_OPERATIONS = [
  'readFile',
  'writeFile',
  'appendFile'
] as const;

/**
 * Command execution functions that could be vulnerable to injection
 */
export const COMMAND_FUNCTIONS = [
  'exec',
  'spawn',
  'execSync'
] as const;

/**
 * DOM manipulation attributes that could lead to XSS
 */
export const XSS_ATTRIBUTES = [
  'dangerouslySetInnerHTML',
  'innerHTML'
] as const;

/**
 * Security-related functions for input transformation
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
 * Mapping of transformation types to their security impact
 */
export const TRANSFORMATION_TYPES = {
  escape: 'SANITIZE',
  sanitize: 'SANITIZE',
  validate: 'VALIDATE',
  encode: 'TRANSFORM',
  filter: 'TRANSFORM',
  parseInt: 'TRANSFORM',
  parseFloat: 'TRANSFORM'
} as const;

/**
 * Default remediation messages for different vulnerability types
 */
export const DEFAULT_REMEDIATIONS = {
  SQL_INJECTION: 'Use parameterized queries or an ORM to prevent SQL injection',
  XSS: 'Use appropriate encoding functions and Content Security Policy (CSP)',
  PATH_TRAVERSAL: 'Validate and sanitize file paths, use path.resolve()',
  COMMAND_INJECTION: 'Avoid command execution with user input, use allowlist if necessary',
  UNSAFE_DESERIALIZATION: 'Use safe alternatives like JSON.parse with schema validation',
  FILE_UPLOAD: 'Implement proper file upload validation and scanning',
  DATA_EXPOSURE: 'Review data handling and implement proper access controls',
  OPEN_REDIRECT: 'Validate and sanitize URL redirects, use allowlist'
} as const; 