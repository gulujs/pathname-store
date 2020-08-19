const { PathnameStore } = require('..');

describe('PathnameStore', () => {
  it('options.paramNamePattern should not contain "/"', () => {
    expect(() => {
      const s = new PathnameStore({ paramNamePattern: '[a-z/]+' });
    }).toThrow('The `options.paramNamePattern` should not contain "/"')
  });

  it('options.boxing must be a function', () => {
    expect(() => {
      const s = new PathnameStore({ boxing: 'boxing' });
    }).toThrow('The `options.boxing` must be a function');
  });

  it('prettyPring', () => {
    const s = new PathnameStore();
    s.add('/users');
    s.add('/user/:name');
    s.add('/user/followers');
    expect(s.prettyPrint()).toEqual([
      '/',
      '└── user',
      '    ├── /',
      '    │   ├── followers',
      '    │   └── : (name)',
      '    └── s',
      '',
    ].join('\n'));
  });
});
