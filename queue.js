
var memory = require('./lib/memory')
var _ = require('lodash')

function queue(options) {

  var seneca = this

  // # Plugin options.
  // These are the defaults. You can override using the _options_ argument.
  // Example: `seneca.use('queue', { concurrency:42 } )`.
  options = seneca.util.deepextend({
    role: 'queue',
    concurrency: 1,
    queues: []
  }, options)

  // You can change the _role_ value for the plugin patterns.
  // Use this when you want to load multiple versions of the plugin
  // and expose them via different patterns.
  var role = options.role

  // hook the in-memory worker only if neeeded
  var hookMemory = _.memoize(function(cmd) {
    var hooked = _.find(seneca.list(), function(pattern) {
      return pattern.role === role && pattern.hook === cmd
    })

    if (!hooked) {
      memory(role, seneca, options)
    }

    return !hooked
  })

  var listEnqueues = _.memoize(function(cmd) {
    return _.filter(seneca.list(), function(pattern) {
      return pattern.role === role && pattern.hook === cmd
    })
  })

  function wrapHook(cmd) {
    seneca.add({
      role: role,
      cmd: cmd
    }, function (args, cb) {
      delete args.cmd

      hookMemory(cmd)
      args = _.defaults(args, listEnqueues(cmd)[0])

      seneca.act(args, cb)
    })
  }

  ['start', 'stop'].forEach(wrapHook)

  var round = 0
  seneca.add({
    role: role,
    cmd: 'enqueue'
  }, function (args, cb) {
    delete args.cmd

    hookMemory('enqueue')
    args = _.defaults(args, listEnqueues('enqueue')[round])

    seneca.act(args, cb)

    if (++round === listEnqueues('enqueue').length) {
      round = 0
    }
  })

  var enqueueRemote = 'enqueue-remote'
  options.queues.forEach(function(name, i) {
    seneca.add({
      role: role,
      hook: 'enqueue',
      type: 'remote',
      queue: name
    }, function(args, cb) {
      args.cmd = enqueueRemote
      delete args.hook
      seneca.act(args, cb)
    })
  })

  if (options.queues.length === 0) {
    seneca.add({
      role: role,
      cmd: enqueueRemote
    }, function (args, cb) {
      args.cmd = 'enqueue'
      delete args.type
      delete args.queue
      seneca.act(args, cb)
    })
  }

  seneca.add({init:role},function(args,done){
    done()
  })

  return {
    name: role
  }
}

module.exports = queue
