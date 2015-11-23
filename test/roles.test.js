
var queue = require('..')
var seneca = require('seneca')
var expect = require('code').expect

var Lab = require('lab')
var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it
var beforeEach = lab.beforeEach
var afterEach = lab.afterEach

process.setMaxListeners(0)

describe('seneca queue', function () {
  describe('With different role', function () {
    var s

    beforeEach(function (done) {
      s = seneca({log: 'silent'})
        .use(queue, { role: 'role1' })
        .ready(done)
    })

    afterEach(function (done) {
      s.close(done)
    })

    it('should process a task', function (done) {
      var task = {
        task: 'my task',
        param: 42
      }

      s.add({
        task: 'my task'
      }, function (args, cb) {
        expect(args).to.include(task)
        cb()
        done()
      })

      s.act({ role: 'role1', cmd: 'start' }, function (err) {
        if (err) { return done(err) }
        s.act({ role: 'role1', cmd: 'enqueue', msg: task }, function (err) {
          if (err) { return done(err) }
        })
      })
    })

    it('should not process a task until start is called', function (done) {
      var task = {
        task: 'my task',
        param: 42
      }

      // first enqueing
      s.act({ role: 'role1', cmd: 'enqueue', msg: task })

      // then we add the task handler
      s.add({
        task: 'my task'
      }, function (args, cb) {
        expect(args).to.include(task)
        cb()
        done()
      })

      // finally we start the worker
      s.act({ role: 'role1', cmd: 'start' })
    })

    it('should stop a worker', function (done) {
      var task = {
        task: 'my task',
        param: 42
      }

      s.add({
        task: 'my task'
      }, function (args, cb) {
        cb()
        done(new Error('this should never be called'))
      })

      s.act({ role: 'role1', cmd: 'start' })
      s.act({ role: 'role1', cmd: 'stop' })
      s.act({ role: 'role1', cmd: 'enqueue', msg: task }, done)
    })

    it('should restart a worker', function (done) {
      var task = {
        task: 'my task',
        param: 42
      }

      s.add({
        task: 'my task'
      }, function (args, cb) {
        expect(args).to.include(task)
        cb()
        done()
      })

      s.act({ role: 'role1', cmd: 'start' })
      s.act({ role: 'role1', cmd: 'stop' })
      s.act({ role: 'role1', cmd: 'enqueue', msg: task })
      s.act({ role: 'role1', cmd: 'start' })
    })
  })

  describe('With two different roles', function () {
    var s

    beforeEach(function (done) {
      s = seneca({log: 'silent'})
        .use({ name: '..', tag: 'queue1' }, { role: 'role1' })
        .use({ name: '..', tag: 'queue2' }, { role: 'role2' })
        .ready(done)
    })

    afterEach(function (done) {
      s.close(done)
    })

    it('should process tasks from correct queue', function (done) {
      var secondTime = false

      var task = {
        task: 'my task',
        param: 42
      }

      s.add({
        task: 'my task'
      }, function (args, cb) {
        expect(args).to.include(task)
        expect(args.plugin$).to.include({ tag: secondTime ? 'queue2' : 'queue1' })
        cb()

        if (secondTime) {
          return done()
        }

        s.act({ role: 'role1', cmd: 'stop' }, function (err) {
          if (err) { return done(err) }
          s.act({ role: 'role2', cmd: 'start' }, function (err) {
            if (err) { return done(err) }

            secondTime = true
            s.act({ role: 'role2', cmd: 'enqueue', msg: task }, function (err) {
              if (err) { return done(err) }
            })
          })
        })
      })

      s.act({ role: 'role1', cmd: 'start' }, function (err) {
        if (err) { return done(err) }
        s.act({ role: 'role1', cmd: 'enqueue', msg: task }, function (err) {
          if (err) { return done(err) }
        })
      })
    })
  })
})
