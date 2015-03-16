
module.exports = function(s) {
  s.add({
    task: 'my task'
  }, function(args, cb) {
    setTimeout(function() {
      console.log('OK', args.param)
      cb()
    }, (4 - args.param) * 1000)
  })
}
