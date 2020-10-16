const { PathnameStore } = require('..');

describe('PathnameStore.add', () => {
  it('first character of path must be "/"', () => {
    const s = new PathnameStore();
    expect(() => s.add('user')).toThrow('The first character of path must be "/"');
  });

  it('empty param name', () => {
    const s = new PathnameStore();
    expect(() => s.add('/users/:')).toThrow('Param name should not be empty.');
  });

  it('invalid param name', () => {
    const s = new PathnameStore();
    expect(() => s.add('/users/:名字')).toThrow(/Param name ".*" is not valid/);
    expect(() => s.add('/users/:名字*')).toThrow(/Param name ".*" is not valid/);
  });

  it('contain multiple of the same param name', () => {
    const s = new PathnameStore();
    expect(() => s.add('/users/:name/:name')).toThrow(/contain multiple of the same param name/);
    expect(() => s.add('/users/:name/:name*')).toThrow(/contain multiple of the same param name/);
  });

  it('the character "*" should be at end of path', () => {
    const s = new PathnameStore();
    expect(() => s.add('/*/*')).toThrow('The character "*" should be at end of path.');
    expect(() => s.add('/:name*/:name*')).toThrow('The character "*" should be at end of path.');
  });

  it('add case sensitive path', () => {
    const s = new PathnameStore();
    s.add('/Users');
    s.add('/Users/:name');

    expect(s.tree).toEqual({
      kind: 's',
      prefix: '/',
      label: 47,
      endsWithSlash: true,
      children: {
        '85': {
          kind: 's',
          prefix: 'Users',
          label: 85,
          endsWithSlash: false,
          children: {
            '47': {
              kind: 's',
              prefix: '/',
              label: 47,
              endsWithSlash: true,
              children: {},
              paramChild: {
                kind: 'p',
                prefix: ':',
                label: 58,
                endsWithSlash: false,
                children: {},
                paramChild: null,
                matchAllChild: null,
                box: {
                  pnames: ['name']
                }
              },
              matchAllChild: null,
              box: null
            }
          },
          paramChild: null,
          matchAllChild: null,
          box: {
            pnames: []
          }
        }
      },
      paramChild: null,
      matchAllChild: null,
      box: null
    });
  });

  it('add case insensitive path', () => {
    const s = new PathnameStore({ caseSensitive: false });
    s.add('/Users');
    s.add('/Users/:name');

    expect(s.tree).toEqual({
      kind: 's',
      prefix: '/',
      label: 47,
      endsWithSlash: true,
      children: {
        '117': {
          kind: 's',
          prefix: 'users',
          label: 117,
          endsWithSlash: false,
          children: {
            '47': {
              kind: 's',
              prefix: '/',
              label: 47,
              endsWithSlash: true,
              children: {},
              paramChild: {
                kind: 'p',
                prefix: ':',
                label: 58,
                endsWithSlash: false,
                children: {},
                paramChild: null,
                matchAllChild: null,
                box: {
                  pnames: ['name']
                }
              },
              matchAllChild: null,
              box: null
            }
          },
          paramChild: null,
          matchAllChild: null,
          box: {
            pnames: []
          }
        }
      },
      paramChild: null,
      matchAllChild: null,
      box: null
    });
  });

  it('add path', () => {
    const s = new PathnameStore();
    s.add('/users');
    s.add('/users/:name');
    s.add('/user');
    s.add('/user/followers/:name');
    s.add('/user/following/:name');
    s.add('/user/starred/:owner/:repo');
    s.add('/*');
    s.add('/file/:path*');

    expect(s.tree).toEqual({
      kind: 's',
      prefix: '/',
      label: 47,
      endsWithSlash: true,
      children: {
        '102': {
          kind: 's',
          prefix: 'file/',
          label: 102,
          endsWithSlash: true,
          children: {},
          paramChild: null,
          matchAllChild: {
            kind: 'a',
            prefix: '*',
            label: 42,
            endsWithSlash: false,
            children: {},
            paramChild: null,
            matchAllChild: null,
            box: {
              pnames: ['path']
            }
          },
          box: null
        },
        '117': {
          kind: 's',
          prefix: 'user',
          label: 117,
          endsWithSlash: false,
          children: {
            '47': {
              kind: 's',
              prefix: '/',
              label: 47,
              endsWithSlash: true,
              children: {
                '102': {
                  kind: 's',
                  prefix: 'follow',
                  label: 102,
                  endsWithSlash: false,
                  children: {
                    '101': {
                      kind: 's',
                      prefix: 'ers/',
                      label: 101,
                      endsWithSlash: true,
                      children: {},
                      paramChild: {
                        kind: 'p',
                        prefix: ':',
                        label: 58,
                        endsWithSlash: false,
                        children: {},
                        paramChild: null,
                        matchAllChild: null,
                        box: {
                          pnames: ['name']
                        }
                      },
                      matchAllChild: null,
                      box: null
                    },
                    '105': {
                      kind: 's',
                      prefix: 'ing/',
                      label: 105,
                      endsWithSlash: true,
                      children: {},
                      paramChild: {
                        kind: 'p',
                        prefix: ':',
                        label: 58,
                        endsWithSlash: false,
                        children: {},
                        paramChild: null,
                        matchAllChild: null,
                        box: {
                          pnames: ['name']
                        }
                      },
                      matchAllChild: null,
                      box: null
                    }
                  },
                  paramChild: null,
                  matchAllChild: null,
                  box: null
                },
                '115': {
                  kind: 's',
                  prefix: 'starred/',
                  label: 115,
                  endsWithSlash: true,
                  children: {},
                  paramChild: {
                    kind: 'p',
                    prefix: ':',
                    label: 58,
                    endsWithSlash: false,
                    children: {
                      '47': {
                        kind: 's',
                        prefix: '/',
                        label: 47,
                        endsWithSlash: true,
                        children: {},
                        paramChild: {
                          kind: 'p',
                          prefix: ':',
                          label: 58,
                          endsWithSlash: false,
                          children: {},
                          paramChild: null,
                          matchAllChild: null,
                          box: {
                            pnames: ['owner', 'repo']
                          }
                        },
                        matchAllChild: null,
                        box: null
                      }
                    },
                    paramChild: null,
                    matchAllChild: null,
                    box: null
                  },
                  matchAllChild: null,
                  box: null
                }
              },
              paramChild: null,
              matchAllChild: null,
              box: null
            },
            '115': {
              kind: 's',
              prefix: 's',
              label: 115,
              endsWithSlash: false,
              children: {
                '47': {
                  kind: 's',
                  prefix: '/',
                  label: 47,
                  endsWithSlash: true,
                  children: {},
                  paramChild: {
                    kind: 'p',
                    prefix: ':',
                    label: 58,
                    endsWithSlash: false,
                    children: {},
                    paramChild: null,
                    matchAllChild: null,
                    box: {
                      pnames: ['name']
                    }
                  },
                  matchAllChild: null,
                  box: null
                }
              },
              paramChild: null,
              matchAllChild: null,
              box: {
                pnames: []
              }
            }
          },
          paramChild: null,
          matchAllChild: null,
          box: {
            pnames: []
          }
        }
      },
      paramChild: null,
      matchAllChild: {
        kind: 'a',
        prefix: '*',
        label: 42,
        endsWithSlash: false,
        children: {},
        paramChild: null,
        matchAllChild: null,
        box: {
          pnames: ['*']
        }
      },
      box: null
    });
  });
});
