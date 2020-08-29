export interface PathnameStoreOptions {
    backtrack?: boolean;
    caseSensitive?: boolean;
    paramNamePattern?: string;
    boxing?: (box: any, store: any, pnames: string[]) => any;
}

export class PathnameStore {
  constructor(options?: PathnameStoreOptions);
  add(path: string, store: any): void;
  find(path: string): { found: false; } | { found: true; pvalues: string[]; box: any; };
  prettyPrint(options: any): string;
}
