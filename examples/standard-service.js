var s = require('seneca')()

s.add({
  other: 'call'
}, function(args, cb) {
  cb(null, { result: 42 })
})

s.listen(8083)
