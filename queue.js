
var async = require('async')

function queue(options) {

  var seneca = this

  // # Plugin options.
  // These are the defaults. You can override using the _options_ argument.
  // Example: `seneca.use('queue', { concurrency:42 } )`.
  options = seneca.util.deepextend({
    concurrency: 1
  }, options)

  // You can change the _role_ value for the plugin patterns.
  // Use this when you want to load multiple versions of the plugin
  // and expose them via different patterns.
  var role = options.role

  var queue = async.queue(worker, options.concurrency)
  queue.pause()

  seneca.add({
    role: role,
    cmd: 'start'
  }, function start(args, cb) {
    queue.resume()
    cb()
  })

  seneca.add({
    role: role,
    cmd: 'stop'
  }, function start(args, cb) {
    queue.pause()
    cb()
  })

  seneca.add({
    role: role,
    cmd: 'enqueue'
  }, function enqueue(args, cb) {
    if (!args.task) {
      return cb(new Error('no task specified'))
    }

    queue.push(args.task)
    cb()
  })

  return {
    name: role
  }

  function worker(task, cb) {
    seneca.act(task, cb)
  }
}

module.exports = queue
