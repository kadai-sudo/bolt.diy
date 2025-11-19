import path from 'path';
import type { ParsedPath } from 'path';

/**
 * Node.js 専用の path ユーティリティ
 * path-browserify を使わず、Node の純正 path モジュールを利用
 */
export const pathUtils = {
  join: (...paths: string[]): string => path.join(...paths),
  dirname: (p: string): string => path.dirname(p),
  basename: (p: string, ext?: string): string => path.basename(p, ext),
  extname: (p: string): string => path.extname(p),
  relative: (from: string, to: string): string => path.relative(from, to),
  isAbsolute: (p: string): boolean => path.isAbsolute(p),
  normalize: (p: string): string => path.normalize(p),
  parse: (p: string): ParsedPath => path.parse(p),
  format: (pathObject: ParsedPath): string => path.format(pathObject),
} as const;

// 必要に応じてデフォルトエクスポートも可能
export default pathUtils;
