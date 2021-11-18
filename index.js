import * as archy from '@lunjs/archy';
import {
  StaticKind,
  ParamKind,
  MatchAllKind,
  ASTERISK,
  SLASH,
  COLON,
  Node
} from './node.js';

export class PathnameStore {
  constructor(options = {}) {
    options = options || {};

    this.backtrack = options.backtrack || false;
    this.caseSensitive = typeof options.caseSensitive === 'undefined' || options.caseSensitive;
    this.paramNamePattern = options.paramNamePattern || '[a-zA-Z_]\\w*';

    if (this.paramNamePattern.includes('/')) {
      throw new Error('The `options.paramNamePattern` should not contain "/"');
    }
    this.paramNameRE = new RegExp(`^${this.paramNamePattern}$`);

    this.boxing = null;
    if (options.boxing) {
      if (typeof options.boxing !== 'function') {
        throw new Error('The `options.boxing` must be a function');
      }
      this.boxing = options.boxing;
    }

    this.tree = new Node();
  }

  /**
   * Add path
   * @param {string} path
   * @param {*} store
   */
  // eslint-disable-next-line complexity
  add(path, store) {
    if (path.charCodeAt(0) !== SLASH) {
      throw new Error('The first character of path must be "/"');
    }

    const originalPath = path;
    const pnames = [];
    let staticPart;

    for (let i = 0, l = path.length; i < l; i++) {
      const code = path.charCodeAt(i);

      if (code === COLON) {
        staticPart = path.substring(0, i);
        if (!this.caseSensitive) {
          staticPart = staticPart.toLowerCase();
        }
        this.insert(StaticKind, staticPart);

        const j = i + 1;
        for (; i < l && path.charCodeAt(i) !== SLASH; i++);

        let pname = path.substring(j, i);
        const hasAsterisk = pname.charCodeAt(pname.length - 1) === ASTERISK;
        if (hasAsterisk) {
          pname = pname.substring(0, pname.length - 1);
        }

        if (!pname) {
          throw new Error('Param name should not be empty.');
        }
        if (!this.paramNameRE.test(pname)) {
          throw new Error(`Param name "${pname}" is not valid.`);
        }
        if (pnames.includes(pname)) {
          throw new Error(`Path "${originalPath}" contain multiple of the same param name`);
        }
        pnames.push(pname);

        if (!hasAsterisk) {
          // named param
          path = path.substring(0, j) + path.substring(i);

          i = j;
          l = path.length;

          if (i === l) {
            if (!this.caseSensitive) {
              path = path.toLowerCase();
            }
            this.insert(ParamKind, path, store, pnames);
            return;
          }

          staticPart = path.substring(0, i);
          if (!this.caseSensitive) {
            staticPart = staticPart.toLowerCase();
          }
          this.insert(ParamKind, staticPart);

        } else {
          // named match-all param
          if (i === l) {
            // eslint-disable-next-line prefer-template
            staticPart = path.substring(0, j - 1) + '*';
            if (!this.caseSensitive) {
              staticPart = staticPart.toLowerCase();
            }
            this.insert(MatchAllKind, staticPart, store, pnames);
            return;
          }

          throw new Error('The character "*" should be at end of path.');
        }

      } else if (code === ASTERISK) {
        staticPart = path.substring(0, i);
        if (!this.caseSensitive) {
          staticPart = staticPart.toLowerCase();
        }
        this.insert(StaticKind, staticPart);

        pnames.push('*');

        if (i + 1 === l) {
          if (this.caseSensitive) {
            path = path.toLowerCase();
          }
          this.insert(MatchAllKind, path, store, pnames);
          return;
        }

        throw new Error('The character "*" should be at end of path.');
      }
    }

    if (!this.caseSensitive) {
      path = path.toLowerCase();
    }
    this.insert(StaticKind, path, store, pnames);
  }

  /**
   * Insert path
   * @param {StaticKind|ParamKind|MatchAllKind} kind
   * @param {string} path
   * @param {*} store
   * @param {*} pnames
   */
  insert(kind, path, store, pnames) {
    // eslint-disable-next-line one-var
    let cn = this.tree,
      search = path,
      sl,
      pl,
      l,
      n,
      code;

    // eslint-disable-next-line no-constant-condition
    while (true) {
      sl = search.length;
      pl = cn.prefix.length;
      l = lcp(search, cn.prefix, sl, pl);

      // There is some overlap between `search` and `cn.prefix`
      if (l < pl) {
        // Split node
        n = cn.clone();
        n.setPrefix(cn.prefix.substring(l));
        cn.reset(cn.kind, cn.prefix.substring(0, l));
        cn.addChild(n);

        // l < pl && l === sl
        if (l === sl) {
          // `search` ⊆ `cn.prefix`
          // eg: search = '/user', cn.prefix = '/users'
          setNodeBox(this, cn, store, pnames);
          return;
        }

        // l < pl && l < sl
        // eg: search = '/page', cn.prefix = '/post'
        n = new Node(kind, search.substring(l));
        setNodeBox(this, n, store, pnames);
        cn.addChild(n);
        return;
      }

      // l === pl && l < sl
      if (l < sl) {
        // Match whole prefix, `cn.prefix` ⊆ `search`
        search = search.substring(l);

        code = search.charCodeAt(0);
        n = cn.getChildByLabel(code);

        if (n !== null) {
          // Continue search child
          cn = n;
          continue;
        }

        // Create child node
        n = new Node(kind, search);
        setNodeBox(this, n, store, pnames);
        cn.addChild(n);
        return;
      }

      // l === pl && l === sl
      setNodeBox(this, cn, store, pnames);
      return;
    }
  }

