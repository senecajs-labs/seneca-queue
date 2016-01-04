
var Queue = require('..')
var Seneca = require('seneca')
var expect = require('code').expect

var Lab = require('lab')
var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it
var beforeEach = lab.beforeEach
var afterEach = lab.afterEach

describe('seneca queue', function () {
  describe('Concurrency', function () {
    var s

    beforeEach(function (done) {
      s = Seneca({log: 'silent'})
        .use(Queue, { concurrency: 2 })
        .ready(done)
    })

    afterEach(function (done) {
      s.close(done)
    })

    it('should run multiple tasks in parallel', function (done) {
      var task1 = {
        task: 'my task',
        param: 42
      }
      var task2 = {
        task: 'my task',
        param: 24
      }

      var firstTime = true
      var secondTime = false
      var completed = false

      s.add({
        task: 'my task'
      }, function (args, cb) {
        if (firstTime) {
          firstTime = false
          expect(args).to.include(task1)
          return setTimeout(function () {
            completed = true
            expect(secondTime).to.be.true()
            cb()
            done()
          }, 10)
        }

        secondTime = true
        expect(args).to.include(task2)
        expect(completed).to.be.false()
        cb()
      })

      s.act({ role: 'queue', cmd: 'start' }, function (err) {
        if (err) { return done(err) }
        s.act({ role: 'queue', cmd: 'enqueue', msg: task1 }, function (err) {
          if (err) { return done(err) }
          s.act({ role: 'queue', cmd: 'enqueue', msg: task2 }, function (err) {
            if (err) { return done(err) }
          })
        })
      })
    })
  })
})
