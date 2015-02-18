var s = require('seneca')()
          .use(require('../'), { concurrency: 2 })
          .listen({ type: 'tcp', port: 8081 })

s.add({
  task: 'my task'
}, function(args, cb) {
  setTimeout(function() {
    console.log('OK', args.param)
    cb()
  }, (4 - args.param) * 1000)
})

console.log('worked if you see OK two times')
s.act({ role: 'queue', cmd: 'start' })

