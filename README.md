# seneca-queue

A job queue for Seneca

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
s.act({ role: 'queue', cmd: 'enqueue', task: task })
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

s.act({ role: 'queue', cmd: 'enqueue', task: { task: 'my task', param: 1 }})
s.act({ role: 'queue', cmd: 'enqueue', task: { task: 'my task', param: 2 }})
s.act({ role: 'queue', cmd: 'enqueue', task: { task: 'my task', param: 3 }})
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

## License

MIT
