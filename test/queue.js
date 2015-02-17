
var queue = require('../')
var seneca = require('seneca')
var expect = require('chai').expect

describe('seneca queue', function() {
  var s

  beforeEach(function() {
    s = seneca()
    s.use(queue)
  })

  it('should process a task', function(done) {
    var task = {
      task: 'my task',
      param: 42
    }

    s.add({
      task: 'my task'
    }, function(args, cb) {
      expect(args).to.include(task)
      cb()
      done()
    })

    s.act({ role: 'queue', cmd: 'start' })
    s.act({ role: 'queue', cmd: 'enqueue', task: task })
  })

  it('should not process a task until start is called', function(done) {
    var task = {
      task: 'my task',
      param: 42
    }

    // first enqueing
    s.act({ role: 'queue', cmd: 'enqueue', task: task })

    // then we add the task handler
    s.add({
      task: 'my task'
    }, function(args, cb) {
      expect(args).to.include(task)
      cb()
      done()
    })

    // finally we start the worker
    s.act({ role: 'queue', cmd: 'start' })
  })

  it('should stop a worker', function(done) {
    var task = {
      task: 'my task',
      param: 42
    }

    s.add({
      task: 'my task'
    }, function(args, cb) {
      cb()
      done(new Error('this should never be called'))
    })

    s.act({ role: 'queue', cmd: 'start' })
    s.act({ role: 'queue', cmd: 'stop' })
    s.act({ role: 'queue', cmd: 'enqueue', task: task }, done)
  })

  it('should restart a worker', function(done) {
    var task = {
      task: 'my task',
      param: 42
    }

    s.add({
      task: 'my task'
    }, function(args, cb) {
      expect(args).to.include(task)
      cb()
      done()
    })

    s.act({ role: 'queue', cmd: 'start' })
    s.act({ role: 'queue', cmd: 'stop' })
    s.act({ role: 'queue', cmd: 'enqueue', task: task })
    s.act({ role: 'queue', cmd: 'start' })
  })
})
