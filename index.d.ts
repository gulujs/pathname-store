import { DrawOptions } from '@gulujs/archy';

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
    boxing?: (box: unknown, store: unknown, pnames: string[]) => unknown;
}

export class PathnameStore {
    constructor(options?: PathnameStoreOptions);
    add(path: string, store: unknown): void;
    find(path: string): { found: false; } | { found: true; pvalues: string[]; box: unknown; };
    prettyPrint(options?: DrawOptions): string;
}
