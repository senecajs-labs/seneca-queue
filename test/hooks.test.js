var queue = require('..')
var seneca = require('seneca')
var expect = require('code').expect

var Lab = require('lab')
var lab = exports.lab = Lab.script()
var describe = lab.describe
var it = lab.it
var beforeEach = lab.beforeEach
var afterEach = lab.afterEach

describe('seneca queue', function () {
  describe('Hooks', function () {
    var s

    beforeEach(function (done) {
      s = seneca({log: 'silent'})
        .use(queue)
        .ready(done)
    })

    afterEach(function (done) {
      s.close(done)
    })

    it('should be possible to implement different queues through hooks', function (done) {
      var startCalled = false
      var stopCalled = false
      var enqueueCalled = false

      s.add({ role: 'queue', hook: 'start', type: 'test' }, function (args, done) {
        startCalled = true
        done()
      })

      s.add({ role: 'queue', hook: 'stop', type: 'test' }, function (args, done) {
        stopCalled = true
        done()
      })

      s.add({ role: 'queue', hook: 'enqueue', type: 'test' }, function (args, done) {
        enqueueCalled = true
        done()
      })

      s.act({ role: 'queue', cmd: 'start' }, function (err) {
        if (err) {
          return done(err)
        }

        s.act({ role: 'queue', cmd: 'enqueue' }, function (err) {
          if (err) {
            return done(err)
          }

          s.act({ role: 'queue', cmd: 'stop' }, function (err) {
            if (err) {
              return done(err)
            }

            expect(startCalled).to.be.true()
            expect(stopCalled).to.be.true()
            expect(enqueueCalled).to.be.true()

            done()
          })
        })
      })
    })
  })
})
