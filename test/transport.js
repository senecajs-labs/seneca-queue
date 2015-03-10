
var queue = require('../')
var seneca = require('seneca')
var expect = require('chai').expect
var async = require('async')

describe('seneca queue', function() {
  var client
  var server1
  var server2

  beforeEach(function(done) {
    server1 = seneca()
                .use(queue)
                .listen(8081)

    server1.ready(function() {
      server2 = seneca()
                  .use(queue)
                  .listen(8082)

      server2.ready(function() {

        client = seneca()
                  .client({ port: 8081, pin:'cmd:enqueue-remote,queue:queue1' })
                  .client({ port: 8082, pin:'cmd:enqueue-remote,queue:queue2' })
                  .use(queue, {
                    queues: [
                      'queue1',
                      'queue2'
                    ]
                  })
                  .ready(done)
      })
    })
  })

  afterEach(function(done) {
    async.each([server1, server2], function(server, cb) {
      server.close(cb)
    }, done)
  })

  it('should process a task on the first worker', function(done) {
    var task = {
      task: 'my task',
      param: 42
    }

    server1.add({
      task: 'my task'
    }, function(args, cb) {
      expect(args).to.include(task)
      cb()
      done()
    })

    server2.add({
      task: 'my task'
    }, function(args, cb) {
      cb()
      done(new Error('this should never be called'))
    })

    server1.act({ role: 'queue', cmd: 'start' })
    server2.act({ role: 'queue', cmd: 'start' })

    client.act({ role: 'queue', cmd: 'enqueue', msg: task }, function(err) {
      if (err) { return done(err) }
    })
  })

  it('should process a task on both workers', function(done) {
    var task1 = {
      task: 'my task',
      param: 1
    }
    var task2 = {
      task: 'my task',
      param: 2
    }
    var count = 2

    server1.add({
      task: 'my task'
    }, function(args, cb) {
      expect(args).to.include(task1)
      cb()
      if (--count == 0) {
        done()
      }
    })

    server2.add({
      task: 'my task'
    }, function(args, cb) {
      expect(args).to.include(task2)
      cb()
      if (--count == 0) {
        done()
      }
    })

    server1.act({ role: 'queue', cmd: 'start' })
    server2.act({ role: 'queue', cmd: 'start' })

    client.act({ role: 'queue', cmd: 'enqueue', msg: task1 }, function(err) {
      if (err) { return done(err) }
    })
    client.act({ role: 'queue', cmd: 'enqueue', msg: task2 }, function(err) {
      if (err) { return done(err) }
    })
  })
})
