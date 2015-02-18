
var memory = require('./lib/memory')
var _ = require('lodash')

function queue(options) {

  var seneca = this

  // # Plugin options.
  // These are the defaults. You can override using the _options_ argument.
  // Example: `seneca.use('queue', { concurrency:42 } )`.
  options = seneca.util.deepextend({
    role: 'queue',
    concurrency: 1
  }, options)

  // You can change the _role_ value for the plugin patterns.
  // Use this when you want to load multiple versions of the plugin
  // and expose them via different patterns.
  var role = options.role

  // hook the in-memory worker only if neeeded
  var hook = _.memoize(function(cmd) {
    var hooked = _.find(seneca.list(), function(pattern) {
      return pattern.role === role && pattern.hook === cmd
    })

    if (!hooked) {
      memory(role, seneca, options)
    }

    return !!hooked
  })

  function wrapHook(cmd) {
    seneca.add({
      role: role,
      cmd: cmd
    }, function (args, cb) {
      delete args.cmd
      args.hook = cmd

      hook(cmd)

      seneca.act(args, cb)
    })
  }

  ['start', 'stop', 'enqueue'].forEach(wrapHook)

  return {
    name: role
  }
}

module.exports = queue
