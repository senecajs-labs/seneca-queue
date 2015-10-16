![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js][] job queue plugin

# seneca-queue
[![Build Status][travis-badge]][travis-url]
[![Gitter][gitter-badge]][gitter-url]

[![js-standard-style][standard-badge]][standard-style]

A plugin that allows you to create and use queues.

- __Version:__ 0.2.0
- __Tested on:__ Seneca 0.7
- __Node:__ 0.10, 0.12, 4

If you're using this module, and need help, you can:

- Post a [github issue][],
- Tweet to [@senecajs][],
- Ask on the [Gitter][gitter-url].

If you are new to Seneca in general, please take a look at [senecajs.org][]. We have everything from
tutorials to sample apps to help get you up and running quickly.

## Install
To install, simply use npm. Remember you will need to install [Seneca.js][] if you haven't already.

```
npm install seneca
npm install seneca-queue
```

## Test
To run tests, simply use npm:

```
npm run test
```

## Usage in the same process

```js
var s = require('seneca')()
var assert = require('assert')

var task = {
  task: 'my task',
  param: 42
}

s.use('queue')

s.add({
  task: 'my task'
}, function(args, cb) {
  assert.equal(args.param, 42)
  cb()
  s.act({ role: 'queue', cmd: 'stop' })
})

s.act({ role: 'queue', cmd: 'start' })
s.act({ role: 'queue', cmd: 'enqueue', msg: task })
```

## Usage in multiple processes

### client

```js
var s = require('seneca')()
          .client({ port: 8081, pin: 'cmd:enqueue-remote,queue:q1' })
          .client({ port: 8082, pin: 'cmd:enqueue-remote,queue:q2' })
          .use('../', {
            queues: ['q1', 'q2']
          })

s.act({ role: 'queue', cmd: 'enqueue', msg: { task: 'my task', param: 1 }})
s.act({ role: 'queue', cmd: 'enqueue', msg: { task: 'my task', param: 2 }})
s.act({ role: 'queue', cmd: 'enqueue', msg: { task: 'my task', param: 3 }})
```

### server1

```js
var s = require('seneca')()
          .use(require('../'))
          .listen({ port: 8081 })

s.add({
  task: 'my task'
}, function(args, cb) {
  console.log('OK', args.param)
  setTimeout(cb, 2000)
})

console.log('worked if you see OK two times')
s.act({ role: 'queue', cmd: 'start' })
```

### server2

```js
var s = require('seneca')()
          .use(require('../'))
          .listen({ port: 8081 })

s.add({
  task: 'my task'
}, function(args, cb) {
  console.log('OK', args.param)
  cb()
})

console.log('worked if you see OK')
s.act({ role: 'queue', cmd: 'start' })
```
## Contributing
The [Senecajs org][] encourages open participation. If you feel you can help in any way, be it with
documentation, examples, extra testing, or new features please get in touch.


## License
Copyright Matteo Collina and Senecajs.org contributors, 2015, Licensed under [MIT][].


[travis-badge]: https://travis-ci.org/senecajs/seneca-queue.png?branch=master
[travis-url]: https://travis-ci.org/senecajs/seneca-queue
[gitter-badge]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/senecajs/seneca
[standard-badge]: https://raw.githubusercontent.com/feross/standard/master/badge.png
[standard-style]: https://github.com/feross/standard

[MIT]: ./LICENSE
[Senecajs org]: https://github.com/senecajs/
[senecajs.org]: http://senecajs.org/
[Seneca.js]: https://www.npmjs.com/package/seneca
[github issue]: https://github.com/senecajs/seneca-queue/issues
[@senecajs]: http://twitter.com/senecajs
