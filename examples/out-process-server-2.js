var s = require('seneca')()
          .use(require('../'))
          .listen({ type: 'tcp', port: 8082 })

require('./process')(s)

console.log('worked if you see OK')
s.act({ role: 'queue', cmd: 'start' })

