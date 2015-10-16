var s = require('seneca')()
          .use(require('..'), { concurrency: 2 })
          .listen({ type: 'tcp', port: 8081 })

require('./process')(s)

console.log('worked if you see OK two times')
s.act({ role: 'queue', cmd: 'start' })
