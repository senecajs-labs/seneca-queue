
var queue = require('../')
var seneca = require('seneca')
var expect = require('chai').expect

describe('seneca queue', function() {
  var s

  beforeEach(function(done) {
    s = seneca()
    s.use(queue)
    s.ready(done)
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

    s.act({ role: 'queue', cmd: 'start' }, function(err) {
      if (err) { return done(err) }
      s.act({ role: 'queue', cmd: 'enqueue', msg: task }, function(err) {
        if (err) { return done(err) }
      })
    })
  })

  it('should not process a task until start is called', function(done) {
    var task = {
      task: 'my task',
      param: 42
    }

    // first enqueing
    s.act({ role: 'queue', cmd: 'enqueue', msg: task })

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
    s.act({ role: 'queue', cmd: 'enqueue', msg: task }, done)
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
    s.act({ role: 'queue', cmd: 'enqueue', msg: task })
    s.act({ role: 'queue', cmd: 'start' })
  })
})
