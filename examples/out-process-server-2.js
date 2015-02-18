var s = require('seneca')()
          .use(require('../'))
          .listen({ port: 8082 })

s.add({
  task: 'my task'
}, function(args, cb) {
  console.log('OK', args.param)
  cb()
})

console.log('worked if you see OK')
s.act({ role: 'queue', cmd: 'start' })

