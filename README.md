# @lunjs/pathname-store

## Installation

```
npm install @lunjs/pathname-store
```

## Usage

```
const { PathnameStore } = require('@lunjs/pathname-store');

const s = new PathnameStore();
s.add('/users', {});
s.add('/user/:name', {});

let r = s.find('/users');
console.log(r);
// output: { found: true, box: { store: {}, pnames: [] }, params: [] }
```

## Pattern Rule

| Syntax | Description |
| -- | -- |
| :name | named param |
| * | match-all param |
| :name* | named match-all param |

- Named parameters match anything until the next '/' or the path end.
- Match-all param match anything until the path end.

## Path matching order

- Static
- Param
- Match all

## Inspired by

- [echo router](https://github.com/labstack/echo)
- [trek-router](https://github.com/trekjs/router)
- [find-my-way](https://github.com/delvedor/find-my-way)

## License

- [MIT](https://github.com/lunjs/pathname-store/blob/master/LICENSE)
