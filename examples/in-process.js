var s = require('seneca')()
          .use(require('../'))
var assert = require('assert')

var task = {
  task: 'my task',
  param: 3
}

require('./process')(s)

console.log('worked if you see OK')
s.act({ role: 'queue', cmd: 'start' })
s.act({ role: 'queue', cmd: 'enqueue', msg: task })
