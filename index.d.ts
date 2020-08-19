export interface PathnameStoreOptions {
    backtrack?: boolean;
    caseSensitive?: boolean;
    paramNamePattern?: string;
    boxing?: (box: any, store: any, pnames: string[]) => any;
}

export class PathnameStore {
  constructor(options?: PathnameStoreOptions);
  add(path: string, store: any): void;
  find(path: string): any;
  prettyPrint(options: any): string;
}
