var s = require('seneca')()
          .client({ type: 'tcp', port: 8081, pin: 'cmd:enqueue-remote,queue:q1' })
          .client({ type: 'tcp', port: 8082, pin: 'cmd:enqueue-remote,queue:q2' })
          .use('../', {
            queues: ['q1', 'q2']
          })

s.act({ role: 'queue', cmd: 'enqueue', task: { task: 'my task', param: 1 }})
s.act({ role: 'queue', cmd: 'enqueue', task: { task: 'my task', param: 2 }})
s.act({ role: 'queue', cmd: 'enqueue', task: { task: 'my task', param: 3 }})
