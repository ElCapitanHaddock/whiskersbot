const version = 13

var fs = require('fs')
var obj = JSON.parse(fs.readFileSync(`./versions/v${version}.json`, 'utf8'));

var res = ""

obj = Object.keys(obj).map(k => obj[k])
for (var i = 0; i < obj.length; i++) {
    for (var j = 0; j < obj[i].edges.length; j++) {
        
        res += "\""+obj[i].node + "\" -> \"" + obj[i].edges[j] + "\"\n"
    }
}
console.log(res)

fs.writeFile(`./graphs/g${version}.txt`, res, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
}); 


/*

digraph G {
	node [fontsize=10 shape=point];
	ranksep=2

*/