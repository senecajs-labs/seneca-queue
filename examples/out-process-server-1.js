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

