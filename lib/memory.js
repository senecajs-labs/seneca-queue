'use strict'

var Async = require('async')

module.exports = function memory (role, seneca, options) {
  function worker (task, done) {
    seneca.root.delegate({role$: role}).act(task, done)
  }

  var queue = Async.queue(worker, options.concurrency)

  seneca.add({role: role, hook: 'start', type: 'memory'}, function (args, done) {
    queue.resume()
    done()
  })

  seneca.add({role: role, hook: 'stop', type: 'memory'}, function (args, done) {
    queue.pause()
    done()
  })

  seneca.add({role: role, hook: 'enqueue', type: 'memory'}, function (args, done) {
    if (!args.msg) {
      return done(new Error('no message specified'))
    }
    queue.push(args.msg)
    done()
  })
}
