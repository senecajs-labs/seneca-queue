var s = require('seneca')()
          .client({ type: 'http', port: 8083 })
          .client({ type: 'tcp', port: 8081, pin: 'cmd:enqueue-remote,queue:q1' })
          .client({ type: 'tcp', port: 8082, pin: 'cmd:enqueue-remote,queue:q2' })
          .use('..', {
            queues: ['q1', 'q2']
          })

s.act({ role: 'queue', cmd: 'enqueue', msg: { task: 'my task', param: 1 }})
s.act({ role: 'queue', cmd: 'enqueue', msg: { task: 'my task', param: 2 }})
s.act({ role: 'queue', cmd: 'enqueue', msg: { task: 'my task', param: 3 }})
s.act({ other: 'call' }, function(err, result) {
  if (err) {
    console.log(err)
    process.exit(1)
  }

  console.log('Other call result:', result)
  setTimeout(function() {
    // wait for messages ot be delivered
    process.exit(0)
  }, 1000)
})