  /**
   * Find path
   * @param {string} path
   */
  find(path) {
    const originalPath = path;
    if (!this.caseSensitive) {
      path = path.toLowerCase();
    }

    if (!this.backtrack) {
      return simpleFind(path, this.tree, originalPath);

    } else {
      const r = {
        found: false,
        box: null,
        pvalues: [],
        originalPath
      };
      backtrackFind(path, this.tree, r, 0, 0);
      delete r.originalPath;
      return r;
    }
  }

  prettyPrint(options) {
    options = {
      style: archy.STYLE.FMW,
      label(node) {
        let name = node.prefix;
        if (node.box && node.box.pnames.length) {
          name += ` (${node.box.pnames.join()})`;
        }
        return name;
      },
      nodes(node) {
        const children = [...Object.values(node.children)];
        if (node.paramChild !== null) {
          children.push(node.paramChild);
        }
        if (node.matchAllChild !== null) {
          children.push(node.matchAllChild);
        }
        return children;
      },
      ...options
    };

    return archy.draw(this.tree, options);
  }
}

function setNodeBox(ps, node, store, pnames) {
  if (!pnames) {
    return;
  }

  let box;
  if (typeof ps.boxing === 'function') {
    box = ps.boxing(node.box, store, pnames);
  } else {
    box = { store, pnames };
  }
  node.setBox(box);
}

// Longest Common Prefix (https://en.wikipedia.org/wiki/LCP_array)
function lcp(search, prefix, sl, pl) {
  let max = pl;
  if (sl < max) {
    max = sl;
  }
  let l = 0;
  for (; l < max && search.charCodeAt(l) === prefix.charCodeAt(l); l++);
  return l;
}

function simpleFind(search, cn, originalPath) {
  const pvalues = [];
  // eslint-disable-next-line one-var
  let n = 0,
    p = 0,
    prefix,
    sl,
    pl,
    l,
    searchStaticNode,
    child,

    nextSearch,
    nextNode = null,
    nextN,
    nextP,

    anyNode = null,
    anyN,
    anyP;

  const r = {
    found: false,
    box: null,
    pvalues: []
  };

  const storeAnyNode = (cn, n, p) => {
    if (cn.matchAllChild !== null) {
      anyNode = cn.matchAllChild;
      anyN = n;
      anyP = p;
    }
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    sl = search.length;
    prefix = cn.prefix;

    if (sl === 0 || search === prefix) {
      if (cn.box) {
        r.found = true;
        r.box = cn.box;
        r.pvalues = pvalues;
      }
      return r;
    }

    pl = 0;
    l = 0;

    if (cn.kind === StaticKind) {
      pl = prefix.length;
      l = lcp(search, prefix, sl, pl);
    }

    if (l === pl) {
      // 1. cn (static) exact match prefix
      // 2. cn (param) l == pl == 0
      search = search.substring(l);
      p += l;
      searchStaticNode = true;

    } else if (nextNode !== null) {
      // restore node
      search = nextSearch;
      cn = nextNode;
      n = nextN;
      p = nextP;
      nextNode = null;
      searchStaticNode = false;

    } else if (anyNode !== null) {
      // matchAll node from store
      cn = anyNode;
      pvalues[anyN] = originalPath.substring(anyP);
      search = '';
      continue;

    } else {
      return r;
    }

    // child static node
    if (searchStaticNode) {
      child = cn.children[search.charCodeAt(0)];
      if (typeof child !== 'undefined') {
        if (cn.endsWithSlash) {
          // store current node
          nextSearch = search;
          nextNode = cn;
          nextN = n;
          nextP = p;

          // store child match all node
          storeAnyNode(cn, n, p);
        }

        cn = child;
        continue;
      }
    }

    // store child match all node
    storeAnyNode(cn, n, p);

    // child param node
    if (cn.paramChild !== null) {
      l = search.indexOf('/');
      if (l === -1) {
        l = search.length;
      }
      pvalues[n] = originalPath.substring(p, p + l);
      n++;

      cn = cn.paramChild;
      search = search.substring(l);
      p += l;
      continue;
    }

    // matchAll node from store
    if (anyNode !== null) {
      cn = anyNode;
      pvalues[anyN] = originalPath.substring(anyP);
      search = '';
      continue;
    }

    return r;
  }
}

function backtrackFind(search, cn, r, n, p) {
  const sl = search.length;

  if (sl === 0 || search === cn.prefix) {
    if (cn.box) {
      r.found = true;
      r.box = cn.box;
    }
    return;
  }

  const pl = cn.prefix.length;
  let l = lcp(search, cn.prefix, sl, pl);

  if (l === pl) {
    search = search.substring(l);
    p += l;
  } else if (cn.kind === StaticKind) {
    return;
  }

  // Static node
  const child = cn.children[search.charCodeAt(0)];
  if (typeof child !== 'undefined') {
    backtrackFind(search, child, r, n, p);
    if (r.found) {
      return;
    }
  }

  if (cn.kind !== StaticKind) {
    return;
  }

  // Param node
  if (cn.paramChild !== null) {
    l = search.indexOf('/');
    if (l === -1) {
      l = search.length;
    }
    r.pvalues[n] = r.originalPath.substring(p, p + l);

    backtrackFind(search.substring(l), cn.paramChild, r, n + 1, p + l);
    if (r.found) {
      return;
    }
  }

  // MatchAll node
  if (cn.matchAllChild !== null) {
    r.pvalues[n] = r.originalPath.substring(p);
    backtrackFind('', cn.matchAllChild, r);
  }
}
