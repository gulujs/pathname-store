export const StaticKind = 's';
export const ParamKind = 'p';
export const MatchAllKind = 'a';

/** '*' */
export const ASTERISK = 42;
/** '/' */
export const SLASH = 47;
/** ':' */
export const COLON = 58;

export class Node {
  constructor(kind = StaticKind, prefix = '/') {
    this.kind = kind;
    this.setPrefix(prefix);
    this.children = {};
    this.paramChild = null;
    this.matchAllChild = null;
    this.box = null;
  }

  setPrefix(prefix) {
    this.prefix = prefix;
    this.label = prefix.charCodeAt(0);
    this.endsWithSlash = prefix[prefix.length - 1] === '/';
  }

  setBox(box) {
    this.box = box;
  }

  reset(kind, prefix = '/') {
    this.kind = kind;
    this.setPrefix(prefix);
    this.children = {};
    this.paramChild = null;
    this.matchAllChild = null;
    this.box = null;
  }

  addChild(node) {
    if (node.kind === StaticKind) {
      this.children[node.label] = node;
    } else if (node.kind === ParamKind) {
      this.paramChild = node;
    } else if (node.kind === MatchAllKind) {
      this.matchAllChild = node;
    } else {
      throw new Error(`Unexpected node kind "${node.kind}".`);
    }
  }

  getChildByLabel(label) {
    if (label === COLON) {
      return this.paramChild;
    } else if (label === ASTERISK) {
      return this.matchAllChild;
    } else {
      return this.children[label] === undefined ? null : this.children[label];
    }
  }

  clone() {
    const node = new Node(this.kind, this.prefix);
    node.children = { ...this.children };
    node.paramChild = this.paramChild;
    node.matchAllChild = this.matchAllChild;
    node.box = this.box;
    return node;
  }
}
