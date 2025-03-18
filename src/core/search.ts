import { promises as fs, createReadStream, statSync } from 'fs';
import { join, relative, extname } from 'path';
import { createInterface } from 'readline';
import { isBinary } from 'istextorbinary';

export interface SearchOptions {
  maxDepth?: number;
  excludePatterns?: RegExp[];
  includePatterns?: RegExp[];
  fileSizeLimit?: number;
  followSymlinks?: boolean;
  maxLineLength?: number;
  contextLines?: number;
}

export interface FileInfo {
  path: string;
  size: number;
  extension: string;
  isDirectory: boolean;
  lastModified: number;
  isBinary: boolean;
}

export interface SearchResult {
  file: FileInfo;
  matches: Match[];
  context: string;
}

export interface Match {
  line: number;
  column: number;
  text: string;
  context: string;
}

export class CodeSearch {
  private readonly options: Required<SearchOptions>;

  constructor(options: SearchOptions = {}) {
    this.options = {
      maxDepth: options.maxDepth ?? 10,
      excludePatterns: options.excludePatterns ?? [/node_modules/, /\.git/],
      includePatterns: options.includePatterns ?? [],
      fileSizeLimit: options.fileSizeLimit ?? 1024 * 1024, // 1MB
      followSymlinks: options.followSymlinks ?? false,
      maxLineLength: options.maxLineLength ?? 1000,
      contextLines: options.contextLines ?? 3
    };
  }

  async searchFiles(
    rootPath: string,
    patterns: RegExp[],
    onProgress?: (progress: { processed: number; total: number }) => void
  ): Promise<SearchResult[]> {
    const files = await this.getFiles(rootPath);
    const results: SearchResult[] = [];
    let processed = 0;

    await Promise.all(
      files.map(async file => {
        if (!file.isBinary) {
          const result = await this.searchFile(file, patterns);
          if (result) {
            results.push(result);
          }
        }
        processed++;
        onProgress?.({ processed, total: files.length });
      })
    );

    return results;
  }

  private async getFiles(rootPath: string): Promise<FileInfo[]> {
    const files: FileInfo[] = [];
    await this.traverseDirectory(rootPath, files);
    return files;
  }

  private async traverseDirectory(
    dirPath: string,
    files: FileInfo[],
    depth = 0
  ): Promise<void> {
    if (depth > this.options.maxDepth) {
      return;
    }

    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      const relativePath = relative(process.cwd(), fullPath);

      if (this.shouldExclude(relativePath)) {
        continue;
      }

      if (entry.isDirectory()) {
        if (this.options.followSymlinks || !entry.isSymbolicLink()) {
          await this.traverseDirectory(fullPath, files, depth + 1);
        }
      } else if (entry.isFile() && this.shouldProcessFile(relativePath)) {
        const stats = await fs.stat(fullPath);
        const isBinaryFile = await this.isBinaryFile(fullPath);

        files.push({
          path: relativePath,
          size: stats.size,
          extension: extname(entry.name),
          isDirectory: false,
          lastModified: stats.mtimeMs,
          isBinary: isBinaryFile
        });
      }
    }
  }

  private async isBinaryFile(filePath: string): Promise<boolean> {
    try {
      const buffer = await fs.readFile(filePath);
      return isBinary(filePath, buffer) ?? false;
    } catch {
      return true; // Assume binary if we can't read the file
    }
  }

  private async searchFile(
    file: FileInfo,
    patterns: RegExp[]
  ): Promise<SearchResult | null> {
    const matches: Match[] = [];
    const lineBuffer: string[] = [];
    let lineNumber = 0;

    const stream = createReadStream(file.path, { encoding: 'utf8' });
    const rl = createInterface({
      input: stream,
      crlfDelay: Infinity
    });

    for await (const line of rl) {
      lineNumber++;
      lineBuffer.push(line);

      if (lineBuffer.length > this.options.contextLines * 2 + 1) {
        lineBuffer.shift();
      }

      for (const pattern of patterns) {
        const match = line.match(pattern);
        if (match) {
          matches.push({
            line: lineNumber,
            column: match.index ?? 0,
            text: match[0],
            context: this.getContext(lineBuffer, this.options.contextLines)
          });
        }
      }
    }

    if (matches.length === 0) {
      return null;
    }

    return {
      file,
      matches,
      context: this.getFileContext(await fs.readFile(file.path, 'utf8'))
    };
  }

  private shouldExclude(path: string): boolean {
    return this.options.excludePatterns.some(pattern => pattern.test(path));
  }

  private shouldProcessFile(path: string): boolean {
    if (this.options.fileSizeLimit > 0) {
      const stats = statSync(path);
      if (stats.size > this.options.fileSizeLimit) {
        return false;
      }
    }

    return (
      this.options.includePatterns.length === 0 ||
      this.options.includePatterns.some(pattern => pattern.test(path))
    );
  }

  private getContext(lineBuffer: string[], contextLines: number): string {
    const start = Math.max(0, lineBuffer.length - contextLines - 1);
    const end = Math.min(lineBuffer.length, start + contextLines * 2 + 1);
    return lineBuffer.slice(start, end).join('\n');
  }

  private getFileContext(content: string, maxLength = 1000): string {
    if (content.length <= maxLength) {
      return content;
    }
    return content.slice(0, maxLength) + '...';
  }
} 