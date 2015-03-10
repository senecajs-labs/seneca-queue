
var async = require('async')

function memory(role, seneca, options) {
  var queue = async.queue(worker, options.concurrency)

  seneca.add({
    role: role,
    hook: 'start',
    type: 'memory'
  }, function(args, done) {
    queue.resume()
    done()
  })

  seneca.add({
    role: role,
    hook: 'stop',
    type: 'memory'
  }, function(args, done) {
    queue.pause()
    done()
  })

  seneca.add({
    role: role,
    hook: 'enqueue',
    type: 'memory'
  }, function(args, done) {
    if (!args.msg) {
      return done(new Error('no message specified'))
    }
    queue.push(args.msg)
    done()
  })

  function worker(task, cb) {
    seneca.act(task, cb)
  }
}

module.exports = memory
