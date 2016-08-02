![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js][] job queue plugin

# seneca-queue
[![npm version][npm-badge]][npm-url]
[![Build Status][travis-badge]][travis-url]
[![Coverage Status][coveralls-badge]][coveralls-url]
[![Dependency Status][david-badge]][david-url]
[![Gitter chat][gitter-badge]][gitter-url]

A plugin that allows you to create and use queues.


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

### server 1

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

### server 2

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

The tasks will be distributed among the servers in round robin. If a server fails to respond, it is blacklisted and won't receive any task (unless the requests are marked fatal$, in that case the instance will be closed as intended)

## Options

It is possible to pass additional options when registering the queue plugin, as shown below

```js
var s = require('seneca')()
var assert = require('assert')

s.use('queue', {
  role: 'queue',
  concurrency: 1
})
```

- role, default: 'queue'. This is the role to be used for start, stop and enqueue commands, you can change it in case of a conflict with other action patterns or if you want to register two different queues.
- concurrency, default: 1. How many task to process in parallel. Currently working only with the in-memory queue

## Implementing queues

seneca-queue provide a simple in-memory implementation, but more can be created. The implementation should add three "hook" actions to the seneca instance: `'role:queue,hook:start',type:my queue'`,`'role:queue,hook:stop',type:my queue'`,`'role:queue,hook:enqueue',type:my queue'`.
After the implementing plugin and actions are registered, seneca-queue will automatically recognize and start using it.

For examples see the in-memory implementation (https://github.com/senecajs/seneca-queue/blob/master/lib/memory.js) or the amazon sqs one (https://github.com/LucaLanziani/seneca-sqs-queue)


## Contributing
The [Senecajs org][] encourages open participation. If you feel you can help in any way, be it with
documentation, examples, extra testing, or new features please get in touch.


## License
Copyright Matteo Collina and Senecajs.org contributors, 2015-2016, Licensed under [MIT][].


[npm-badge]: https://img.shields.io/npm/v/seneca-queue.svg
[npm-url]: https://npmjs.com/package/seneca-queue
[travis-badge]: https://travis-ci.org/senecajs-labs/seneca-queue.png?branch=master
[travis-url]: https://travis-ci.org/senecajs-labs/seneca-queue
[coveralls-badge]:https://coveralls.io/repos/senecajs/seneca-queue/badge.svg?branch=master&service=github
[coveralls-url]: https://coveralls.io/github/senecajs/seneca-queue?branch=master
[david-badge]: https://david-dm.org/senecajs/seneca-queue.svg
[david-url]: https://david-dm.org/senecajs/seneca-queue
[gitter-badge]: https://badges.gitter.im/Join%20Chat.svg
[gitter-url]: https://gitter.im/senecajs/seneca

[MIT]: ./LICENSE
[Senecajs org]: https://github.com/senecajs/
[senecajs.org]: http://senecajs.org/
[Seneca.js]: https://www.npmjs.com/package/seneca
[github issue]: https://github.com/senecajs/seneca-queue/issues
[@senecajs]: http://twitter.com/senecajs
