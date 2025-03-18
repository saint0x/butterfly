import * as t from '@babel/types';
import traverse, { NodePath } from '@babel/traverse';
import { USER_INPUT_SOURCES } from '../constants';
import { CodeLocation } from '../../../types/core';

/**
 * Checks if a node represents user input
 */
export function isUserInput(node: t.Node): boolean {
  const nodeString = node.toString();
  return USER_INPUT_SOURCES.some(source => nodeString.includes(source)) ||
         (t.isIdentifier(node) && isVariableFromUserInput(node));
}

/**
 * Checks if a variable's value comes from user input
 */
export function isVariableFromUserInput(node: t.Identifier): boolean {
  const binding = getBinding(node);
  if (!binding || !binding.path.node.init) return false;
  return containsUserInput(binding.path.node.init);
}

/**
 * Gets the binding for an identifier
 */
export function getBinding(node: t.Identifier): any {
  if (!node || !node.name) return null;
  
  // Get the scope from the current path
  const path = node as unknown as NodePath<t.Identifier>;
  if (!path.scope) return null;
  
  let currentScope = path.scope;
  while (currentScope) {
    const binding = currentScope.getBinding(node.name);
    if (binding) return binding;
    currentScope = currentScope.parent;
  }
  return null;
}

/**
 * Checks if an AST node contains user input
 */
export function containsUserInput(node: t.Node): boolean {
  let hasUserInput = false;
  traverse(node, {
    MemberExpression(path) {
      const { object } = path.node;
      if (t.isIdentifier(object) && 
          ['req', 'document', 'window', 'localStorage'].includes(object.name)) {
        hasUserInput = true;
        path.stop();
      }
    }
  });
  return hasUserInput;
}

/**
 * Gets the location information for a node
 */
export function getNodeLocation(path: NodePath, filename: string): CodeLocation {
  const { loc } = path.node;
  if (!loc) {
    return {
      file: filename,
      line: 0,
      column: 0,
      context: getNodeContext(path)
    };
  }

  return {
    file: filename,
    line: loc.start.line,
    column: loc.start.column,
    context: getNodeContext(path)
  };
}

/**
 * Gets the context (surrounding code) for a node
 */
export function getNodeContext(path: NodePath): string {
  const { node } = path;
  if (!node) return '';
  
  // Get the parent statement or declaration
  const statement = path.getStatementParent();
  if (!statement) return '';
  
  return statement.toString();
}

/**
 * Gets the name of the function containing a node
 */
export function getFunctionName(path: NodePath): string | undefined {
  const func = path.getFunctionParent();
  if (!func) return undefined;
  
  const { node } = func;
  if (t.isFunctionDeclaration(node)) {
    return node.id?.name;
  }
  
  if (t.isFunctionExpression(node)) {
    return node.id?.name;
  }
  
  return undefined;
}

/**
 * Gets the name of the class containing a node
 */
export function getClassName(path: NodePath): string | undefined {
  const classPath = path.findParent((p) => p.isClassDeclaration());
  if (!classPath) return undefined;
  
  const { node } = classPath;
  if (t.isClassDeclaration(node)) {
    return node.id?.name;
  }
  
  return undefined;
}

/**
 * Type guard for checking node types
 */
export function isNodeType<T extends t.Node>(
  node: t.Node,
  check: (node: t.Node) => node is T
): node is T {
  return check(node);
} 