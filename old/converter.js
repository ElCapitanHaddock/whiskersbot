var fs = require('fs');
var dbAPI = require('dbAPI')
var API = new dbAPI()

var obj;
fs.readFile('convert.json', 'utf8', function (err, data) {
  if (err) throw err;
  obj = JSON.parse(data);
  for (var key in obj) {
    for (var nested in obj[key]) {
      if (obj[key][nested] instanceof Array) {
        obj[key][nested] = Object.assign({}, obj[key][nested])
      }
    }
  }
  var json = JSON.stringify(obj)
  fs.writeFile("convert.json", json, function(err) {
      if (err) {
          console.log(err);
      }
  });
});