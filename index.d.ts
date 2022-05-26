import { DrawOptions } from '@gulujs/archy';

export type BoxingFn = (box: any, store: any, pnames: string[]) => any;

export interface PathnameStoreOptions {
  backtrack?: boolean;
  caseSensitive?: boolean;
  paramNamePattern?: string;
  /**
   * @param box Structured object that previously returned
   * @param store
   * @param pnames
   * @returns A new customized object
   */
  boxing?: BoxingFn;
}

export declare class PathnameStore {
  backtrack: boolean;
  caseSensitive: boolean;
  paramNamePattern: string;
  paramNameRE: RegExp;
  boxing?: BoxingFn | null;

  constructor(options?: PathnameStoreOptions);
  add(path: string, store: any): void;
  find<T = unknown>(path: string): { found: false; } | { found: true; pvalues: string[]; box: T; };
  reset(): void;
  prettyPrint(options?: DrawOptions): string;
}
