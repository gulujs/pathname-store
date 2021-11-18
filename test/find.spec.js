import { expect } from 'chai';
import { PathnameStore } from '../index.js';

function addPaths(s) {
  s.add('/Users', '/Users');
  s.add('/Users/:Name', '/Users/:Name');
  s.add('/Users/:Name/Following/:TargetUser/Repos', '/Users/:Name/Following/:TargetUser/Repos');
  s.add('/Users/:Name/:Repo/Keys/:Id', '/Users/:Name/:Repo/Keys/:Id');
  s.add('/User', '/User');
  s.add('/User/Followers', '/User/Followers');
  s.add('/User/Following', '/User/Following');
  s.add('/User/Starred/:Owner/:Repo', '/User/Starred/:Owner/:Repo');
  s.add('/*', '/*');
  s.add('/File/:Path*', '/File/:Path*');
}

function basicCaseSensitiveTest(options) {
  const s = new PathnameStore({ ...options, caseSensitive: true });
  addPaths(s);

  it('match static', () => {
    const r = s.find('/User/Followers');
    expect(r).to.deep.equal({
      found: true,
      box: {
        store: '/User/Followers',
        pnames: []
      },
      pvalues: []
    });
  });

  it('match param', () => {
    const r = s.find('/Users/jKeyLu');
    expect(r).to.deep.equal({
      found: true,
      box: {
        store: '/Users/:Name',
        pnames: ['Name']
      },
      pvalues: ['jKeyLu']
    });
  });

  it('match param 2', () => {
    const r = s.find('/Users/jKeyLu/hello/Keys/1');
    expect(r).to.deep.equal({
      found: true,
      box: {
        store: '/Users/:Name/:Repo/Keys/:Id',
        pnames: ['Name', 'Repo', 'Id']
      },
      pvalues: ['jKeyLu', 'hello', '1']
    });
  });

  it('match all', () => {
    const r = s.find('/repos/jKeyLu');
    expect(r).to.deep.equal({
      found: true,
      box: {
        store: '/*',
        pnames: ['*']
      },
      pvalues: ['repos/jKeyLu']
    });
  });

  it('named match all param', () => {
    const r = s.find('/File/to/the/pathname');
    expect(r).to.deep.equal({
      found: true,
      box: {
        store: '/File/:Path*',
        pnames: ['Path']
      },
      pvalues: ['to/the/pathname']
    });
  });
}

function basicCaseInsensitiveTest(options) {
  const s = new PathnameStore({ ...options, caseSensitive: false });
  addPaths(s);

  it('match static', () => {
    const r = s.find('/user/followers');
    expect(r).to.deep.equal({
      found: true,
      box: {
        store: '/User/Followers',
        pnames: []
      },
      pvalues: []
    });
  });

  it('match param', () => {
    const r = s.find('/users/jKeyLu');
    expect(r).to.deep.equal({
      found: true,
      box: {
        store: '/Users/:Name',
        pnames: ['Name']
      },
      pvalues: ['jKeyLu']
    });
  });

  it('match param 2', () => {
    const r = s.find('/users/jKeyLu/hello/keys/1');
    expect(r).to.deep.equal({
      found: true,
      box: {
        store: '/Users/:Name/:Repo/Keys/:Id',
        pnames: ['Name', 'Repo', 'Id']
      },
      pvalues: ['jKeyLu', 'hello', '1']
    });
  });

  it('match all', () => {
    const r = s.find('/repos/jKeyLu');
    expect(r).to.deep.equal({
      found: true,
      box: {
        store: '/*',
        pnames: ['*']
      },
      pvalues: ['repos/jKeyLu']
    });
  });

  it('named match all param', () => {
    const r = s.find('/file/to/the/pathname');
    expect(r).to.deep.equal({
      found: true,
      box: {
        store: '/File/:Path*',
        pnames: ['Path']
      },
      pvalues: ['to/the/pathname']
    });
  });
}

describe('PathnameStore.find', () => {
  describe('simple mode, case sensitive', () => {
    basicCaseSensitiveTest();

    it('simple mode can not match any path', () => {
      const s = new PathnameStore();
      s.add('/a/b/:c/:d/e', '/a/b/:c/:d/e');
      s.add('/a/:b/:c/d/f', '/a/:b/:c/d/f');
      s.add('/:a/:b/:c/:d/g', '/:a/:b/:c/:d/g');
      const r = s.find('/a/b/c/d/g');
      expect(r.found).to.deep.equal(false);
    });

    it('simple mode can match all', () => {
      const s = new PathnameStore();
      s.add('/a/b/:c/:d/e', '/a/b/:c/:d/e');
      s.add('/a/:b/:c/d/f', '/a/:b/:c/d/f');
      s.add('/:a/:b/:c/:d/g', '/:a/:b/:c/:d/g');
      s.add('/*');
      const r = s.find('/a/b/c/d/g');
      expect(r).to.deep.equal({
        found: true,
        box: { store: undefined, pnames: ['*'] },
        pvalues: ['a/b/c/d/g', 'c']
      });
    });
  });

  describe('simple mode, case insensitive', () => {
    basicCaseInsensitiveTest({ caseSensitive: false });
  });

  describe('backtrack mode, case sensitive', () => {
    basicCaseSensitiveTest({ backtrack: true });

    it('backtrack mode could match a path', () => {
      const s = new PathnameStore({ backtrack: true });
      s.add('/a/b/:c/:d/e', '/a/b/:c/:d/e');
      s.add('/a/:b/:c/d/f', '/a/:b/:c/d/f');
      s.add('/:a/:b/:c/:d/g', '/:a/:b/:c/:d/g');
      const r = s.find('/a/b/c/d/g');
      expect(r).to.deep.equal({
        found: true,
        box: { store: '/:a/:b/:c/:d/g', pnames: ['a', 'b', 'c', 'd'] },
        pvalues: ['a', 'b', 'c', 'd']
      });
    });
  });

  describe('backtrack mode, case insensitive', () => {
    basicCaseInsensitiveTest({ backtrack: true });
  });
});
